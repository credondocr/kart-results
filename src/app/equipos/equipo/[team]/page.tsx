import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getTeam } from "@/data/drivers/teams";
import { getPilotRacedCategories, normalizeName } from "@/app/utils/pilotHistory";
import { getTeamRoster } from "@/app/utils/teamRoster";
import Breadcrumb from "@/app/components/Breadcrumb";
import DriverAvatar from "@/app/components/DriverAvatar";
import CountryFlag from "@/app/components/CountryFlag";

interface PageProps {
  params: Promise<{ team: string }>;
}

const prettifyTeam = (slug: string) =>
  slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { team } = await params;
  const known = getTeam(team);
  const name = known?.name ?? prettifyTeam((team ?? "").toLowerCase());
  return {
    title: `${name} | Costa Rica Kart Championship`,
    description: `Pilotos del equipo ${name} en el Costa Rica Kart Championship.`,
  };
}

export default async function TeamPage({ params }: PageProps) {
  const { team } = await params;
  const slug = (team ?? "").toLowerCase();
  const known = getTeam(slug);
  const teamPilots = getTeamRoster(slug);

  if (!teamPilots.length) notFound();

  const meta = known ?? { slug, name: prettifyTeam(slug), logo: "" };

  return (
    <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
      <Breadcrumb />

      <div className="flex flex-col items-center gap-4 my-6">
        {meta.logo && (
          <div className="team-card-logo lg">
            <Image src={meta.logo} alt={meta.name} width={180} height={180} />
          </div>
        )}
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
          const categories =
            raced.length > 0
              ? raced
              : pilot.categories.map((label) => ({ label, years: [] as string[] }));
          const isSynthetic = !pilot.profileUrl;
          const hint = isSynthetic ? `?p=${encodeURIComponent(normalizeName(pilot.name))}` : "";
          return (
            <Link
              key={`${meta.slug}-${pilot.kartNumber}-${pilot.name}`}
              href={`/equipos/equipo/${meta.slug}/${pilot.kartNumber}${hint}`}
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
                  <span key={category.label} className="tag-chip">{category.label}</span>
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
