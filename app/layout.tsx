import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://theconservativepatriot.com"),
  title: "The Conservative Patriot | Balanced US Breaking News & Politics",
  description: "High-quality breaking US political news aggregated automatically from left, center, and right sources. Curated highlights + community submissions. Clear signals in a noisy world.",
  keywords: [
    "conservative news",
    "US politics",
    "breaking news",
    "balanced news",
    "political news",
    "Trump administration",
    "Congress",
    "elections",
    "The Conservative Patriot",
  ],
  authors: [{ name: "The Conservative Patriot" }],
  openGraph: {
    title: "The Conservative Patriot | Balanced Breaking News",
    description: "Automatically aggregated high-quality US political & breaking news from across the spectrum. Live wires + curated must-reads.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "The Conservative Patriot - Balanced US News" }],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/favicon-patriotic.jpg",
    shortcut: "/favicon-patriotic.jpg",
    apple: "/favicon-patriotic.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0F172A] text-[#F1F5F9]">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
