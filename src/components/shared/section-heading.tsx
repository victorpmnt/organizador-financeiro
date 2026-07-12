interface SectionHeadingProps {
  title: string;
  description?: string;
}

export function SectionHeading({ title, description }: SectionHeadingProps) {
  return (
    <header className="flex flex-col gap-1">
      <h2 className="text-lg font-semibold text-zinc-950">{title}</h2>
      {description ? <p className="text-sm text-zinc-600">{description}</p> : null}
    </header>
  );
}
