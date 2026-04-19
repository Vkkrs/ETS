import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import BottomNav from "@/components/layout/BottomNav";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ETS — Embrace The Suck",
  description: "The suck doesn't stop. Neither do you.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ETS",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#080808",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${inter.variable}`}>
      <body className="bg-ets-bg antialiased">
        <div className="w-full max-w-app mx-auto min-h-dvh bg-ets-bg relative">
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
