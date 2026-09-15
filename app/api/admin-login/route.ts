import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

type LockState = { blocked: boolean; permanent: boolean; retry_after_seconds: number | null };
type IpLockState = { blocked: boolean; retry_after_seconds: number | null };

function normalizeEmail(v: unknown) {
  return String(v ?? "").trim().toLowerCase().slice(0, 255);
}

function clientIp(request: Request) {
  // x-real-ip é definido pela própria infraestrutura da Vercel (não dá pra
  // falsificar de fora). Se ausente, usa o ÚLTIMO endereço de
  // x-forwarded-for — é o hop que o proxy da Vercel realmente enxergou;
  // o primeiro pode ter sido enviado pelo próprio cliente.
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) {
    const parts = fwd.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }
  return "unknown";
}

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  const password = String(body.password ?? "");
  if (!email || !password) return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 });

  const ip = clientIp(request);
  const service = createServiceClient();

  const [{ data: lock, error: lockError }, { data: ipLock, error: ipLockError }] = await Promise.all([
    service.rpc("check_login_lock", { p_email: email }).single<LockState>(),
    service.rpc("check_ip_lock", { p_ip: ip }).single<IpLockState>(),
  ]);
  if (lockError) console.error("check_login_lock RPC failed:", lockError.message);
  if (ipLockError) console.error("check_ip_lock RPC failed:", ipLockError.message);

  if (lock?.blocked) {
    return NextResponse.json({
      ok: false,
      blocked: true,
      permanent: lock.permanent,
      retryAfterSeconds: lock.retry_after_seconds,
    });
  }
  if (ipLock?.blocked) {
    return NextResponse.json({ ok: false, blocked: true, permanent: false, retryAfterSeconds: ipLock.retry_after_seconds });
  }

  // A autenticação real acontece aqui, no servidor — o resultado dela é o
  // único jeito de mexer nos contadores de tentativas (não dá pra "reportar"
  // uma falha sem de fato tentar uma senha).
  const sb = await createClient();
  const { error } = await sb.auth.signInWithPassword({ email, password });

  const [{ data: result, error: recordError }, { data: ipResult, error: ipRecordError }] = await Promise.all([
    service.rpc("record_login_result", { p_email: email, p_success: !error }).single<LockState>(),
    service.rpc("record_ip_result", { p_ip: ip, p_success: !error }).single<IpLockState>(),
  ]);
  if (recordError) console.error("record_login_result RPC failed:", recordError.message);
  if (ipRecordError) console.error("record_ip_result RPC failed:", ipRecordError.message);

  if (error) {
    return NextResponse.json({
      ok: false,
      blocked: result?.blocked || ipResult?.blocked || false,
      permanent: result?.permanent ?? false,
      retryAfterSeconds: result?.retry_after_seconds ?? ipResult?.retry_after_seconds ?? null,
    });
  }

  return NextResponse.json({ ok: true });
}
