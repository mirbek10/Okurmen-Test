export function AdminPageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="flex flex-col gap-5 rounded-[24px] border border-slate-200 bg-white p-6 md:flex-row md:items-center md:justify-between md:p-8">
      <div>
        {eyebrow && <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">{eyebrow}</p>}
        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">{title}</h1>
        {description && <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}

export function AdminMetric({ label, value, detail }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <strong className="mt-3 block font-mono text-3xl font-bold text-slate-950">{value}</strong>
      {detail && <p className="mt-1 text-xs text-slate-500">{detail}</p>}
    </div>
  );
}

export function AdminEmptyState({ title, description }) {
  return <div className="px-6 py-12 text-center"><strong className="text-slate-900">{title}</strong>{description && <p className="mt-1 text-sm text-slate-500">{description}</p>}</div>;
}
