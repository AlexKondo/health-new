import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeNext(raw: string | null) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/admin";
  return raw;
}

/**
 * Troca o token_hash do e-mail (recovery/invite) por uma sessão de verdade,
 * gravando os cookies de auth, e só então redireciona para a página final.
 * Necessário porque o link padrão do Supabase entrega os tokens em formato
 * de hash de URL (#access_token=...), que o cliente do app não lê — aqui
 * na rota do servidor a troca é feita com verifyOtp() antes do redirect.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNext(searchParams.get("next"));

  if (token_hash && type) {
    const sb = await createClient();
    const { error } = await sb.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    // Um token inválido nunca deve dar a impressão de ter "funcionado".
    // Se o navegador já tinha uma sessão de OUTRA conta (ex.: um admin
    // testando vários convites em sequência), deixar essa sessão intacta
    // faria o link quebrado de uma pessoa parecer ter logado como a outra
    // — confuso mesmo sem vazar dado nenhum entre contas. Desloga antes
    // de mandar pro login, pra um link inválido nunca "aproveitar" uma
    // sessão alheia.
    await sb.auth.signOut();
  }

  return NextResponse.redirect(`${origin}/admin/login?notice=link_invalid`);
}
