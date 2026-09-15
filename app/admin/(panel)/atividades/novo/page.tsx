import ActivityForm from "@/components/admin/ActivityForm";
import BackLink from "@/components/admin/BackLink";
import { requireUser } from "@/lib/admin";

export default async function NewActivityPage() {
  await requireUser();
  return (
    <div>
      <BackLink href="/admin/atividades" />
      <h1 className="text-2xl font-extrabold text-brand-dark mb-6">Nova atividade</h1>
      <ActivityForm />
    </div>
  );
}
