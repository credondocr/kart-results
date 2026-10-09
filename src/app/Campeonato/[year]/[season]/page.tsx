"use client";
import { Championships, } from "@/data/history"
import { Championship, Leaderboard, Class, Category } from "@/data/types";
import HeaderTabs from "@/app/components/HeaderTabs";
import LeaderboardTable from "@/app/components/LeaderboardTable";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Breadcrumb from "@/app/components/Breadcrumb";
import SeasonSelector from "@/app/components/SeasonSelector";
import { calculatePointsAndSort } from "@/app/utils/common";
import { addTeamsCategory, generateGeneralLeaderboard } from "@/app/utils/common";
import GeneralTable from "@/app/components/GeneralTable";
import SeasonSkeleton from "@/app/components/SeasonSkeleton";
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
    const searchParams = useSearchParams();
    const router = useRouter();
    const selectedTab = searchParams.get("tab") ?? "ALL";

    const handleTabSelect = (tab: string) => {
        const query = tab && tab !== "ALL" ? `?tab=${encodeURIComponent(tab)}` : "";
        router.replace(`/Campeonato/${year}/${season}${query}`, { scroll: false });
    };

    useEffect(() => {
        if (season == "invierno" || season == "verano") {
            console.log("here")
            const filteredData = Championships.years
                .find((championship) => championship.year === year)?.[season as keyof Championship] as Leaderboard;

            if (filteredData) {
                calculatePointsAndSort(filteredData.classes);
                console.log(addTeamsCategory(filteredData))
                setLeaderboard(addTeamsCategory(filteredData));
            }
        } else if (season == "general") {
            const championship = Championships.years.find((champ) => champ.year === year);
            if (championship) {
                const invierno = championship.invierno as Leaderboard;
                const verano = championship.verano as Leaderboard;
                const general = generateGeneralLeaderboard({ invierno, verano })
                const filteredClasses =
                    selectedTab && selectedTab !== "ALL"
                        ? general?.classes.filter((cls) => cls.title === selectedTab)
                        : general?.classes || [];
                general.classes = filteredClasses || [];
                setLeaderboard(general);
            }
        }

    }, [year, season, selectedTab]);

    if (!leaderboard) return <SeasonSkeleton />;

    const filteredClasses =
        selectedTab !== "ALL"
            ? leaderboard?.classes.filter((cls) => cls.title === selectedTab)
            : leaderboard?.classes || [];

    const fechas = leaderboard.classes.reduce(
        (max, cls) =>
            cls.categories.reduce(
                (catMax, cat) => cat.results.reduce((rowMax, r) => Math.max(rowMax, r.scores.length), catMax),
                max
            ),
        0
    );
    const seasonLabel = season === "general" ? `General ${year}` : `${season} ${year}`;

    return (
        <div className="mt-20">
            <div className="flex flex-col items-center px-4 py-4 space-y-4">
                <div className="w-full max-w-6xl flex justify-center">
                    <SeasonSelector />
                </div>
                <div className="w-full max-w-6xl flex justify-center">
                    <Breadcrumb />
                </div>
                <h1 className="season-eyebrow">
                    CRKC · <strong>{seasonLabel}</strong>
                    {season !== "general" && fechas > 0 && <> · A la fecha {fechas}</>}
                </h1>
            </div>

            {season === "general" ? (

                <div>
                    <div className="flex justify-center items-center px-1 py-1">
                        <div className="w-full max-w-6xl flex justify-center">
                            <HeaderTabs onTabSelect={handleTabSelect} showTeamTab={false} activeTab={selectedTab} />
                        </div>
                    </div>
                    <div className="flex items-center px-1 py-1  md:justify-center">
                        <div className="flex md:justify-center w-full max-w-6xl" style={{ overflowX: "auto" }}>
                            <GeneralTable leaderboard={leaderboard} />
                        </div>
                    </div>
                </div>




            ) : (season === "invierno" || season === "verano") && (
                <div>
                    <div className="flex justify-center items-center px-1 py-1">
                        <div className="w-full max-w-6xl flex justify-center">
                            <HeaderTabs onTabSelect={handleTabSelect} showTeamTab={true} activeTab={selectedTab} />
                        </div>
                    </div>
                    {filteredClasses.map((classItem: Class, index: number) => (
                        <div key={`${selectedTab}-${classItem.title}-${index}`} className="class-block p-2">
                            <h2 className="class-title my-4 text-4xl md:text-5xl">{classItem.title}</h2>
                            {classItem.categories.map((category: Category, i: number) => (
                                <div key={i} className="flex items-center px-2 py-2  md:justify-center">
                                    <div className="flex md:justify-center w-full max-w-6xl" style={{ overflowX: "auto" }}>
                                        <LeaderboardTable category={category} season={season} leaderboard={leaderboard} />
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