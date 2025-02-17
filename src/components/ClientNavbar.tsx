"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";

interface ClientNavbarProps {
  user?: any; // Define the user prop
}

export default function ClientNavbar({ user }: ClientNavbarProps) {
  const pathname = usePathname();

  // Hide navbar for dashboard routes
  if (pathname.startsWith("/dashboard")) return null;

  return <Navbar />;
}
