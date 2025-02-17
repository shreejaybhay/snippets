import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["i.pinimg.com", "i.postimg.cc"], // ✅ Add allowed domains here
  },
};

export default nextConfig;
