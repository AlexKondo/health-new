import Link from "next/link";
import { requireUser } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/service";
import DeleteForm from "@/components/admin/DeleteForm";
import { removeUser, resendInvite } from "./actions";

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

export default async function UsuariosPage() {
  const { user: me } = await requireUser();
  const service = createServiceClient();
  const { users: fetched, error } = await listAllUsers(service);
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

      <div className="mt-6 space-y-3">
        {users.map((u) => {
          const pending = !u.email_confirmed_at;
          const isMe = u.id === me.id;
          return (
            <div key={u.id} className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-bold truncate">
                  {u.email}
                  {isMe && <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand-dark">você</span>}
                  {pending && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">convite pendente</span>}
                </p>
                <p className="text-xs text-foreground/60">
                  Criado em {formatDate(u.created_at)} · Último acesso {formatDate(u.last_sign_in_at)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {pending && (
                  <form action={resendInvite}>
                    <input type="hidden" name="email" value={u.email ?? ""} />
                    <button className="text-sm font-semibold text-brand hover:underline">Reenviar convite</button>
                  </form>
                )}
                {!isMe && (
                  <DeleteForm
                    action={removeUser}
                    id={u.id}
                    confirmText={`Remover o acesso de "${u.email}"? Essa pessoa não vai mais conseguir entrar no painel.`}
                  >
                    <button className="text-sm text-red-600 hover:underline">Remover</button>
                  </DeleteForm>
                )}
              </div>
            </div>
          );
        })}
        {users.length === 0 && <p className="text-foreground/60">Nenhum usuário encontrado.</p>}
      </div>
    </div>
  );
}
