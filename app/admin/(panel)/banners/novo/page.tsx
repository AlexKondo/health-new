import BannerForm from "@/components/admin/BannerForm";
import { requireUser } from "@/lib/admin";

export default async function NewBannerPage() {
  await requireUser();
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-dark mb-6">Novo banner</h1>
      <BannerForm />
    </div>
  );
}
