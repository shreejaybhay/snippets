"use client";

import { ThemeProvider } from "@/components/theme-provider";
import ClientNavbar from "@/components/ClientNavbar";
import { useEffect, useState } from "react";

export default function RootLayoutClient({
  children,
  geistSansClass,
  geistMonoClass,
}: {
  children: React.ReactNode;
  geistSansClass: string;
  geistMonoClass: string;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // or a loading skeleton
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className={`${geistSansClass} ${geistMonoClass} antialiased min-h-screen`}>
        <ClientNavbar />
        {children}
      </div>
    </ThemeProvider>
  );
}
