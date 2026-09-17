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

    // O token só serve uma vez. Se essa mesma pessoa já tinha clicado no
    // link antes (sessão ainda válida no navegador) e só não chegou a
    // definir a senha, não manda pra tela de login — manda de volta pro
    // destino, que o proxy.ts redireciona pra redefinir-senha se a senha
    // ainda não tiver sido definida.
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (user) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/admin/login`);
}
