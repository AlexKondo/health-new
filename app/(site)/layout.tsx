import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import WhatsAppButton from "@/components/site/WhatsAppButton";
import Analytics from "@/components/site/Analytics";
import TrackingScripts from "@/components/site/TrackingScripts";
import { getSetting, getDiferenciais } from "@/lib/content";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [metaPixelId, googleTagId, diferenciais] = await Promise.all([
    getSetting("meta_pixel_id", ""),
    getSetting("google_tag_id", ""),
    getDiferenciais(),
  ]);

  return (
    <>
      <TrackingScripts metaPixelId={metaPixelId} googleTagId={googleTagId} />
      <Analytics />
      <Header showDiferenciais={diferenciais.published} />
      <main className="flex-1">{children}</main>
      <Footer showDiferenciais={diferenciais.published} />
      <WhatsAppButton />
    </>
  );
}
