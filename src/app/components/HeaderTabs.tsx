import React, { useRef, useEffect } from "react";

interface HeaderTabsProps {
  onTabSelect: (category: string) => void;
  showTeamTab: boolean;
  activeTab: string;
}

const BASE_TABS = [
  { id: "ALL", label: "Todo" },
  { id: "KID KART", label: "Kid Kart" },
  { id: "MICRO ROK", label: "Micro Rok" },
  { id: "MINI ROK", label: "Mini Rok" },
  { id: "ROK SHIFTER", label: "Rok Shifter" },
  { id: "STARS OF TOMORROW", label: "Stars of Tomorrow" },
  { id: "TILLOTSON", label: "Tillotson" },
  { id: "VLR", label: "VLR" },
];

const HeaderTabs: React.FC<HeaderTabsProps> = ({ onTabSelect, showTeamTab = false, activeTab }) => {
  const tabs = showTeamTab ? [...BASE_TABS, { id: "Equipos", label: "Equipos" }] : BASE_TABS;

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const { scrollLeft, scrollWidth, clientWidth } = container;
      const isAtStart = scrollLeft <= 0;
      const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 1;

      container.setAttribute('data-at-start', isAtStart.toString());
      container.setAttribute('data-at-end', isAtEnd.toString());
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      // Check initial scroll position
      checkScroll();

      // Recheck on window resize
      window.addEventListener('resize', checkScroll);

      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="tabs-container"
      role="group"
      aria-label="Filtrar por clase"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabSelect(tab.id)}
          aria-pressed={activeTab === tab.id}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default HeaderTabs;
