import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session on every request and guards /admin.
 * Unauthenticated users hitting /admin (except /admin/login) are redirected.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const configured = !!url && !url.includes("YOUR_PROJECT");

  // Sem Supabase configurado: site público funciona; /admin fica indisponível.
  const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/redefinir-senha"];

  if (!configured) {
    if (request.nextUrl.pathname.startsWith("/admin") && !PUBLIC_ADMIN_PATHS.includes(request.nextUrl.pathname)) {
      const u = request.nextUrl.clone();
      u.pathname = "/admin/login";
      return NextResponse.redirect(u);
    }
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { secure: process.env.NODE_ENV === "production", sameSite: "lax" },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Sessão obtida só de clicar num link de convite/recuperação já autentica
  // no Supabase, mas a pessoa ainda não escolheu senha nenhuma — essa
  // sessão só pode ser usada pra definir a senha, não pra navegar o resto
  // do painel. password_set só vira true depois de updateUser({password})
  // (ver /api/auth/mark-password-set), via app_metadata (não editável pelo
  // próprio usuário).
  const passwordSet = user?.app_metadata?.password_set === true;

  const { pathname } = request.nextUrl;
  const isAdmin = pathname.startsWith("/admin");
  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.includes(pathname);
  const isLogin = pathname === "/admin/login";
  const isRedefinirSenha = pathname === "/admin/redefinir-senha";

  if (isAdmin && !isPublicAdminPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }
  if (isAdmin && !isPublicAdminPath && user && !passwordSet) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/redefinir-senha";
    return NextResponse.redirect(url);
  }
  if (isLogin && user && passwordSet) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }
  // Sessão própria (mesmo navegador) ainda sem senha definida — resolve
  // sem precisar de um link novo, mandando pra tela certa a partir da
  // própria sessão já ativa (não de um token de e-mail).
  if (isLogin && user && !passwordSet) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/redefinir-senha";
    return NextResponse.redirect(url);
  }
  if (isRedefinirSenha && user && passwordSet) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:png|jpg|jpeg|svg|webp|gif)$).*)"],
};
