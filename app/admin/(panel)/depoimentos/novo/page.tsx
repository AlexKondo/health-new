import TestimonialForm from "@/components/admin/TestimonialForm";
import BackLink from "@/components/admin/BackLink";
import { requireUser } from "@/lib/admin";

export default async function NewTestimonial() {
  await requireUser();
  return (
    <div>
      <BackLink href="/admin/depoimentos" />
      <h1 className="text-2xl font-extrabold text-brand-dark mb-6">Novo depoimento</h1>
      <TestimonialForm />
    </div>
  );
}
