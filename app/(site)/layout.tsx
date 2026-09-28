import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import ContactBar from "@/components/site/ContactBar";
import WhatsAppButton from "@/components/site/WhatsAppButton";
import Analytics from "@/components/site/Analytics";
import TrackingScripts from "@/components/site/TrackingScripts";
import { getSetting, getDiferenciais, getSegments, getSocialLinks } from "@/lib/content";
import { buildNav } from "@/lib/nav";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [metaPixelId, googleTagId, diferenciais, segments, social] = await Promise.all([
    getSetting("meta_pixel_id", ""),
    getSetting("google_tag_id", ""),
    getDiferenciais(),
    getSegments(),
    getSocialLinks(),
  ]);
  const nav = buildNav({
    showDiferenciais: diferenciais.published,
    segments: segments.filter((s) => s.slug !== "curricular"),
    youtubeUrl: social.youtube,
  });

  return (
    <>
      <TrackingScripts metaPixelId={metaPixelId} googleTagId={googleTagId} />
      <Analytics />
      <ContactBar contact={social} />
      <Header nav={nav} />
      <main className="flex-1">{children}</main>
      <Footer nav={nav} social={social} />
      <WhatsAppButton whatsappNumber={social.whatsappNumber} />
    </>
  );
}
