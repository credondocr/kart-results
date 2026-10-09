import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Drivers } from "@/data/drivers/data";
import { TEAMS } from "@/data/drivers/teams";
import Breadcrumb from "@/app/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Equipos | Costa Rica Kart Championship",
  description: "Equipos y pilotos del Costa Rica Kart Championship.",
};

const TeamsPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
      <Breadcrumb />
      <h1 className="class-title my-4 text-4xl md:text-5xl">Equipos</h1>
      <p className="season-eyebrow">
        Costa Rica Kart Championship · <strong>{TEAMS.length} equipos</strong>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10">
        {TEAMS.map((team) => {
          const count = Drivers.filter((driver) => driver.teamLogo === team.slug).length;
          return (
            <Link key={team.slug} href={`/equipos/equipo/${team.slug}`} className="team-card">
              <div className="team-card-logo">
                <Image src={team.logo} alt={team.name} width={140} height={140} />
              </div>
              <h2 className="team-card-name">{team.name}</h2>
              <p className="team-card-count">
                <strong>{count}</strong> {count === 1 ? "piloto" : "pilotos"}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default TeamsPage;
