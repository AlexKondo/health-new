import StatForm from "@/components/admin/StatForm";
import { requireUser } from "@/lib/admin";

export default async function NewStatPage() {
  await requireUser();
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-dark mb-6">Novo número</h1>
      <StatForm />
    </div>
  );
}
