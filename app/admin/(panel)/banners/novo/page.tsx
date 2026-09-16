import BannerForm from "@/components/admin/BannerForm";
import BackLink from "@/components/admin/BackLink";
import { requireUser } from "@/lib/admin";
import { getSiteLinkOptions } from "@/lib/content";

export default async function NewBannerPage() {
  await requireUser();
  const pageOptions = await getSiteLinkOptions();
  return (
    <div>
      <BackLink href="/admin/banners" />
      <h1 className="text-2xl font-extrabold text-brand-dark mb-6">Novo banner</h1>
      <BannerForm pageOptions={pageOptions} />
    </div>
  );
}
