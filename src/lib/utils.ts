import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

// Dynamic base URL that works in both development and production
export function getBaseUrl() {
  // If NEXT_PUBLIC_BASE_URL is set, use it
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  // In browser, use current origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Fallback for server-side rendering
  return 'http://localhost:3000';
}
