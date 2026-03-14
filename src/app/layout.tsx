// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css"; // ← make sure this imports your global styles (animations, tailwind, etc.)

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "River Research & Innovation Journal",
  description: "Peer-reviewed open access journal for river research and innovation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* Navbar - appears on ALL pages */}
        <Navbar />

        {/* Main content - different for each page */}
        <main className="min-h-screen">
          {children}
        </main>

        {/* Footer - appears on ALL pages */}
        <Footer />
      </body>
    </html>
  );
}