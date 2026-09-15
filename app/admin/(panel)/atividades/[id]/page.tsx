import { notFound } from "next/navigation";
import ActivityForm from "@/components/admin/ActivityForm";
import BackLink from "@/components/admin/BackLink";
import { requireUser } from "@/lib/admin";

export default async function EditActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { sb } = await requireUser();
  const { data: activity } = await sb.from("activities").select("*").eq("id", id).single();
  if (!activity) notFound();

  return (
    <div>
      <BackLink href="/admin/atividades" />
      <h1 className="text-2xl font-extrabold text-brand-dark mb-6">Editar atividade</h1>
      <ActivityForm activity={activity} />
    </div>
  );
}
