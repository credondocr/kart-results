import React, { useState, useRef, useEffect } from "react";

interface HeaderTabsProps {
  onTabSelect: (category: string) => void;
  showTeamTab: boolean
}

const HeaderTabs: React.FC<HeaderTabsProps> = ({ onTabSelect, showTeamTab = false }) => {
  const tabs = [
    "ALL",
    "KID KART",
    "MICRO ROK",
    "MINI ROK",
    "ROK SHIFTER",
    "STARS OF TOMORROW",
    "TILLOTSON",
    "VLR"
  ];

  if (showTeamTab) {
    tabs.push("Equipos")
  }

  const [selectedTab, setSelectedTab] = useState<string>(tabs[0]);

  const handleTabClick = (tab: string) => {
    setSelectedTab(tab);
    onTabSelect(tab);
  };

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
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => handleTabClick(tab)}
          className={`tab-button ${selectedTab === tab ? 'active' : ''}`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default HeaderTabs;