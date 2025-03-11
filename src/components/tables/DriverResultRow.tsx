'use client';

import { TableRow, TableCell } from '@/components/ui/Table';
import CountryFlag from '@/app/components/CountryFlag';
import TeamLogo from '@/app/components/TeamLogo';

interface DriverResultRowProps {
  rank: number;
  number: number;
  driver: string;
  country: string;
  team: string;
  points: number;
}

export function DriverResultRow({
  rank,
  number,
  driver,
  country,
  team,
  points
}: DriverResultRowProps) {
  return (
    <TableRow>
      <TableCell className="px-2">{rank}</TableCell>
      <TableCell className="px-2">{number}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <CountryFlag countryCode={country} alt={country} />
          <TeamLogo team={team} altText={team} />
          <span className="whitespace-nowrap">{driver}</span>
        </div>
      </TableCell>
      <TableCell align="right">{points}</TableCell>
    </TableRow>
  );
}
