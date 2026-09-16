import BackLink from "@/components/admin/BackLink";
import { inviteUser } from "../actions";

export default function NovoUsuarioPage() {
  return (
    <div className="max-w-lg">
      <BackLink href="/admin/usuarios" />
      <h1 className="mt-4 text-2xl font-extrabold text-brand-dark">Convidar usuário</h1>
      <p className="mt-2 text-sm text-foreground/60">
        A pessoa recebe um e-mail para definir a própria senha e passa a ter acesso completo ao painel administrativo.
      </p>

      <form action={inviteUser} className="mt-6 grid gap-4 rounded-2xl bg-white p-6 shadow-sm">
        <label className="block text-sm font-semibold">
          E-mail
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="pessoa@exemplo.com"
            className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
          />
        </label>
        <button type="submit" className="rounded-full bg-accent px-5 py-2.5 font-bold text-white">
          Enviar convite
        </button>
      </form>
    </div>
  );
}
