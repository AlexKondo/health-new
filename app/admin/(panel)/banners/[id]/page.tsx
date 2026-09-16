import { notFound } from "next/navigation";
import BannerForm from "@/components/admin/BannerForm";
import BackLink from "@/components/admin/BackLink";
import { requireUser } from "@/lib/admin";
import { getSiteLinkOptions } from "@/lib/content";

export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { sb } = await requireUser();
  const [{ data: banner }, pageOptions] = await Promise.all([
    sb.from("banners").select("*").eq("id", id).single(),
    getSiteLinkOptions(),
  ]);
  if (!banner) notFound();

  return (
    <div>
      <BackLink href="/admin/banners" />
      <h1 className="text-2xl font-extrabold text-brand-dark mb-6">Editar banner</h1>
      <BannerForm banner={banner} pageOptions={pageOptions} />
    </div>
  );
}
