/** Estrutura de navegação (espelha a IA do site atual). */
export type NavItem = { label: string; href: string };
export type NavGroup = { label: string; href?: string; children?: NavItem[] };

export const NAV: NavGroup[] = [
  { label: "Início", href: "/" },
  {
    label: "Institucional",
    children: [
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
  { label: "Depoimentos", href: "/depoimentos" },
  { label: "Diferenciais", href: "/diferenciais" },
  {
    label: "Mídias",
    children: [
      { label: "Galeria de Fotos", href: "/galeria-de-fotos" },
      { label: "Podcast", href: "/podcast" },
    ],
  },
  { label: "Parceiros", href: "/parceiros" },
];

export const CONTACT = {
  phone: "(11) 5072-4470",
  whatsapp: "(11) 91943-6104",
  whatsappNumber: "5511919436104",
  email: "escolasaude@escolasaude.com.br",
  address: "Rua Guapiaçu, 151 - Vila Clementino, São Paulo - SP",
  hours: "Segunda a sexta, das 7h às 19h",
};
