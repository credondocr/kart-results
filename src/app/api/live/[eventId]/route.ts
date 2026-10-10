import { NextResponse } from "next/server";
import {
  fetchActiveSession,
  fetchLiveEventDetail,
  findLiveEvent,
  LIVE_EVENT_ID_RE,
} from "@/app/utils/liveTiming";

// ISR en el route handler: el CDN de Vercel cachea5s la respuesta.
export const revalidate = 5;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;

  if (!LIVE_EVENT_ID_RE.test(eventId)) {
    return NextResponse.json(
      { ok: false, error: "invalid_event_id" },
      { status: 400 }
    );
  }

  const [detail, active, summary] = await Promise.all([
    fetchLiveEventDetail(eventId),
    fetchActiveSession(eventId),
    findLiveEvent(eventId),
  ]);

  if (!detail && !active) {
    return NextResponse.json(
      { ok: false, error: "not_found" },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      fetchedAt: Date.now(),
      summary: summary
        ? { vs: summary.vs, w: summary.w, l: summary.l, u: summary.u }
        : null,
      detail,
      active,
    },
    {
      headers: {
        "Cache-Control":
          "public, s-maxage=5, stale-while-revalidate=15",
      },
    }
  );
}
