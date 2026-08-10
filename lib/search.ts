import type { Dish } from "@/lib/types";

/**
 * Small subsequence matcher over name + blurb. Not a real fuzzy library:
 * "btr msla" finds Chicken Butter Masala, which is the whole requirement,
 * and it costs nothing in the bundle.
 */
function subsequenceScore(haystack: string, needle: string): number {
  if (!needle) return 1;
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase();

  const direct = h.indexOf(n);
  if (direct === 0) return 1000;
  if (direct > 0) return 800 - direct;

  let hi = 0;
  let score = 0;
  let streak = 0;
  for (const ch of n) {
    if (ch === " ") continue;
    const found = h.indexOf(ch, hi);
    if (found === -1) return 0;
    streak = found === hi ? streak + 1 : 0;
    score += 10 + streak * 4 - Math.min(found - hi, 8);
    hi = found + 1;
  }
  return Math.max(score, 1);
}

export function searchDishes(dishes: Dish[], query: string): Dish[] {
  const q = query.trim();
  if (!q) return dishes;

  return dishes
    .map((dish) => ({
      dish,
      score: Math.max(
        subsequenceScore(dish.name, q) * 2,
        subsequenceScore(dish.blurb, q),
      ),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.dish);
}
