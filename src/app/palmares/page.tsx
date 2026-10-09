import type { Metadata } from "next";
import Link from "next/link";
import { getChampions } from "@/app/utils/pilotHistory";
import { findPilotProfile, pilotLinkHref } from "@/app/utils/pilotLinks";
import Breadcrumb from "@/app/components/Breadcrumb";
import TeamLogo from "@/app/components/TeamLogo";

export const metadata: Metadata = {
  title: "Palmarés | Costa Rica Kart Championship",
  description:
    "Primeros lugares de cada temporada y categoría del Costa Rica Kart Championship.",
};

const seasonLabel = (season: string) =>
  season.charAt(0).toUpperCase() + season.slice(1);

export default function PalmaresPage() {
  const champions = getChampions();
  const byYear = new Map<string, typeof champions>();
  for (const entry of champions) {
    const list = byYear.get(entry.year) ?? [];
    list.push(entry);
    byYear.set(entry.year, list);
  }
  const years = [...byYear.keys()].sort((a, b) => Number(b) - Number(a));

  return (
    <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
      <Breadcrumb />
      <h1 className="class-title my-4 text-4xl md:text-5xl">Palmarés</h1>
      <p className="season-eyebrow">
        Primeros lugares por temporada · <strong>a la fecha</strong>
      </p>

      <div className="mt-10 space-y-12">
        {years.map((year) => (
          <section key={year} aria-label={`Temporada ${year}`}>
            <h2 className="class-title text-3xl">{year}</h2>

            <div className="table-container mt-6">
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Temporada</th>
                      <th className="text-left">Clase / Categoría</th>
                      <th className="text-left">Campeón</th>
                      <th>Equipo</th>
                      <th className="points-cell">Puntos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byYear.get(year)!.map((entry, index) => {
                      const profile = findPilotProfile(entry.driver, entry.number, entry.team);
                      return (
                        <tr
                          key={`${entry.season}-${entry.classTitle}-${entry.categoryName}-${index}`}
                          style={{ "--row": index } as React.CSSProperties}
                        >
                          <td>{seasonLabel(entry.season)}</td>
                          <td className="text-left">
                            <span className="history-class">{entry.classTitle}</span>
                            {entry.categoryName && (
                              <span className="history-cat"> · {entry.categoryName}</span>
                            )}
                          </td>
                          <td className="text-left">
                            <span className="champion-cell">
                              <span className="rank-chip gold">1</span>
                              {profile ? (
                                <Link
                                  href={pilotLinkHref(profile)}
                                  className="driver-link"
                                >
                                  {entry.driver}
                                </Link>
                              ) : (
                                entry.driver
                              )}
                            </span>
                          </td>
                          <td>
                            <TeamLogo team={entry.team} altText={entry.team} />
                          </td>
                          <td className="points-cell">{entry.points}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
