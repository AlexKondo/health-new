import SegmentForm from "@/components/admin/SegmentForm";
import BackLink from "@/components/admin/BackLink";
import { requireUser } from "@/lib/admin";

export default async function NewSegmentPage() {
  await requireUser();
  return (
    <div>
      <BackLink href="/admin/segmentos" />
      <h1 className="text-2xl font-extrabold text-brand-dark mb-6">Novo segmento</h1>
      <SegmentForm />
    </div>
  );
}
