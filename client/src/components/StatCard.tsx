import { LucideIcon } from 'lucide-react';

export function StatCard({
  label,
  value,
  icon: Icon,
  tint = 'rose',
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tint?: 'rose' | 'lavender' | 'mint' | 'amber' | 'coral';
}) {
  const tints: Record<string, string> = {
    rose: 'bg-blush-100 text-rose-500',
    lavender: 'bg-lavender-100 text-lavender-500',
    mint: 'bg-mint-100 text-mint-500',
    amber: 'bg-amber-100 text-amber-500',
    coral: 'bg-coral-100 text-coral-500',
  };

  return (
    <div className="rounded-3xl border border-blush-100 bg-white p-5 shadow-soft">
      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl ${tints[tint]}`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-extrabold text-ink-700">{value}</p>
      <p className="text-sm font-semibold text-ink-400">{label}</p>
    </div>
  );
}
