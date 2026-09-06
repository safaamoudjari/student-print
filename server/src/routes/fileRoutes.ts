import { Router } from 'express';
import { downloadFile, deleteFile } from '../controllers/fileController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/:id/download', downloadFile);
router.delete('/:id', deleteFile);

export default router;
