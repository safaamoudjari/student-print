import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Printer, Palette, ScanLine, BookOpen, Layers } from 'lucide-react';
import { api } from '../lib/api';
import { Service } from '../types';
import { Spinner } from '../components/Spinner';

const ICONS: Record<string, any> = {
  per_page_bw: Printer,
  per_page_color: Palette,
};
function iconFor(service: Service) {
  if (ICONS[service.type]) return ICONS[service.type];
  const name = service.name.toLowerCase();
  if (name.includes('scan')) return ScanLine;
  if (name.includes('bind')) return BookOpen;
  return Layers;
}

export function Pricing() {
  const [services, setServices] = useState<Service[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/services')
      .then((res) => setServices(res.data.services))
      .catch(() => setError('Could not load current prices. Please try again later.'));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-5 py-14">
      <div className="text-center">
        <h1 className="text-3xl font-semibold sm:text-4xl">Simple, transparent prices</h1>
        <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-ink-400">
          Prices are set by the residence and always shown in Algerian Dinar (DA).
        </p>
      </div>

      {!services && !error && (
        <div className="mt-14 flex justify-center text-rose-400">
          <Spinner className="h-8 w-8" />
        </div>
      )}
      {error && <p className="mt-8 text-center font-bold text-coral-500">{error}</p>}

      {services && (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => {
            const Icon = iconFor(s);
            return (
              <div key={s._id} className="rounded-3xl border border-blush-100 bg-white p-6 shadow-soft">
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blush-100 text-rose-500">
                  <Icon size={20} />
                </span>
                <h3 className="font-display text-base font-semibold text-ink-700">{s.name}</h3>
                <p className="mt-2 font-display text-2xl font-semibold text-rose-600">
                  {s.price} <span className="text-sm font-bold text-ink-400">{s.unit}</span>
                </p>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-12 text-center">
        <Link
          to="/register"
          className="inline-flex items-center justify-center rounded-full bg-rose-500 px-7 py-3.5 text-sm font-bold text-white shadow-blush transition hover:-translate-y-0.5 hover:bg-rose-600"
        >
          Start Printing
        </Link>
      </div>
    </div>
  );
}
