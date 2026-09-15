import StatForm from "@/components/admin/StatForm";
import BackLink from "@/components/admin/BackLink";
import { requireUser } from "@/lib/admin";

export default async function NewStatPage() {
  await requireUser();
  return (
    <div>
      <BackLink href="/admin/estatisticas" />
      <h1 className="text-2xl font-extrabold text-brand-dark mb-6">Novo número</h1>
      <StatForm />
    </div>
  );
}
