import { Check } from 'lucide-react';
import { OrderStatus } from '../types';

const STEPS: { key: OrderStatus; label: string }[] = [
  { key: 'pending', label: 'Order submitted' },
  { key: 'confirmed', label: 'Order confirmed' },
  { key: 'processing', label: 'Printing' },
  { key: 'ready', label: 'Ready' },
  { key: 'completed', label: 'Completed' },
];

export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') {
    return (
      <div className="rounded-2xl bg-coral-100 px-4 py-3 text-sm font-bold text-coral-500">
        This order was cancelled.
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <ol className="flex flex-col gap-4">
      {STEPS.map((step, i) => {
        const done = i <= currentIndex;
        const active = i === currentIndex;
        return (
          <li key={step.key} className="flex items-center gap-3">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                done
                  ? 'border-rose-500 bg-rose-500 text-white'
                  : 'border-blush-200 bg-white text-ink-400'
              } ${active ? 'ring-4 ring-blush-100' : ''}`}
            >
              {done ? <Check size={14} /> : i + 1}
            </span>
            <span className={`text-sm font-bold ${done ? 'text-ink-700' : 'text-ink-400'}`}>
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
