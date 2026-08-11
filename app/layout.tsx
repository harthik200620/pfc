import type { Metadata, Viewport } from "next";
import { SITE, SERVICE_WINDOWS } from "@/data/site";
import { CartProvider } from "@/components/providers/CartProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { CartPanel } from "@/components/cart/CartPanel";
import { OrderNowBar } from "@/components/cart/OrderNowBar";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "PFC — PAN Loop Fast Food Center, IIT Kharagpur",
    template: "%s · PFC",
  },
  description:
    "Order from PFC at Oval 3, on the PAN Loop inside IIT Kharagpur. Biryani, Chinese and North Indian, delivered to every hall on the loop. Open 12–4 and 6–11, daily.",
  keywords: ["PFC", "PAN Loop", "IIT Kharagpur", "biryani", "food delivery", "Kharagpur"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "PFC — PAN Loop Fast Food Center",
    title: "PFC — PAN Loop Fast Food Center, IIT Kharagpur",
    description:
      "Oval 3, at the mouth of the PAN Loop. Delivery to every hall. Open 12–4 and 6–11, daily.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "PFC — Pan Loop Fast Food Center" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PFC — PAN Loop Fast Food Center, IIT Kharagpur",
    description: "Oval 3, at the mouth of the PAN Loop. Delivery to every hall.",
    images: ["/og.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon-180.png", sizes: "180x180" }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#14100B",
  colorScheme: "dark",
};

function pad(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

const restaurantSchema = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: SITE.fullName,
  alternateName: "PFC",
  description:
    "Campus restaurant at the entrance to the PAN Loop, IIT Kharagpur. North Indian, Chinese, Mughlai and Continental, with delivery to the halls of residence.",
  address: {
    "@type": "PostalAddress",
    streetAddress: `${SITE.address.line1}, ${SITE.address.line2}`,
    addressLocality: SITE.address.city,
    addressRegion: SITE.address.state,
    postalCode: SITE.address.postalCode,
    addressCountry: SITE.address.country,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: SITE.geo.lat,
    longitude: SITE.geo.lng,
  },
  telephone: SITE.phones,
  servesCuisine: SITE.cuisines,
  priceRange: "₹₹",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: SITE.rating.value,
    reviewCount: SITE.rating.count,
    bestRating: 5,
  },
  openingHoursSpecification: SERVICE_WINDOWS.map((w) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: pad(w.open),
    closes: pad(w.close),
  })),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <head>
        {/* Preload the faces that paint above the fold — kills the serif FOUT. */}
        <link
          rel="preload"
          href="/fonts/Italiana-400.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/CrimsonPro-Variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/InstrumentSans-Variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <script
          type="application/ld+json"
          // Static, authored above — not user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
        />
        <a
          href="#menu"
          className="sr-only-focusable btn btn-primary fixed left-4 top-4 z-[200]"
        >
          Skip to the menu
        </a>
        <ToastProvider>
          <CartProvider>
            {children}
            <OrderNowBar />
            <CartPanel />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
