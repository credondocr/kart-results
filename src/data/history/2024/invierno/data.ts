import { Leaderboard } from "@/data/types";
import { tillotson } from "./tillotson/data";
import { vlr } from "./vlr/data";
import { stars } from "./starts/data";
import { mini } from "./mini/data";
import { micro } from "./micro/data";
import { kid } from "./kid/data";
import { shifter } from "./shifter/data";

export const invierno :Leaderboard = {
  year: 2024,
  season: 'Invierno',
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