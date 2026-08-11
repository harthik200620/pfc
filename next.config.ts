import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The floating dev-tools badge only ever appears in `next dev`, but it sits
  // over the bottom-left of the page and gets in the way of judging the design.
  // Compile and runtime errors are still surfaced without it.
  devIndicators: false,

  images: {
    // next/image does the AVIF/WebP conversion and width fan-out at request time,
    // so scripts/fetch-images.mjs only has to fetch originals and emit LQIPs.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1280, 1920],
    imageSizes: [200, 320, 420, 560],
    // Required from Next 16: the default narrowed to [75] and any quality not
    // on this list is rejected. 90 is the full-bleed hero, 75 everything else.
    qualities: [75, 90],
    // The hero plate and the ring are first-party SVGs authored in this repo.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
