import { DishMedia } from "@/components/ui/DishMedia";
import { SpicePips, VegMark } from "@/components/ui/Marks";
import { DISHES_BY_ID, SPOTLIGHT_IDS } from "@/data/menu";
import { rupees } from "@/lib/format";

const NOTES: Record<string, string> = {
  "chicken-mughlai-biryani":
    "The dish that gets named when someone off campus asks what PFC is. Ordered by the plate, argued about by the leg piece.",
  "chilli-chicken":
    "Not authentic anything, and nobody has ever asked it to be. It is the default second order on every table of four.",
  "chicken-butter-masala":
    "The one that ends the negotiation. Mild enough for the whole table, heavy enough that nobody orders a second thing.",
};

export function Spotlight() {
  const dishes = SPOTLIGHT_IDS.map((id) => DISHES_BY_ID.get(id)).filter(
    (d): d is NonNullable<typeof d> => Boolean(d),
  );

  return (
    <section className="section" aria-labelledby="spotlight-heading">
      <div className="shell">
        <p className="eyebrow mb-4">Reputation</p>
        <h2 id="spotlight-heading" className="h2 max-w-[16ch]">
          Three you will be told to order.
        </h2>
      </div>

      <div className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-[max(1rem,calc((100vw-78rem)/2+2.5rem))] pb-4">
        {dishes.map((dish) => (
          <article
            key={dish.id}
            className="card w-[min(85vw,30rem)] shrink-0 snap-center overflow-hidden"
          >
            <div className="relative aspect-[3/2] w-full overflow-hidden">
              <DishMedia
                id={dish.id}
                alt={dish.name}
                sizes="(max-width: 640px) 85vw, 480px"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2.5">
                <VegMark veg={dish.veg} />
                <h3 className="h3 flex-1">{dish.name}</h3>
                <span className="data text-brass">{rupees(dish.price)}</span>
              </div>
              <p className="mt-3 text-jade-mist/75">{NOTES[dish.id] ?? dish.description}</p>
              <div className="mt-4 flex items-center gap-3">
                <SpicePips level={dish.spice} />
                <span className="data text-jade-mist/45">{dish.prepMinutes} min</span>
              </div>
            </div>
          </article>
        ))}

        {/* Scroll-driven progress rule. Runs on the scroll container's own
            inline timeline — no listener, no library. */}
        <div className="sr-only">End of spotlight</div>
      </div>

      <div className="shell mt-2">
        <div className="h-px w-full bg-hairline">
          <div className="progress-rule h-px w-full origin-left bg-brass" />
        </div>
      </div>
    </section>
  );
}
