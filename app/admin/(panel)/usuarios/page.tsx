import Link from "next/link";
import { requireUser } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/service";
import UsersList from "@/components/admin/UsersList";

function formatDate(v: string | null | undefined) {
  if (!v) return "—";
  return new Date(v).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

async function listAllUsers(service: ReturnType<typeof createServiceClient>) {
  const perPage = 200;
  const all = [];
  let page = 1;
  for (;;) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage });
    if (error) return { users: all, error };
    all.push(...data.users);
    if (data.users.length < perPage) break;
    page += 1;
  }
  return { users: all, error: null };
}

async function listInviteSends(service: ReturnType<typeof createServiceClient>) {
  const { data } = await service
    .from("invite_sends")
    .select("email, sent_at")
    .order("sent_at", { ascending: false });

  const byEmail: Record<string, string[]> = {};
  for (const row of data ?? []) {
    (byEmail[row.email] ??= []).push(row.sent_at);
  }
  return byEmail;
}

export default async function UsuariosPage() {
  const { user: me } = await requireUser();
  const service = createServiceClient();
  const [{ users: fetched, error }, inviteSends] = await Promise.all([
    listAllUsers(service),
    listInviteSends(service),
  ]);
  const users = [...fetched].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-brand-dark">Usuários do painel</h1>
        <Link href="/admin/usuarios/novo" className="rounded-full bg-accent px-5 py-2.5 font-bold text-white">
          + Convidar usuário
        </Link>
      </div>
      <p className="mt-2 text-sm text-foreground/60">
        Qualquer pessoa nesta lista consegue entrar no painel administrativo com sua própria senha.
      </p>

      {error && <p className="mt-4 text-sm text-red-600">Não foi possível carregar os usuários: {error.message}</p>}

      <UsersList
        meId={me.id}
        initialInviteSends={inviteSends}
        initialUsers={users.map((u) => ({
          id: u.id,
          email: u.email ?? "",
          createdAt: u.created_at ?? null,
          lastSignInAt: u.last_sign_in_at ?? null,
          pending: !u.email_confirmed_at,
        }))}
      />
    </div>
  );
}
