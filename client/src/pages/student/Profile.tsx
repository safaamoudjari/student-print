import { FormEvent, useState } from 'react';
import { UserCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api, getErrorMessage } from '../../lib/api';
import { Spinner } from '../../components/Spinner';

export function Profile() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    roomNumber: user?.roomNumber || '',
    residence: user?.residence || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await api.patch('/auth/me', form);
      await refreshUser();
      setSaved(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const inputClasses =
    'w-full rounded-2xl border border-blush-200 bg-cream px-4 py-3 text-sm font-semibold text-ink-700 outline-none focus:border-rose-400';

  return (
    <div className="mx-auto max-w-lg px-5 py-10">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blush-100 text-rose-500">
          <UserCircle2 size={24} />
        </span>
        <div>
          <h1 className="text-xl font-semibold">My Profile</h1>
          <p className="text-sm font-semibold text-ink-400">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4 rounded-3xl border border-blush-100 bg-white p-6">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className="mb-1.5 block text-sm font-bold text-ink-600">
              First name
            </label>
            <input id="firstName" value={form.firstName} onChange={update('firstName')} className={inputClasses} />
          </div>
          <div>
            <label htmlFor="lastName" className="mb-1.5 block text-sm font-bold text-ink-600">
              Last name
            </label>
            <input id="lastName" value={form.lastName} onChange={update('lastName')} className={inputClasses} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-bold text-ink-600">
              Phone number
            </label>
            <input id="phone" value={form.phone} onChange={update('phone')} className={inputClasses} />
          </div>
          <div>
            <label htmlFor="roomNumber" className="mb-1.5 block text-sm font-bold text-ink-600">
              Room number
            </label>
            <input id="roomNumber" value={form.roomNumber} onChange={update('roomNumber')} className={inputClasses} />
          </div>
        </div>

        <div>
          <label htmlFor="residence" className="mb-1.5 block text-sm font-bold text-ink-600">
            Residence / building
          </label>
          <input id="residence" value={form.residence} onChange={update('residence')} className={inputClasses} />
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-coral-100 px-3 py-2 text-sm font-bold text-coral-500">
            {error}
          </p>
        )}
        {saved && (
          <p className="rounded-xl bg-mint-100 px-3 py-2 text-sm font-bold text-mint-500">
            Your profile was updated.
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 px-6 py-3.5 text-sm font-bold text-white shadow-blush transition hover:-translate-y-0.5 hover:bg-rose-600 disabled:opacity-60"
        >
          {saving && <Spinner className="h-4 w-4" />}
          Save changes
        </button>
      </form>
    </div>
  );
}
