import { OrderStatus } from '../types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; classes: string; dot: string }> = {
  pending: { label: 'Pending', classes: 'bg-lavender-100 text-lavender-500', dot: 'bg-lavender-400' },
  confirmed: { label: 'Confirmed', classes: 'bg-blush-100 text-rose-600', dot: 'bg-rose-500' },
  processing: { label: 'Processing', classes: 'bg-amber-100 text-amber-500', dot: 'bg-amber-400' },
  ready: { label: 'Ready', classes: 'bg-mint-100 text-mint-500', dot: 'bg-mint-400' },
  completed: { label: 'Completed', classes: 'bg-ink-700/10 text-ink-500', dot: 'bg-ink-400' },
  cancelled: { label: 'Cancelled', classes: 'bg-coral-100 text-coral-500', dot: 'bg-coral-400' },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${cfg.classes}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
