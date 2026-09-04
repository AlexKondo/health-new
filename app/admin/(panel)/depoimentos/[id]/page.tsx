import { notFound } from "next/navigation";
import TestimonialForm from "@/components/admin/TestimonialForm";
import { requireUser } from "@/lib/admin";

export default async function EditTestimonial({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { sb } = await requireUser();
  const { data } = await sb.from("testimonials").select("*").eq("id", id).single();
  if (!data) notFound();

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-dark mb-6">Editar depoimento</h1>
      <TestimonialForm t={data} />
    </div>
  );
}
