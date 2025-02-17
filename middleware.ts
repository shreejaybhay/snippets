import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === "/login" || path === "/signup" || path === "/";
  const token = request.cookies.get("authToken")?.value || "";

  // Add debug logging
  console.log("🚀 Middleware is running...", {
    path,
    isPublicPath,
    hasToken: !!token
  });

  if (isPublicPath && token) {
    // Redirect authenticated users trying to access login/signup to their profile
    return NextResponse.redirect(new URL("/dashboard/snippets", request.url));
  }

  if (!isPublicPath && !token) {
    // Redirect unauthenticated users trying to access protected routes to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Allow access if authenticated or accessing a public path
  return NextResponse.next();
}

// Update the matcher to include all dashboard routes and settings
export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/dashboard/:path*",  // Matches all dashboard routes
  ]
};
