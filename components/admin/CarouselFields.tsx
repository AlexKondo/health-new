export default function CarouselFields({
  showCarousel,
  intervalSeconds,
}: {
  showCarousel?: boolean;
  intervalSeconds?: number;
}) {
  return (
    <fieldset className="grid gap-3 rounded-2xl border border-brand-soft p-4">
      <legend className="px-1 text-sm font-bold text-brand-dark">Carrossel de fotos</legend>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" name="show_carousel" defaultChecked={showCarousel ?? true} className="h-4 w-4" />
        Mostrar carrossel nesta página (só aparece se houver fotos)
      </label>
      <label className="block text-sm font-semibold">
        Troca de foto a cada (segundos)
        <input
          type="number"
          name="carousel_interval_seconds"
          min={1}
          max={30}
          defaultValue={intervalSeconds ?? 3}
          className="mt-1 w-32 rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
        />
      </label>
    </fieldset>
  );
}
