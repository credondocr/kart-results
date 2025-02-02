"use client";

import React from "react";
import { Leaderboard } from "@/data/types";
import CountryFlag from "@/app/components/CountryFlag";
import TeamLogo from "@/app/components/TeamLogo";

interface LeaderboardTableProps {
    leaderboard: Leaderboard;
}

const GeneralTable: React.FC<LeaderboardTableProps> = ({ leaderboard }) => {
    return (
        <div className="flex justify-center items-center px-1 py-1">
            <div className="w-full max-w-6xl">
                {leaderboard.classes.map((cls, clsIndex) => (
                    <div key={clsIndex} className="my-5 p-2">
                        <h2 className="text-2xl font-bold text-center mb-4">
                            {cls.title}
                        </h2>
                        {cls.categories.map((category, catIndex) => (
                            <div key={catIndex} className="my-4">
                                <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                                <div className="table-container overflow-x-auto">
                                    <table className="table bg-gray-800 text-white rounded-lg w-full">
                                        <thead className="bg-gray-700">
                                            <tr>
                                                <th className="px-2 py-2 text-left">Pos.</th>
                                                <th className="px-2 py-2 text-left">Num.</th>
                                                <th className="px-4 py-2 text-left">Piloto</th>
                                                <th className="px-4 py-2 text-right">Puntos</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {category.results.map((result, index) => (
                                                <tr key={index} className="hover:bg-gray-600">
                                                    <td className="px-2 py-2">{result.rank}</td>
                                                    <td className="px-2 py-2">{result.number}</td>
                                                    <td className="flex items-center gap-2 px-4 py-2">
                                                        <CountryFlag countryCode={result.country} alt={result.country} />
                                                        <TeamLogo team={result.team} altText={result.team} />
                                                        <span className="whitespace-nowrap">{result.driver}</span>
                                                    </td>
                                                    <td className="px-4 py-2 text-right">{result.points}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GeneralTable;