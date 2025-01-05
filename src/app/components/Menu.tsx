"use client";

import { useState } from "react";
import Link from "next/link";

import { Championships } from "@/data/history";

const Menu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openYear, setOpenYear] = useState<string | null>(null);

  const years = ["2024"]; // Lista de años

  const toggleYear = (year: string) => {
    setOpenYear(openYear === year ? null : year);
  };

  return (
    <div>
      {/* Botón que dice "Temporadas" en lugar del ícono hamburguesa */}
      <button
        className="p-2 bg-gray-800 text-white md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        Temporadas
      </button>

      {/* Menú principal */}
      <nav
        className={`${
          isOpen ? "block" : "hidden"
        } md:block bg-gray-800 text-white`}
      >
        <ul className="space-y-2 p-4">
          {years.map((year) => (
            <li key={year}>
              {/* Año principal */}
              <button
                className="w-full flex justify-between items-center p-2 text-left bg-gray-700 hover:bg-gray-600"
                onClick={() => toggleYear(year)}
              >
                <span>{year}</span>
                <span>{openYear === year ? "−" : "+"}</span>
              </button>

              {/* Submenú de invierno/verano */}
              {openYear === year && (
  <ul className="pl-4 space-y-2 bg-gray-700">
    {Championships.years
      .find((championship) => championship.year === year) &&
      Object.entries(
        Championships.years.find((championship) => championship.year === year) || {}
      )
        .filter(([season]) => season === "invierno" || season === "verano")
        .map(([season]) => (
          <li key={season}>
            <Link
              href={`/${year}/${season}`}
              className="block p-2 hover:bg-gray-600"
            >
              {season.charAt(0).toUpperCase() + season.slice(1)}
            </Link>
          </li>
        ))}
  </ul>
)}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Menu;