"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Drivers } from "@/data/drivers/data";
import { TEAMS } from "@/data/drivers/teams";
import { Championships } from "@/data/history";
import { normalizeName, getHistoryPilots, samePerson } from "@/app/utils/pilotHistory";
import { uniqueHistoryPilots } from "@/app/utils/teamRoster";

interface SearchPaletteProps {
  onClose: () => void;
}

interface Result {
  key: string;
  label: string;
  meta?: string;
  href: string;
  group: "Pilotos" | "Clases" | "Equipos" | "Temporadas";
}

function classResults(): Result[] {
  const titles = new Set<string>();
  for (const championship of Championships.years) {
    for (const season of [championship.invierno, championship.verano]) {
      if (!season) continue;
      for (const cls of season.classes) titles.add(cls.title);
    }
  }
  const latest = String(Championships.years[Championships.years.length - 1].year);
  return [...titles].map((title) => ({
    key: `c-${title}`,
    label: title,
    href: `/Campeonato/${latest}/general?tab=${encodeURIComponent(title)}`,
    group: "Clases",
  }));
}

function seasonResults(): Result[] {
  const results: Result[] = [];
  for (const championship of [...Championships.years].reverse()) {
    const year = String(championship.year);
    results.push({ key: `g-${year}`, label: `General ${year}`, href: `/Campeonato/${year}/general`, group: "Temporadas" });
    if (championship.invierno) {
      results.push({ key: `i-${year}`, label: `Invierno ${year}`, href: `/Campeonato/${year}/invierno`, group: "Temporadas" });
    }
    if (championship.verano) {
      results.push({ key: `v-${year}`, label: `Verano ${year}`, href: `/Campeonato/${year}/verano`, group: "Temporadas" });
    }
  }
  return results;
}

const QUICK_LINKS: Result[] = [
  { key: "q-invierno", label: "Invierno 2026", href: "/Campeonato/2026/invierno", group: "Temporadas" },
  { key: "q-general", label: "General 2026", href: "/Campeonato/2026/general", group: "Temporadas" },
  { key: "q-equipos", label: "Equipos", href: "/equipos", group: "Equipos" },
  { key: "q-campeones", label: "Campeones por temporada", href: "/campeones", group: "Temporadas" },
  { key: "q-estadisticas", label: "Estadísticas", href: "/estadisticas", group: "Temporadas" },
];

const SearchPalette: React.FC<SearchPaletteProps> = ({ onClose }) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (!coarse) inputRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const results = useMemo<Result[]>(() => {
    const raw = query.trim();
    if (!raw) return QUICK_LINKS;
    const nq = normalizeName(raw);
    const digits = /^\d+$/.test(raw);

    const seenProfileHrefs = new Set<string>();
    const profilePilots: Result[] = Drivers.filter((driver) =>
      digits
        ? String(driver.kartNumber).includes(raw) || normalizeName(driver.name).includes(nq)
        : normalizeName(driver.name).includes(nq)
    )
      .slice(0, 8)
      .filter((driver) => {
        const href = `/equipos/equipo/${driver.teamLogo}/${driver.kartNumber}`;
        if (seenProfileHrefs.has(href)) return false; // dup en drivers/data
        seenProfileHrefs.add(href);
        return true;
      })
      .map((driver) => ({
        key: `p-${driver.teamLogo}-${driver.kartNumber}-${normalizeName(driver.name)}`,
        label: driver.name,
        meta: `#${driver.kartNumber}`,
        href: `/equipos/equipo/${driver.teamLogo}/${driver.kartNumber}`,
        group: "Pilotos",
      }));

    // Pilotos que solo existen en el historial de posiciones (sin perfil en drivers).
    const historyPilots: Result[] = uniqueHistoryPilots(
      getHistoryPilots()
        .filter((pilot) =>
          digits
            ? String(pilot.number).includes(raw) || normalizeName(pilot.name).includes(nq)
            : normalizeName(pilot.name).includes(nq)
        )
        .filter((pilot) => !Drivers.some((driver) => samePerson(driver.name, pilot.name)))
    )
      .slice(0, 8 - profilePilots.length)
      .map((pilot) => ({
        key: `h-${pilot.team}-${pilot.number}-${normalizeName(pilot.name)}`,
        label: pilot.name,
        meta: `#${pilot.number}`,
        href: `/equipos/equipo/${pilot.team}/${pilot.number}?p=${encodeURIComponent(normalizeName(pilot.name))}`,
        group: "Pilotos",
      }));

    const pilots = [...profilePilots, ...historyPilots];

    const teams: Result[] = TEAMS.filter(
      (team) => normalizeName(team.name).includes(nq) || team.slug.includes(nq)
    )
      .slice(0, 4)
      .map((team) => ({
        key: `t-${team.slug}`,
        label: team.name,
        href: `/equipos/equipo/${team.slug}`,
        group: "Equipos",
      }));

    const classes: Result[] = classResults()
      .filter((cls) => normalizeName(cls.label).includes(nq) || cls.label.includes(raw))
      .slice(0, 4);

    const seasons: Result[] = seasonResults()
      .filter((season) => normalizeName(season.label).includes(nq) || season.label.includes(raw))
      .slice(0, 4);

    return [...pilots, ...classes, ...teams, ...seasons];
  }, [query]);

  const groups = useMemo(() => {
    if (!query.trim()) {
      return [{ name: "Accesos rápidos", items: results }];
    }
    const order: Result["group"][] = ["Pilotos", "Clases", "Equipos", "Temporadas"];
    return order
      .map((name) => ({ name, items: results.filter((result) => result.group === name) }))
      .filter((group) => group.items.length > 0);
  }, [query, results]);

  return (
    <div
      className="search-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="search-panel" role="dialog" aria-modal="true" aria-label="Buscar" ref={panelRef}>
        <input
          ref={inputRef}
          type="search"
          className="search-input"
          placeholder="Buscar piloto, equipo o temporada…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Buscar pilotos, equipos y temporadas"
        />

        {groups.length > 0 ? (
          <div className="search-results">
            {groups.map((group) => (
              <div key={group.name}>
                <div className="search-group">{group.name}</div>
                {group.items.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className="search-item"
                    onClick={onClose}
                  >
                    <span>{item.label}</span>
                    {item.meta && <span className="search-item-meta">{item.meta}</span>}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <p className="search-empty">Sin resultados para «{query.trim()}»</p>
        )}

        <div className="search-footer">
          <span>esc para cerrar</span>
          <span>Enter para abrir</span>
        </div>
      </div>
    </div>
  );
};

export default SearchPalette;
