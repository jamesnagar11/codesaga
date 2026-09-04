import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from "next-auth/providers/google";
import { globalPrismaClient } from './prisma';
import jwt from "jsonwebtoken";

const prisma = globalPrismaClient;
export const NEXT_AUTH_CONFIG = {
  providers: [
    CredentialsProvider({
        name: 'Credentials',
        credentials: {
          name: {label: 'name', type: 'text', placeholder: ''},
          username: { label: 'email', type: 'text', placeholder: '' },
          password: { label: 'password', type: 'password', placeholder: '' },
        },
        async authorize(credentials) {
            const username = credentials?.username as string;
            const name = credentials?.name as string;

            const user = await prisma.user.findUnique({
              where: {email: username, name: name}, select: {id: true, name: true, email: true, image: true}
            })
            if(user) {
                return {id: user.id, name: user.name, email: user.email, image: user.image}
            }
            else {
              return null;
            }
        },
      }),
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
      }),           
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    // @ts-expect-error: Not able to tell ts compiler that i provided it at runtime while signin
    signIn: async ({ user, account }) => {
      const providerAccountId = account?.providerAccountId;
      const userId = user?.id || providerAccountId;
      const email = user?.email;

      if (!userId && !email) {
        console.log('signIn callback error: Neither user.id, account.providerAccountId nor user.email was provided.');
        return false;
      }

      try {
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [
              ...(userId ? [{ id: userId }] : []),
              ...(email ? [{ email: email }] : []),
            ],
          },
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              id: userId || String(Date.now()),
              email: email || '',
              name: user?.name || email?.split('@')[0] || 'User',
              image: user?.image || '',
            },
          });
        }
      } catch (error) {
        console.error('Error in signIn callback during Prisma operation:', error);
        return false;
      }
      return true;
    },
    // @ts-expect-error: Not able to tell ts compiler that i provided it at runtime while signin
    session: async ({ session, token }) => {
      if (session?.user && token?.sub) {
        try {
          const existingUser = await prisma.user.findFirst({
            where: {
              OR: [
                { id: token.sub },
                ...(session.user.email ? [{ email: session.user.email }] : []),
              ],
            },
            select: {
              id: true,
              name: true,
              image: true,
            },
          });
          // noTimestamp: true — omits the `iat` field so the token string is
          // identical for the same user on every session refresh. Without this,
          // jwt.sign() embeds a new timestamp each call, producing a different
          // string every tab-focus, which caused the WebSocket to reconnect.
          const jwt_token = jwt.sign(
            { id: existingUser?.id ?? token.sub, email: token.email },
            process.env.JWT_SECRET as string
          );
          if (existingUser) {
            session.user.name = existingUser.name;
            session.user.image = existingUser.image;
            session.user.id = existingUser.id;
            session.user.token = jwt_token;
          } else {
            session.user.id = token.sub;
            session.user.token = jwt_token;
          }
        } catch (error) {
          console.error('Error in session callback:', error);
          return null;
        }
      }
      return session;
    },
  },
};