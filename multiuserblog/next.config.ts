// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
//   reactCompiler: true,
// };

// export default nextConfig;


// import type { NextConfig } from "next";
// /** @type {import('next').NextConfig} */

// const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:2321";

// const nextConfig: NextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'images.unsplash.com',
//       },
//       {
//         protocol: 'https',
//         hostname: 'res.cloudinary.com',
//       },
//     ],
//   },
//   reactCompiler: true,
//   async rewrites() {
//     return [
//       {
//         source: "/api/:path*",
//         destination: `${BACKEND_URL}/api/:path*`, // Proxy API requests to Express
//       },
//     ];
//   },
// };

// export default nextConfig;


import type { NextConfig } from "next";
/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "cdn.dummyjson.com",
      },
    ],
  },
};

export default nextConfig;
