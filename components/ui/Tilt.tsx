"use client";

import { useCallback, useRef, type ReactNode } from "react";

/**
 * Pointer-tracked 3D tilt. The JS writes four custom properties and nothing
 * else — perspective, shadows, the specular highlight and every gate
 * ((hover: hover), prefers-reduced-motion) live in globals.css, so touch
 * devices and reduced-motion users never see a transform at all.
 */
export function Tilt({
  children,
  className = "",
  max = 6,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const el = useRef<HTMLDivElement>(null);

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== "mouse") return;
      const node = el.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      // A zero-sized rect (hidden container, mid-layout) would divide to NaN
      // and write junk into the custom properties.
      if (rect.width < 1 || rect.height < 1) return;
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      node.style.setProperty("--rx", `${((0.5 - py) * 2 * max).toFixed(2)}deg`);
      node.style.setProperty("--ry", `${((px - 0.5) * 2 * max).toFixed(2)}deg`);
      node.style.setProperty("--sx", `${(px * 100).toFixed(1)}%`);
      node.style.setProperty("--sy", `${(py * 100).toFixed(1)}%`);
    },
    [max],
  );

  const onPointerLeave = useCallback(() => {
    const node = el.current;
    if (!node) return;
    node.style.setProperty("--rx", "0deg");
    node.style.setProperty("--ry", "0deg");
  }, []);

  return (
    <div
      ref={el}
      className={`tilt ${className}`}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {children}
      <div className="tilt-shine" aria-hidden="true" />
    </div>
  );
}
