import { Pilot } from "../types";
import { Advanced } from "./advanced/data";
import { Babyliss } from "./babyliss/data";
import { FMV } from "./fmv/data";
import { Formula } from "./formula/data";
import { FSA } from "./fsa/data";
import { MHKarting } from "./mhkarting/data";
import { Valerio } from "./valerio/data";

export const Drivers: Pilot[] = [
    ...Advanced,
    ...Babyliss,
    ...FMV,
    ...FSA,
    ...Formula,
    ...MHKarting,
    ...Valerio
  ];