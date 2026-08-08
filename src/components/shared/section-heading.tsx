interface SectionHeadingProps {
  title: string;
  description?: string;
}

export function SectionHeading({ title, description }: SectionHeadingProps) {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-[-0.035em] text-[var(--silver-100)] sm:text-[2rem]">{title}</h1>
      {description ? <p className="max-w-2xl text-sm/6 text-[rgb(244_247_250_/_0.68)] sm:text-[15px]/6">{description}</p> : null}
    </header>
  );
}
