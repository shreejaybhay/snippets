"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";

interface User {
  _id: string;
  email: string;
  username: string;
  profileURL?: string;
}

interface ClientNavbarProps {
  user?: User;
}

export default function ClientNavbar({ user }: ClientNavbarProps) {
  const pathname = usePathname();

  // Hide navbar only for dashboard routes and public snippet view routes
  // Remove the check for learn page since we want to show the navbar there
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/s/")) return null;

  // Add key prop to prevent remounting
  return <Navbar user={user} key="main-navbar" />;
}
