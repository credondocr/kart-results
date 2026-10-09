import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Drivers } from "@/data/drivers/data";
import { getTeam } from "@/data/drivers/teams";
import Breadcrumb from "@/app/components/Breadcrumb";
import DriverAvatar from "@/app/components/DriverAvatar";
import CountryFlag from "@/app/components/CountryFlag";
import TeamLogo from "@/app/components/TeamLogo";

interface PageProps {
  params: Promise<{ team: string; id: string }>;
}

function findPilot(teamSlug: string, id: string) {
  const number = Number(id);
  if (!Number.isInteger(number)) return undefined;
  return Drivers.find(
    (driver) => driver.teamLogo.toLowerCase() === teamSlug && driver.kartNumber === number
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { team, id } = await params;
  const pilot = findPilot(team.toLowerCase(), id);
  if (!pilot) return { title: "Piloto | Costa Rica Kart Championship" };
  return {
    title: `${pilot.name} | Costa Rica Kart Championship`,
    description: `Ficha del piloto ${pilot.name} (#${pilot.kartNumber}) del Costa Rica Kart Championship.`,
  };
}

export default async function PilotPage({ params }: PageProps) {
  const { team, id } = await params;
  const meta = getTeam(team);
  const pilot = findPilot((team ?? "").toLowerCase(), id);
  if (!meta || !pilot) notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
      <Breadcrumb />

      <div className="pilot-profile">
        <div className="pilot-profile-media">
          <DriverAvatar pilot={pilot} large />
        </div>

        <div className="pilot-profile-info">
          <p className="season-eyebrow" style={{ marginBottom: "0.5rem" }}>
            <Link href={`/equipos/equipo/${meta.slug}`} className="crumb">{meta.name}</Link>
          </p>
          <h1 className="class-title align-left text-4xl md:text-5xl">
            {pilot.name}
          </h1>

          <div className="pilot-profile-stats">
            <div className="stat">
              <span className="stat-label">Kart</span>
              <span className="stat-value">#{pilot.kartNumber}</span>
            </div>
            <div className="stat">
              <span className="stat-label">País</span>
              <span className="stat-value with-media">
                <CountryFlag countryCode={pilot.country} alt={pilot.country} />
                {pilot.country}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Equipo</span>
              <span className="stat-value with-media">
                <TeamLogo team={pilot.teamLogo} altText={meta.name} />
                {meta.name}
              </span>
            </div>
          </div>

          <div className="pilot-profile-categories">
            <span className="stat-label">Categorías</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {pilot.categories.map((category) => (
                <span key={category} className="tag-chip">{category}</span>
              ))}
            </div>
          </div>

          {pilot.biography && <p className="pilot-profile-bio">{pilot.biography}</p>}

          <Link href={`/equipos/equipo/${meta.slug}`} className="back-link">
            ← Volver a {meta.name}
          </Link>
        </div>
      </div>
    </div>
  );
}
