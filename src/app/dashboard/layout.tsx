"use client";

import AppSidebar from "@/components/app-sidebar";
import MobileNavbar from "@/components/mobile-sidebar";
import { Toaster } from "@/components/ui/toaster";
import NotificationBell from "@/components/NotificationBell";
import React, { useEffect } from "react";
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          router.push('/login');
          return;
        }

        const data = await res.json();
        if (!data.success) {
          router.push('/login');
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="flex h-screen">
      {/* Sidebar (Hidden on Mobile) */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Mobile Navbar (Hidden on Desktop) */}
      <div className="md:hidden">
        <MobileNavbar />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-4">
          <div className="flex justify-end mb-4">
            <NotificationBell />
          </div>
          {children}
        </div>
      </main>

      <Toaster />
    </div>
  );
}
