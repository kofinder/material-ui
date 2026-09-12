import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Material Flow · Factory Store",
  description: "Factory materials management: inventory, receiving, issuing, and reports.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
