import { Router } from 'express';
import { createOrder, listMyOrders, getMyOrder, cancelMyOrder } from '../controllers/orderController';
import { requireAuth, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(requireAuth, requireRole('student'));

router.get('/', listMyOrders);
router.post('/', upload.array('files'), createOrder);
router.get('/:id', getMyOrder);
router.post('/:id/cancel', cancelMyOrder);

export default router;
