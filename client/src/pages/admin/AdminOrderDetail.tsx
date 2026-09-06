import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  Download,
  Phone,
  DoorOpen,
  Mail,
} from 'lucide-react';
import { api, getErrorMessage } from '../../lib/api';
import { Order, OrderFileSummary, OrderStatus, User } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { OrderTimeline } from '../../components/OrderTimeline';
import { Spinner } from '../../components/Spinner';

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const NEXT_STATUS: Partial<Record<OrderStatus, { status: OrderStatus; label: string; tone: string }[]>> = {
  pending: [
    { status: 'confirmed', label: 'Confirm order', tone: 'bg-rose-500 hover:bg-rose-600' },
    { status: 'cancelled', label: 'Cancel order', tone: 'bg-coral-500 hover:bg-coral-600' },
  ],
  confirmed: [
    { status: 'processing', label: 'Start printing', tone: 'bg-amber-500 hover:bg-amber-600' },
    { status: 'cancelled', label: 'Cancel order', tone: 'bg-coral-500 hover:bg-coral-600' },
  ],
  processing: [
    { status: 'ready', label: 'Mark as ready', tone: 'bg-mint-500 hover:bg-mint-600' },
    { status: 'cancelled', label: 'Cancel order', tone: 'bg-coral-500 hover:bg-coral-600' },
  ],
  ready: [{ status: 'completed', label: 'Mark as collected', tone: 'bg-ink-600 hover:bg-ink-700' }],
};

export function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [files, setFiles] = useState<OrderFileSummary[]>([]);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  const load = () => {
    api
      .get(`/admin/orders/${id}`)
      .then((res) => {
        setOrder(res.data.order);
        setFiles(res.data.files);
      })
      .catch((err) => setError(getErrorMessage(err)));
  };

  useEffect(load, [id]);

  const changeStatus = async (status: OrderStatus) => {
    setUpdating(true);
    setError('');
    try {
      await api.patch(`/admin/orders/${id}/status`, { status });
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  };

  if (!order) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-rose-400">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const student = order.studentId as User;

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        to="/admin/orders"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-bold text-ink-500 hover:text-rose-500"
      >
        <ArrowLeft size={16} /> Back to orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{order.orderNumber}</h1>
          <p className="text-sm font-semibold text-ink-400">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-coral-100 px-3 py-2 text-sm font-bold text-coral-500">
          {error}
        </p>
      )}

      {NEXT_STATUS[order.status] && (
        <div className="mt-5 flex flex-wrap gap-2">
          {NEXT_STATUS[order.status]!.map((action) => (
            <button
              key={action.status}
              disabled={updating}
              onClick={() => changeStatus(action.status)}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-soft transition disabled:opacity-60 ${action.tone}`}
            >
              {updating && <Spinner className="h-4 w-4" />}
              {action.label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="rounded-3xl border border-blush-100 bg-white p-5">
          <h3 className="mb-3 font-display text-base font-semibold text-ink-700">Student</h3>
          {typeof student === 'object' ? (
            <div className="flex flex-col gap-2 text-sm font-semibold text-ink-600">
              <p className="font-display text-base font-semibold text-ink-700">
                {student.firstName} {student.lastName}
              </p>
              <p className="flex items-center gap-2 text-ink-500">
                <Mail size={14} /> {student.email}
              </p>
              <p className="flex items-center gap-2 text-ink-500">
                <Phone size={14} /> {student.phone}
              </p>
              <p className="flex items-center gap-2 text-ink-500">
                <DoorOpen size={14} /> Room {student.roomNumber}
                {student.residence ? `, ${student.residence}` : ''}
              </p>
            </div>
          ) : (
            <p className="text-sm font-semibold text-ink-400">Student information unavailable.</p>
          )}
        </div>

        <div className="rounded-3xl border border-blush-100 bg-white p-5">
          <h3 className="mb-3 font-display text-base font-semibold text-ink-700">Printing settings</h3>
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="font-semibold text-ink-400">Color</dt>
              <dd className="font-bold text-ink-700">{order.colorMode === 'bw' ? 'Black & White' : 'Color'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-semibold text-ink-400">Sides</dt>
              <dd className="font-bold text-ink-700">{order.sides === 'single' ? 'Single-sided' : 'Double-sided'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-semibold text-ink-400">Copies</dt>
              <dd className="font-bold text-ink-700">{order.copies}</dd>
            </div>
            {order.additionalServices.map((s) => (
              <div key={s.name} className="flex justify-between">
                <dt className="font-semibold text-ink-400">{s.name}</dt>
                <dd className="font-bold text-ink-700">
                  x{s.quantity} — {s.price * s.quantity} DA
                </dd>
              </div>
            ))}
            <div className="mt-1 flex justify-between border-t border-dashed border-blush-200 pt-3 font-display text-base font-semibold text-rose-600">
              <dt>Total</dt>
              <dd>{order.totalPrice} DA</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-5 rounded-3xl border border-blush-100 bg-white p-5">
        <h3 className="mb-3 font-display text-base font-semibold text-ink-700">Files</h3>
        <ul className="flex flex-col gap-2">
          {files.map((f) => {
            const Icon = f.mimeType?.startsWith('image/') ? ImageIcon : FileText;
            return (
              <li
                key={f._id}
                className="flex items-center gap-3 rounded-2xl border border-blush-100 bg-cream px-4 py-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lavender-100 text-lavender-500">
                  <Icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink-700">{f.originalFileName}</p>
                  <p className="text-xs font-semibold text-ink-400">
                    {formatSize(f.fileSize)} • {f.pageCount} page{f.pageCount === 1 ? '' : 's'}
                    {f.pageCountStatus !== 'exact' ? ' (estimated)' : ''}
                  </p>
                </div>
                <a
                  href={`/api/files/${f._id}/download`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-blush-100 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-blush-200"
                >
                  <Download size={14} /> Download
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-5 rounded-3xl border border-blush-100 bg-white p-5">
        <h3 className="mb-3 font-display text-base font-semibold text-ink-700">Order timeline</h3>
        <OrderTimeline status={order.status} />
      </div>
    </div>
  );
}
