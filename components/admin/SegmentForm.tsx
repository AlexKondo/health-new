"use client";

import Image from "next/image";
import { useState } from "react";
import { saveSegment } from "@/app/admin/(panel)/segmentos/actions";
import ImageInput from "@/components/admin/ImageInput";
import RichTextEditor from "@/components/admin/RichTextEditor";

type ScheduleBlock = { label: string; from: string; to: string };

type Segment = {
  id?: string;
  slug?: string;
  title?: string;
  card_image?: string | null;
  hero_image?: string | null;
  age_range?: string | null;
  intro?: string | null;
  body?: string | null;
  schedule?: ScheduleBlock[];
  sort_order?: number;
};

export default function SegmentForm({ segment }: { segment?: Segment }) {
  const [cardPreview, setCardPreview] = useState<string | null>(segment?.card_image ?? null);
  const [heroPreview, setHeroPreview] = useState<string | null>(segment?.hero_image ?? null);
  const sched = segment?.schedule ?? [];

  return (
    <form action={saveSegment} className="grid gap-5 max-w-2xl">
      {segment?.id && <input type="hidden" name="id" value={segment.id} />}
      <input type="hidden" name="slug" value={segment?.slug ?? ""} />
      <input type="hidden" name="card_image" value={segment?.card_image ?? ""} />
      <input type="hidden" name="hero_image" value={segment?.hero_image ?? ""} />

      <Input name="title" label="Título" defaultValue={segment?.title} required />

      <div>
        {cardPreview && (
          <div className="relative mb-3 aspect-[16/10] w-full max-w-xs overflow-hidden rounded-xl border border-brand-soft">
            <Image src={cardPreview} alt="Prévia do card" fill className="object-cover" />
          </div>
        )}
        <ImageInput
          name="card_image_file"
          label="Imagem do card (usada na home)"
          hint="Tamanho recomendado: 1200×750px. Deixe em branco para manter a imagem atual."
          onFileChange={(f) => setCardPreview(URL.createObjectURL(f))}
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
          label="Imagem de capa (topo da página do segmento)"
          hint="Tamanho recomendado: 1920×600px. Deixe em branco para manter a imagem atual."
          onFileChange={(f) => setHeroPreview(URL.createObjectURL(f))}
        />
      </div>

      <Input name="age_range" label="Faixa etária" defaultValue={segment?.age_range ?? ""} placeholder="4 meses a 1 ano" />
      <Textarea
        name="intro"
        label="Resumo (aparece no card da home e no topo da página)"
        defaultValue={segment?.intro ?? ""}
        rows={3}
      />
      <RichTextEditor name="body" label="Texto completo da página" defaultValue={segment?.body} />

      <div>
        <p className="block text-sm font-semibold mb-2">Horários (opcional, até 2 turnos)</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1].map((i) => {
            const b: Partial<ScheduleBlock> = sched[i] ?? {};
            const n = i + 1;
            return (
              <div key={n} className="rounded-xl border border-brand-soft p-3 space-y-2">
                <Input name={`schedule_${n}_label`} label="Turno" defaultValue={b.label ?? ""} placeholder="Manhã" />
                <div className="grid grid-cols-2 gap-2">
                  <Input name={`schedule_${n}_from`} label="Das" type="time" defaultValue={b.from ?? ""} />
                  <Input name={`schedule_${n}_to`} label="Até" type="time" defaultValue={b.to ?? ""} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Input name="sort_order" label="Ordem" type="number" defaultValue={String(segment?.sort_order ?? 0)} />

      <button className="rounded-full bg-brand px-6 py-3 font-bold text-white hover:bg-brand-dark w-fit">
        Salvar segmento
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

function Textarea({
  name, label, defaultValue, rows = 4,
}: {
  name: string; label: string; defaultValue?: string; rows?: number;
}) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
      />
    </label>
  );
}
