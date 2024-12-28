"use client";

import { useState, useEffect } from "react";

interface RaceResult {
  id: number;
  position: number | null;
  r1: number | null;
  r2: number | null;
  r3: number | null;
  driver: {
    Name: string;
  };
}

interface Category {
  id: number;
  name: string;
}

export default function SeasonLeaderboard({
  season,
  race,
}: {
  season: string;
  race?: string;
}) {
  const [resultsByCategory, setResultsByCategory] = useState<
    Record<string, RaceResult[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      try {
        // Obtener las categorías
        const categoriesResponse = await fetch("/api/categories");
        if (!categoriesResponse.ok) {
          throw new Error("Failed to fetch categories");
        }
        const categoriesData: { data: Category[] } = await categoriesResponse.json();

        const resultsData: Record<string, RaceResult[]> = {};

        // Obtener resultados por cada categoría
        for (const category of categoriesData.data) {
          const response = await fetch(
            `/api/results/${season}/${race || ""}/${encodeURIComponent(category.name)}`
          );

          if (!response.ok) {
            throw new Error(`Failed to fetch results for category ${category.name}`);
          }

          const data = await response.json();
          resultsData[category.name] = data.data || [];
        }

        setResultsByCategory(resultsData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [season, race]); // Se ejecuta cuando cambian estos valores

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Resultados de la Carrera</h1>
      {Object.entries(resultsByCategory).map(([categoryName, results]) => (
        <div key={categoryName}>
          <h2>{categoryName}</h2>
          <table
            border="1"
            cellPadding="10"
            style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}
          >
            <thead>
              <tr>
                <th>Posición</th>
                <th>Nombre del Piloto</th>
                <th>R1</th>
                <th>R2</th>
                <th>R3</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.id}>
                  <td>{result.position ?? "N/A"}</td>
                  <td>{result.driver.Name}</td>
                  <td>{result.r1 ?? "N/A"}</td>
                  <td>{result.r2 ?? "N/A"}</td>
                  <td>{result.r3 ?? "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}