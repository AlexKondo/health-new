import Image from "next/image";
import { requireUser } from "@/lib/admin";
import ImageInput from "@/components/admin/ImageInput";
import { getNossaHistoria } from "@/lib/content";
import { saveNossaHistoria } from "./actions";

export default async function NossaHistoriaAdmin() {
  await requireUser();
  const h = await getNossaHistoria();

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
    </div>
  );
}
