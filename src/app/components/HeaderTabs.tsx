import React from "react";

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

  return (
    <div style={{ display: "flex", gap: "10px", marginBottom: "20px", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabSelect(tab)} // Ejecuta la función con el tab seleccionado
          style={{
            padding: "5px 10px",
            border: "1px solid #ccc",
            backgroundColor: "#f0f0f0",
            cursor: "pointer",
            color: "black",
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default HeaderTabs;