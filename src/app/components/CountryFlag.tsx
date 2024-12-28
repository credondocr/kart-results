import React from "react";

interface CountryFlagProps {
    countryCode: string; // Acrónimo del país, como 'US', 'FR', 'JP'
    alt?: string; // Texto alternativo opcional
    style?: React.CSSProperties; // Estilos personalizados opcionales
  }

const CountryFlag: React.FC<CountryFlagProps> = ({ countryCode, alt, style }) => {
    const flagUrl = `https://flagcdn.com/w320/${countryCode.toLowerCase()}.png`; // URL para obtener la bandera
    return (
      <img
        src={flagUrl}
        alt={alt || `Flag of ${countryCode}`}
        style={{
          width: "50px",
          height: "auto",
          borderRadius: "5px",
          ...style,
        }}
      />
    );
  };

  export default CountryFlag;