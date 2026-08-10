import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // next/image does the AVIF/WebP conversion and width fan-out at request time,
    // so scripts/fetch-images.mjs only has to fetch originals and emit LQIPs.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1280, 1920],
    imageSizes: [200, 320, 420, 560],
    // The hero plate and the ring are first-party SVGs authored in this repo.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
