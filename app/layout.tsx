import type { Metadata, Viewport } from "next";
import { SITE, SERVICE_WINDOWS } from "@/data/site";
import { CartProvider } from "@/components/providers/CartProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { CartPanel } from "@/components/cart/CartPanel";
import { PageAtmosphere } from "@/components/PageAtmosphere";
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
  },
  twitter: {
    card: "summary_large_image",
    title: "PFC — PAN Loop Fast Food Center, IIT Kharagpur",
    description: "Oval 3, at the mouth of the PAN Loop. Delivery to every hall.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#051C15",
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
      <body>
        <PageAtmosphere />
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
            <CartPanel />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
