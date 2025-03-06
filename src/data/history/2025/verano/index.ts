import { Leaderboard } from "@/data/types";
import { tillotson } from "./tillotson";
import { vlr } from "./vlr";
import { stars } from "./starts";
import { mini } from "./mini";
import { micro } from "./micro";
// import { kid } from "./kid";
import { shifter } from "./shifter";

export const verano: Leaderboard = {
    year: 2024,
    season: 'verano',
    classes: [
        //   kid,
        micro,
        mini,
        stars,
        tillotson,
        vlr,
        shifter
    ],
    teams: [
        {
            name: 'MH Racing',
            logo: 'mhkarting',
            points: 87
        },
        {
            name: 'FMV Racing',
            logo: 'fmv',
            points: 84
        },
        {
            name: 'Valerio Racing System',
            logo: 'valerio',
            points: 83
        },
        {
            name: 'Formula Kart',
            logo: 'formula',
            points: 79
        },
        {
            name: 'Advanced Racing',
            logo: 'advanced',
            points: 75
        },
        {
            name: 'FIK Sport Academy',
            logo: 'fsa',
            points: 70
        },
        {
            name: 'DKR',
            logo: 'independiente',
            points: 11
        },
        {
            name: 'Babyliss Pro - Los Primos',
            logo: 'losprimos',
            points: 4
        },
        {
            name: 'Epson',
            logo: 'epson',
            points: 3
        },
    ]
}