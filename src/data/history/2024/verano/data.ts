import { Leaderboard } from "@/data/types";
import { tillotson } from "./tillotson/data";
import { vlr } from "./vlr/data";
import { stars } from "./starts/data";
import { mini } from "./mini/data";
import { micro } from "./micro/data";
import { kid } from "./kid/data";

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