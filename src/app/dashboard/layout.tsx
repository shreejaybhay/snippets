"use client";

import AppSidebar from "@/components/app-sidebar";
import MobileNavbar from "@/components/mobile-sidebar";
import { Toaster } from "@/components/ui/toaster";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      {/* Sidebar (Hidden on Mobile) */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Mobile Navbar (Hidden on Desktop) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50">
        <MobileNavbar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <main className="h-full overflow-y-auto p-6 pt-16 md:pt-6 xl:mt-6">
          {children}
          <Toaster />
        </main>
      </div>
    </div>
  );
}
