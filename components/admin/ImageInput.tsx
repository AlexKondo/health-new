"use client";

import { useId, useState } from "react";

export default function ImageInput({
  name,
  label,
  hint,
  onFileChange,
}: {
  name: string;
  label: string;
  hint?: string;
  onFileChange?: (file: File) => void;
}) {
  const id = useId();
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div>
      <label className="block text-sm font-semibold mb-1">{label}</label>
      <div className="flex items-center gap-3">
        <label
          htmlFor={id}
          className="cursor-pointer rounded-full border-2 border-brand px-4 py-2 text-sm font-bold text-brand transition-colors hover:bg-brand hover:text-white"
        >
          Selecionar imagem
        </label>
        <span className="truncate text-sm text-foreground/60">
          {fileName ?? "Nenhum arquivo selecionado"}
        </span>
      </div>
      <input
        id={id}
        name={name}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            setFileName(f.name);
            onFileChange?.(f);
          }
        }}
      />
      {hint && <p className="text-xs text-foreground/50 mt-1">{hint}</p>}
    </div>
  );
}
