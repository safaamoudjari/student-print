import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionTo,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-4xl border border-dashed border-blush-200 bg-white/60 px-6 py-14 text-center">
      <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-blush-100 text-rose-400">
        {icon}
      </span>
      <h3 className="font-display text-lg font-semibold text-ink-700">{title}</h3>
      <p className="mt-1 max-w-sm text-sm font-semibold text-ink-400">{description}</p>
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-rose-500 px-6 py-3 text-sm font-bold text-white shadow-blush transition hover:-translate-y-0.5 hover:bg-rose-600"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
