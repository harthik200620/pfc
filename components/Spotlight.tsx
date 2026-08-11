import { DishMedia } from "@/components/ui/DishMedia";
import { SpicePips, VegMark } from "@/components/ui/Marks";
import { Tilt } from "@/components/ui/Tilt";
import { DISHES_BY_ID, SPOTLIGHT_IDS } from "@/data/menu";
import { rupees } from "@/lib/format";

const NOTES: Record<string, string> = {
  "chicken-mughlai-biryani":
    "The dish the campus names first. Layered long-grain rice, a proper leg piece, fried onion through every stratum.",
  "chilli-chicken":
    "Kharagpur's own dialect of Chinese — batter-fried, folded into a dark, sharp gravy. The standing second order at every table.",
  "chicken-butter-masala":
    "Tomato, linen and a butter finish. The plate that settles the table's argument before it starts.",
};

export function Spotlight() {
  const dishes = SPOTLIGHT_IDS.map((id) => DISHES_BY_ID.get(id)).filter(
    (d): d is NonNullable<typeof d> => Boolean(d),
  );

  return (
    <section className="border-y border-line bg-espresso-2" aria-labelledby="spotlight-heading">
      <div className="section">
        <div className="shell">
          <p className="eyebrow mb-5">Signatures</p>
          <h2 id="spotlight-heading" className="h2 max-w-[20ch]">
            Three plates carry the reputation.
          </h2>
          <div className="metal-rule mt-6" aria-hidden="true" />
        </div>

        <div className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto px-[max(1rem,calc((100vw-78rem)/2+2.5rem))] pb-4">
          {dishes.map((dish) => (
            <Tilt key={dish.id} className="w-[min(85vw,30rem)] shrink-0 snap-center rounded-xl" max={4}>
              <article className="card h-full overflow-hidden bg-espresso transition-colors hover:border-champagne/40">
                <div className="relative aspect-[3/2] w-full overflow-hidden border-b border-line">
                  <DishMedia id={dish.id} alt={dish.name} sizes="(max-width: 640px) 85vw, 480px" />
                </div>
                <div className="p-7">
                  <div className="flex items-center gap-3">
                    <VegMark veg={dish.veg} />
                    <h3 className="h3 flex-1">{dish.name}</h3>
                    <span className="price text-xl text-champagne">{rupees(dish.price)}</span>
                  </div>
                  <p className="mt-3.5 text-[0.9375rem] leading-relaxed text-linen-2">
                    {NOTES[dish.id] ?? dish.description}
                  </p>
                  <div className="mt-5 flex items-center gap-3">
                    <SpicePips level={dish.spice} />
                    <span className="data text-sm text-linen-2">{dish.prepMinutes} min</span>
                  </div>
                </div>
              </article>
            </Tilt>
          ))}

          <div className="sr-only">End of signatures</div>
        </div>

        <div className="shell mt-2">
          <div className="h-px w-full bg-line">
            <div className="progress-rule h-px w-full origin-left bg-champagne" />
          </div>
        </div>
      </div>
    </section>
  );
}
