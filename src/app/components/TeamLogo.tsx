import Image from "next/image";
import React from "react";

interface TeamLogoProps {
  team: string;
  altText?: string; // Texto alternativo para accesibilidad
}

const PLACEHOLDER_LOGO = "/logos/independiente.png";

const TeamLogo: React.FC<TeamLogoProps> = ({ team, altText }) => {
  const formattedTeamName = (team ?? "").toLowerCase().replace(/\s+/g, "-").trim();
  const logoPath = formattedTeamName ? `/logos/${formattedTeamName}.png` : PLACEHOLDER_LOGO;

  return (
    <Image
      src={logoPath}
      width={50}
      height={50}
      alt={altText || (formattedTeamName ? `${team} Logo` : "Sin equipo")}
      style={{ width: 50, height: 50, objectFit: "contain" }}
      onError={(e) => {
        (e.target as HTMLImageElement).src = PLACEHOLDER_LOGO;
      }}
    />
  );
};

export default TeamLogo;
