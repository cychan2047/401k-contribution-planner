import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "401(k) Contribution Planner",
  description: "Manage your 401(k) contributions and project retirement savings",
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

