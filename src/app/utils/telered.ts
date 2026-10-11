/**
 * Transmisiones de Telered (YouTube) vía RSS público — sin API key.
 * Filtra videos relacionados con kartismo.
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

export async function fetchTeleredKartVideos(
  limit = 12
): Promise<TeleredVideo[]> {
  try {
    const res = await fetch(FEED, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const xml = await res.text();
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
      // Excluir shorts si aparecen el link canónico
      const link = entry.match(/<link[^>]*href="([^"]+)"[^>]*rel="alternate"/)?.[1];
      if (link?.includes("/shorts/")) continue;
      if (!isKart(title)) continue;
      videos.push({
        id,
        title,
        publishedAt: published ?? "",
        thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        url: `https://www.youtube.com/watch?v=${id}`,
      });
      if (videos.length >= limit) break;
    }
    return videos;
  } catch {
    return [];
  }
}
