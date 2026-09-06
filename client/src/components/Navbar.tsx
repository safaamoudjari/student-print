import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Sparkles } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-bold transition-colors ${
    isActive ? 'text-rose-600' : 'text-ink-500 hover:text-rose-500'
  }`;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const dashboardPath = user?.role === 'admin' ? '/admin' : '/dashboard';

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-blush-100 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link to="/" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <NavLink to="/" className={linkClasses} end>
            Home
          </NavLink>
          <NavLink to="/pricing" className={linkClasses}>
            Prices
          </NavLink>
          <NavLink to="/#how-it-works" className={linkClasses}>
            How it works
          </NavLink>
          {user ? (
            <>
              <NavLink to={dashboardPath} className={linkClasses}>
                Dashboard
              </NavLink>
              <button onClick={handleLogout} className="text-sm font-bold text-ink-500 hover:text-rose-500">
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClasses}>
                Log in
              </NavLink>
              <NavLink to="/register" className={linkClasses}>
                Register
              </NavLink>
            </>
          )}
          <Link
            to={user ? '/dashboard/new-order' : '/register'}
            className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-5 py-2.5 text-sm font-bold text-white shadow-blush transition hover:-translate-y-0.5 hover:bg-rose-600"
          >
            <Sparkles size={16} /> Print Now
          </Link>
        </nav>

        <button
          className="rounded-xl p-2 text-ink-600 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-blush-100 bg-cream px-5 pb-5 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            <Link to="/" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 font-bold text-ink-600">
              Home
            </Link>
            <Link to="/pricing" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 font-bold text-ink-600">
              Prices
            </Link>
            {user ? (
              <>
                <Link
                  to={dashboardPath}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 font-bold text-ink-600"
                >
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="rounded-xl px-3 py-3 text-left font-bold text-ink-600">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 font-bold text-ink-600">
                  Log in
                </Link>
                <Link to="/register" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 font-bold text-ink-600">
                  Register
                </Link>
              </>
            )}
            <Link
              to={user ? '/dashboard/new-order' : '/register'}
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full bg-rose-500 px-5 py-3 font-bold text-white shadow-blush"
            >
              <Sparkles size={16} /> Print Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
