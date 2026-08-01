import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./torneio/torneio.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aula Experimental | CT Vai na Fita",
  description:
    "Agende sua aula experimental de futevôlei no CT Vai na Fita, na Praia de Icaraí.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: {
      url: "/favicon.svg?v=2",
      type: "image/svg+xml",
    },
    shortcut: "/favicon.svg?v=2",
    apple: "/brand/logo-horizontal.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
