"use client";

import Link from "next/link";

/**
 * Link de navegação do site. Para hrefs com "#" (âncora, ex: /#sobre-nos),
 * usa uma <a> normal em vez do <Link> do Next: o Link tem um bug real onde,
 * ao chegar numa URL com hash via carregamento completo da página e depois
 * clicar de novo no mesmo link de âncora, ele concatena a hash em vez de
 * substituir (vira "#sobre-nos#sobre-nos" e o scroll para de funcionar).
 *
 * Além disso, quando já estamos na mesma página, o navegador pula pro
 * elemento instantaneamente antes de qualquer JS rodar — por isso o clique
 * é interceptado aqui: previne o pulo nativo e faz o scroll suave na mão.
 * Navegação vinda de OUTRA página continua normal (carrega a página e
 * quem cuida do scroll suave nesse caso é o HashScrollSmooth, no mount).
 */
export default function SiteLink({
  href,
  className,
  onClick,
  children,
}: {
  href: string;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  if (href.includes("#")) {
    const [path, hash] = href.split("#");
    const targetPath = path || "/";

    return (
      <a
        href={href}
        className={className}
        onClick={(e) => {
          if (typeof window !== "undefined" && window.location.pathname === targetPath) {
            const el = document.getElementById(hash);
            if (el) {
              e.preventDefault();
              history.pushState(null, "", href);
              const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
              el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
            }
          }
          onClick?.();
        }}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
