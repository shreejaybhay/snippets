"use client";

import { ThemeProvider } from "@/components/theme-provider";
import ClientNavbar from "@/components/ClientNavbar";

export default function RootLayoutClient({ 
  children,
  geistSansClass,
  geistMonoClass 
}: { 
  children: React.ReactNode;
  geistSansClass: string;
  geistMonoClass: string;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSansClass} ${geistMonoClass} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ClientNavbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}