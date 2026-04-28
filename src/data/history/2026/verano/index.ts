import { Leaderboard } from "@/data/types";
import { kid } from "./kid";
import { stars } from "./starts";
import { tillotson } from "./tillotson";
import { micro } from "./micro";
import { mini } from "./mini";
import { vlr } from "./vlr";

export const verano: Leaderboard = {
  year: 2026,
  season: 'verano',
  classes: [
    kid,
    stars,
    tillotson,
    micro,
    mini,
    vlr,
  ],
}

