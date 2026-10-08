import type { Class, RaceResult } from "../../src/data/types";

function q(value: string): string {
  return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

function num(value: number): string {
  return String(value);
}

function kartNumber(value: number | string): string {
  return typeof value === "string" ? q(value) : String(value);
}

function serializeResult(result: RaceResult): string[] {
  const lines = ["        {"];
  if (result.rank !== undefined) lines.push(`          rank: ${result.rank},`);
  lines.push(`          number: ${kartNumber(result.number)},`);
  lines.push(`          driver: ${q(result.driver)},`);
  lines.push(`          team: ${q(result.team)},`);
  lines.push(`          country: ${q(result.country)},`);
  lines.push(`          scores: [${result.scores.map(num).join(", ")}],`);
  lines.push(`          points: ${num(result.points ?? 0)},`);
  if (result.tiebreaker !== undefined) lines.push(`          tiebreaker: ${num(result.tiebreaker)},`);
  lines.push(`          worst: ${num(result.worst)},`);
  lines.push("        },");
  return lines;
}

export function serializeClass(cls: Class, exportName: string): string {
  const lines: string[] = [
    `import { Class } from "@/data/types";`,
    ``,
    `export const ${exportName}: Class = {`,
    `  title: ${q(cls.title)},`,
    `  ageGroup: ${q(cls.ageGroup)},`,
    `  details: [`,
    ...cls.details.map((d) => `    ${q(d)},`),
    `  ],`,
    `  img: ${q(cls.img)},`,
    `  categories: [`,
  ];

  for (const category of cls.categories) {
    lines.push(`    {`);
    lines.push(`      name: ${q(category.name)},`);
    lines.push(`      results: [`);
    for (const result of category.results) {
      lines.push(...serializeResult(result));
    }
    lines.push(`      ],`);
    lines.push(`    },`);
  }

  lines.push(`  ],`, `}`, ``);
  return lines.join("\n");
}
