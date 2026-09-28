import { notFound } from "next/navigation";
import PartnerForm from "@/components/admin/PartnerForm";
import BackLink from "@/components/admin/BackLink";
import { requireUser } from "@/lib/admin";

export default async function EditPartnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { sb } = await requireUser();
  const { data: partner } = await sb.from("partners").select("*").eq("id", id).single();
  if (!partner) notFound();

  return (
    <div>
      <BackLink href="/admin/parceiros" />
      <h1 className="text-2xl font-extrabold text-brand-dark mb-6">Editar parceiro</h1>
      <PartnerForm partner={partner} />
    </div>
  );
}
