import Link from "next/link";

/**
 * Link de navegação do site. Para hrefs com "#" (âncora, ex: /#sobre-nos),
 * usa uma <a> normal em vez do <Link> do Next: o Link tem um bug real onde,
 * ao chegar numa URL com hash via carregamento completo da página e depois
 * clicar de novo no mesmo link de âncora, ele concatena a hash em vez de
 * substituir (vira "#sobre-nos#sobre-nos" e o scroll para de funcionar).
 * Uma <a> segue a resolução de URL padrão do navegador, que não tem esse
 * problema.
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
    return (
      <a href={href} className={className} onClick={onClick}>
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
