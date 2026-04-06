interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  accent?: boolean;
}

export function SectionHeading({ title, subtitle, accent = false }: SectionHeadingProps) {
  return (
    <div>
      <h2 className="flex items-center gap-3 font-display text-xl font-black tracking-tight text-white sm:text-2xl">
        {accent && (
          <span className="h-5 w-1 rounded-full bg-[#FDB913]" />
        )}
        <span className={accent ? "text-gradient-yellow" : ""}>{title}</span>
      </h2>
      {subtitle && <p className="mt-1 text-sm text-white/40">{subtitle}</p>}
    </div>
  );
}
