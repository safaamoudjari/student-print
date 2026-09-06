import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Tags,
  Settings,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { to: '/admin/users', label: 'Students', icon: Users },
  { to: '/admin/services', label: 'Printing Settings', icon: Tags },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

function navClasses({ isActive }: { isActive: boolean }) {
  return `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
    isActive ? 'bg-rose-500 text-white shadow-blush' : 'text-ink-500 hover:bg-blush-100 hover:text-rose-600'
  }`;
}

export function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const SidebarContent = (
    <>
      <Logo />
      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-lavender-500">Admin</p>
      <nav className="mt-8 flex flex-1 flex-col gap-1.5">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={navClasses} onClick={() => setOpen(false)}>
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-6 rounded-2xl bg-blush-50 p-4">
        <p className="truncate text-sm font-bold text-ink-700">
          {user?.firstName} {user?.lastName}
        </p>
        <p className="truncate text-xs font-semibold text-ink-400">{user?.email}</p>
        <button
          onClick={handleLogout}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-600"
        >
          <LogOut size={14} /> Log out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-cream md:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-blush-100 bg-white p-5 md:flex">
        {SidebarContent}
      </aside>

      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-blush-100 bg-white px-5 py-3.5 md:hidden">
        <Logo />
        <button className="rounded-xl p-2 text-ink-600" onClick={() => setOpen(true)} aria-label="Open admin menu">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-ink-700/40" onClick={() => setOpen(false)} />
          <div className="relative flex w-72 max-w-[85%] flex-col bg-white p-5 shadow-lift">
            <button
              className="absolute right-4 top-4 rounded-xl p-1.5 text-ink-500"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
            {SidebarContent}
          </div>
        </div>
      )}

      <main className="flex-1 px-5 py-8 md:px-10">
        <Outlet />
      </main>
    </div>
  );
}
