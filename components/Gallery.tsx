"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { GALLERY } from "@/data/gallery";
import { IMAGES } from "@/data/images.generated";

const ITEMS = GALLERY.filter((item) => IMAGES[item.id]);

export function Gallery() {
  const [index, setIndex] = useState<number | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setIndex(null);
    trigger.current?.focus();
  }, []);

  useEffect(() => {
    if (index === null) return;
    closeButton.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") setIndex((i) => (i === null ? i : (i + 1) % ITEMS.length));
      if (event.key === "ArrowLeft")
        setIndex((i) => (i === null ? i : (i - 1 + ITEMS.length) % ITEMS.length));
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [index, close]);

  if (ITEMS.length === 0) return null;

  const active = index === null ? null : ITEMS[index];
  const activeImage = active ? IMAGES[active.id] : undefined;

  return (
    <section className="section" aria-labelledby="gallery-heading">
      <div className="shell">
        <div className="text-center">
          <p className="eyebrow mb-5">Gallery</p>
          <h2 id="gallery-heading" className="h2 mx-auto max-w-[20ch]">
            The arena, the counter, the plate.
          </h2>
          <div className="metal-rule mx-auto mt-6" aria-hidden="true" />
        </div>

        <div className="mt-10 columns-2 gap-4 lg:columns-3 [&>*]:mb-4">
          {ITEMS.map((item, i) => {
            const record = IMAGES[item.id]!;
            return (
              <button
                key={item.id}
                type="button"
                className="reveal card group relative block w-full break-inside-avoid overflow-hidden text-left"
                onClick={(e) => {
                  trigger.current = e.currentTarget;
                  setIndex(i);
                }}
              >
                <Image
                  src={record.src}
                  alt={item.caption}
                  width={record.width ?? 1200}
                  height={record.height ?? 900}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 380px"
                  loading="lazy"
                  placeholder={record.blurDataURL ? "blur" : "empty"}
                  blurDataURL={record.blurDataURL}
                  className="h-auto w-full transition-transform duration-620 ease-entrance group-hover:scale-[1.04]"
                />
                <span className="serif-italic pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-espresso/90 to-transparent p-3.5 pt-12 text-[0.9375rem] text-linen">
                  {item.caption}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {active && activeImage && (
        <div className="anim-fade fixed inset-0 z-[110] grid place-items-center bg-espresso/97 p-4">
          <div role="dialog" aria-modal="true" aria-label={active.caption} className="relative w-full max-w-4xl">
            <Image
              src={activeImage.src}
              alt={active.caption}
              width={activeImage.width ?? 1600}
              height={activeImage.height ?? 1200}
              sizes="(max-width: 1024px) 100vw, 900px"
              className="mx-auto h-auto max-h-[78svh] w-auto rounded-xl object-contain"
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="serif-italic text-[0.9375rem] text-linen">{active.caption}</p>
                {activeImage.attributionRequired && (
                  <p className="mt-1 text-xs text-linen-2">
                    Photo: {activeImage.creator} ·{" "}
                    <a
                      href={activeImage.licenseUrl}
                      className="underline hover:text-champagne"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {activeImage.license}
                    </a>{" "}
                    ·{" "}
                    <a
                      href={activeImage.sourceUrl}
                      className="underline hover:text-champagne"
                      target="_blank"
                      rel="noreferrer"
                    >
                      source
                    </a>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="btn btn-ghost h-11 w-11 px-0"
                  onClick={() => setIndex((i) => (i === null ? i : (i - 1 + ITEMS.length) % ITEMS.length))}
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <span className="data text-linen-2">
                  {index! + 1}/{ITEMS.length}
                </span>
                <button
                  type="button"
                  className="btn btn-ghost h-11 w-11 px-0"
                  onClick={() => setIndex((i) => (i === null ? i : (i + 1) % ITEMS.length))}
                  aria-label="Next image"
                >
                  ›
                </button>
                <button ref={closeButton} type="button" className="btn btn-ghost ml-1 px-4" onClick={close}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
