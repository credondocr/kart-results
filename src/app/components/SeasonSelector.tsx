'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Championships } from '@/data/history';

const SeasonSelector: React.FC = () => {
  const [isSeasonMenuOpen, setSeasonMenuOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const toggleSeasonMenu = () => setSeasonMenuOpen(!isSeasonMenuOpen);

  const closeMenu = () => {
    setSeasonMenuOpen(false);
    setSelectedYear(null);
  };

  const handleYearSelect = (year: string) =>
    setSelectedYear(year === selectedYear ? null : year);

  return (
    <div className="relative">
      <button
        onClick={toggleSeasonMenu}
        className="px-4 py-2 text-gray-200 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 flex items-center space-x-2 shadow-lg"
      >
        <span>Temporada</span>
        <svg
          className={`h-4 w-4 transform transition-transform duration-200 ${isSeasonMenuOpen ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isSeasonMenuOpen && (
        <div className="absolute left-0 bg-gray-700 rounded-lg shadow-xl mt-2 min-w-[200px] border border-gray-600 z-50">
          <ul className="py-2">
            {Championships.years.map((year) => (
              <li key={year.year} className="px-4">
                <button
                  onClick={() => handleYearSelect(year.year)}
                  className="w-full text-left flex justify-between items-center hover:bg-gray-600 px-3 py-2 rounded-md"
                >
                  <span className="font-medium">{year.year}</span>
                  <svg
                    className={`h-4 w-4 transform transition-transform duration-200 ${selectedYear === year.year ? 'rotate-180' : ''}`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
                {selectedYear === year.year && (
                  <ul className="mt-1 ml-4 border-l border-gray-600 space-y-1">
                    <li>
                      <Link
                        href={`/Campeonato/${year.year}/general`}
                        className="block hover:bg-gray-600 px-3 py-2 rounded-md transition-colors duration-150"
                        onClick={closeMenu}
                      >
                        General
                      </Link>
                    </li>
                    {year.invierno && (
                      <li>
                        <Link
                          href={`/Campeonato/${year.year}/invierno`}
                          className="block hover:bg-gray-600 px-3 py-2 rounded-md transition-colors duration-150"
                          onClick={closeMenu}
                        >
                          Invierno
                        </Link>
                      </li>
                    )}
                    {year.verano && (
                      <li>
                        <Link
                          href={`/Campeonato/${year.year}/verano`}
                          className="block hover:bg-gray-600 px-3 py-2 rounded-md transition-colors duration-150"
                          onClick={closeMenu}
                        >
                          Verano
                        </Link>
                      </li>
                    )}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SeasonSelector;
