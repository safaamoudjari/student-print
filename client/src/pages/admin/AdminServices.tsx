import { FormEvent, useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api, getErrorMessage } from '../../lib/api';
import { Service, ServiceType } from '../../types';
import { Spinner } from '../../components/Spinner';

const TYPE_LABELS: Record<ServiceType, string> = {
  per_page_bw: 'Per page (Black & White)',
  per_page_color: 'Per page (Color)',
  flat: 'Flat fee',
  per_unit: 'Per unit',
};

function ServiceRow({ service, onSaved }: { service: Service; onSaved: () => void }) {
  const [price, setPrice] = useState(String(service.price));
  const [isActive, setIsActive] = useState(service.isActive);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      await api.patch(`/admin/services/${service._id}`, { price: Number(price), isActive });
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete "${service.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/services/${service._id}`);
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="rounded-3xl border border-blush-100 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-base font-semibold text-ink-700">{service.name}</p>
          <p className="text-xs font-bold uppercase tracking-wide text-lavender-500">
            {TYPE_LABELS[service.type]}
            {service.isCore ? ' • core' : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-bold text-ink-600">
            Price
            <input
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-24 rounded-xl border border-blush-200 bg-cream px-3 py-2 text-sm font-bold text-ink-700 outline-none focus:border-rose-400"
            />
            <span className="text-ink-400">{service.unit}</span>
          </label>
          <label className="flex items-center gap-2 text-sm font-bold text-ink-600">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 accent-rose-500"
            />
            Active
          </label>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-sm font-bold text-white shadow-blush transition hover:bg-rose-600 disabled:opacity-60"
          >
            {saving && <Spinner className="h-4 w-4" />}
            Save
          </button>
          {!service.isCore && (
            <button
              onClick={remove}
              className="rounded-full p-2 text-coral-500 hover:bg-coral-100"
              aria-label={`Delete ${service.name}`}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
      {error && <p className="mt-2 text-sm font-bold text-coral-500">{error}</p>}
    </div>
  );
}

export function AdminServices() {
  const [services, setServices] = useState<Service[] | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newService, setNewService] = useState({ name: '', price: '', unit: 'DA', type: 'flat' as ServiceType });
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);

  const load = () => api.get('/admin/services').then((res) => setServices(res.data.services));

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setAddError('');
    try {
      await api.post('/admin/services', { ...newService, price: Number(newService.price) });
      setNewService({ name: '', price: '', unit: 'DA', type: 'flat' });
      setShowAdd(false);
      load();
    } catch (err) {
      setAddError(getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Printing Settings</h1>
          <p className="text-sm font-semibold text-ink-400">
            Prices update instantly for students — nothing is hard-coded on the site.
          </p>
        </div>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-5 py-2.5 text-sm font-bold text-white shadow-blush hover:bg-rose-600"
        >
          <Plus size={16} /> Add service
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="mt-5 rounded-3xl border border-blush-100 bg-white p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-ink-600">Name</label>
              <input
                required
                value={newService.name}
                onChange={(e) => setNewService((s) => ({ ...s, name: e.target.value }))}
                className="w-full rounded-2xl border border-blush-200 bg-cream px-4 py-2.5 text-sm font-semibold text-ink-700 outline-none focus:border-rose-400"
                placeholder="e.g. Laminating"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-ink-600">Type</label>
              <select
                value={newService.type}
                onChange={(e) => setNewService((s) => ({ ...s, type: e.target.value as ServiceType }))}
                className="w-full rounded-2xl border border-blush-200 bg-cream px-4 py-2.5 text-sm font-bold text-ink-700 outline-none focus:border-rose-400"
              >
                <option value="flat"></option>
                <option value="per_unit">Per unit</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-ink-600">Price</label>
              <input
                required
                type="number"
                min={0}
                value={newService.price}
                onChange={(e) => setNewService((s) => ({ ...s, price: e.target.value }))}
                className="w-full rounded-2xl border border-blush-200 bg-cream px-4 py-2.5 text-sm font-bold text-ink-700 outline-none focus:border-rose-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-ink-600">Unit label</label>
              <input
                value={newService.unit}
                onChange={(e) => setNewService((s) => ({ ...s, unit: e.target.value }))}
                className="w-full rounded-2xl border border-blush-200 bg-cream px-4 py-2.5 text-sm font-semibold text-ink-700 outline-none focus:border-rose-400"
                placeholder="DA"
              />
            </div>
          </div>
          {addError && <p className="mt-3 text-sm font-bold text-coral-500">{addError}</p>}
          <button
            type="submit"
            disabled={adding}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-rose-500 px-6 py-2.5 text-sm font-bold text-white shadow-blush hover:bg-rose-600 disabled:opacity-60"
          >
            {adding && <Spinner className="h-4 w-4" />}
            Create service
          </button>
        </form>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {!services && (
          <div className="flex justify-center py-14 text-rose-400">
            <Spinner className="h-8 w-8" />
          </div>
        )}
        {services?.map((s) => (
          <ServiceRow key={s._id} service={s} onSaved={load} />
        ))}
      </div>
    </div>
  );
}
