/** Estrutura de navegação (espelha a IA do site atual). */
export type NavItem = { label: string; href: string };
export type NavGroup = { label: string; href?: string; children?: NavItem[] };

export const NAV: NavGroup[] = [
  { label: "Início", href: "/" },
  {
    label: "Institucional",
    children: [
      { label: "Sobre nós", href: "/#sobre-nos" },
      { label: "Missão, Visão e Valores", href: "/missao-visao-e-valores" },
      { label: "Nossa História", href: "/nossa-historia" },
      { label: "Responsabilidade Social", href: "/responsabilidade-social" },
      { label: "Infraestrutura", href: "/infraestrutura" },
    ],
  },
  {
    label: "Formação",
    children: [
      { label: "Berçário", href: "/bercario" },
      { label: "Educação Infantil", href: "/ensino-infantil" },
      { label: "Ensino Fundamental I", href: "/ensino-fundamental" },
      { label: "Curricular", href: "/curricular" },
    ],
  },
  {
    label: "Complementar",
    children: [
      { label: "Período Integral", href: "/periodo-integral" },
      { label: "Extracurricular", href: "/extracurricular" },
    ],
  },
  { label: "Depoimentos", href: "/#depoimentos" },
  {
    label: "Mídias",
    children: [
      { label: "Galeria de Fotos", href: "/galeria-de-fotos" },
      { label: "Podcast", href: "/podcast" },
    ],
  },
  { label: "Parceiros", href: "/parceiros" },
];

/** NAV + "Diferenciais", só quando a página estiver publicada no admin. */
export function navWithDiferenciais(showDiferenciais: boolean): NavGroup[] {
  if (!showDiferenciais) return NAV;
  const idx = NAV.findIndex((n) => n.label === "Mídias");
  const withItem = [...NAV];
  withItem.splice(idx, 0, { label: "Diferenciais", href: "/diferenciais" });
  return withItem;
}

export const CONTACT = {
  phone: "(11) 5072-4470",
  whatsapp: "(11) 91943-6104",
  whatsappNumber: "5511919436104",
  email: "escolasaude@escolasaude.com.br",
  address: "Rua Guapiaçu, 151 - Vila Clementino, São Paulo - SP",
  hours: "Segunda a sexta, das 7h às 19h",
};
