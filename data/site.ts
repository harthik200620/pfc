// Subject facts. Sources for every line are in FACTS.md.

export const SITE = {
  name: "PFC",
  fullName: "PAN Loop Fast Food Center",
  tagline: "PAN Loop · IIT Kharagpur",
  url: "https://pfc-kharagpur.example",

  address: {
    line1: "Shop No. Oval 3, PAN Loop",
    line2: "Near Patel Hall of Residence, IIT Kharagpur",
    city: "Kharagpur",
    state: "West Bengal",
    postalCode: "721302",
    country: "IN",
  },

  // MetaKGP Wiki.
  phones: ["+91 90938 88281", "+91 90468 59505"],

  /** Approximate, for the map deep link. IIT KGP campus. */
  geo: { lat: 22.3149, lng: 87.3105 },

  cuisines: [
    "North Indian",
    "Chinese",
    "Mughlai",
    "Continental",
    "Fast food",
    "Desserts",
  ],

  /** Restaurant Guru, at time of writing. Cited as public data, not our own. */
  rating: { value: 3.8, count: 2224, source: "Restaurant Guru" },

  priceRange: "₹200–400 per person",

  seating: "Shaded open-air arena",

  deliversTo: "Halls of residence, departments and the Main Building",
} as const;

/**
 * The split shift, in minutes from midnight, Asia/Kolkata. Daily.
 * The site treats this as a live constraint, not decoration.
 */
export const SERVICE_WINDOWS = [
  { open: 12 * 60, close: 16 * 60 }, // 12:00–16:00
  { open: 18 * 60, close: 23 * 60 }, // 18:00–23:00
] as const;

export const TIMEZONE = "Asia/Kolkata";

export const NAV_LINKS = [
  { href: "#menu", label: "Menu" },
  { href: "#delivery", label: "Delivery" },
  { href: "#reserve", label: "Reserve" },
  { href: "#visit", label: "Visit" },
] as const;
