// ---------------------------------------------------------------------------
// PLACEHOLDER — verify against the physical menu board.
//
// Every price in this file is a guess inside the documented ₹200–400 per-head
// band. No verified price list for PFC exists publicly. Ten minutes at the
// counter replaces all of it, and nothing else in the codebase has to change:
// prices live here and nowhere else.
//
// The delivery and packaging fees below are placeholders for a second reason —
// the two public sources disagree. MetaKGP says ₹30 total (₹10 packaging +
// ₹20 delivery); Restaurant Guru says roughly ₹15. Unresolved. See FACTS.md.
//
// Twenty of the twenty-six dishes are attested from PFC's public menu listing
// and reviews. Six are marked `unverified` — three breads and three beverages,
// added because the attested twenty leave those two categories empty and a
// category that renders with nothing in it is a broken interface. They are
// flagged in the data and marked in the UI.
// ---------------------------------------------------------------------------

import type { Category, CategoryId, Dish } from "@/lib/types";

/** PLACEHOLDER */
export const PACKAGING_FEE = 10;
/** PLACEHOLDER — base, before the per-hall distance component. */
export const DELIVERY_BASE_FEE = 20;

/** Rail order. The rail itself is derived from which of these have dishes. */
export const CATEGORY_ORDER: Category[] = [
  { id: "biryani", label: "Biryani" },
  { id: "tandoor", label: "Tandoor" },
  { id: "chinese", label: "Chinese" },
  { id: "north-indian", label: "North Indian" },
  { id: "rolls-burgers", label: "Rolls & Burgers" },
  { id: "pasta-pizza", label: "Pasta & Pizza" },
  { id: "rice-noodles", label: "Rice & Noodles" },
  { id: "breads", label: "Breads" },
  { id: "desserts", label: "Desserts" },
  { id: "beverages", label: "Beverages" },
];

