import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "d2ncjxd2rk2vpl.cloudfront.net" }, // White Land product photos (Beep CDN)
    ],
  },
  // The ordering menu is a static app in public/menu
  async rewrites() {
    return [{ source: "/menu", destination: "/menu/index.html" }, { source: "/menu/", destination: "/menu/index.html" }];
  },
};

export default nextConfig;
