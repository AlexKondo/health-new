import TestimonialForm from "@/components/admin/TestimonialForm";
import { requireUser } from "@/lib/admin";

export default async function NewTestimonial() {
  await requireUser();
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-dark mb-6">Novo depoimento</h1>
      <TestimonialForm />
    </div>
  );
}
