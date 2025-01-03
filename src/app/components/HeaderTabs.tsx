import React, { useState } from "react";

interface HeaderTabsProps {
  onTabSelect: (category: string) => void;
}

const HeaderTabs: React.FC<HeaderTabsProps> = ({ onTabSelect }) => {
  const tabs = [
    "ALL",
    "KID KART",
    "MICRO ROK",
    "MINI ROK",
    "ROK SHIFTER",
    "STARS OF TOMORROW",
    "TILLOTSON",
    "VLR",
  ];

  // Estado para rastrear el tab seleccionado
  const [selectedTab, setSelectedTab] = useState<string>(tabs[0]);

  const handleTabClick = (tab: string) => {
    setSelectedTab(tab); // Actualiza el tab seleccionado
    onTabSelect(tab); // Llama a la función recibida como prop
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => handleTabClick(tab)} // Cambia el estado y ejecuta la función
          style={{
            padding: "5px 10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            backgroundColor: selectedTab === tab ? "#007bff" : "#f0f0f0", // Cambia el color del fondo
            color: selectedTab === tab ? "white" : "black", // Cambia el color del texto
            cursor: "pointer",
            transition: "background-color 0.3s, color 0.3s", // Transición suave
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default HeaderTabs;