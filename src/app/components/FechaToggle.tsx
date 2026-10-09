"use client";

interface FechaToggleProps {
  fechas: number;
  value: number | null;
  onChange: (fecha: number | null) => void;
}

const FechaToggle: React.FC<FechaToggleProps> = ({ fechas, value, onChange }) => {
  if (fechas <= 1) return null;

  return (
    <div className="tabs-container fecha-toggle" role="group" aria-label="Ver clasificación por fecha">
      <button
        type="button"
        className={`tab-button ${value === null ? "active" : ""}`}
        aria-pressed={value === null}
        onClick={() => onChange(null)}
      >
        Acumulado
      </button>
      {Array.from({ length: fechas }, (_, index) => index + 1).map((fecha) => (
        <button
          key={fecha}
          type="button"
          className={`tab-button ${value === fecha ? "active" : ""}`}
          aria-pressed={value === fecha}
          onClick={() => onChange(fecha)}
        >
          Fecha {fecha}
        </button>
      ))}
    </div>
  );
};

export default FechaToggle;
