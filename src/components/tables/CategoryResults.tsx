'use client';

import { Table, TableHeader, TableBody, TableHeaderCell } from '@/components/ui/Table';
import { DriverResultRow } from './DriverResultRow';
import { RaceResult } from '@/data/types';

interface CategoryResultsProps {
  name: string;
  results: RaceResult[];
}

export function CategoryResults({ name, results }: CategoryResultsProps) {
  return (
    <div className="my-4">
      {name && <h3 className="category-label">{name}</h3>}
      <Table>
        <TableHeader>
          <tr>
            <TableHeaderCell className="px-2">Po</TableHeaderCell>
            <TableHeaderCell className="px-2">No</TableHeaderCell>
            <TableHeaderCell>Piloto</TableHeaderCell>
            <TableHeaderCell align="right">Puntos</TableHeaderCell>
          </tr>
        </TableHeader>
        <TableBody>
          {results.map((result, index) => (
            <DriverResultRow
              key={index}
              rank={result.rank ?? index + 1}
              number={result.number}
              driver={result.driver}
              country={result.country}
              team={result.team}
              points={result.points ?? 0}
              rowIndex={index}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
