"use client";

import HeaderTabs from "./components/HeaderTabs";
import LeaderboardTable from "./components/LeaderboardTable";
import { mockLeaderboard } from "@/data/mockData";
import { useState } from "react";

export default function Home() {
  const { classes } = mockLeaderboard;
  const [selectedTab, setSelectedTab] = useState<string | null>(null);


  const handleTabSelect = (tab: string) => {
    setSelectedTab(tab);
  };


  const filteredClasses = selectedTab && selectedTab != "ALL"
    ? classes.filter((cls) => cls.title === selectedTab)
    : classes;

  return (
    <div>
      <HeaderTabs onTabSelect={handleTabSelect} />
      {filteredClasses.map((item, o) => (
        <div key={`class-${o}`} style={{width: "900px"}}>
          <h1 style={{ textAlign: "center" }}>{item.title}</h1>
          {item.categories.map((category, i) => (
            <div key={`category-${o}-${i}`}>
              <LeaderboardTable
                category={category}
              />
              <br />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}