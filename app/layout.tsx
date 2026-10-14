import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "LA Tech Week 2026 — Every Event, Sorted",
  description:
    "Every LA Tech Week 2026 event, organized by category: Deep Tech, AI, Gaming, Sports, Health & more. Filter by day, time, and neighborhood.",
};

export const viewport: Viewport = {
  themeColor: "#0b0a10",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen overflow-x-hidden bg-bg font-body text-ink antialiased">
        <div className="pointer-events-none fixed -right-[8vw] -top-[14vw] -z-10 h-[40vw] w-[40vw] rounded-full bg-coral opacity-[0.05] blur-[140px]" />
        {children}
      </body>
    </html>
  );
}
