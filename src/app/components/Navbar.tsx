"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Championships } from "@/data/history";
import Image from "next/image";

const Navbar: React.FC = () => {
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
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Image
                src="/logos/acek.webp"
                alt="Logo"
                width={50}
                height={50}
                className="h-12 w-auto cursor-pointer"
              />
            </Link>
            <Link href="/" className="text-xl font-semibold">
              Costa Rica Kart Championship
            </Link>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center space-x-6">
            {/* <Link href="/equipos" className="hover:text-gray-300" onClick={closeMenu}>
              Equipos
            </Link> */}
            {/* <Link href="/inscripciones" className="hover:text-gray-300" onClick={closeMenu}>
              Inscripciones
            </Link> */}
            <div className="relative">
              <button
                onClick={toggleSeasonMenu}
                className="hover:text-gray-300 focus:outline-none"
              >
                Temporada
              </button>
              {isSeasonMenuOpen && (
                <div className="absolute bg-gray-700 rounded shadow-lg mt-2 z-50">
                  <ul className="py-2 px-4 space-y-1">
                    {Championships.years.map((year) => (
                      <li key={year.year}>
                        <button
                          onClick={() => handleYearSelect(year.year)}
                          className="w-full text-left flex justify-between items-center hover:bg-gray-600 px-2 py-1"
                        >
                          {year.year}
                          <svg
                            className={`h-4 w-4 transform transition ${
                              selectedYear === year.year ? "rotate-180" : ""
                            }`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        </button>
                        {selectedYear === year.year && (
                          <ul className="mt-2 pl-4 space-y-1">
                            <li>
                              <Link
                                href={`/Campeonato/${year.year}/general`}
                                className="block hover:bg-gray-600 px-2 py-1"
                                onClick={closeMenu}
                              >
                                General
                              </Link>
                            </li>
                            {year.invierno && (
                              <li>
                                <Link
                                  href={`/Campeonato/${year.year}/invierno`}
                                  className="block hover:bg-gray-600 px-2 py-1"
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
                                  className="block hover:bg-gray-600 px-2 py-1"
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
            {/* <Link href="/reglamento" className="hover:text-gray-300" onClick={closeMenu}>
              Reglamento
            </Link> */}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleSeasonMenu}
              className="hover:text-gray-300 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isSeasonMenuOpen && (
        <div className="md:hidden bg-gray-700">
          <ul className="flex flex-col py-2 px-4 space-y-2">
      
            {/* <li>
              <Link href="/equipos" className="hover:text-gray-300" onClick={closeMenu}>
                Equipos
              </Link>
            </li>
            */}
  
            {/* <li>
              <Link href="/inscripciones" className="hover:text-gray-300" onClick={closeMenu}>
                Inscripciones
              </Link>
            </li> */}
            <li>
              <button
                onClick={toggleSeasonMenu}
                className="hover:text-gray-300 w-full text-left"
              >
                Temporada
              </button>
              <ul className="pl-4 mt-2">
                {Championships.years.map((year) => (
                  <li key={year.year}>
                    <button
                      onClick={() => handleYearSelect(year.year)}
                      className="w-full text-left hover:bg-gray-600 px-2 py-1"
                    >
                      {year.year}
                    </button>
                    {selectedYear === year.year && (
                      <ul className="pl-4 space-y-1">
                        <li>
                          <Link
                            href={`/Campeonato/${year.year}/general`}
                            className="block hover:bg-gray-600"
                            onClick={closeMenu}
                          >
                            General
                          </Link>
                        </li>
                        {year.invierno && (
                          <li>
                            <Link
                              href={`/Campeonato/${year.year}/invierno`}
                              className="block hover:bg-gray-600"
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
                              className="block hover:bg-gray-600"
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
            </li>
            {/* <li>
              <Link href="/reglamento" className="hover:text-gray-300" onClick={closeMenu}>
                Reglamento
              </Link>
            </li> */}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
