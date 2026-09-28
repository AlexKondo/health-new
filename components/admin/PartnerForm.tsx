"use client";

import Image from "next/image";
import { useState } from "react";
import { savePartner } from "@/app/admin/(panel)/parceiros/actions";
import ImageInput from "@/components/admin/ImageInput";

type Partner = {
  id?: string;
  name?: string;
  logo_url?: string | null;
  link_url?: string | null;
  description?: string | null;
  sort_order?: number;
};

export default function PartnerForm({ partner }: { partner?: Partner }) {
  const [preview, setPreview] = useState<string | null>(partner?.logo_url ?? null);

  return (
    <form action={savePartner} className="grid gap-5 max-w-2xl">
      {partner?.id && <input type="hidden" name="id" value={partner.id} />}
      <input type="hidden" name="logo_url" value={partner?.logo_url ?? ""} />

      <label className="block text-sm font-semibold">
        Nome do parceiro
        <input
          name="name"
          defaultValue={partner?.name}
          required
          className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
        />
      </label>

      <div>
        {preview && (
          <div className="relative mb-3 aspect-square w-32 overflow-hidden rounded-xl border border-brand-soft bg-white">
            <Image src={preview} alt="Prévia do logo" fill className="object-contain p-2" />
          </div>
        )}
        <ImageInput
          name="logo"
          label="Logo (imagem quadrada)"
          hint="Tamanho recomendado: 400×400px, fundo transparente ou branco. Deixe em branco para manter o logo atual."
          onFileChange={(f) => setPreview(URL.createObjectURL(f))}
        />
      </div>

      <label className="block text-sm font-semibold">
        Descrição
        <textarea
          name="description"
          defaultValue={partner?.description ?? ""}
          rows={4}
          className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
        />
      </label>

      <label className="block text-sm font-semibold">
        Link (opcional)
        <input
          name="link_url"
          defaultValue={partner?.link_url ?? ""}
          placeholder="https://..."
          className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
        />
      </label>

      <label className="block text-sm font-semibold">
        Ordem
        <input
          name="sort_order"
          type="number"
          defaultValue={String(partner?.sort_order ?? 0)}
          className="mt-1 w-40 rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
        />
      </label>

      <button className="rounded-full bg-brand px-6 py-3 font-bold text-white hover:bg-brand-dark w-fit">
        Salvar parceiro
      </button>
    </form>
  );
}
