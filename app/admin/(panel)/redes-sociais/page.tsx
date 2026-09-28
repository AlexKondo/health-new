import { requireUser } from "@/lib/admin";
import { getSocialLinks } from "@/lib/content";
import { saveSocialLinks } from "./actions";

export default async function RedesSociaisPage() {
  await requireUser();
  const social = await getSocialLinks();

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-dark">Redes sociais</h1>
      <p className="mt-2 text-sm text-foreground/60">
        Esses links aparecem como ícones no rodapé do site. O link do Podcast, no menu, também usa o do YouTube
        abaixo. Deixe em branco pra não mostrar o ícone daquela rede.
      </p>

      <form action={saveSocialLinks} className="mt-6 grid max-w-xl gap-5 rounded-2xl bg-white p-6 shadow-sm">
        <label className="block text-sm font-semibold">
          Instagram
          <input
            name="instagram"
            type="url"
            defaultValue={social.instagram}
            placeholder="https://instagram.com/escolasaude"
            className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
          />
        </label>

        <label className="block text-sm font-semibold">
          Facebook
          <input
            name="facebook"
            type="url"
            defaultValue={social.facebook}
            placeholder="https://facebook.com/escolasaude"
            className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
          />
        </label>

        <label className="block text-sm font-semibold">
          YouTube
          <input
            name="youtube"
            type="url"
            defaultValue={social.youtube}
            placeholder="https://youtube.com/@escolasaude"
            className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
          />
        </label>

        <button className="rounded-full bg-brand px-6 py-3 font-bold text-white hover:bg-brand-dark w-fit">
          Salvar
        </button>
      </form>
    </div>
  );
}
