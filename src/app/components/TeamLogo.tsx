import Image from "next/image";
import React from "react";

interface TeamLogoProps {
  team: string;
  altText?: string; // Texto alternativo para accesibilidad
}

const TeamLogo: React.FC<TeamLogoProps> = ({ team, altText }) => {
  const formattedTeamName = team.toLowerCase().replace(/\s+/g, "-");
  const logoPath = `/logos/${formattedTeamName}.png`;

  return (
    <Image
      src={logoPath}
      width={50}
      height={50}
      alt={altText || `${team} Logo`}
      style={{ width: 50, height: 50, objectFit: "contain" }}
      onError={(e) => {
        (e.target as HTMLImageElement).src = "/logos/default.png";
      }}
    />
  );
};

export default TeamLogo;