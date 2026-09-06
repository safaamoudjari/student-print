import { Routes, Route } from 'react-router-dom';
import { SiteLayout } from './components/SiteLayout';
import { AdminLayout } from './components/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Landing } from './pages/Landing';
import { Pricing } from './pages/Pricing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { NotFound } from './pages/NotFound';

import { Dashboard } from './pages/student/Dashboard';
import { NewOrder } from './pages/student/NewOrder';
import { MyOrders } from './pages/student/MyOrders';
import { OrderDetails } from './pages/student/OrderDetails';
import { Profile } from './pages/student/Profile';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminOrderDetail } from './pages/admin/AdminOrderDetail';
import { AdminServices } from './pages/admin/AdminServices';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminUsers } from './pages/admin/AdminUsers';

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route element={<ProtectedRoute role="student" />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/new-order" element={<NewOrder />} />
          <Route path="/dashboard/orders" element={<MyOrders />} />
          <Route path="/dashboard/orders/:id" element={<OrderDetails />} />
          <Route path="/dashboard/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<ProtectedRoute role="admin" />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/services" element={<AdminServices />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
      </Route>
    </Routes>
  );
}
