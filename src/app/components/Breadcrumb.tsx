"use client";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getTeam } from "@/data/drivers/teams";
import { Drivers } from "@/data/drivers/data";
import { findHistoryEntry } from "@/app/utils/pilotHistory";

interface Crumb {
  label: string;
  href: string | null;
}

const formatPart = (part: string) => {
  return part.charAt(0).toUpperCase() +
         part.slice(1).toLowerCase().replace(/-/g, " ");
};

function buildCrumbs(pathname: string, nameHint?: string): Crumb[] {
  const parts = pathname.split("/").filter((part) => part);
  const crumbs: Crumb[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const isLast = i === parts.length - 1;
    const prev = parts[i - 1];

    // Ruta de equipos: /equipos/equipo/<slug>/<número>
    if (part === "equipo") continue; // segmento estructural, no se muestra

    if (part === "equipos") {
      crumbs.push({ label: "Equipos", href: isLast ? null : "/equipos" });
      continue;
    }

    if (prev === "equipo") {
      const team = getTeam(part);
      crumbs.push({
        label: team?.name ?? formatPart(part),
        href: isLast ? null : `/equipos/equipo/${part}`,
      });
      continue;
    }

    // Ficha de piloto: último segmento numérico tras el slug del equipo
    if (isLast && /^\d+$/.test(part) && parts[i - 2] === "equipo") {
      const slug = parts[i - 1] ?? "";
      const pilot = Drivers.find(
        (driver) =>
          driver.teamLogo.toLowerCase() === slug.toLowerCase() &&
          driver.kartNumber === Number(part)
      );
      const hinted = nameHint ? findHistoryEntry(slug, part, nameHint)?.driver : undefined;
      const fromHistory = hinted ?? pilot?.name ?? findHistoryEntry(slug, part)?.driver;
      crumbs.push({ label: fromHistory ?? `#${part}`, href: null });
      continue;
    }

    // Ruta del campeonato: /Campeonato/<año>/<temporada>
    if (part === "Campeonato") {
      crumbs.push({ label: "Campeonato", href: "/" });
      continue;
    }

    if (/^\d{4}$/.test(part)) {
      crumbs.push({ label: part, href: `/Campeonato/${part}/general` });
      continue;
    }

    if (prev && /^\d{4}$/.test(prev)) {
      crumbs.push({
        label: formatPart(part),
        href: isLast ? null : `/Campeonato/${prev}/${part}`,
      });
      continue;
    }

    crumbs.push({
      label: formatPart(part),
      href: isLast ? null : `/${parts.slice(0, i + 1).join("/")}`,
    });
  }

  return crumbs;
}

const BreadcrumbInner: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const nameHint = searchParams.get("p") ?? undefined;
  const crumbs = buildCrumbs(pathname ?? "/", nameHint);

  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="Ruta de navegación" className="text-sm py-4">
      <ol className="flex flex-wrap items-center gap-y-1">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={index} className="flex items-center">
              {index > 0 && <span className="crumb-sep" aria-hidden="true">›</span>}
              {crumb.href && !isLast ? (
                <Link href={crumb.href} className="crumb">
                  {crumb.label}
                </Link>
              ) : (
                <span className="crumb current" aria-current={isLast ? "page" : undefined}>
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// useSearchParams() exige un límite Suspense en páginas estáticas (prerender).
const Breadcrumb: React.FC = () => (
  <Suspense fallback={<div className="text-sm py-4" />}>
    <BreadcrumbInner />
  </Suspense>
);

export default Breadcrumb;
