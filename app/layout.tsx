import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers";

export const dynamic = 'force-dynamic';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CodeSaga",
  description: "A coding plateform made to enhance dsa skills",
  icons: {
    icon: ['/favicon.ico?v=4'],
    apple: ['/apple-touch-icon.png?v=4'],
    shortcut: ['/apple-touch-icon.png']
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Whitelist only public-safe variables to inject at runtime.
  // Secrets (DATABASE_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_SECRET, etc.)
  // are intentionally excluded — they must NEVER reach the browser.
  const publicEnv = {
    NEXT_PUBLIC_SOCKET_BACKEND_URL: process.env.SOCKET_BACKEND_URL ?? '',
    NEXT_PUBLIC_PRESET_NAME: process.env.NEXT_PUBLIC_PRESET_NAME ?? '',
    NEXT_PUBLIC_CLOUDINARY_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_NAME ?? '',
    NEXT_PUBLIC_CLOUDINARY_BASE_URL: process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL ?? '',
  };

  // JSON.stringify is safe here — values are server-provided strings, not user input.
  const envScript = `window.__ENV = ${JSON.stringify(publicEnv)};`;

  return (
    <html lang="en">
      <head>
        {/* Runtime public env injection: read by client components via window.__ENV */}
        <script dangerouslySetInnerHTML={{ __html: envScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#151515] text-white`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
