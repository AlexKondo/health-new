import { notFound } from "next/navigation";
import BannerForm from "@/components/admin/BannerForm";
import BackLink from "@/components/admin/BackLink";
import { requireUser } from "@/lib/admin";

export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { sb } = await requireUser();
  const { data: banner } = await sb.from("banners").select("*").eq("id", id).single();
  if (!banner) notFound();

  return (
    <div>
      <BackLink href="/admin/banners" />
      <h1 className="text-2xl font-extrabold text-brand-dark mb-6">Editar banner</h1>
      <BannerForm banner={banner} />
    </div>
  );
}
