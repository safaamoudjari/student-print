import { useEffect, useMemo, useState } from 'react';
import { FileStack } from 'lucide-react';
import { api } from '../../lib/api';
import { Order, OrderStatus } from '../../types';
import { OrderCard } from '../../components/OrderCard';
import { EmptyState } from '../../components/EmptyState';
import { Spinner } from '../../components/Spinner';

const FILTERS: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'ready', label: 'Ready' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export function MyOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    api.get('/orders').then((res) => setOrders(res.data.orders));
  }, []);

  const filtered = useMemo(
    () => (orders || []).filter((o) => filter === 'all' || o.status === filter),
    [orders, filter]
  );

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="text-2xl font-semibold">My Orders</h1>

      <div className="mt-5 flex gap-2 overflow-x-auto scrollbar-thin pb-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
              filter === f.key ? 'bg-rose-500 text-white shadow-blush' : 'bg-white text-ink-500 border border-blush-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {!orders && (
          <div className="flex justify-center py-14 text-rose-400">
            <Spinner className="h-7 w-7" />
          </div>
        )}

        {orders && filtered.length === 0 && (
          <EmptyState
            icon={<FileStack size={26} />}
            title="No orders here yet"
            description="Once you create a printing order, it will show up in this list."
            actionLabel="Create Order"
            actionTo="/dashboard/new-order"
          />
        )}

        <div className="flex flex-col gap-3">
          {filtered.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      </div>
    </div>
  );
}
