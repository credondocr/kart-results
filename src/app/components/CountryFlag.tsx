import React from "react";
import Image from 'next/image'

interface CountryFlagProps {
    countryCode: string; // Acrónimo del país, como 'US', 'FR', 'JP'
    alt?: string; // Texto alternativo opcional
    style?: React.CSSProperties; // Estilos personalizados opcionales
  }

const CountryFlag: React.FC<CountryFlagProps> = ({ countryCode, alt, style }) => {
    const code = (countryCode ?? "").trim().toLowerCase();
    if (!code) return null;

    const flagUrl = `https://flagcdn.com/w320/${code}.png`; // URL para obtener la bandera
    return (
      <Image
        src={flagUrl}
        alt={alt || `Flag of ${countryCode}`}
        width={25}
        height={25}
        style={{
          height: "auto",
          ...style,
        }}
      />
    );
  };

  export default CountryFlag;
