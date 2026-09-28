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
    // Berçário/Educação Infantil/Ensino Fundamental I entram dinamicamente
    // (ver buildNav), a partir dos segmentos publicados no admin.
    children: [{ label: "Curricular", href: "/curricular" }],
  },
  {
    label: "Complementar",
    children: [
      { label: "Período Integral", href: "/periodo-integral" },
      { label: "Extracurricular", href: "/extracurricular" },
    ],
  },
  { label: "Depoimentos", href: "/#depoimentos" },
  // "Podcast" entra dinamicamente (ver buildNav), com o link do YouTube
  // configurado em /admin/redes-sociais.
  { label: "Parceiros", href: "/parceiros" },
];

/**
 * NAV final, montado a partir do que está publicado no admin: os segmentos
 * (Berçário, Educação Infantil, ...) entram no início de "Formação", e
 * "Diferenciais" só aparece quando publicada.
 */
export function buildNav({
  showDiferenciais,
  segments,
  youtubeUrl,
}: {
  showDiferenciais: boolean;
  segments: { slug: string; title: string }[];
  youtubeUrl?: string;
}): NavGroup[] {
  const nav = NAV.map((group) => {
    if (group.label !== "Formação") return group;
    return {
      ...group,
      children: [
        ...segments.map((s) => ({ label: s.title, href: `/${s.slug}` })),
        ...(group.children ?? []),
      ],
    };
  });

  // Ordem final antes de "Parceiros": [Diferenciais?] [Podcast?]
  const extras: NavGroup[] = [];
  if (showDiferenciais) extras.push({ label: "Diferenciais", href: "/diferenciais" });
  if (youtubeUrl) extras.push({ label: "Podcast", href: youtubeUrl });

  const parceirosIdx = nav.findIndex((n) => n.label === "Parceiros");
  nav.splice(parceirosIdx, 0, ...extras);
  return nav;
}

export const CONTACT = {
  phone: "(11) 5072-4470",
  whatsapp: "(11) 91943-6104",
  whatsappNumber: "5511919436104",
  email: "escolasaude@escolasaude.com.br",
  address: "Rua Guapiaçu, 151 - Vila Clementino, São Paulo - SP",
  hours: "Segunda a sexta, das 7h às 19h",
};
