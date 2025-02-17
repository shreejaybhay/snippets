import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === "/login" || path === "/signup" || path === "/";
  const token = request.cookies.get("authToken")?.value || "";

  // Add debug logging
  console.log("🚀 Middleware is running...", {
    path,
    isPublicPath,
    hasToken: !!token,
    fullUrl: request.url
  });

  // If user is authenticated (has token) and tries to access any public path
  // (including home page), redirect to dashboard
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/dashboard/snippets", request.url));
  }

  // If user is not authenticated and tries to access protected routes
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Update the matcher to include all protected routes
export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/dashboard/:path*",  // Matches all dashboard routes
  ]
};
