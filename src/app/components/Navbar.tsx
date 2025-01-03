"use client";
import React, { useState } from "react";
import Link from "next/link";
import { mockHistory } from "@/data/mockData";

const Navbar: React.FC = () => {
  const [isSeasonMenuOpen, setSeasonMenuOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);



  const toggleSeasonMenu = () => setSeasonMenuOpen(!isSeasonMenuOpen);

  const handleYearSelect = (year: string) => {
    setSelectedYear(year === selectedYear ? null : year);
  };

  return (
    <nav className="bg-gray-800 text-white">
      <div className="container mx-auto flex justify-between items-center p-4">
        {/* Logo */}
        <div className="flex items-center">
        <Link href="/">
        {/* <img src="/logo.png" alt="Logo" className="h-10 w-auto mr-3" /> */}
        <span className="text-xl font-semibold">Karting League</span>
        </Link>
          
        </div>

        {/* Navigation */}
        <div className="hidden md:flex space-x-6">
        <Link href="/equipos" className="hover:text-gray-300">
            Equipos
          </Link>

          {/* Temporada Dropdown */}
          <div className="relative">
            <button
              onClick={toggleSeasonMenu}
              className="hover:text-gray-300 focus:outline-none"
            >
              Temporada
            </button>
            {isSeasonMenuOpen && (
              <div className="absolute bg-gray-700 text-white mt-2 rounded-md shadow-lg z-50">
                <ul className="space-y-1 p-2">
                  {mockHistory.years.map((year) => (
                    <li key={year.year}>
                      <button
                        onClick={() => handleYearSelect(year.year)}
                        className="flex justify-between w-full text-left hover:bg-gray-600 px-2 py-1"
                      >
                        {year.year}
                        <svg
                          className={`h-4 w-4 transition-transform ${
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
                            strokeWidth="2"
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      </button>
                      {selectedYear === year.year && (
                        <ul className="ml-4 space-y-1">
                          {year.invierno && (
                            <li>
                              <Link
                                href={`/torneo/${year.year}/invierno`}
                                className="block px-2 py-1 hover:bg-gray-600"
                              >
                                Invierno
                              </Link>
                            </li>
                          )}
                          {year.verano && (
                            <li>
                              <Link
                                href={`/torneo/${year.year}/verano`}
                                className="block px-2 py-1 hover:bg-gray-600"
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

          <Link href="/reglamento" className="hover:text-gray-300">
            Reglamento
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <button
            className="text-white hover:text-gray-300 focus:outline-none"
            onClick={() => {
              const menu = document.getElementById("mobile-menu");
              menu?.classList.toggle("hidden");
            }}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div id="mobile-menu" className="hidden bg-gray-700 text-white md:hidden">
        <ul className="flex flex-col space-y-2 p-4">
          {/* Mobile Pilotos Menu */}
          <li>
          <Link href="/equipos" className="block hover:text-gray-300">
              Equipos
            </Link>
          </li>
          {/* Mobile Temporada Menu */}
          <li>
            <button
              onClick={toggleSeasonMenu}
              className="block text-left hover:text-gray-300"
            >
              Temporada
            </button>
            {isSeasonMenuOpen && (
              <ul className="pl-4">
                {mockHistory.years.map((year) => (
                  <li key={year.year}>
                    <button
                      onClick={() => handleYearSelect(year.year)}
                      className="block hover:bg-gray-600"
                    >
                      {year.year}
                    </button>
                    {selectedYear === year.year && (
                      <ul className="pl-4">
                        {year.invierno && (
                          <li>
                            <Link
                              href={`/torneo/${year.year}/invierno`}
                              className="block hover:bg-gray-600"
                            >
                              Invierno
                            </Link>
                          </li>
                        )}
                        {year.verano && (
                          <li>
                            <Link
                              href={`/torneo/${year.year}/verano`}
                              className="block hover:bg-gray-600"
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
            )}
          </li>
          <li>
            <Link href="/reglamento" className="block hover:text-gray-300">
              Reglamento
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;