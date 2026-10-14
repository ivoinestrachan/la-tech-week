import type { Metadata, Viewport } from "next";
import "./globals.css";

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen overflow-x-hidden bg-bg font-body text-ink antialiased">
        <div className="pointer-events-none fixed -right-[8vw] -top-[14vw] -z-10 h-[40vw] w-[40vw] rounded-full bg-coral opacity-[0.05] blur-[140px]" />
        {children}
      </body>
    </html>
  );
}
