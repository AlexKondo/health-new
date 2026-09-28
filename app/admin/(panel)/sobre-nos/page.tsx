import Image from "next/image";
import { requireUser } from "@/lib/admin";
import { saveAbout } from "./actions";

const DEFAULTS = {
  about_title: "Um pouco sobre nós!",
  about_text:
    "O que é uma escola para você? Um lugar bonito e cheio de pessoas? Lugar de conhecimento e materiais de ponta e tecnológicos? Laboratórios, quadras, provas e atividades diversificadas? Educadores mestres e doutores? O que define uma escola? Boa pergunta, não é mesmo?\nPara nós, da Escola Saúde, a escola também é muito mais que tudo isso!\nEscola é recepcionar com um sorriso, acolher com um abraço, ouvir histórias mirabolantes e cheias de imaginação com interesse genuíno, é colocar no colo na hora da dor, é gargalhar junto, é correr até não poder mais, é comer comida gostosa, é comemorar cada passo dado, é instigar a curiosidade e ser curioso, é fazer perguntas, é sair fumacinha da cabeça buscando diferentes caminhos e soluções, é dialogar, é se desafiar e ainda no final do dia, é receber um até amanhã gostoso com vontade de ficar mais!",
  about_cta_text: "Venha nos conhecer, será um prazer recebê-lo aqui!",
  about_cta_href: "#agendar",
  about_image_url: "",
};

export default async function SobreNosAdmin() {
  const { sb } = await requireUser();
  const keys = Object.keys(DEFAULTS);
  const { data } = await sb.from("site_settings").select("key, value").in("key", keys);
  const values = { ...DEFAULTS };
  (data ?? []).forEach((row) => {
    if (row.value) (values as Record<string, string>)[row.key] = row.value;
  });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold text-brand-dark">Sobre nós (home)</h1>
      <p className="mt-2 text-sm text-foreground/60">
        Bloco exibido na página inicial, logo abaixo dos números da escola. Alterações aparecem no site assim que
        você salvar.
      </p>

      <form action={saveAbout} className="mt-6 grid gap-4 rounded-2xl bg-white p-6 shadow-sm" encType="multipart/form-data">
        <label className="block text-sm font-semibold">
          Título
          <input
            name="title"
            defaultValue={values.about_title}
            required
            className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
          />
        </label>
        <label className="block text-sm font-semibold">
          Texto
          <textarea
            name="text"
            defaultValue={values.about_text}
            required
            rows={10}
            className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
          />
        </label>
        <label className="block text-sm font-semibold">
          Texto do botão
          <input
            name="cta_text"
            defaultValue={values.about_cta_text}
            className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
          />
        </label>
        <label className="block text-sm font-semibold">
          Link do botão
          <input
            name="cta_href"
            defaultValue={values.about_cta_href}
            placeholder="#agendar"
            className="mt-1 w-full rounded-xl border border-brand-soft px-3 py-2 font-normal outline-none focus:border-brand"
          />
        </label>

        <label className="block text-sm font-semibold">
          Imagem
          {values.about_image_url && (
            <div className="relative mt-2 h-40 w-full overflow-hidden rounded-xl bg-brand-soft">
              <Image src={values.about_image_url} alt="Sobre nós" fill className="object-cover" />
            </div>
          )}
          <input
            name="image"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="mt-2 block w-full text-sm"
          />
          <span className="mt-1 block text-xs font-normal text-foreground/60">
            Deixe em branco pra manter a imagem atual.
          </span>
        </label>

        <button type="submit" className="mt-2 rounded-full bg-brand px-5 py-2.5 font-bold text-white hover:bg-brand-dark">
          Salvar
        </button>
      </form>
    </div>
  );
}
