import type { Metadata } from "next";
import Link from "next/link";
import { IMAGES } from "@/data/images.generated";

export const metadata: Metadata = {
  title: "Image credits",
  description:
    "Every photograph on this site, where it came from, under what licence and by whom.",
};

export default function CreditsPage() {
  const entries = Object.entries(IMAGES);
  const needsCredit = entries.filter(([, r]) => r.attributionRequired);

  return (
    <main className="section">
      <div className="shell max-w-3xl">
        <Link href="/" className="brand text-champagne hover:text-linen">
          ← PFC
        </Link>

        <h1 className="h2 mt-6">Image credits</h1>
        <div className="metal-rule mt-6" aria-hidden="true" />

        <p className="mt-7 text-linen-2">
          {entries.length} photograph{entries.length === 1 ? "" : "s"}. Dish and gallery imagery is
          sourced under licences that permit reuse — CC0 and public domain first, Creative Commons
          attribution licences only where nothing in the public domain fitted.{" "}
          {needsCredit.length} require a credit; those are also credited in place, in the dish
          modal and the gallery lightbox.
        </p>

        <p className="mt-4 text-linen-2">
          The one exception is the storefront photo on the hero: no freely licensed picture of the
          building exists, so it is used from Restaurant Guru&apos;s public listing with a visible
          credit and a link to the source. It is not openly licensed, and it is listed below on
          the same terms as everything else.
        </p>

        <div className="card mt-10 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="eyebrow p-4">Image</th>
                <th scope="col" className="eyebrow p-4">Creator</th>
                <th scope="col" className="eyebrow p-4">Licence</th>
                <th scope="col" className="eyebrow p-4">Source</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(([id, record]) => (
                <tr key={id} className="border-b border-line last:border-0">
                  <td className="data p-4 text-linen-2">{id}</td>
                  <td className="p-4 text-linen">{record.creator || "Unknown"}</td>
                  <td className="p-4">
                    <a
                      href={record.licenseUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={`data ${record.attributionRequired ? "text-champagne" : "text-linen-2"} hover:underline`}
                    >
                      {record.license}
                    </a>
                  </td>
                  <td className="p-4">
                    <a
                      href={record.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-champagne underline underline-offset-4 hover:text-linen"
                    >
                      link
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {entries.length === 0 && (
          <p className="mt-6 text-linen-2">
            No images fetched yet. Run <span className="data">npm run images</span>.
          </p>
        )}
      </div>
    </main>
  );
}
