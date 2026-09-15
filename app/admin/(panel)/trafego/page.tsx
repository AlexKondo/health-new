import { requireUser } from "@/lib/admin";
import { saveTrafficSettings } from "./actions";

export default async function TrafegoPage() {
  const { sb } = await requireUser();
  const { data } = await sb.from("site_settings").select("key,value").in("key", ["meta_pixel_id", "google_tag_id"]);
  const values: Record<string, string> = {};
  for (const row of data ?? []) values[row.key] = row.value ?? "";

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-dark">Tráfego pago</h1>
      <p className="mt-2 text-sm text-foreground/60">
        Cole aqui os IDs do Pixel da Meta e da tag do Google (Google Ads/Analytics). Deixe em
        branco para não carregar o script correspondente no site.
      </p>

      <form action={saveTrafficSettings} className="mt-6 grid max-w-xl gap-5 rounded-2xl bg-white p-6 shadow-sm">
        <label className="block text-sm font-semibold">
          Meta Pixel ID
          <input
            name="meta_pixel_id"
            defaultValue={values.meta_pixel_id}
            placeholder="Ex.: 1234567890123456"
            className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
          />
          <span className="mt-1 block text-xs text-foreground/50">
            Meta Events Manager → Fontes de dados → seu Pixel → ID.
          </span>
        </label>

        <label className="block text-sm font-semibold">
          Google Tag ID (Google Ads ou GA4)
          <input
            name="google_tag_id"
            defaultValue={values.google_tag_id}
            placeholder="Ex.: G-XXXXXXX ou AW-XXXXXXXXX"
            className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
          />
          <span className="mt-1 block text-xs text-foreground/50">
            Começa com &quot;G-&quot; (Google Analytics) ou &quot;AW-&quot; (Google Ads).
          </span>
        </label>

        <button className="rounded-full bg-brand px-6 py-3 font-bold text-white hover:bg-brand-dark w-fit">
          Salvar
        </button>
      </form>
    </div>
  );
}
