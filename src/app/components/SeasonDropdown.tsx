"use client";

import { Season } from "@/types/types";
import { useState, useEffect } from "react";



export default function SeasonDropdown({
  onSeasonChange,
}: {
  onSeasonChange: (season: Season | null) => void;
}) {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const response = await fetch("/api/seasons");
        if (!response.ok) {
          throw new Error("Failed to fetch seasons");
        }
        const data = await response.json();
        setSeasons(data.data.map((season: any) => ({
          id: season.id,
          name: season.name,
        })));
      } catch (error) {
        console.error("Error fetching seasons:", error);
      }
    };

    fetchSeasons();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(event.target.value);
    const season = seasons.find((s) => s.id === selectedId) || null;
    setSelectedSeason(season);
    onSeasonChange(season);
  };

  return (
    <div>
      <label htmlFor="season">Select Season:</label>
      <select id="season" value={selectedSeason?.id || ""} onChange={handleChange}>
        <option value="">-- Select a Season --</option>
        {seasons.map((season) => (
          <option key={season.id} value={season.id}>
            {season.name}
          </option>
        ))}
      </select>
    </div>
  );
}