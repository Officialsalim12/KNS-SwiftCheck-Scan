import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KNS SwiftCheck Scan",
  description: "QR Code based attendance system for KNS Training",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

import { ToastProvider } from "@/lib/ToastContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

