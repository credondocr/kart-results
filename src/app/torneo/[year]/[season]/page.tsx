"use client";
import {Championships, } from "@/data/history"
import { Championship, Leaderboard, Class, Category } from "@/data/types";
import HeaderTabs from "@/app/components/HeaderTabs";
import LeaderboardTable from "@/app/components/LeaderboardTable";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Breadcrumb from "@/app/components/Breadcrumb";
import { calculatePointsAndSort } from "@/app/utils/common";

interface Params {
    [key: string]: string | undefined;
    year?: string;
    season: string;
}



const SeasonLeaderboard = () => {
    const params = useParams<Params>();
    const year = params.year;
    const season = params.season;

    const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
    const [selectedTab, setSelectedTab] = useState<string | null>(null);

    const handleTabSelect = (tab: string) => {
        console.log(tab);
        setSelectedTab(tab);
    };

    useEffect(() => {
        const filteredData = Championships.years
            .find((championship) => championship.year === year)?.[season as keyof Championship] as Leaderboard;

        if (filteredData) {
            calculatePointsAndSort(filteredData.classes); 
            setLeaderboard(filteredData);
        }
    }, [year, season]);

    if (!leaderboard) return <div>Loading...</div>;

    const filteredClasses = selectedTab && selectedTab !== "ALL"
        ? leaderboard.classes.filter((cls) => cls.title === selectedTab)
        : leaderboard.classes;

    return (
        <div>
            {/* <header className="bg-gray-900 text-white p-4">
                <h1 className="text-center text-xl">Liga de Kartismo</h1>
                <Menu />
            </header> */}
            <div className="flex justify-center items-center px-4 py-4">
                <div className="w-full max-w-6xl flex justify-center">
                    <Breadcrumb />
                </div>
            </div>
            <div className="flex justify-center items-center px-4 py-4">
                <div className="w-full max-w-6xl flex justify-center">
                    <HeaderTabs onTabSelect={handleTabSelect} />
                </div>
            </div>
            {filteredClasses.map((classItem: Class, index: number) => (
                <div key={index}>
                    <h1 className="text-center my-4 text-4xl font-extrabold dark:text-white">{classItem.title}</h1>
                    {classItem.categories.map((category: Category, i: number) => (
                        <div key={i} className="flex items-center px-4 py-8  md:justify-center">
                            <div className="flex md:justify-center w-full max-w-6xl" style={{ overflowX: "auto" }}>
                                <LeaderboardTable category={category} season={season}/>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default SeasonLeaderboard;