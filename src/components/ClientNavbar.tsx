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

  // Hide navbar for dashboard routes
  if (pathname.startsWith("/dashboard")) return null;

  return <Navbar user={user} />;
}
