import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, ListChecks, UserCircle2, FileStack } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types';
import { OrderCard } from '../../components/OrderCard';
import { EmptyState } from '../../components/EmptyState';
import { Spinner } from '../../components/Spinner';

const QUICK_ACTIONS = [
  { to: '/dashboard/new-order', label: 'New Printing Order', icon: PlusCircle, tint: 'bg-rose-500 text-white' },
  { to: '/dashboard/orders', label: 'My Orders', icon: ListChecks, tint: 'bg-lavender-100 text-lavender-500' },
  { to: '/dashboard/profile', label: 'Profile', icon: UserCircle2, tint: 'bg-mint-100 text-mint-500' },
];

export function Dashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    api.get('/orders').then((res) => setOrders(res.data.orders));
  }, []);

  const activeOrders = orders?.filter((o) => !['completed', 'cancelled'].includes(o.status)) || [];

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="text-2xl font-semibold sm:text-3xl">Welcome, {user?.firstName} </h1>
      <p className="mt-1 text-sm font-semibold text-ink-400">Here's what's happening with your prints.</p>

      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.label}
            to={action.to}
            className="flex items-center gap-3 rounded-3xl border border-blush-100 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-blush"
          >
            <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${action.tint}`}>
              <action.icon size={20} />
            </span>
            <span className="font-display text-sm font-semibold text-ink-700">{action.label}</span>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-700">Current orders</h2>
          <Link to="/dashboard/orders" className="text-sm font-bold text-rose-500">
            View all
          </Link>
        </div>

        {!orders && (
          <div className="flex justify-center py-10 text-rose-400">
            <Spinner className="h-7 w-7" />
          </div>
        )}

        {orders && activeOrders.length === 0 && (
          <EmptyState
            icon={<FileStack size={26} />}
            title="You don't have any printing orders yet"
            description="Start your first order now — it only takes a minute."
            actionLabel="Create Order"
            actionTo="/dashboard/new-order"
          />
        )}

        {activeOrders.length > 0 && (
          <div className="flex flex-col gap-3">
            {activeOrders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
