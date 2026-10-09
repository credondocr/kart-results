'use client';

import { TableRow, TableCell } from '@/components/ui/Table';
import CountryFlag from '@/app/components/CountryFlag';
import TeamLogo from '@/app/components/TeamLogo';

interface DriverResultRowProps {
  rank: number;
  number: number | string;
  driver: string;
  country: string;
  team: string;
  points: number;
  rowIndex?: number;
}

export function DriverResultRow({
  rank,
  number,
  driver,
  country,
  team,
  points,
  rowIndex
}: DriverResultRowProps) {
  const podiumClass = rank <= 3 ? `podium-${rank}` : "";

  return (
    <TableRow
      className={podiumClass}
      style={{ "--row": rowIndex ?? 0 } as React.CSSProperties}
    >
      <TableCell className="position">
        <span className="rank-chip">{rank}</span>
      </TableCell>
      <TableCell className="race-number">{number}</TableCell>
      <TableCell className="driver-info" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <CountryFlag countryCode={country} alt={country} />
        <TeamLogo team={team} altText={team} />
        <span className="driver-name">{driver}</span>
      </TableCell>
      <TableCell align="right" className="points-cell">{points}</TableCell>
    </TableRow>
  );
}
