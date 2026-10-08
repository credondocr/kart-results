import { Leaderboard } from "@/data/types";
import { kid } from "./kid";
import { micro } from "./micro";
import { mini } from "./mini";
import { shifter } from "./shifter";
import { tillotson } from "./tillotson";
import { vlr } from "./vlr";

export const invierno: Leaderboard = {
  year: 2026,
  season: 'invierno',
  classes: [
    kid,
    micro,
    mini,
    shifter,
    tillotson,
    vlr,
  ],
}
