import SegmentForm from "@/components/admin/SegmentForm";
import { requireUser } from "@/lib/admin";

export default async function NewSegmentPage() {
  await requireUser();
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-dark mb-6">Novo segmento</h1>
      <SegmentForm />
    </div>
  );
}
