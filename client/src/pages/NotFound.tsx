import { Link } from 'react-router-dom';
import { Frown } from 'lucide-react';

export function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-5 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-blush-100 text-rose-500">
        <Frown size={26} />
      </span>
      <h1 className="text-2xl font-semibold">This page could not be found</h1>
      <p className="mt-2 text-sm font-semibold text-ink-400">
        The link might be broken, or the page may have moved.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center justify-center rounded-full bg-rose-500 px-6 py-3 text-sm font-bold text-white shadow-blush transition hover:-translate-y-0.5 hover:bg-rose-600"
      >
        Back to home
      </Link>
    </div>
  );
}
