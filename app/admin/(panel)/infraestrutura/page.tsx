import Image from "next/image";
import { requireUser } from "@/lib/admin";
import ImageInput from "@/components/admin/ImageInput";
import DeleteForm from "@/components/admin/DeleteForm";
import { getInfraestrutura, getInfraPhotos } from "@/lib/content";
import { saveInfraestrutura, addInfraPhoto, deleteInfraPhoto } from "./actions";

export default async function InfraestruturaAdmin() {
  await requireUser();
  const [info, photos] = await Promise.all([getInfraestrutura(), getInfraPhotos()]);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold text-brand-dark">Infraestrutura</h1>
      <p className="mt-2 text-sm text-foreground/60">
        Página institucional em /infraestrutura. Alterações aparecem no site assim que você salvar.
      </p>

      <form
        action={saveInfraestrutura}
        className="mt-6 grid gap-4 rounded-2xl bg-white p-6 shadow-sm"
        encType="multipart/form-data"
      >
        <label className="block text-sm font-semibold">
          Título
          <input
            name="title"
            defaultValue={info.title}
            required
            className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
          />
        </label>

        <label className="block text-sm font-semibold">
          Texto
          <textarea
            name="body"
            defaultValue={info.body}
            required
            rows={8}
            className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
          />
          <span className="mt-1 block text-xs font-normal text-foreground/60">
            Deixe uma linha em branco entre parágrafos.
          </span>
        </label>

        <div>
          {info.heroImage && (
            <div className="relative mb-3 h-40 w-full overflow-hidden rounded-xl bg-brand-soft">
              <Image src={info.heroImage} alt="Infraestrutura" fill className="object-cover" />
            </div>
          )}
          <ImageInput name="hero_image" label="Imagem do topo" hint="Deixe em branco pra manter a imagem atual." />
        </div>

        <button type="submit" className="mt-2 rounded-full bg-brand px-5 py-2.5 font-bold text-white hover:bg-brand-dark">
          Salvar
        </button>
      </form>

      <h2 className="mt-10 text-xl font-extrabold text-brand-dark">Galeria de fotos</h2>
      <p className="mt-1 text-sm text-foreground/60">
        Fotos exibidas na página, na ordem em que aparecem aqui.
      </p>

      <form
        action={addInfraPhoto}
        className="mt-4 flex flex-wrap items-end gap-4 rounded-2xl bg-white p-6 shadow-sm"
        encType="multipart/form-data"
      >
        <div className="flex-1 min-w-[220px]">
          <ImageInput name="photo" label="Nova foto" hint="Adiciona ao final da galeria." />
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
            <DeleteForm action={deleteInfraPhoto} id={p.id} confirmText="Excluir essa foto da galeria?">
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
