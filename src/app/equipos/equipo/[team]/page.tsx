import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Drivers } from "@/data/drivers/data";
import { getTeam } from "@/data/drivers/teams";
import { getPilotRacedCategories } from "@/app/utils/pilotHistory";
import Breadcrumb from "@/app/components/Breadcrumb";
import DriverAvatar from "@/app/components/DriverAvatar";
import CountryFlag from "@/app/components/CountryFlag";

interface PageProps {
  params: Promise<{ team: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { team } = await params;
  const meta = getTeam(team);
  if (!meta) return { title: "Equipo | Costa Rica Kart Championship" };
  return {
    title: `${meta.name} | Costa Rica Kart Championship`,
    description: `Pilotos del equipo ${meta.name} en el Costa Rica Kart Championship.`,
  };
}

export default async function TeamPage({ params }: PageProps) {
  const { team } = await params;
  const meta = getTeam(team);
  if (!meta) notFound();

  const teamPilots = Drivers.filter((driver) => driver.teamLogo === meta.slug);

  if (!teamPilots.length) notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
      <Breadcrumb />

      <div className="flex flex-col items-center gap-4 my-6">
        <div className="team-card-logo lg">
          <Image src={meta.logo} alt={meta.name} width={180} height={180} />
        </div>
        <div className="text-center">
          <p className="season-eyebrow" style={{ marginBottom: "0.4rem" }}>
            <Link href="/equipos" className="crumb">Equipos</Link>
            {" · "}
            <strong>{teamPilots.length} {teamPilots.length === 1 ? "piloto" : "pilotos"}</strong>
          </p>
          <h1 className="class-title text-4xl md:text-5xl">{meta.name}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
        {teamPilots.map((pilot) => {
          const raced = getPilotRacedCategories(pilot.name, pilot.kartNumber);
          const categories = raced.length > 0 ? raced : pilot.categories;
          return (
            <Link
              key={`${pilot.teamLogo}-${pilot.kartNumber}`}
              href={`/equipos/equipo/${meta.slug}/${pilot.kartNumber}`}
              className="pilot-card"
            >
              <DriverAvatar pilot={pilot} />
              <h2 className="pilot-card-name">{pilot.name}</h2>
              <p className="pilot-card-number">
                Kart <strong>#{pilot.kartNumber}</strong>
              </p>
              <div className="pilot-card-tags">
                <CountryFlag countryCode={pilot.country} alt={pilot.country} />
                {categories.slice(0, 2).map((category) => (
                  <span key={category} className="tag-chip">{category}</span>
                ))}
                {categories.length > 2 && (
                  <span className="tag-chip">+{categories.length - 2}</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
