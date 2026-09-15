import { notFound } from "next/navigation";
import SegmentForm from "@/components/admin/SegmentForm";
import { requireUser } from "@/lib/admin";

export default async function EditSegmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { sb } = await requireUser();
  const { data: segment } = await sb.from("segments").select("*").eq("id", id).single();
  if (!segment) notFound();

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-dark mb-6">Editar segmento</h1>
      <SegmentForm segment={segment} />
    </div>
  );
}
