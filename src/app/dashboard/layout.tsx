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
      <div className="hidden md:flex">
        <AppSidebar />
      </div>

      {/* Mobile Navbar (Hidden on Desktop) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50">
        <MobileNavbar />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto pt-16 md:pt-0 xl:mt-6">
        <Toaster />
        {children}
      </main>
    </div>
  );
}
