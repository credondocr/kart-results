"use client";

import { Race } from "@/types/types";
import { useEffect, useState } from "react";


interface RaceDropdownProps {
  season?: string;
  onRaceChange: (race: Race | null) => void;
}

const RaceDropdown: React.FC<RaceDropdownProps> = ({ season, onRaceChange }) => {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRaces = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/races?season=${encodeURIComponent(season || "")}`);
        if (!response.ok) {
          throw new Error("Failed to fetch races");
        }
        const data = await response.json();
        setRaces(data.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRaces();
  }, [season]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(event.target.value, 10);
    const selectedRace = races.find((race) => race.id === selectedId) || null;
    onRaceChange(selectedRace);
  };

  if (loading) return <div>Loading races...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <select onChange={handleChange} defaultValue="">
      <option value="" disabled>
        Select a race
      </option>
      {races.map((race) => (
        <option key={race.id} value={race.id}>
          {race.name} ({race.date})
        </option>
      ))}
    </select>
  );
};

export default RaceDropdown;