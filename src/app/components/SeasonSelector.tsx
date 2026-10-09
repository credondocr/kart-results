'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Championships } from '@/data/history';

const SeasonSelector: React.FC = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  const match = pathname?.match(/^\/Campeonato\/(\d{4})\/(\w+)/);
  const currentYear = match?.[1] ?? null;
  const currentSeason = match?.[2] ?? null;
  const [activeYear, setActiveYear] = useState<string>(currentYear ?? Championships.years[Championships.years.length - 1].year);

  useEffect(() => {
    if (match) setActiveYear(match[1]);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const yearData = Championships.years.find((y) => y.year === activeYear);
  const label = currentYear
    ? `${currentSeason === 'general' ? 'General' : currentSeason} ${currentYear}`
    : 'Temporada';

  const seasonLink = (season: string, text: string) => {
    const isCurrent = currentYear === activeYear && currentSeason === season;
    return (
      <li key={season}>
        <Link
          href={`/Campeonato/${activeYear}/${season}`}
          className={`season-option ${isCurrent ? 'active' : ''}`}
          onClick={() => setOpen(false)}
        >
          <span>{text}</span>
          {isCurrent && <span className="season-option-dot" />}
        </Link>
      </li>
    );
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className="season-trigger"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="season-trigger-dot" />
        <span className="season-trigger-label">{label}</span>
        <svg
          className={`season-trigger-chevron ${open ? 'open' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="season-panel" role="menu" aria-label="Seleccionar temporada">
          <div className="season-panel-header">Temporadas</div>

          <div className="season-years" role="none">
            {Championships.years.map((year) => (
              <button
                key={year.year}
                type="button"
                className={`season-year-chip ${activeYear === year.year ? 'active' : ''}`}
                onClick={() => setActiveYear(year.year)}
              >
                {year.year}
              </button>
            ))}
          </div>

          <ul className="season-list" role="menu">
            {seasonLink('general', 'General')}
            {yearData?.invierno && seasonLink('invierno', 'Invierno')}
            {yearData?.verano && seasonLink('verano', 'Verano')}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SeasonSelector;
