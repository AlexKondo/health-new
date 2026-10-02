import Image from "next/image";
import { requireUser } from "@/lib/admin";
import ImageInput from "@/components/admin/ImageInput";
import DeleteForm from "@/components/admin/DeleteForm";
import { getNossaHistoria, getNossaHistoriaPhotos } from "@/lib/content";
import { saveNossaHistoria, addNossaHistoriaPhoto, deleteNossaHistoriaPhoto } from "./actions";

export default async function NossaHistoriaAdmin() {
  await requireUser();
  const [h, photos] = await Promise.all([getNossaHistoria(), getNossaHistoriaPhotos()]);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold text-brand-dark">Nossa História</h1>
      <p className="mt-2 text-sm text-foreground/60">
        Página institucional em /nossa-historia. Alterações aparecem no site assim que você salvar.
      </p>

      <form
        action={saveNossaHistoria}
        className="mt-6 grid gap-4 rounded-2xl bg-white p-6 shadow-sm"
        encType="multipart/form-data"
      >
        <label className="block text-sm font-semibold">
          Título
          <input
            name="title"
            defaultValue={h.title}
            required
            className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
          />
        </label>

        <label className="block text-sm font-semibold">
          Texto
          <textarea
            name="body"
            defaultValue={h.body}
            required
            rows={12}
            className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
          />
          <span className="mt-1 block text-xs font-normal text-foreground/60">
            Deixe uma linha em branco entre parágrafos.
          </span>
        </label>

        <div>
          {h.heroImage && (
            <div className="relative mb-3 h-40 w-full overflow-hidden rounded-xl bg-brand-soft">
              <Image src={h.heroImage} alt="Nossa História" fill className="object-cover" />
            </div>
          )}
          <ImageInput
            name="hero_image"
            label="Imagem do topo"
            hint="Deixe em branco pra manter a imagem atual."
          />
        </div>

        <button type="submit" className="mt-2 rounded-full bg-brand px-5 py-2.5 font-bold text-white hover:bg-brand-dark">
          Salvar
        </button>
      </form>

      <h2 className="mt-10 text-xl font-extrabold text-brand-dark">Carrossel de fotos</h2>
      <p className="mt-1 text-sm text-foreground/60">
        Aparece logo abaixo do texto, na página. Troca automaticamente de foto.
      </p>

      <form
        action={saveNossaHistoria}
        className="mt-4 max-w-xs rounded-2xl bg-white p-6 shadow-sm"
      >
        <input type="hidden" name="title" value={h.title} />
        <input type="hidden" name="body" value={h.body} />
        <label className="block text-sm font-semibold">
          Troca de foto a cada (segundos)
          <input
            type="number"
            name="carousel_interval_seconds"
            min={1}
            max={30}
            defaultValue={h.carouselIntervalSeconds}
            className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
          />
        </label>
        <button type="submit" className="mt-3 rounded-full bg-brand px-5 py-2.5 font-bold text-white hover:bg-brand-dark">
          Salvar
        </button>
      </form>

      <form
        action={addNossaHistoriaPhoto}
        className="mt-4 flex flex-wrap items-end gap-4 rounded-2xl bg-white p-6 shadow-sm"
        encType="multipart/form-data"
      >
        <div className="flex-1 min-w-[220px]">
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
            <DeleteForm action={deleteNossaHistoriaPhoto} id={p.id} confirmText="Excluir essa foto do carrossel?">
              <button className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs font-bold text-white hover:bg-red-600">
                Excluir
              </button>
            </DeleteForm>
          </div>
        ))}
        {photos.length === 0 && <p className="text-foreground/60">Nenhuma foto cadastrada ainda.</p>}
      </div>
    </div>
  );
}
