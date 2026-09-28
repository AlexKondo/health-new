import { requireUser } from "@/lib/admin";
import { getSocialLinks } from "@/lib/content";
import { saveSocialLinks } from "./actions";

export default async function RedesSociaisPage() {
  await requireUser();
  const social = await getSocialLinks();

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-dark">Contato e redes sociais</h1>
      <p className="mt-2 text-sm text-foreground/60">
        Essas informações aparecem na barra de contato do topo, no rodapé e no botão de WhatsApp do site.
      </p>

      <form action={saveSocialLinks} className="mt-6 grid max-w-xl gap-5 rounded-2xl bg-white p-6 shadow-sm">
        <label className="block text-sm font-semibold">
          Telefone
          <input
            name="phone"
            defaultValue={social.phone}
            placeholder="(11) 5072-4470"
            className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
          />
        </label>

        <label className="block text-sm font-semibold">
          WhatsApp (como aparece escrito no site)
          <input
            name="whatsapp_display"
            defaultValue={social.whatsappDisplay}
            placeholder="(11) 91943-6104"
            className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
          />
        </label>

        <label className="block text-sm font-semibold">
          WhatsApp (número usado no link, só dígitos com DDI+DDD)
          <input
            name="whatsapp_number"
            defaultValue={social.whatsappNumber}
            placeholder="5511919436104"
            className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
          />
          <span className="mt-1 block text-xs font-normal text-foreground/60">
            Sem espaços, parênteses ou traços. Ex.: 55 (Brasil) + 11 (DDD) + número.
          </span>
        </label>

        <label className="block text-sm font-semibold">
          Endereço
          <input
            name="address"
            defaultValue={social.address}
            placeholder="Rua Guapiaçu, 151 - Vila Clementino, São Paulo - SP"
            className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
          />
        </label>

        <hr className="border-brand-soft" />

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
