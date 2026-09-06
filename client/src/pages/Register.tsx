import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/Spinner';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  roomNumber: '',
  residence: '',
};

function validate(form: typeof initialForm) {
  if (!form.firstName.trim()) return 'First name is required.';
  if (!form.lastName.trim()) return 'Last name is required.';
  if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Please enter a valid email address.';
  if (form.password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(form.password)) return 'Password must contain an uppercase letter.';
  if (!/[0-9]/.test(form.password)) return 'Password must contain a number.';
  if (!/^[0-9+\s-]{8,20}$/.test(form.phone)) return 'Please enter a valid phone number.';
  if (!form.roomNumber.trim()) return 'Room number is required.';
  return null;
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationError = validate(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register({ ...form, residence: form.residence || undefined });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    'w-full rounded-2xl border border-blush-200 bg-cream px-4 py-3 text-sm font-semibold text-ink-700 outline-none focus:border-rose-400';

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-lg flex-col justify-center px-5 py-14">
      <div className="rounded-4xl border border-blush-100 bg-white p-8 shadow-soft">
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blush-100 text-rose-500">
          <UserPlus size={22} />
        </span>
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="mt-1 text-sm font-semibold text-ink-400">
          Just a few details so we know where to send your prints.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="mb-1.5 block text-sm font-bold text-ink-600">
                First name
              </label>
              <input id="firstName" required value={form.firstName} onChange={update('firstName')} className={inputClasses} />
            </div>
            <div>
              <label htmlFor="lastName" className="mb-1.5 block text-sm font-bold text-ink-600">
                Last name
              </label>
              <input id="lastName" required value={form.lastName} onChange={update('lastName')} className={inputClasses} />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-bold text-ink-600">
              Email
            </label>
            <input id="email" type="email" required value={form.email} onChange={update('email')} className={inputClasses} autoComplete="email" />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-bold text-ink-600">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={form.password}
              onChange={update('password')}
              className={inputClasses}
              autoComplete="new-password"
            />
            <p className="mt-1 text-xs font-semibold text-ink-400">
              At least 8 characters, with an uppercase letter and a number.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-bold text-ink-600">
                Phone number
              </label>
              <input id="phone" required value={form.phone} onChange={update('phone')} className={inputClasses} placeholder="0555 12 34 56" />
            </div>
            <div>
              <label htmlFor="roomNumber" className="mb-1.5 block text-sm font-bold text-ink-600">
                Room number
              </label>
              <input id="roomNumber" required value={form.roomNumber} onChange={update('roomNumber')} className={inputClasses} placeholder="A-204" />
            </div>
          </div>

          <div>
            <label htmlFor="residence" className="mb-1.5 block text-sm font-bold text-ink-600">
              Residence / building <span className="font-semibold text-ink-400">(optional)</span>
            </label>
            <input id="residence" value={form.residence} onChange={update('residence')} className={inputClasses} />
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-coral-100 px-3 py-2 text-sm font-bold text-coral-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 px-6 py-3.5 text-sm font-bold text-white shadow-blush transition hover:-translate-y-0.5 hover:bg-rose-600 disabled:opacity-60"
          >
            {loading && <Spinner className="h-4 w-4" />}
            Create account
          </button>
        </form>

        <p className="mt-6 text-center text-sm font-semibold text-ink-400">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-rose-500">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
