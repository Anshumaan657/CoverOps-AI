import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoverOps AI",
  description: "AI-led commercial insurance operations MVP"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
