import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './Spinner';
import { UserRole } from '../types';

export function ProtectedRoute({ role }: { role?: UserRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-rose-400">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return <Outlet />;
}
