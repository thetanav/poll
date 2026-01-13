import "./globals.css";
import type { Metadata } from "next";
import Providers from "@/components/providers";
import { Analytics } from "@vercel/analytics/next";
import { Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";

const sans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Poll",
  description: "Get Answered. Create Polls.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.className} antialiased`}>
        <NextTopLoader color="oklch(59.6% 0.145 163.225)" showSpinner={false} />
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
