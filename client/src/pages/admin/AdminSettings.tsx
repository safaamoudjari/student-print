import { FormEvent, useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../lib/api';
import { AdminSettings as AdminSettingsType } from '../../types';
import { Spinner } from '../../components/Spinner';

export function AdminSettings() {
  const [settings, setSettings] = useState<AdminSettingsType | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/admin/settings').then((res) => setSettings(res.data.settings));
  }, []);

  const update = (key: keyof AdminSettingsType) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setSettings((s) =>
      s
        ? {
            ...s,
            [key]: e.target.type === 'number' ? Number(e.target.value) : e.target.value,
          }
        : s
    );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await api.patch('/admin/settings', settings);
      setSettings(res.data.settings);
      setSaved(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-rose-400">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const inputClasses =
    'w-full rounded-2xl border border-blush-200 bg-cream px-4 py-3 text-sm font-bold text-ink-700 outline-none focus:border-rose-400';

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mt-1 text-sm font-semibold text-ink-400">
        These limits apply immediately to every new order students create.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 rounded-3xl border border-blush-100 bg-white p-6">
        <div>
          <label className="mb-1.5 block text-sm font-bold text-ink-600">Residence name</label>
          <input
            value={settings.residenceName}
            onChange={update('residenceName')}
            className={inputClasses.replace('font-bold', 'font-semibold')}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-ink-600">Max file size (MB)</label>
            <input type="number" min={1} value={settings.maxFileSizeMb} onChange={update('maxFileSizeMb')} className={inputClasses} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-ink-600">Max files per order</label>
            <input
              type="number"
              min={1}
              value={settings.maxFilesPerOrder}
              onChange={update('maxFilesPerOrder')}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-ink-600">Max copies per order</label>
            <input type="number" min={1} value={settings.maxCopies} onChange={update('maxCopies')} className={inputClasses} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-ink-600">File retention (days)</label>
            <input
              type="number"
              min={0}
              value={settings.fileRetentionDays}
              onChange={update('fileRetentionDays')}
              className={inputClasses}
            />
          </div>
        </div>
        <p className="-mt-2 text-xs font-semibold text-ink-400">
          Uploaded files can be automatically removed this many days after an order is completed. Order
          history is always kept. Automatic deletion runs as a scheduled job you set up on your server (see
          the README).
        </p>

        {error && (
          <p role="alert" className="rounded-xl bg-coral-100 px-3 py-2 text-sm font-bold text-coral-500">
            {error}
          </p>
        )}
        {saved && (
          <p className="rounded-xl bg-mint-100 px-3 py-2 text-sm font-bold text-mint-500">Settings saved.</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 px-6 py-3.5 text-sm font-bold text-white shadow-blush transition hover:-translate-y-0.5 hover:bg-rose-600 disabled:opacity-60"
        >
          {saving && <Spinner className="h-4 w-4" />}
          Save settings
        </button>
      </form>
    </div>
  );
}
