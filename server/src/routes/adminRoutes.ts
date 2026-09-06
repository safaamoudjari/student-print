import { Router } from 'express';
import {
  listOrders,
  getOrder,
  updateOrderStatus,
  deleteOrder,
  getStatistics,
  listUsers,
  getUser,
  setUserActive,
  listServices,
  createService,
  updateService,
  deleteService,
  getAdminSettings,
  updateAdminSettings,
} from '../controllers/adminController';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.get('/orders', listOrders);
router.get('/orders/:id', getOrder);
router.patch('/orders/:id/status', updateOrderStatus);
router.delete('/orders/:id', deleteOrder);

router.get('/statistics', getStatistics);

router.get('/users', listUsers);
router.get('/users/:id', getUser);
router.patch('/users/:id/active', setUserActive);

router.get('/services', listServices);
router.post('/services', createService);
router.patch('/services/:id', updateService);
router.delete('/services/:id', deleteService);

router.get('/settings', getAdminSettings);
router.patch('/settings', updateAdminSettings);

export default router;
