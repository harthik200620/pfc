"use client";

import { useEffect, useRef, useState } from "react";
import { NAV_LINKS } from "@/data/site";
import { OpenPill } from "@/components/OpenPill";
import { useCart } from "@/components/providers/CartProvider";

export function Nav() {
  const [stuck, setStuck] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const { count, openCart } = useCart();

  // IntersectionObserver on a 1px sentinel rather than a scroll listener —
  // no work on the main thread while the menu data hydrates.
  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;
    const io = new IntersectionObserver(([entry]) => setStuck(!entry?.isIntersecting), {
      threshold: 0,
      rootMargin: "-80px 0px 0px 0px",
    });
    io.observe(node);
    return () => io.disconnect();
  }, []);

  // Focus trap + scroll lock for the mobile overlay.
  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = () =>
      Array.from(
        overlay.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

    focusables()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        trigger.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <>
      <div ref={sentinel} aria-hidden="true" className="absolute top-0 h-px w-full" />

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-320 ${
          stuck ? "border-b border-hairline bg-ink/80 backdrop-blur-xl" : "border-b border-transparent"
        }`}
      >
        <nav className="shell flex h-16 items-center justify-between gap-4" aria-label="Primary">
          <a href="#top" className="flex items-baseline gap-2 font-display text-2xl tracking-tight">
            PFC
            <span className="data hidden text-[0.625rem] text-brass sm:inline">PAN LOOP</span>
          </a>

          <ul className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm font-medium text-jade-mist/80 transition-colors hover:text-emerald-lit"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 sm:gap-3">
            <OpenPill className="hidden lg:inline-flex" />

            <button
              type="button"
              onClick={() => openCart()}
              className="btn btn-ghost px-4"
              aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
            >
              <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path
                  d="M1.5 1.5h2.2l2 9.6h8.3l1.8-6.9H5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="7.2" cy="15" r="1.4" fill="currentColor" />
                <circle cx="13.4" cy="15" r="1.4" fill="currentColor" />
              </svg>
              <span className="data" aria-hidden="true">
                {count}
              </span>
            </button>

            <button
              ref={trigger}
              type="button"
              className="btn btn-ghost h-11 w-11 shrink-0 px-0 md:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
              <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true">
                {menuOpen ? (
                  <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M2 2l14 10M16 2L2 12" />
                  </g>
                ) : (
                  <g fill="currentColor">
                    <rect width="18" height="1.8" rx="0.9" />
                    <rect y="6.1" width="18" height="1.8" rx="0.9" />
                    <rect y="12.2" width="18" height="1.8" rx="0.9" />
                  </g>
                )}
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {menuOpen && (
        <div
          ref={overlay}
          id="mobile-menu"
          className="anim-fade fixed inset-0 z-40 bg-ink/97 backdrop-blur-xl md:hidden"
        >
          <div className="shell flex h-full flex-col justify-center gap-2 pb-24">
            <ul className="stagger flex flex-col gap-1">
              {NAV_LINKS.map((link, i) => (
                <li key={link.href} style={{ ["--i" as string]: i }}>
                  <a
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block py-3 font-display text-5xl tracking-tight transition-colors hover:text-emerald-lit"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col items-start gap-4">
              <OpenPill />
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setMenuOpen(false);
                  openCart();
                }}
              >
                Open cart · {count}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
