import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/Spinner';

export function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-5 py-14">
      <div className="rounded-4xl border border-blush-100 bg-white p-8 shadow-soft">
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blush-100 text-rose-500">
          <LogIn size={22} />
        </span>
        <h1 className="text-2xl font-semibold">Welcome back </h1>
        <p className="mt-1 text-sm font-semibold text-ink-400">Log in to track your printing orders.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-bold text-ink-600">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-blush-200 bg-cream px-4 py-3 text-sm font-semibold text-ink-700 outline-none focus:border-rose-400"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-bold text-ink-600">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs font-bold text-rose-500">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-blush-200 bg-cream px-4 py-3 text-sm font-semibold text-ink-700 outline-none focus:border-rose-400"
              placeholder="••••••••"
              autoComplete="current-password"
            />
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
            Log in
          </button>
        </form>

        <p className="mt-6 text-center text-sm font-semibold text-ink-400">
          New here?{' '}
          <Link to="/register" className="font-bold text-rose-500">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
