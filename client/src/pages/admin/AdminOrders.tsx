import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye } from 'lucide-react';
import { api } from '../../lib/api';
import { Order, OrderStatus, User } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { Spinner } from '../../components/Spinner';
import { ClipboardList } from 'lucide-react';

const STATUS_OPTIONS: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All statuses' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'ready', label: 'Ready' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const SORT_OPTIONS = [
  { key: 'newest', label: 'Newest first' },
  { key: 'oldest', label: 'Oldest first' },
  { key: 'highest', label: 'Highest price' },
  { key: 'lowest', label: 'Lowest price' },
];

function studentName(order: Order) {
  const s = order.studentId as User;
  return typeof s === 'object' ? `${s.firstName} ${s.lastName}` : '—';
}
function studentRoom(order: Order) {
  const s = order.studentId as User;
  return typeof s === 'object' ? s.roomNumber : '—';
}

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OrderStatus | 'all'>('all');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    const handle = setTimeout(() => {
      api
        .get('/admin/orders', { params: { search: search || undefined, status, sort } })
        .then((res) => setOrders(res.data.orders));
    }, 300);
    return () => clearTimeout(handle);
  }, [search, status, sort]);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold">Orders</h1>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number, name, phone or room…"
            className="w-full rounded-2xl border border-blush-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-ink-700 outline-none focus:border-rose-400"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus | 'all')}
          className="rounded-2xl border border-blush-200 bg-white px-4 py-3 text-sm font-bold text-ink-600 outline-none focus:border-rose-400"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-2xl border border-blush-200 bg-white px-4 py-3 text-sm font-bold text-ink-600 outline-none focus:border-rose-400"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {!orders && (
          <div className="flex justify-center py-14 text-rose-400">
            <Spinner className="h-8 w-8" />
          </div>
        )}

        {orders && orders.length === 0 && (
          <EmptyState
            icon={<ClipboardList size={26} />}
            title="No orders match your filters"
            description="Try a different search term or clear the status filter."
          />
        )}

        {orders && orders.length > 0 && (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-3xl border border-blush-100 bg-white lg:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-blush-50 text-xs font-extrabold uppercase tracking-wide text-ink-400">
                  <tr>
                    <th className="px-5 py-3">Order</th>
                    <th className="px-5 py-3">Student</th>
                    <th className="px-5 py-3">Room</th>
                    <th className="px-5 py-3">File</th>
                    <th className="px-5 py-3">Pages</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Total</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-blush-50">
                  {orders.map((o) => (
                    <tr key={o._id} className="hover:bg-blush-50/60">
                      <td className="px-5 py-3 font-bold text-ink-700">{o.orderNumber}</td>
                      <td className="px-5 py-3 font-semibold text-ink-600">{studentName(o)}</td>
                      <td className="px-5 py-3 font-semibold text-ink-500">{studentRoom(o)}</td>
                      <td className="px-5 py-3 font-semibold text-ink-500">
                        {o.files && o.files.length > 0
                          ? o.files.length === 1
                            ? o.files[0].originalFileName
                            : `${o.files.length} files`
                          : '—'}
                      </td>
                      <td className="px-5 py-3 font-semibold text-ink-500">
                        {o.files?.reduce((sum, f) => sum + f.pageCount, 0) ?? '—'}
                      </td>
                      <td className="px-5 py-3 font-semibold text-ink-500">
                        {o.colorMode === 'bw' ? 'B&W' : 'Color'}
                      </td>
                      <td className="px-5 py-3 font-bold text-rose-600">{o.totalPrice} DA</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          to={`/admin/orders/${o._id}`}
                          className="inline-flex items-center gap-1 rounded-full bg-blush-100 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-blush-200"
                        >
                          <Eye size={14} /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="flex flex-col gap-3 lg:hidden">
              {orders.map((o) => (
                <Link
                  key={o._id}
                  to={`/admin/orders/${o._id}`}
                  className="rounded-3xl border border-blush-100 bg-white p-4 shadow-soft"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-display text-sm font-semibold text-ink-700">{o.orderNumber}</p>
                    <StatusBadge status={o.status} />
                  </div>
                  <p className="mt-1 text-sm font-bold text-ink-600">{studentName(o)}</p>
                  <p className="text-xs font-semibold text-ink-400">Room {studentRoom(o)}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-ink-400">
                      {o.colorMode === 'bw' ? 'Black & White' : 'Color'} • {o.copies} copies
                    </span>
                    <span className="font-bold text-rose-600">{o.totalPrice} DA</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
