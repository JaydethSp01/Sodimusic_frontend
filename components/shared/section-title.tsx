interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  id?: string;
}

export function SectionTitle({ eyebrow, title, subtitle, id }: SectionTitleProps) {
  return (
    <div className="mb-10 max-w-3xl">
      {eyebrow ? (
        <p className="font-mono text-xs uppercase tracking-widest text-primary">{eyebrow}</p>
      ) : null}
      <h2 id={id} className="mt-2 font-display text-3xl tracking-wide text-foreground md:text-5xl">
        {title}
      </h2>
      {subtitle ? <p className="mt-3 text-[var(--text-secondary)]">{subtitle}</p> : null}
    </div>
  );
}
