import { Pilot } from "../types";
import { Advanced } from "./advanced/data";
import { AKM } from "./akm/data";
import { Babyliss } from "./babyliss/data";
import { FMV } from "./fmv/data";
import { Formula } from "./formula/data";
import { FSA } from "./fsa/data";
import { MHKarting } from "./mhkarting/data";
import { Valerio } from "./valerio/data";
import { VRT4 } from "./vrt4/data";

export const Drivers: Pilot[] = [
    ...Advanced,
    ...AKM,
    ...Babyliss,
    ...FMV,
    ...FSA,
    ...Formula,
    ...MHKarting,
    ...Valerio,
    ...VRT4
  ];