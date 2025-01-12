"use client";
import { Championships, } from "@/data/history"
import { Championship, Leaderboard, Class, Category } from "@/data/types";
import HeaderTabs from "@/app/components/HeaderTabs";
import LeaderboardTable from "@/app/components/LeaderboardTable";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Breadcrumb from "@/app/components/Breadcrumb";
import { calculatePointsAndSort } from "@/app/utils/common";
import { addTeamsCategory, generateGeneralLeaderboard } from "@/app/utils/common";
import GeneralTable from "@/app/components/GeneralTable";
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
    const [generalLeaderboard, setGeneralLeaderboard] = useState<Record<
        string,
        { driver: string; points: number }[]
    > | null>(null);

    const handleTabSelect = (tab: string) => {
        setSelectedTab(tab);
    };

    useEffect(() => {
        if (season == "invierno" || season == "verano") {
            console.log("here")
            const filteredData = Championships.years
                .find((championship) => championship.year === year)?.[season as keyof Championship] as Leaderboard;

            if (filteredData) {
                calculatePointsAndSort(filteredData.classes);
                setLeaderboard(addTeamsCategory(filteredData));
                console.log(leaderboard)
            }
        } else if (season == "general") {
            const championship = Championships.years.find((champ) => champ.year === year);
            if (championship) {
                const invierno = championship.invierno as Leaderboard;
                const verano = championship.verano as Leaderboard;
                if (invierno && verano) {
                    setLeaderboard(generateGeneralLeaderboard({ invierno, verano }));
                }
            }
        }
    }, [year, season]);

    if (!leaderboard) return <div>Loading...</div>;

    const filteredClasses =
        selectedTab && selectedTab !== "ALL"
            ? leaderboard?.classes.filter((cls) => cls.title === selectedTab)
            : leaderboard?.classes || [];

    return (
        <div>
            <div className="flex justify-center items-center px-4 py-4">
                <div className="w-full max-w-6xl flex justify-center">
                    <Breadcrumb />
                </div>
            </div>

            {season === "general" ? (

                <div>
                    <div className="flex justify-center items-center px-1 py-1">
                        <div className="w-full max-w-6xl flex justify-center">
                            <HeaderTabs onTabSelect={handleTabSelect} />
                        </div>
                    </div>
                    <div className="flex items-center px-1 py-1  md:justify-center">
                        <div className="flex md:justify-center w-full max-w-6xl" style={{ overflowX: "auto" }}>
                            <GeneralTable leaderboard={{ classes: filteredClasses }} />
                        </div>
                    </div>
                </div>




            ) : (season === "invierno" || season === "verano") && (
                <div>
 <div className="flex justify-center items-center px-1 py-1">
                        <div className="w-full max-w-6xl flex justify-center">
                            <HeaderTabs onTabSelect={handleTabSelect} showTeamTab={true}/>
                        </div>
                    </div>
                    {filteredClasses.map((classItem: Class, index: number) => (
                        <div key={index} className="p-2">
                            <h1 className="text-center my-4 text-4xl font-extrabold dark:text-white">{classItem.title}</h1>
                            {classItem.categories.map((category: Category, i: number) => (
                                <div key={i} className="flex items-center px-2 py-2  md:justify-center">
                                    <div className="flex md:justify-center w-full max-w-6xl" style={{ overflowX: "auto" }}>
                                        <LeaderboardTable category={category} season={season} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SeasonLeaderboard;