import { useEffect, useState } from 'react';
import { Search, Ban, CheckCircle2, Users as UsersIcon } from 'lucide-react';
import { api, getErrorMessage } from '../../lib/api';
import { User } from '../../types';
import { EmptyState } from '../../components/EmptyState';
import { Spinner } from '../../components/Spinner';

interface UserWithCount extends User {
  orderCount: number;
}

export function AdminUsers() {
  const [users, setUsers] = useState<UserWithCount[] | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    api
      .get('/admin/users', { params: { search: search || undefined } })
      .then((res) => setUsers(res.data.users));
  };

  useEffect(() => {
    const handle = setTimeout(load, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const toggleActive = async (user: UserWithCount) => {
    setError('');
    try {
      await api.patch(`/admin/users/${user._id}/active`, { isActive: !user.isActive });
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold">Students</h1>

      <div className="relative mt-5">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, phone or room…"
          className="w-full rounded-2xl border border-blush-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-ink-700 outline-none focus:border-rose-400 sm:max-w-md"
        />
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-coral-100 px-3 py-2 text-sm font-bold text-coral-500">
          {error}
        </p>
      )}

      <div className="mt-6">
        {!users && (
          <div className="flex justify-center py-14 text-rose-400">
            <Spinner className="h-8 w-8" />
          </div>
        )}

        {users && users.length === 0 && (
          <EmptyState icon={<UsersIcon size={26} />} title="No students found" description="Try a different search." />
        )}

        {users && users.length > 0 && (
          <div className="flex flex-col gap-3">
            {users.map((u) => (
              <div
                key={u._id}
                className="flex flex-col gap-3 rounded-3xl border border-blush-100 bg-white p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-display text-base font-semibold text-ink-700">
                    {u.firstName} {u.lastName}{' '}
                    {!u.isActive && (
                      <span className="ml-2 rounded-full bg-coral-100 px-2 py-0.5 text-xs font-bold text-coral-500">
                        Disabled
                      </span>
                    )}
                  </p>
                  <p className="text-sm font-semibold text-ink-500">{u.email}</p>
                  <p className="text-sm font-semibold text-ink-400">
                    {u.phone} • Room {u.roomNumber} • {u.orderCount} order{u.orderCount === 1 ? '' : 's'}
                  </p>
                </div>
                <button
                  onClick={() => toggleActive(u)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition ${
                    u.isActive
                      ? 'border-2 border-coral-300 text-coral-500 hover:bg-coral-100'
                      : 'border-2 border-mint-400 text-mint-500 hover:bg-mint-100'
                  }`}
                >
                  {u.isActive ? <Ban size={16} /> : <CheckCircle2 size={16} />}
                  {u.isActive ? 'Disable account' : 'Enable account'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
