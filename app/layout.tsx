import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "KNS SwiftCheck Scan | Smart Attendance Tracking",
    template: "%s | KNS SwiftCheck Scan"
  },
  description: "Modern QR Code based attendance tracking platform for KNS Training and Events. Secure, fast, and highly responsive.",
  keywords: ["attendance tracking", "QR code scan", "event management", "KNS", "SwiftCheck"],
  authors: [{ name: "KNS Tech Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://knsscan.com",
    title: "KNS SwiftCheck Scan | Smart Attendance Tracking",
    description: "Enterprise grade QR attendance system for training and corporate events.",
    siteName: "KNS SwiftCheck Scan",
  },
  twitter: {
    card: "summary_large_image",
    title: "KNS SwiftCheck Scan",
    description: "Modern QR Code based attendance tracking platform.",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CheckScan",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2563eb",
};

import { ToastProvider } from "@/lib/ToastContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

