"use client";

import Image from "next/image";
import { useState } from "react";
import { saveActivity } from "@/app/admin/(panel)/atividades/actions";
import ImageInput from "@/components/admin/ImageInput";
import RichTextEditor from "@/components/admin/RichTextEditor";

type Activity = {
  id?: string;
  slug?: string;
  title?: string;
  category?: "curricular" | "extracurricular";
  tile_image?: string | null;
  hero_image?: string | null;
  body?: string | null;
  sort_order?: number;
};

export default function ActivityForm({ activity }: { activity?: Activity }) {
  const [tilePreview, setTilePreview] = useState<string | null>(activity?.tile_image ?? null);
  const [heroPreview, setHeroPreview] = useState<string | null>(activity?.hero_image ?? null);

  return (
    <form action={saveActivity} className="grid gap-5 max-w-2xl">
      {activity?.id && <input type="hidden" name="id" value={activity.id} />}
      <input type="hidden" name="slug" value={activity?.slug ?? ""} />
      <input type="hidden" name="tile_image" value={activity?.tile_image ?? ""} />
      <input type="hidden" name="hero_image" value={activity?.hero_image ?? ""} />

      <Input name="title" label="Título" defaultValue={activity?.title} required />

      <label className="block text-sm font-semibold">
        Categoria
        <select
          name="category"
          defaultValue={activity?.category ?? "extracurricular"}
          className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
        >
          <option value="extracurricular">Extracurricular</option>
          <option value="curricular">Curricular</option>
        </select>
      </label>

      <div>
        {tilePreview && (
          <div className="relative mb-3 aspect-square w-40 overflow-hidden rounded-xl border border-brand-soft">
            <Image src={tilePreview} alt="Prévia do quadrado" fill className="object-cover" />
          </div>
        )}
        <ImageInput
          name="tile_image_file"
          label="Imagem do quadrado (home)"
          hint="Tamanho recomendado: 800×800px. Em branco = usa um ícone e cor padrão em vez de foto."
          onFileChange={(f) => setTilePreview(URL.createObjectURL(f))}
        />
      </div>

      <div>
        {heroPreview && (
          <div className="relative mb-3 aspect-[21/9] w-full overflow-hidden rounded-xl border border-brand-soft">
            <Image src={heroPreview} alt="Prévia da capa" fill className="object-cover" />
          </div>
        )}
        <ImageInput
          name="hero_image_file"
          label="Imagem de capa (topo da página da atividade, opcional)"
          hint="Tamanho recomendado: 1920×600px. Deixe em branco para manter a imagem atual."
          onFileChange={(f) => setHeroPreview(URL.createObjectURL(f))}
        />
      </div>

      <RichTextEditor name="body" label="Texto da página" defaultValue={activity?.body} />

      <Input name="sort_order" label="Ordem" type="number" defaultValue={String(activity?.sort_order ?? 0)} />

      <button className="rounded-full bg-brand px-6 py-3 font-bold text-white hover:bg-brand-dark w-fit">
        Salvar atividade
      </button>
    </form>
  );
}

function Input({
  name, label, type = "text", defaultValue, required, placeholder,
}: {
  name: string; label: string; type?: string;
  defaultValue?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
      />
    </label>
  );
}
