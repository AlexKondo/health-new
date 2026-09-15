import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  let body: { session_id?: string; type?: string; duration_seconds?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const session_id = String(body.session_id ?? "");
  if (!UUID_RE.test(session_id)) return NextResponse.json({ ok: false }, { status: 400 });

  const sb = createServiceClient();

  if (body.type === "duration") {
    const duration = Math.max(0, Math.min(3 * 60 * 60, Math.round(Number(body.duration_seconds) || 0)));
    const { error } = await sb.rpc("track_duration", { p_session_id: session_id, p_duration: duration });
    if (error) return NextResponse.json({ ok: false }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const { error } = await sb.rpc("track_pageview", { p_session_id: session_id });
  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true });
}
