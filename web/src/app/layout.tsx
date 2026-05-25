import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Header } from "@/components/header";
import { StatusFooter } from "@/components/status-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz"],
});

const APP_URL = process.env.APP_URL ?? "https://zelvra.local";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Zelvra — Watch what matters",
    template: "%s · Zelvra",
  },
  description:
    "AI-powered OSINT intelligence tracker. Add sources, get summaries when something changes, never re-read a page again.",
  applicationName: "Zelvra",
  keywords: ["OSINT", "intelligence", "monitoring", "tracker", "AI"],
  authors: [{ name: "Zelvra" }],
  openGraph: {
    title: "Zelvra — Watch what matters",
    description:
      "AI-powered OSINT intelligence tracker. Add sources, get summaries when something changes.",
    type: "website",
    siteName: "Zelvra",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zelvra — Watch what matters",
    description: "AI-powered OSINT intelligence tracker.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="relative z-10 flex flex-col flex-1">
          <Header />
          <div className="flex-1 flex flex-col">{children}</div>
          <Suspense fallback={null}>
            <StatusFooter />
          </Suspense>
        </div>
      </body>
    </html>
  );
}
