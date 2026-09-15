"use client";

import Image from "next/image";
import Cropper, { type Area } from "react-easy-crop";
import { useId, useRef, useState } from "react";
import { getCroppedImageBlob } from "@/lib/cropImage";

export default function ImageCropInput({
  name,
  label,
  currentUrl,
}: {
  name: string;
  label: string;
  currentUrl?: string | null;
}) {
  const pickId = useId();
  const submitInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [rawSrc, setRawSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setRawSrc(URL.createObjectURL(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    e.target.value = "";
  }

  async function confirmCrop() {
    if (!rawSrc || !croppedAreaPixels) return;
    setSaving(true);
    try {
      const blob = await getCroppedImageBlob(rawSrc, croppedAreaPixels);
      const file = new File([blob], "foto.jpg", { type: "image/jpeg" });
      const dt = new DataTransfer();
      dt.items.add(file);
      if (submitInputRef.current) submitInputRef.current.files = dt.files;
      setPreview(URL.createObjectURL(blob));
    } finally {
      setSaving(false);
      setRawSrc(null);
    }
  }

  return (
    <div>
      <label className="block text-sm font-semibold mb-1">{label}</label>
      <div className="flex items-center gap-4">
        {preview && (
          <Image
            src={preview}
            alt="Prévia da foto"
            width={64}
            height={64}
            unoptimized={preview.startsWith("blob:")}
            className="h-16 w-16 rounded-full object-cover ring-1 ring-black/10"
          />
        )}
        <label
          htmlFor={pickId}
          className="cursor-pointer rounded-full border-2 border-brand px-4 py-2 text-sm font-bold text-brand transition-colors hover:bg-brand hover:text-white"
        >
          Selecionar imagem
        </label>
      </div>
      <p className="mt-2 text-xs text-foreground/50">
        Foto quadrada (1:1) — você ajusta o enquadramento a seguir.
      </p>
      <input id={pickId} type="file" accept="image/*" className="sr-only" onChange={onPick} />
      <input ref={submitInputRef} type="file" name={name} className="sr-only" />

      {rawSrc && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl">
            <p className="mb-3 font-bold text-brand-dark">Ajuste a foto</p>
            <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-black">
              <Cropper
                image={rawSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
              />
            </div>
            <label className="mt-4 block text-xs font-semibold text-foreground/60">
              Zoom
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="mt-1 w-full"
              />
            </label>
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRawSrc(null)}
                className="rounded-full px-4 py-2 text-sm font-semibold text-foreground/60 hover:bg-brand-soft"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={confirmCrop}
                className="rounded-full bg-brand px-5 py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-60"
              >
                {saving ? "Salvando…" : "Usar essa foto"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
