import Image from "next/image";

/**
 * Logo com quatro detalhes animados via CSS (ver .logo-* em globals.css):
 * o bonequinho laranja acena, o "balão" verde pula, o telhado da casinha
 * cai de cima pra baixo e o quadradinho da casinha balança — tudo sutil e
 * a maior parte do tempo em repouso. As camadas (base sem esses quatro
 * elementos + cada elemento recortado) foram geradas a partir do
 * logo.png original; as posições abaixo são em % do canvas original
 * (1280×489), então escalam junto com o tamanho renderizado do logo.
 */
export default function AnimatedLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`relative inline-block ${className}`} style={{ aspectRatio: "1280 / 489" }}>
      <Image src="/images/logo-base2.png" alt="Escola Saúde" fill priority className="object-contain" sizes="220px" />
      <span
        className="logo-bounce absolute"
        style={{ left: "43.67%", top: "0%", width: "13.59%", height: "35.58%" }}
      >
        <Image src="/images/logo-ball-green.png" alt="" fill aria-hidden className="object-contain" sizes="40px" />
      </span>
      <span
        className="logo-wave absolute"
        style={{ left: "61.17%", top: "23.52%", width: "9.53%", height: "40.29%" }}
      >
        <Image src="/images/logo-figure-orange.png" alt="" fill aria-hidden className="object-contain" sizes="30px" />
      </span>
      <span
        className="logo-roof-drop absolute"
        style={{ left: "85.0%", top: "7.36%", width: "15.0%", height: "22.7%" }}
      >
        <Image src="/images/logo-roof-orange.png" alt="" fill aria-hidden className="object-contain" sizes="30px" />
      </span>
      <span
        className="logo-square-sway absolute"
        style={{ left: "87.58%", top: "32.11%", width: "10.08%", height: "25.77%" }}
      >
        <Image src="/images/logo-square-blue.png" alt="" fill aria-hidden className="object-contain" sizes="20px" />
      </span>
    </span>
  );
}
