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
import FechaToggle from "@/app/components/FechaToggle";
import WhatsAppShare from "@/app/components/WhatsAppShare";
import eventsManifest from "@/data/events/manifest.json";
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
    const fechaParam = searchParams.get("fecha");
    const fecha =
        fechaParam && /^\d+$/.test(fechaParam) ? parseInt(fechaParam, 10) : null;

    const updateQuery = (updates: Record<string, string | null>) => {
        const query = new URLSearchParams(searchParams.toString());
        for (const [key, value] of Object.entries(updates)) {
            if (value === null) query.delete(key);
            else query.set(key, value);
        }
        const qs = query.toString();
        router.replace(`/Campeonato/${year}/${season}${qs ? `?${qs}` : ""}`, { scroll: false });
    };

    const handleTabSelect = (tab: string) => {
        updateQuery({ tab: tab && tab !== "ALL" ? tab : null });
    };

    const handleFechaChange = (value: number | null) => {
        updateQuery({ fecha: value === null ? null : String(value) });
    };

    useEffect(() => {
        if (season == "invierno" || season == "verano") {
            const filteredData = Championships.years
                .find((championship) => championship.year === year)?.[season as keyof Championship] as Leaderboard;

            if (filteredData) {
                calculatePointsAndSort(filteredData.classes);
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

    // Fechas realmente disputadas: columnas con al menos un puntaje > 0
    const fechas = leaderboard.classes.reduce((max, cls) => {
        const catMax = cls.categories.reduce((inner, cat) => {
            const width = cat.results.reduce((w, r) => Math.max(w, r.scores.length), 0);
            const done = Array.from({ length: width }, (_, i) =>
                cat.results.some((r) => (r.scores[i] ?? 0) !== 0)
            ).filter(Boolean).length;
            return Math.max(inner, done);
        }, 0);
        return Math.max(max, catMax);
    }, 0);
    const seasonLabel = season === "general" ? `General ${year}` : `${season} ${year}`;
    const activeFecha = fecha && fecha >= 1 && fecha <= fechas ? fecha : null;

    // Eventos de SpeedHive por número de fecha (para linkear R1..Rn y ★).
    const eventsByFecha: Record<number, { id?: number; fastest: Array<{ cls: string; driver: string }> }> = {};
    if (season !== "general") {
        for (const event of eventsManifest.events) {
            if (String(event.year) === String(year) && event.season === season) {
                for (const n of event.fechas) {
                    eventsByFecha[n] = { id: event.id, fastest: event.fastestLaps };
                }
            }
        }
    }

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
                <WhatsAppShare text={`Posiciones ${seasonLabel} — Costa Rica Kart Championship`} />
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
                    <div className="flex justify-center px-1 pb-3">
                        <FechaToggle fechas={fechas} value={activeFecha} onChange={handleFechaChange} />
                    </div>
                    <p className="-mt-1 pb-2 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-dim)]">
                        <span className="fastest-star" style={{ marginLeft: 0, marginRight: 4, verticalAlign: "baseline" }}>★</span>
                        Mejor vuelta (vuelta rápida) de la fecha
                    </p>
                    {filteredClasses.map((classItem: Class, index: number) => (
                        <div key={`${selectedTab}-${classItem.title}-${index}`} className="class-block p-2">
                            <h2 className="class-title my-4 text-4xl md:text-5xl">{classItem.title}</h2>
                            {classItem.categories.map((category: Category, i: number) => (
                                <div key={i} className="flex items-center px-2 py-2  md:justify-center">
                                    <div className="flex md:justify-center w-full max-w-6xl" style={{ overflowX: "auto" }}>
                                        <LeaderboardTable
                                            category={category}
                                            season={season}
                                            leaderboard={leaderboard}
                                            fecha={activeFecha}
                                            classTitle={classItem.title}
                                            eventsByFecha={eventsByFecha}
                                        />
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