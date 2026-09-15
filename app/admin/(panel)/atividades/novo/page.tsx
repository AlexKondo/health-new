import ActivityForm from "@/components/admin/ActivityForm";
import { requireUser } from "@/lib/admin";

export default async function NewActivityPage() {
  await requireUser();
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-dark mb-6">Nova atividade</h1>
      <ActivityForm />
    </div>
  );
}
