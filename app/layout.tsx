import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KNS Training Pass System",
  description: "QR Code based attendance system for KNS Training",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

