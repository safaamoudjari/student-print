import { Link } from 'react-router-dom';
import { KeyRound } from 'lucide-react';

export function ForgotPassword() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-14 text-center">
      <div className="rounded-4xl border border-blush-100 bg-white p-8 shadow-soft">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blush-100 text-rose-500">
          <KeyRound size={22} />
        </span>
        <h1 className="text-xl font-semibold">Password reset by email isn't set up yet</h1>
        <p className="mt-2 text-sm font-semibold text-ink-400">
          For now, please reach out to the residence admin directly and they can reset your
          password from the admin dashboard. Self-service email reset is planned for a future
          version.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-rose-500 px-6 py-3 text-sm font-bold text-white shadow-blush"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
