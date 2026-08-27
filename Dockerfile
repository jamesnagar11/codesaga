FROM node:22-alpine as builder

WORKDIR /usr/src/app

ARG DATABASE_URL

COPY package*.json ./
COPY ./prisma ./prisma/

RUN npm install

COPY . .

RUN npm run build

FROM node:22-alpine as runner

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/next.config.ts ./
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/package-lock.json ./

ENV NODE_ENV=production

CMD ["npm", "run", "start"]