/**
 * The page's ambient base. Four fixed layers behind everything:
 *   plate     the storefront photograph, blurred to a wash and darkened
 *   veil      94% ink, plus the two ambient poles — emerald from above,
 *             brass from the lower right
 *   vignette  pulls the corners back down so the eye stays centred
 *   grain     the same feTurbulence the hero uses, so the page reads as one
 *             material rather than a lit hero stuck on a flat body
 *
 * All four are CSS (see the atmosphere block in globals.css). The photograph is
 * a background-image and not an <img>: if /images/hero-storefront.jpg is absent
 * the layer simply paints nothing and the veil's gradients over ink are a
 * complete look on their own, where a missing <img> would render a broken-image
 * box across the whole viewport.
 *
 * Mounted as the first child of <body>. Tree order is load-bearing: this and
 * .section::before are both z-index -1 in the root stacking context, so being
 * first is what puts the per-section lighting on top of the wash.
 *
 * Server component — pure markup, zero JS.
 */
export function PageAtmosphere() {
  return (
    <div className="atmos" aria-hidden="true">
      <div className="atmos-plate" />
      <div className="atmos-veil" />
      <div className="atmos-vignette" />
      <div className="grain" />
    </div>
  );
}
