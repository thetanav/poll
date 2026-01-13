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
  title: {
    default: "Poll - Create polls. Get answers.",
    template: "%s | Poll",
  },
  description: "Real-time voting. No sign-up required for voters. Free forever.",
  keywords: ["poll", "polls", "survey", "voting", "feedback", "real-time"],
  authors: [{ name: "Poll" }],
  creator: "Poll",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://poll.vercel.app"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Poll",
    title: "Poll - Create polls. Get answers.",
    description: "Real-time voting. No sign-up required for voters. Free forever.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Poll - Create polls. Get answers.",
    description: "Real-time voting. No sign-up required for voters. Free forever.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.className} antialiased`}>
        <NextTopLoader color="#3b82f6" showSpinner={false} />
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
