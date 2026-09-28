import Image from "next/image";

/**
 * Logo com dois detalhes animados via CSS (ver .logo-wave / .logo-bounce em
 * globals.css): o bonequinho laranja acena bem devagar e o "balão" verde
 * pula bem discretamente. As três camadas (base sem esses dois elementos +
 * cada elemento recortado) foram geradas a partir do logo.png original —
 * ver scripts/gerar as posições em porcentagem batem com o recorte feito.
 */
export default function AnimatedLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`relative inline-block ${className}`} style={{ aspectRatio: "1280 / 489" }}>
      <Image src="/images/logo-base.png" alt="Escola Saúde" fill priority className="object-contain" sizes="220px" />
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
    </span>
  );
}
