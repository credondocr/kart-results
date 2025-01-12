import { Leaderboard } from "@/data/types";
import { tillotson } from "./tillotson";
import { vlr } from "./vlr";
import { stars } from "./starts";
import { mini } from "./mini";
import { micro } from "./micro";
import { kid } from "./kid";
import { shifter } from "./shifter";

export const invierno :Leaderboard = {
  year: 2024,
  season: 'invierno',
  classes: [
    kid,
    micro,
    mini,
    shifter,
    stars,
    tillotson,
    vlr
  ]
}