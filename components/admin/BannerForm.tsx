"use client";

import Image from "next/image";
import { useState } from "react";
import { saveBanner } from "@/app/admin/(panel)/banners/actions";

type Banner = {
  id?: string;
  title?: string;
  image_url?: string;
  link_url?: string | null;
  alt?: string | null;
  sort_order?: number;
  duration_seconds?: number;
  starts_at?: string | null;
  ends_at?: string | null;
  active?: boolean;
};

export default function BannerForm({
  banner,
  pageOptions = [],
}: {
  banner?: Banner;
  pageOptions?: { href: string; label: string }[];
}) {
  const [preview, setPreview] = useState<string | null>(banner?.image_url ?? null);

  return (
    <form action={saveBanner} className="grid gap-5 max-w-2xl">
      {banner?.id && <input type="hidden" name="id" value={banner.id} />}
      <input type="hidden" name="image_url" value={banner?.image_url ?? ""} />

      <div>
        <label className="block text-sm font-semibold mb-1">Imagem do banner (1920×650)</label>
        {preview && (
          <div className="relative mb-3 aspect-[1920/650] w-full overflow-hidden rounded-xl border border-brand-soft">
            <Image src={preview} alt="Prévia" fill className="object-cover" />
          </div>
        )}
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setPreview(URL.createObjectURL(f));
          }}
          className="text-sm"
        />
        <p className="text-xs text-foreground/50 mt-1">
          Deixe em branco para manter a imagem atual.
        </p>
      </div>

      <Input name="title" label="Título" defaultValue={banner?.title} required />
      <Input name="alt" label="Texto alternativo (acessibilidade)" defaultValue={banner?.alt ?? ""} />
      <label className="block text-sm font-semibold">
        Link ao clicar (opcional)
        <input
          name="link_url"
          list="banner-link-options"
          defaultValue={banner?.link_url ?? ""}
          placeholder="Escolha uma página ou digite um link"
          className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
        />
        <datalist id="banner-link-options">
          {pageOptions.map((p) => (
            <option key={p.href} value={p.href}>
              {p.label}
            </option>
          ))}
        </datalist>
        <p className="mt-1 text-xs text-foreground/50">
          Escolha uma das páginas do site na lista, ou digite um link (ex: WhatsApp, PDF, site externo).
        </p>
      </label>

      <div className="grid grid-cols-2 gap-4">
        <Input name="starts_at" label="Exibir a partir de" type="date" defaultValue={banner?.starts_at ?? ""} />
        <Input name="ends_at" label="Exibir até" type="date" defaultValue={banner?.ends_at ?? ""} />
      </div>
      <p className="-mt-2 text-xs text-foreground/50">
        Datas vazias = sempre visível. Use o intervalo para datas comemorativas.
      </p>

      <div className="grid grid-cols-3 gap-4 items-end">
        <Input name="sort_order" label="Ordem" type="number" defaultValue={String(banner?.sort_order ?? 0)} />
        <Input
          name="duration_seconds"
          label="Tempo na tela (segundos)"
          type="number"
          min={1}
          max={60}
          defaultValue={String(banner?.duration_seconds ?? 6)}
        />
        <label className="flex items-center gap-2 text-sm font-semibold pb-2">
          <input type="checkbox" name="active" defaultChecked={banner?.active ?? true} className="h-4 w-4" />
          Ativo
        </label>
      </div>

      <button className="rounded-full bg-brand px-6 py-3 font-bold text-white hover:bg-brand-dark w-fit">
        Salvar banner
      </button>
    </form>
  );
}

function Input({
  name, label, type = "text", defaultValue, required, placeholder, min, max,
}: {
  name: string; label: string; type?: string;
  defaultValue?: string; required?: boolean; placeholder?: string;
  min?: number; max?: number;
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
        min={min}
        max={max}
        className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
      />
    </label>
  );
}
