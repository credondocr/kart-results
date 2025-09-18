import { Leaderboard } from "@/data/types";
import { kid } from "./kid";
import { micro } from "./micro";
import { mini } from "./mini";
import { shifter } from "./shifter";
import { stars } from "./starts";
import { tillotson } from "./tillotson";
import { vlr } from "./vlr";

export const invierno: Leaderboard = {
    year: 2025,
    season: 'invierno',
    classes: [
        kid,
        micro,
        mini,
        shifter,
        stars,
        tillotson,
        vlr
    ],
    teams: [
        {
            name: 'MH Karting',
            logo: 'mhkarting',
            points: 109
        },
        {
            name: 'Advanced Racing',
            logo: 'advanced',
            points: 119.5
        },
        {
            name: 'FMV Racing',
            logo: 'fmv',
            points: 128.5
        },
        {
            name: 'FIK Sport Academy',
            logo: 'fsa',
            points: 121.5
        },
        {
            name: 'Formula Kart',
            logo: 'formula',
            points: 104.5
        },

        {
            name: 'Valerio Racing System',
            logo: 'valerio',
            points: 100
        },

        {
            name: 'DR Racing Kart CR',
            logo: 'dr-racing',
            points: 111
        },
        {
            name: 'Babyliss Pro - Los Primos',
            logo: 'losprimos',
            points: 110
        }
    ]
}

