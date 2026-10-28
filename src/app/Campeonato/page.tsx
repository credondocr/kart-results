import { redirect } from "next/navigation";
import { Championships } from "@/data/history";

/**
 * /Campeonato → última temporada con la temporada activa por calendario.
 * CRKC: ene–jun = verano, jul–dic = invierno. Si esa temporada no existe
 * en los datos del año, cae a general.
 */
export default function CampeonatoIndex() {
  const latest = [...Championships.years].sort(
    (a, b) => Number(b.year) - Number(a.year)
  )[0];

  // Mes actual en Costa Rica (la sede define el calendario).
  const month = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Costa_Rica",
      month: "numeric",
    }).format(new Date())
  );
  const season = month >= 1 && month <= 6 ? "verano" : "invierno";

  const hasSeason = Boolean(
    latest && (latest.invierno || latest.verano)
  );
  const targetSeason =
    hasSeason && (season === "verano" ? latest.verano : latest.invierno)
      ? season
      : "general";

  redirect(`/Campeonato/${latest.year}/${targetSeason}`);
}
