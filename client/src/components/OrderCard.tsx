import { Link } from 'react-router-dom';
import { FileText, ChevronRight } from 'lucide-react';
import { Order } from '../types';
import { StatusBadge } from './StatusBadge';

export function OrderCard({ order }: { order: Order }) {
  const fileLabel =
    order.files && order.files.length > 0
      ? order.files.length === 1
        ? order.files[0].originalFileName
        : `${order.files[0].originalFileName} +${order.files.length - 1} more`
      : 'No files';

  return (
    <Link
      to={`/dashboard/orders/${order._id}`}
      className="flex items-center gap-4 rounded-3xl border border-blush-100 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-blush"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blush-100 text-rose-500">
        <FileText size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="font-display text-sm font-semibold text-ink-700">{order.orderNumber}</p>
          <StatusBadge status={order.status} />
        </div>
        <p className="truncate text-sm font-semibold text-ink-400">{fileLabel}</p>
        <p className="mt-0.5 text-sm font-bold text-rose-600">{order.totalPrice} DA</p>
      </div>
      <ChevronRight size={18} className="shrink-0 text-ink-400" />
    </Link>
  );
}
