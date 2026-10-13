import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://moryadesigns.com"),
  title: {
    template: "%s | Morya Designs",
    default: "Morya Designs - Premium House Plan Marketplace",
  },
  description: "Explore and download custom house design floor plans, elevations, and structural blueprints.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Morya Designs",
    description: "Premium House Plan Marketplace",
    url: "/",
    siteName: "Morya Designs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Morya Designs",
    description: "Premium House Plan Marketplace",
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
