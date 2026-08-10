/**
 * Seed quotes for the reviews band. Written for this build — they are
 * illustrative, not transcribed from any platform, because reviews on Zomato /
 * magicpin / Google belong to the people who wrote them. The aggregate figure
 * in data/site.ts IS real and is cited as public data.
 */
export interface SeedReview {
  id: string;
  name: string;
  hall: string;
  rating: number;
  body: string;
}

export const SEED_REVIEWS: SeedReview[] = [
  {
    id: "r1",
    name: "Ananya",
    hall: "SNVH",
    rating: 5,
    body: "Got my first offer letter in October and the juniors had me at the counter within the hour. Four biryanis and a brownie later I understood the system.",
  },
  {
    id: "r2",
    name: "Rohit",
    hall: "Patel",
    rating: 4,
    body: "Delivery to Patel is genuinely fifteen minutes. The Kolhapuri is not for everyone — order it once to find out which one you are.",
  },
  {
    id: "r3",
    name: "Debjit",
    hall: "Nehru",
    rating: 4,
    body: "Open until eleven, which is the only reason half of Nehru eats dinner at all during endsems. Triple Rice does not photograph well and does not need to.",
  },
  {
    id: "r4",
    name: "Meera",
    hall: "LLR",
    rating: 3,
    body: "Queue at 8pm is long and the arena fills up fast. Worth it, but go at 6:30 if you have a choice.",
  },
];