export const DISHES: Dish[] = [
  // ------------------------------------------------------------- biryani --
  {
    id: "chicken-mughlai-biryani",
    name: "Chicken Mughlai Biryani",
    category: "biryani",
    blurb: "The one the whole loop orders. Long-grain, heavy on the birista.",
    description:
      "Slow-layered rice with a leg piece, fried onion through every layer, and enough gravy on the side that nobody at the table stays dry. This is the dish PFC is known for beyond the campus gates.",
    price: 230,
    veg: false,
    spice: 2,
    prepMinutes: 22,
    allergens: ["dairy", "tree nuts"],
    portion: "One plate, one leg piece. Two people can share if one of them is lying.",
    imageQuery: "chicken biryani",
  },
  {
    id: "tandoor-chicken-biryani",
    name: "Tandoor Chicken Biryani",
    category: "biryani",
    blurb: "Same rice, but the chicken goes through the tandoor first.",
    description:
      "Charred tikka pieces folded into the biryani instead of braised ones. Drier, smokier, and the reason the queue at 8pm is longer than the queue at 1pm.",
    price: 240,
    veg: false,
    spice: 2,
    prepMinutes: 24,
    allergens: ["dairy"],
    portion: "One plate. Comes with raita whether you ask or not.",
    imageQuery: "tandoori chicken biryani",
  },

  // ------------------------------------------------------------- tandoor --
  {
    id: "boneless-garlic-chicken",
    name: "Boneless Garlic Chicken",
    category: "tandoor",
    blurb: "Six pieces, hard garlic hit, no bones to negotiate.",
    description:
      "Boneless thigh marinated long enough that the garlic gets past the surface, then finished hot. Built for eating standing up while somebody else settles the bill.",
    price: 210,
    veg: false,
    spice: 2,
    prepMinutes: 18,
    allergens: ["dairy"],
    portion: "6 pieces.",
    imageQuery: "garlic chicken tikka",
  },
  {
    id: "paneer-lamba",
    name: "Paneer Lamba",
    category: "tandoor",
    blurb: "Long-cut paneer off the skewer, char on three sides.",
    description:
      "Cut long rather than cubed, which means more surface against the heat and more of the marinade actually catching. The default order for the vegetarian half of any table.",
    price: 190,
    veg: true,
    spice: 1,
    prepMinutes: 16,
    allergens: ["dairy"],
    portion: "6 long pieces.",
    imageQuery: "paneer tikka",
  },

  // ------------------------------------------------------------- chinese --
  {
    id: "chilli-chicken",
    name: "Chilli Chicken",
    category: "chinese",
    blurb: "Kharagpur-Chinese, gravy version. Order rice with it.",
    description:
      "Batter-fried chicken thrown back into a dark, sharp gravy with capsicum and far too much green chilli. Nobody claims it is authentic. Everybody orders it.",
    price: 190,
    veg: false,
    spice: 3,
    prepMinutes: 15,
    allergens: ["soy", "gluten"],
    portion: "Half plate. Ask for dry if you want it as a starter.",
    imageQuery: "chilli chicken",
  },
  {
    id: "chicken-lollipop",
    name: "Chicken Lollipop",
    category: "chinese",
    blurb: "Six frenched wings, red marinade, served with the sharp dip.",
    description:
      "Wings turned out into lollipops, marinated red, fried hard. The dip that comes with them is doing more work than anyone admits.",
    price: 180,
    veg: false,
    spice: 2,
    prepMinutes: 16,
    allergens: ["soy", "gluten"],
    portion: "6 pieces.",
    imageQuery: "chicken lollipop appetizer",
  },
  {
    id: "honey-chilli-potato",
    name: "Honey Chilli Potato",
    category: "chinese",
    blurb: "Sticky, sweet, sesame on top. Gone in four minutes flat.",
    description:
      "Twice-fried potato batons in a honey-chilli glaze with sesame. Order two if the table has more than three people, because the first one never gets shared properly.",
    price: 140,
    veg: true,
    spice: 2,
    prepMinutes: 12,
    allergens: ["sesame", "gluten", "soy"],
    portion: "One plate.",
    imageQuery: "honey chilli potato",
  },
  {
    id: "cheese-corn-nugget",
    name: "Cheese Corn Nugget",
    category: "chinese",
    blurb: "Molten centre. Give it thirty seconds before the first bite.",
    description:
      "Sweetcorn and cheese bound, crumbed and fried. Structurally a hazard straight out of the fryer and worth the wait anyway.",
    price: 150,
    veg: true,
    spice: 0,
    prepMinutes: 12,
    allergens: ["dairy", "gluten"],
    portion: "8 pieces.",
    imageQuery: "fried snack croquettes",
  },

  // -------------------------------------------------------- north indian --
  {
    id: "chicken-butter-masala",
    name: "Chicken Butter Masala",
    category: "north-indian",
    blurb: "Mild, heavy, orange. The safe order that nobody regrets.",
    description:
      "Tomato and cream, butter finish, barely any heat. What you order for the friend who says they cannot handle spice and then finishes half of everyone else's plate.",
    price: 220,
    veg: false,
    spice: 1,
    prepMinutes: 20,
    allergens: ["dairy", "tree nuts"],
    portion: "Half plate. Two rotis minimum.",
    imageQuery: "butter chicken masala",
  },
  {
    id: "chicken-kolhapuri",
    name: "Chicken Kolhapuri",
    category: "north-indian",
    blurb: "The hot one. Dark masala, no cream hiding behind it.",
    description:
      "Coconut and dried red chilli ground into a masala that does not soften on the way to your hall. If the table is arguing about heat, this settles it.",
    price: 210,
    veg: false,
    spice: 3,
    prepMinutes: 20,
    allergens: [],
    portion: "Half plate.",
    imageQuery: "spicy indian chicken curry",
  },
  {
    id: "chicken-rashmi-masala",
    name: "Chicken Rashmi Masala",
    category: "north-indian",
    blurb: "Silky, cashew-thick, closer to a kebab gravy than a curry.",
    description:
      "A cashew and cream base built around soft chicken — rashmi means silk, and the gravy earns it. Sits somewhere between butter masala and a white korma.",
    price: 230,
    veg: false,
    spice: 1,
    prepMinutes: 20,
    allergens: ["dairy", "tree nuts"],
    portion: "Half plate.",
    imageQuery: "creamy chicken curry",
  },
  {
    id: "chicken-keema-lachha",
    name: "Chicken Keema with Lachha Paratha",
    category: "north-indian",
    blurb: "Minced, peppery, and two layered parathas to get through it.",
    description:
      "Chicken keema cooked down dry with whole spice, served with lachha paratha. Filed here rather than under Breads because the keema is the dish and the paratha is the cutlery.",
    price: 200,
    veg: false,
    spice: 2,
    prepMinutes: 18,
    allergens: ["gluten", "dairy"],
    portion: "Keema plus 2 parathas.",
    imageQuery: "chicken keema curry",
  },

  // ------------------------------------------------------- rolls/burgers --
  {
    id: "chicken-tikka-kebab-roll",
    name: "Chicken Tikka Kebab Roll",
    category: "rolls-burgers",
    blurb: "The between-classes order. Ten minutes, one hand.",
    description:
      "Tikka pieces, onion, green chutney, rolled in a paratha and wrapped in paper. Engineered for walking from the loop to a 2pm lecture without stopping.",
    price: 120,
    veg: false,
    spice: 2,
    prepMinutes: 10,
    allergens: ["gluten", "dairy"],
    portion: "One roll. Double egg on request.",
    imageQuery: "chicken kathi roll",
  },
  {
    id: "crunchy-chicken-burger",
    name: "Crunchy Chicken Burger",
    category: "rolls-burgers",
    blurb: "Fried fillet, slaw, soft bun. No ambitions beyond that.",
    description:
      "A crumbed chicken fillet with slaw and mayo in a toasted bun. It does exactly one thing and there is no version of it that disappoints at 10pm.",
    price: 130,
    veg: false,
    spice: 1,
    prepMinutes: 12,
    allergens: ["gluten", "egg", "dairy"],
    portion: "One burger.",
    imageQuery: "crispy chicken burger",
  },

  // --------------------------------------------------------- pasta/pizza --
  {
    id: "chicken-tikka-pizza",
    name: "Chicken Tikka Pizza",
    category: "pasta-pizza",
    blurb: "Tikka, onion, capsicum. Thin base, cut into six.",
    description:
      "Leftover-tikka logic applied to a pizza and it works better than it has any right to. Order it for the table, not for yourself.",
    price: 250,
    veg: false,
    spice: 2,
    prepMinutes: 22,
    allergens: ["gluten", "dairy"],
    portion: "8 inch, 6 slices.",
    imageQuery: "chicken tikka pizza",
  },
  {
    id: "chicken-mixed-sauce-pasta",
    name: "Chicken Mixed Sauce Pasta",
    category: "pasta-pizza",
    blurb: "Red and white together, which is the point.",
    description:
      "Penne in a mixed red-and-white sauce with chicken. Nobody orders the two sauces separately here; the mixed version is the whole reason it is on the board.",
    price: 190,
    veg: false,
    spice: 1,
    prepMinutes: 18,
    allergens: ["gluten", "dairy"],
    portion: "One bowl.",
    imageQuery: "creamy tomato chicken pasta",
  },
  {
    id: "veg-pesto-pasta",
    name: "Veg Pesto Pasta",
    category: "pasta-pizza",
    blurb: "Green, herby, and the least predictable thing on the board.",
    description:
      "Pesto with whatever vegetables are good that week. The one item here that does not taste like anything else within three kilometres of the loop.",
    price: 170,
    veg: true,
    spice: 1,
    prepMinutes: 16,
    allergens: ["gluten", "dairy", "tree nuts"],
    portion: "One bowl.",
    imageQuery: "pesto pasta",
  },

  // --------------------------------------------------------- rice/noodles --
  {
    id: "triple-rice",
    name: "Triple Rice",
    category: "rice-noodles",
    blurb: "Rice, noodles and gravy in one plate. Built for after 10pm.",
    description:
      "Fried rice under noodles under a chilli gravy, with egg and chicken through it. An architecture rather than a recipe, and the single most efficient way to end a night at the loop.",
    price: 180,
    veg: false,
    spice: 2,
    prepMinutes: 18,
    allergens: ["egg", "soy", "gluten"],
    portion: "Full plate. There is no half.",
    imageQuery: "fried rice noodles chinese",
  },
  {
    id: "dal-khichdi-veggies",
    name: "Dal Khichdi with Veggies",
    category: "rice-noodles",
    blurb: "What you order when the week has gone badly.",
    description:
      "Soft dal khichdi with vegetables through it and ghee on top. On the board for the same reason every campus canteen keeps one honest plate: some nights you need food, not a treat.",
    price: 150,
    veg: true,
    spice: 1,
    prepMinutes: 20,
    allergens: ["dairy"],
    portion: "One bowl. Pickle on the side.",
    imageQuery: "dal khichdi",
  },

  // -------------------------------------------------------------- breads --
  {
    id: "butter-naan",
    name: "Butter Naan",
    category: "breads",
    blurb: "Straight off the tandoor, butter still melting.",
    description: "Leavened, blistered, brushed with butter. Two per person is the honest number.",
    price: 45,
    veg: true,
    spice: 0,
    prepMinutes: 8,
    allergens: ["gluten", "dairy"],
    portion: "One piece.",
    unverified: true,
    imageQuery: "butter naan bread",
  },
  {
    id: "lachha-paratha",
    name: "Lachha Paratha",
    category: "breads",
    blurb: "Layered, and it pulls apart the way it should.",
    description: "Wound and folded so it comes apart in sheets. The right bread for anything with a thick gravy.",
    price: 50,
    veg: true,
    spice: 0,
    prepMinutes: 9,
    allergens: ["gluten"],
    portion: "One piece.",
    unverified: true,
    imageQuery: "lachha paratha",
  },
  {
    id: "tandoori-roti",
    name: "Tandoori Roti",
    category: "breads",
    blurb: "Plain, fast, cheapest thing that fills a plate.",
    description: "Whole wheat, straight onto the tandoor wall. No butter unless you ask.",
    price: 25,
    veg: true,
    spice: 0,
    prepMinutes: 7,
    allergens: ["gluten"],
    portion: "One piece.",
    unverified: true,
    imageQuery: "tandoori roti",
  },

  // ------------------------------------------------------------ desserts --
  {
    id: "brownie-ice-cream",
    name: "Brownie with Ice Cream",
    category: "desserts",
    blurb: "Warm brownie, cold vanilla. The treat's last course.",
    description:
      "A warm brownie under a scoop of vanilla. This is what gets ordered when the person paying has already stopped counting.",
    price: 120,
    veg: true,
    spice: 0,
    prepMinutes: 6,
    allergens: ["gluten", "dairy", "egg"],
    portion: "One brownie, one scoop.",
    imageQuery: "brownie with ice cream",
  },

  // ----------------------------------------------------------- beverages --
  {
    id: "masala-chai",
    name: "Masala Chai",
    category: "beverages",
    blurb: "Strong, sweet, small glass. The 4pm shutter drink.",
    description: "Boiled long with ginger and cardamom. Ordered most in the gap before the evening shift opens.",
    price: 25,
    veg: true,
    spice: 0,
    prepMinutes: 5,
    allergens: ["dairy"],
    portion: "One glass.",
    unverified: true,
    imageQuery: "masala chai tea",
  },
  {
    id: "cold-coffee",
    name: "Cold Coffee",
    category: "beverages",
    blurb: "Thick, over-sweet, exactly as it should be.",
    description: "Blended cold with ice cream in it. Not a coffee in any serious sense and nobody wants it to be.",
    price: 90,
    veg: true,
    spice: 0,
    prepMinutes: 7,
    allergens: ["dairy"],
    portion: "One tall glass.",
    unverified: true,
    imageQuery: "iced cold coffee",
  },
  {
    id: "fresh-lime-soda",
    name: "Fresh Lime Soda",
    category: "beverages",
    blurb: "Sweet or salted. Say which, or you get sweet.",
    description: "Lime, soda, and a decision you have to make at the counter. The correct answer after Kolhapuri is salted.",
    price: 60,
    veg: true,
    spice: 0,
    prepMinutes: 4,
    allergens: [],
    portion: "One glass.",
    unverified: true,
    imageQuery: "fresh lime soda drink",
  },
];

export const DISHES_BY_ID: ReadonlyMap<string, Dish> = new Map(
  DISHES.map((d) => [d.id, d]),
);

/**
 * Rail is DERIVED, never hard-coded. A category with no dishes cannot render,
 * which is what stops an empty Beverages tab from ever shipping.
 */
export const CATEGORIES: Category[] = CATEGORY_ORDER.filter((c) =>
  DISHES.some((d) => d.category === c.id),
);

export function categoryLabel(id: CategoryId): string {
  return CATEGORY_ORDER.find((c) => c.id === id)?.label ?? id;
}

/** The three with the strongest public reputation. Spotlight order. */
export const SPOTLIGHT_IDS = [
  "chicken-mughlai-biryani",
  "chilli-chicken",
  "chicken-butter-masala",
] as const;

export const PRICE_BANDS = [
  { id: "under-100", label: "Under ₹100", min: 0, max: 99 },
  { id: "100-200", label: "₹100–200", min: 100, max: 200 },
  { id: "over-200", label: "Over ₹200", min: 201, max: Infinity },
] as const;

export type PriceBandId = (typeof PRICE_BANDS)[number]["id"];
