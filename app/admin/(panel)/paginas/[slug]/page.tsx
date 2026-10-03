import Image from "next/image";
import { notFound } from "next/navigation";
import BackLink from "@/components/admin/BackLink";
import ImageInput from "@/components/admin/ImageInput";
import RichTextEditor from "@/components/admin/RichTextEditor";
import CarouselFields from "@/components/admin/CarouselFields";
import PagePhotosManager from "@/components/admin/PagePhotosManager";
import { requireUser } from "@/lib/admin";
import { getEditablePages, getPagePhotos, getSitePage } from "@/lib/content";
import { savePage } from "../actions";

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export default async function EditarPaginaAdmin({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await requireUser();

  const page = getEditablePages().find((p) => p.slug === slug);
  if (!page) notFound();

  const [custom, photos] = await Promise.all([getSitePage(slug), getPagePhotos(slug)]);
  const title = custom?.title ?? page.title;
  const hero = custom?.hero_image || page.hero_image;
  const body = custom?.body ?? page.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("");

  return (
    <div>
      <BackLink href="/admin/paginas" />
      <h1 className="text-2xl font-extrabold text-brand-dark">Editar página: {page.title}</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Página pública em /{slug}. Alterações aparecem no site assim que você salvar.
      </p>

      <form action={savePage} className="mt-6 grid max-w-2xl gap-5" encType="multipart/form-data">
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="hero_image" value={hero ?? ""} />

        <label className="block text-sm font-semibold">
          Título
          <input
            name="title"
            defaultValue={title}
            required
            className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
          />
        </label>

        <div>
          {hero && (
            <div className="relative mb-3 h-40 w-full overflow-hidden rounded-xl bg-brand-soft">
              <Image src={hero} alt={title} fill className="object-cover" />
            </div>
          )}
          <ImageInput
            name="hero_image_file"
            label="Imagem do topo"
            hint="Tamanho recomendado: 1920×600px. Deixe em branco para manter a imagem atual."
          />
        </div>

        <RichTextEditor name="body" label="Texto da página" defaultValue={body} />

        <CarouselFields showCarousel={custom?.show_carousel} intervalSeconds={custom?.carousel_interval_seconds} />

        <button type="submit" className="w-fit rounded-full bg-brand px-6 py-3 font-bold text-white hover:bg-brand-dark">
          Salvar página
        </button>
      </form>

      <PagePhotosManager slug={slug} returnTo={`/admin/paginas/${slug}`} photos={photos} />
    </div>
  );
}
