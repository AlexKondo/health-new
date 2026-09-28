import PartnerForm from "@/components/admin/PartnerForm";
import BackLink from "@/components/admin/BackLink";
import { requireUser } from "@/lib/admin";

export default async function NewPartnerPage() {
  await requireUser();
  return (
    <div>
      <BackLink href="/admin/parceiros" />
      <h1 className="text-2xl font-extrabold text-brand-dark mb-6">Novo parceiro</h1>
      <PartnerForm />
    </div>
  );
}
