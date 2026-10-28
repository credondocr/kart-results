import { redirect } from "next/navigation";
import { Championships } from "@/data/history";

/** /Campeonato → última temporada disponible (general). */
export default function CampeonatoIndex() {
  const latest = [...Championships.years].sort(
    (a, b) => Number(b.year) - Number(a.year)
  )[0];
  redirect(`/Campeonato/${latest.year}/general`);
}
