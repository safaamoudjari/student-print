import { useEffect, useState } from 'react';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  PackageCheck,
  Printer,
  Wallet,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Statistics } from '../../types';
import { StatCard } from '../../components/StatCard';
import { Spinner } from '../../components/Spinner';

type RangeKey = 'today' | 'week' | 'month' | 'all';

function rangeToDates(range: RangeKey): { from?: string } {
  const now = new Date();
  if (range === 'today') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { from: start.toISOString() };
  }
  if (range === 'week') {
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    return { from: start.toISOString() };
  }
  if (range === 'month') {
    const start = new Date(now);
    start.setMonth(now.getMonth() - 1);
    return { from: start.toISOString() };
  }
  return {};
}

const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'This month' },
  { key: 'all', label: 'All time' },
];

export function AdminDashboard() {
  const [range, setRange] = useState<RangeKey>('all');
  const [stats, setStats] = useState<Statistics | null>(null);

  useEffect(() => {
    const params = rangeToDates(range);
    api.get('/admin/statistics', { params }).then((res) => setStats(res.data));
  }, [range]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Overview</h1>
        <div className="flex gap-2 overflow-x-auto">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setRange(opt.key)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
                range === opt.key ? 'bg-rose-500 text-white shadow-blush' : 'border border-blush-100 bg-white text-ink-500'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {!stats ? (
        <div className="mt-14 flex justify-center text-rose-400">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total orders" value={stats.total} icon={ClipboardList} tint="lavender" />
          <StatCard label="Pending" value={stats.pending} icon={Clock} tint="amber" />
          <StatCard label="Processing" value={stats.processing} icon={Printer} tint="rose" />
          <StatCard label="Ready" value={stats.ready} icon={PackageCheck} tint="mint" />
          <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} tint="mint" />
          <StatCard label="Cancelled" value={stats.cancelled} icon={ClipboardList} tint="coral" />
          <StatCard label="Total revenue" value={`${stats.totalRevenue} DA`} icon={Wallet} tint="rose" />
        </div>
      )}
    </div>
  );
}
