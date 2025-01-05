import { Leaderboard } from "@/data/types";
import { tillotson } from "./tillotson";
import { vlr } from "./vlr";
import { stars } from "./starts";
import { mini } from "./mini";
import { micro } from "./micro";
import { kid } from "./kid";

export const verano :Leaderboard = {
    year: 2024,
    season: 'verano',
    classes: [
      kid,
      micro,
      mini,
      stars,
      tillotson,
      vlr
    ]
  }