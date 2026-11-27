import type { NextConfig } from "next";

// `npm run build:static` sets STATIC_EXPORT=1 to produce a plain folder (out/) for Firebase Hosting.
const isStatic = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  ...(isStatic ? { output: "export", trailingSlash: true } : {}),
  images: {
    unoptimized: isStatic,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "d2ncjxd2rk2vpl.cloudfront.net" }, // White Land product photos (Beep CDN)
    ],
  },
};

export default nextConfig;
