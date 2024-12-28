import React from "react";
import Image from 'next/image'

interface CountryFlagProps {
    countryCode: string; // Acrónimo del país, como 'US', 'FR', 'JP'
    alt?: string; // Texto alternativo opcional
    style?: React.CSSProperties; // Estilos personalizados opcionales
  }

const CountryFlag: React.FC<CountryFlagProps> = ({ countryCode, alt, style }) => {
    const flagUrl = `https://flagcdn.com/w320/${countryCode.toLowerCase()}.png`; // URL para obtener la bandera
    return (
      <Image
        src={flagUrl}
        alt={alt || `Flag of ${countryCode}`}
        width={50}
        height={50}
        style={{
          height: "auto",
          ...style,
        }}
      />
    );
  };

  export default CountryFlag;