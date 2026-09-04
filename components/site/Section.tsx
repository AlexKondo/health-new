export function Section({
  id,
  className = "",
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`mx-auto max-w-7xl px-4 py-14 md:py-20 ${className}`}>
      {children}
    </section>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  center = false,
}: {
  eyebrow?: string;
  title: string;
  center?: boolean;
}) {
  return (
    <div className={`mb-10 ${center ? "text-center" : ""}`}>
      {eyebrow && (
        <p className="text-sm font-bold uppercase tracking-wide text-accent">{eyebrow}</p>
      )}
      <h2 className="mt-1 text-3xl md:text-4xl font-extrabold text-brand-dark">{title}</h2>
    </div>
  );
}
