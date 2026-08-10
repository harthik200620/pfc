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
        <Link href="/" className="data text-brass hover:text-emerald-lit">
          ← PFC
        </Link>

        <h1 className="h2 mt-6">Image credits</h1>

        <p className="mt-5 text-jade-mist/75">
          {entries.length} photograph{entries.length === 1 ? "" : "s"}, all sourced under licences
          that permit reuse — CC0 and public domain first, Creative Commons attribution licences
          only where nothing in the public domain fitted. {needsCredit.length} of them require a
          credit; those are also credited in place, in the dish modal and the gallery lightbox.
        </p>

        <p className="mt-4 text-jade-mist/75">
          Nothing here is taken from Zomato, magicpin, Google Maps or Restaurant Guru. Those
          photographs belong to the people who took them or to the platform. The storefront on the
          hero is drawn rather than photographed, for the same reason: no freely licensed picture
          of the building exists.
        </p>

        <div className="card mt-10 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead>
              <tr className="border-b border-hairline">
                <th scope="col" className="eyebrow p-4">Image</th>
                <th scope="col" className="eyebrow p-4">Creator</th>
                <th scope="col" className="eyebrow p-4">Licence</th>
                <th scope="col" className="eyebrow p-4">Source</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(([id, record]) => (
                <tr key={id} className="border-b border-hairline/60 last:border-0">
                  <td className="data p-4 text-jade-mist/70">{id}</td>
                  <td className="p-4 text-jade-mist/85">{record.creator || "Unknown"}</td>
                  <td className="p-4">
                    <a
                      href={record.licenseUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={`data ${record.attributionRequired ? "text-brass" : "text-jade-mist/60"} hover:underline`}
                    >
                      {record.license}
                    </a>
                  </td>
                  <td className="p-4">
                    <a
                      href={record.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-lit hover:underline"
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
          <p className="mt-6 text-jade-mist/60">
            No images fetched yet. Run <span className="data">npm run images</span>.
          </p>
        )}
      </div>
    </main>
  );
}
