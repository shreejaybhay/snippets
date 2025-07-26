import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import RootLayoutClient from "@/components/RootLayoutClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});


export const metadata: Metadata = {
  title: "Snippets - Code Sharing Platform",
  description: "Share and manage your code snippets easily",
  icons: {
    icon: [
      {
        url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2310B981' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='16 18 22 12 16 6'></polyline><polyline points='8 6 2 12 8 18'></polyline></svg>",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
        <RootLayoutClient
          geistSansClass={geistSans.variable}
          geistMonoClass={geistMono.variable}
        >
            {children}
        </RootLayoutClient>
      </body>
    </html>
  );
}
