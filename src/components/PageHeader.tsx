interface Props {
  label?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function PageHeader({ label, title, subtitle, children }: Props) {
  return (
    <section className="bg-brand-black text-white py-12 md:py-16 relative overflow-hidden">
      {/* Yellow accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-brand-yellow" />
      {/* Subtle yellow glow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-yellow/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {label && (
          <p className="text-xs font-extrabold uppercase tracking-widest text-brand-yellow mb-2">{label}</p>
        )}
        <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-gray-400 mt-3 text-lg max-w-2xl leading-relaxed">{subtitle}</p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
