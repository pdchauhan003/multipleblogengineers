import type { NextConfig } from "next";

// Falls back to Render URL so Vercel deployment works without any env var configuration

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL 

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "cdn.dummyjson.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },

  // IMPORTANT: Next.js on Vercel requires rewrites here — NOT in vercel.json
  // vercel.json rewrites are silently ignored for Next.js projects.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
