import Image from "next/image";
import ImageInput from "@/components/admin/ImageInput";
import DeleteForm from "@/components/admin/DeleteForm";
import { addPagePhoto, deletePagePhoto } from "@/app/admin/(panel)/paginas/actions";
import type { PagePhoto } from "@/lib/content";

export default function PagePhotosManager({
  slug,
  returnTo,
  photos,
}: {
  slug: string;
  returnTo: string;
  photos: PagePhoto[];
}) {
  return (
    <section className="mt-10 max-w-2xl">
      <h2 className="text-xl font-extrabold text-brand-dark">Fotos do carrossel</h2>
      <p className="mt-1 text-sm text-foreground/60">
        Aparecem em um carrossel abaixo do texto da página. Sem fotos, o carrossel não aparece no site.
      </p>

      <form
        action={addPagePhoto}
        className="mt-4 flex flex-wrap items-end gap-4 rounded-2xl bg-white p-6 shadow-sm"
        encType="multipart/form-data"
      >
        <input type="hidden" name="page_slug" value={slug} />
        <input type="hidden" name="return_to" value={returnTo} />
        <div className="min-w-[220px] flex-1">
          <ImageInput name="photo" label="Nova foto" hint="Adiciona ao final do carrossel." />
        </div>
        <button type="submit" className="rounded-full bg-accent px-5 py-2.5 font-bold text-white">
          + Adicionar foto
        </button>
      </form>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {photos.map((p) => (
          <div key={p.id} className="relative overflow-hidden rounded-xl shadow-sm">
            <div className="relative aspect-[3/2]">
              <Image src={p.image_url} alt="" fill className="object-cover" />
            </div>
            <DeleteForm action={deletePagePhoto} id={p.id} confirmText="Excluir essa foto do carrossel?">
              <input type="hidden" name="page_slug" value={slug} />
              <input type="hidden" name="return_to" value={returnTo} />
              <button className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs font-bold text-white hover:bg-red-600">
                Excluir
              </button>
            </DeleteForm>
          </div>
        ))}
        {photos.length === 0 && <p className="text-foreground/60">Nenhuma foto cadastrada ainda.</p>}
      </div>
    </section>
  );
}
