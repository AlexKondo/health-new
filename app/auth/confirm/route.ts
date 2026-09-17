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
  const linkEmail = searchParams.get("email")?.toLowerCase() ?? null;

  if (token_hash && type) {
    const sb = await createClient();
    const { error } = await sb.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    // O token já foi usado (ex.: a pessoa clicou no mesmo link de novo
    // depois de fechar o navegador sem terminar de cadastrar a senha) —
    // não quer dizer que o link seja de OUTRA pessoa. Se o navegador já
    // tem uma sessão logada com o mesmo e-mail do link, é seguro só
    // continuar com ela em vez de derrubar o usuário. Só reaproveitamos
    // quando os e-mails batem exatamente; do contrário (sessão de outra
    // conta, ou nenhuma sessão) desloga, pra um link inválido/alheio
    // nunca dar a impressão de ter "logado como outra pessoa".
    if (linkEmail) {
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (user?.email?.toLowerCase() === linkEmail) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
    await sb.auth.signOut();
  }

  return NextResponse.redirect(`${origin}/admin/login?notice=link_invalid`);
}
