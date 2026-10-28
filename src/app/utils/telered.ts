/**
 * Transmisiones de Telered (YouTube).
 * Primario: Data API v3 (playlistItems + videos, ~2 units) con
 * YOUTUBE_API_KEY — confiable. Fallback: RSS público sin key.
 */

export interface TeleredVideo {
  id: string;
  title: string;
  publishedAt: string;
  thumb: string;
  url: string;
}

const CHANNEL_ID = "UCtbg2SiRp8M_Je4Qrd2N89Q";
const FEED = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

/** Título que parece de kartismo (evita Superbike u otros motorsport). */
function isKart(title: string): boolean {
  const t = title.toLowerCase();
  return (
    t.includes("kart") ||
    t.includes("crkc") ||
    t.includes("campeonato nacional")
  );
}

function toVideo(id: string, title: string, publishedAt: string): TeleredVideo {
  return {
    id,
    title,
    publishedAt,
    thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    url: `https://www.youtube.com/watch?v=${id}`,
  };
}

/** Data API: uploads playlist → títulos → filtro kart. ~2 units. */
async function fetchViaApi(limit: number): Promise<TeleredVideo[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return [];
  // Uploads playlist de un channel UC… es UU + resto
  const uploads = `UU${CHANNEL_ID.slice(2)}`;

  const listRes = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${uploads}&maxResults=25&key=${key}`,
    { next: { revalidate: 3600 } }
  );
  if (!listRes.ok) throw new Error(`playlistItems ${listRes.status}`);
  const list = (await listRes.json()) as {
    items?: Array<{ contentDetails?: { videoId?: string } }>;
  };
  const ids = (list.items ?? [])
    .map((i) => i.contentDetails?.videoId)
    .filter((v): v is string => Boolean(v));
  if (!ids.length) return [];

  const vidRes = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${ids.join(",")}&key=${key}`,
    { next: { revalidate: 3600 } }
  );
  if (!vidRes.ok) throw new Error(`videos ${vidRes.status}`);
  const vids = (await vidRes.json()) as {
    items?: Array<{
      id?: string;
      snippet?: { title?: string; publishedAt?: string };
    }>;
  };

  const videos: TeleredVideo[] = [];
  for (const v of vids.items ?? []) {
    if (!v.id || !v.snippet?.title || !isKart(v.snippet.title)) continue;
    videos.push(toVideo(v.id, v.snippet.title, v.snippet.publishedAt ?? ""));
    if (videos.length >= limit) break;
  }
  return videos;
}

/** RSS público (fallback cuando no hay API key o la API falla). */
async function fetchViaRss(limit: number): Promise<TeleredVideo[]> {
  const res = await fetch(FEED, {
    next: { revalidate: 3600 },
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      Accept: "application/atom+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });
  if (!res.ok) throw new Error(`telered RSS ${res.status}`);
  const xml = await res.text();
  if (!xml.includes("<entry>")) throw new Error("telered RSS vacío");
  const entries = xml.split("<entry>").slice(1);
  const videos: TeleredVideo[] = [];
  for (const entry of entries) {
    const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const title = entry
      .match(/<title>([^<]+)<\/title>/)?.[1]
      ?.replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    const published = entry.match(/<published>([^<]+)<\/published>/)?.[1];
    if (!id || !title) continue;
    const link = entry.match(/<link[^>]*href="([^"]+)"[^>]*rel="alternate"/)?.[1];
    if (link?.includes("/shorts/")) continue;
    if (!isKart(title)) continue;
    videos.push(toVideo(id, title, published ?? ""));
    if (videos.length >= limit) break;
  }
  return videos;
}

export async function fetchTeleredKartVideos(
  limit = 12
): Promise<TeleredVideo[]> {
  try {
    return await fetchViaApi(limit);
  } catch (err) {
    console.error("[telered] API failed, trying RSS:", err);
    try {
      return await fetchViaRss(limit);
    } catch (err2) {
      console.error("[telered] RSS failed too:", err2);
      return [];
    }
  }
}

/**
 * ¿Activar el chequeo de live? Solo si hay una fecha programada abierta
 * y hoy (hora CR) es el día de la carrera o el día anterior.
 * Se enlaza con race_dates (Fase 2): al abrir una fecha en el panel,
 * el banner live se activa automáticamente ese fin de semana.
 */
export function isLiveCheckWindow(raceDateIso: string | null | undefined): boolean {
  if (!raceDateIso) return false;
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Costa_Rica",
  });
  const today = fmt.format(new Date());
  const raceDay = fmt.format(new Date(raceDateIso));
  const tomorrow = fmt.format(new Date(Date.now() + 86_400_000));
  // Hoy es la carrera, o es la víspera de la carrera.
  return raceDay === today || raceDay === tomorrow;
}

/**
 * ¿Está Telered transmitiendo kartismo en vivo ahora?
 * Solo consulta la API si `enabled` (día de carrera o víspera, vía race_dates).
 * Usa uploads playlist + videos.list (~3 units, no search.list que son100).
 * Requiere YOUTUBE_API_KEY. Sin key o error → null (la sección no se rompe).
 * Cache server-side1h: todos los visitantes comparten la misma respuesta.
 */
export async function fetchTeleredLiveKart(
  enabled: boolean
): Promise<TeleredVideo | null> {
  if (!enabled) return null;
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return null;
  try {
    // Uploads playlist de un channel UC... es UU + resto
    const uploads = `UU${CHANNEL_ID.slice(2)}`;
    const listUrl =
      "https://www.googleapis.com/youtube/v3/playlistItems" +
      `?part=contentDetails&playlistId=${uploads}&maxResults=5&key=${key}`;
    const listRes = await fetch(listUrl, { next: { revalidate: 3600 } });
    if (!listRes.ok) return null;
    const list = (await listRes.json()) as {
      items?: Array<{ contentDetails?: { videoId?: string } }>;
    };
    const ids = (list.items ?? [])
      .map((i) => i.contentDetails?.videoId)
      .filter((id): id is string => Boolean(id));
    if (!ids.length) return null;

    const videosUrl =
      "https://www.googleapis.com/youtube/v3/videos" +
      `?part=snippet,liveStreamingDetails&id=${ids.join(",")}&key=${key}`;
    const videosRes = await fetch(videosUrl, { next: { revalidate: 3600 } });
    if (!videosRes.ok) return null;
    const videos = (await videosRes.json()) as {
      items?: Array<{
        id?: string;
        snippet?: { title?: string; publishedAt?: string };
        liveStreamingDetails?: { actualStartTime?: string; actualEndTime?: string };
      }>;
    };
    for (const v of videos.items ?? []) {
      const details = v.liveStreamingDetails;
      const isLiveNow = Boolean(
        details?.actualStartTime && !details.actualEndTime
      );
      if (!isLiveNow || !v.id || !v.snippet?.title) continue;
      if (!isKart(v.snippet.title)) continue;
      return {
        id: v.id,
        title: v.snippet.title,
        publishedAt: v.snippet.publishedAt ?? "",
        thumb: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
        url: `https://www.youtube.com/watch?v=${v.id}`,
      };
    }
    return null;
  } catch {
    return null;
  }
}
