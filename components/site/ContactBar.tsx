type Contact = {
  phone: string;
  whatsappDisplay: string;
  whatsappNumber: string;
  address: string;
  instagram: string;
  facebook: string;
  youtube: string;
};

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-current" aria-hidden>
    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1L6.6 10.8Z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 32 32" className="h-4 w-4 shrink-0 fill-current" aria-hidden>
    <path d="M16 .4C7.4.4.5 7.3.5 15.9c0 2.8.7 5.5 2.1 7.9L.3 31.7l8.1-2.1c2.3 1.2 4.9 1.9 7.6 1.9 8.6 0 15.5-6.9 15.5-15.5S24.6.4 16 .4zm0 28.2c-2.4 0-4.7-.6-6.7-1.8l-.5-.3-4.8 1.3 1.3-4.7-.3-.5a12.7 12.7 0 01-1.9-6.7C2.4 8.6 8.5 2.5 16 2.5S29.6 8.6 29.6 16 23.5 28.6 16 28.6zm7.2-9.4c-.4-.2-2.3-1.1-2.7-1.3-.4-.1-.6-.2-.9.2-.3.4-1 1.3-1.2 1.5-.2.2-.4.3-.8.1-.4-.2-1.6-.6-3.1-1.9-1.1-1-1.9-2.3-2.1-2.7-.2-.4 0-.6.2-.8.2-.2.4-.4.6-.7.2-.2.3-.4.4-.7.1-.3 0-.5 0-.7-.1-.2-.9-2.2-1.3-3-.3-.8-.6-.7-.9-.7h-.7c-.2 0-.6.1-1 .5-.3.4-1.3 1.3-1.3 3.1s1.3 3.6 1.5 3.9c.2.3 2.6 3.9 6.2 5.5.9.4 1.5.6 2.1.8.9.3 1.7.2 2.3.1.7-.1 2.3-.9 2.6-1.8.3-.9.3-1.6.2-1.8-.1-.1-.3-.2-.7-.4z" />
  </svg>
);

const PinIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-current" aria-hidden>
    <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
  </svg>
);

const SOCIAL_ICONS: { key: "facebook" | "instagram" | "youtube"; label: string; path: string }[] = [
  {
    key: "facebook",
    label: "Facebook",
    path: "M13.5 21v-7.5h2.5l.4-3h-2.9V8.4c0-.87.24-1.46 1.5-1.46h1.6V4.3C16.3 4.24 15.4 4.15 14.3 4.15c-2.3 0-3.8 1.4-3.8 3.96V10.5H8v3h2.5V21Z",
  },
  {
    key: "instagram",
    label: "Instagram",
    path: "M16 3H8a5 5 0 0 0-5 5v8a5 5 0 0 0 5 5h8a5 5 0 0 0 5-5V8a5 5 0 0 0-5-5Zm3 13a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v8ZM12 7.3A4.7 4.7 0 1 0 16.7 12 4.7 4.7 0 0 0 12 7.3Zm0 7.7A3 3 0 1 1 15 12a3 3 0 0 1-3 3Zm4.9-8.6a1.1 1.1 0 1 0 1.1 1.1 1.1 1.1 0 0 0-1.1-1.1Z",
  },
  {
    key: "youtube",
    label: "YouTube",
    path: "M21.6 7.6a2.7 2.7 0 0 0-1.9-1.9C18 5.2 12 5.2 12 5.2s-6 0-7.7.5A2.7 2.7 0 0 0 2.4 7.6 28 28 0 0 0 2 12a28 28 0 0 0 .4 4.4 2.7 2.7 0 0 0 1.9 1.9c1.7.5 7.7.5 7.7.5s6 0 7.7-.5a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22 12a28 28 0 0 0-.4-4.4ZM10 15V9l5.2 3Z",
  },
];

function Info({ contact, className = "" }: { contact: Contact; className?: string }) {
  return (
    <div className={`flex items-center gap-6 whitespace-nowrap px-3 text-sm font-semibold ${className}`}>
      {contact.phone && (
        <a href={`tel:${contact.phone.replace(/\D/g, "")}`} className="flex items-center gap-2 hover:opacity-80">
          <PhoneIcon />
          {contact.phone}
        </a>
      )}
      {contact.whatsappNumber && (
        <a
          href={`https://wa.me/${contact.whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:opacity-80"
        >
          <WhatsAppIcon />
          {contact.whatsappDisplay || contact.whatsappNumber}
        </a>
      )}
      {contact.address && (
        <span className="flex items-center gap-2">
          <PinIcon />
          {contact.address}
        </span>
      )}
    </div>
  );
}

export default function ContactBar({ contact }: { contact: Contact }) {
  const socials = SOCIAL_ICONS.filter((s) => contact[s.key]);

  return (
    <div className="bg-[#7fab97] text-white">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2">
        {/* Mobile: linha estática, sem animação (pode rolar com o dedo se não couber) */}
        <div className="min-w-0 flex-1 overflow-x-auto md:hidden [&::-webkit-scrollbar]:hidden">
          <Info contact={contact} />
        </div>

        {/* Desktop: conteúdo repetido rolando pro lado continuamente. Usa 4
            cópias (não 2) pra garantir que sempre tem conteúdo cobrindo a
            largura toda mesmo em telas grandes — com só 2, sobrava um vão
            vazio antes de repetir e parecia "pular" em vez de rolar direto.
            Cada cópia tem uma margem bem maior à direita, pra ficar óbvio
            que é uma repetição e não um texto cortado/duplicado colado. */}
        <div className="hidden min-w-0 flex-1 overflow-hidden md:block [mask-image:linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)]">
          <div className="flex w-max animate-marquee">
            <Info contact={contact} className="mr-16" />
            <Info contact={contact} className="mr-16" />
            <Info contact={contact} className="mr-16" />
            <Info contact={contact} className="mr-16" />
          </div>
        </div>

        {socials.length > 0 && (
          <div className="flex shrink-0 items-center gap-3">
            {socials.map((s) => (
              <a
                key={s.key}
                href={contact[s.key]}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="grid h-7 w-7 place-items-center rounded-md bg-white/15 hover:bg-white/25"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
