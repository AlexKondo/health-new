import { notFound } from "next/navigation";
import StatForm from "@/components/admin/StatForm";
import { requireUser } from "@/lib/admin";

export default async function EditStatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { sb } = await requireUser();
  const { data: stat } = await sb.from("stats").select("*").eq("id", id).single();
  if (!stat) notFound();

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-dark mb-6">Editar número</h1>
      <StatForm stat={stat} />
    </div>
  );
}
