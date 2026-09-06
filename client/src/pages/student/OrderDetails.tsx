import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Image as ImageIcon, Download, XCircle } from 'lucide-react';
import { api, getErrorMessage } from '../../lib/api';
import { Order, OrderFileSummary } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { OrderTimeline } from '../../components/OrderTimeline';
import { Spinner } from '../../components/Spinner';

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [files, setFiles] = useState<OrderFileSummary[]>([]);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const load = () => {
    api
      .get(`/orders/${id}`)
      .then((res) => {
        setOrder(res.data.order);
        setFiles(res.data.files);
      })
      .catch((err) => setError(getErrorMessage(err)));
  };

  useEffect(load, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order? This cannot be undone.')) return;
    setCancelling(true);
    setCancelError('');
    try {
      await api.post(`/orders/${id}/cancel`);
      load();
    } catch (err) {
      setCancelError(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-14 text-center">
        <p className="font-bold text-coral-500">{error}</p>
        <Link to="/dashboard/orders" className="mt-4 inline-block text-sm font-bold text-rose-500">
          Back to my orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-rose-400">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const canCancel = ['pending', 'confirmed'].includes(order.status);

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <button
        onClick={() => navigate('/dashboard/orders')}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-bold text-ink-500 hover:text-rose-500"
      >
        <ArrowLeft size={16} /> Back to my orders
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{order.orderNumber}</h1>
          <p className="text-sm font-semibold text-ink-400">{formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="rounded-3xl border border-blush-100 bg-white p-5">
          <h3 className="mb-3 font-display text-base font-semibold text-ink-700">Order status</h3>
          <OrderTimeline status={order.status} />
        </div>

        <div className="rounded-3xl border border-blush-100 bg-white p-5">
          <h3 className="mb-3 font-display text-base font-semibold text-ink-700">Details</h3>
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="font-semibold text-ink-400">Printing</dt>
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
                  className="rounded-full p-2 text-ink-400 hover:bg-blush-100 hover:text-rose-500"
                  aria-label={`Download ${f.originalFileName}`}
                >
                  <Download size={16} />
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      {order.notes && (
        <div className="mt-5 rounded-3xl border border-blush-100 bg-white p-5">
          <h3 className="mb-2 font-display text-base font-semibold text-ink-700">Notes</h3>
          <p className="text-sm font-semibold text-ink-500">{order.notes}</p>
        </div>
      )}

      {cancelError && (
        <p role="alert" className="mt-5 rounded-xl bg-coral-100 px-3 py-2 text-sm font-bold text-coral-500">
          {cancelError}
        </p>
      )}

      {canCancel && (
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-coral-400 px-6 py-3 text-sm font-bold text-coral-500 transition hover:bg-coral-100 disabled:opacity-60"
        >
          {cancelling ? <Spinner className="h-4 w-4" /> : <XCircle size={16} />}
          Cancel order
        </button>
      )}
    </div>
  );
}
