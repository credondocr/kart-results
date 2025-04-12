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
            name: 'MH Karting',
            logo: 'mhkarting',
            points: 261.5
        },
        {
            name: 'FMV Racing',
            logo: 'fmv',
            points: 254.5
        },
        {
            name: 'Advanced Racing',
            logo: 'advanced',
            points: 243
        },
        {
            name: 'Formula Kart',
            logo: 'formula',
            points: 220.5
        },
        {
            name: 'FIK Sport Academy',
            logo: 'fsa',
            points: 209
        },
        {
            name: 'Valerio Racing System',
            logo: 'valerio',
            points: 188
        },

        {
            name: 'DR Racing Kart CR',
            logo: 'dr-racing',
            points: 53.5
        },
        {
            name: 'Babyliss Pro - Los Primos',
            logo: 'losprimos',
            points: 31
        },
        {
            name: 'Epson',
            logo: 'epson',
            points: 8.5
        },
    ]
}