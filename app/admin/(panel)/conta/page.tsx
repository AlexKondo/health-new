import { requireUser } from "@/lib/admin";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";

export default async function ContaPage() {
  const { user } = await requireUser();

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-dark">Minha conta</h1>
      <p className="mt-1 text-sm text-foreground/60">{user.email}</p>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-brand-dark">Alterar senha</h2>
        <p className="mt-1 text-sm text-foreground/60">
          Peça a senha atual para confirmar antes de trocar.
        </p>
        <div className="mt-4">
          <ChangePasswordForm email={user.email!} />
        </div>
      </div>
    </div>
  );
}
