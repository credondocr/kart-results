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

export default function PrintedLeaderboard({ season, race, category }: { season: string; race?: string; category?: string; }) {
  const [results, setResults] = useState<RaceResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
     
      setLoading(true);
      setError(null);

      try {
        let response
        if (category != undefined) {
          response = await fetch(`/api/results/${season}/${race}/${category}`);
        } else {
          response = await fetch(`/api/results/${season}/${race}`);
        }

        if (!response.ok) {
          throw new Error("Failed to fetch results");
        }
        const data = await response.json();
        setResults(data.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [season, race, category]); // Se ejecuta cuando cambian estos valores

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Resultados de la Carrera</h1>
      <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
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
  );
}