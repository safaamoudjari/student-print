import { Router } from 'express';
import { Service } from '../models/Service';
import { getSettings } from '../models/Settings';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Publicly readable so the pricing page and the order form can always show
// the current, database-driven prices — nothing is hard-coded on the
// frontend.
router.get(
  '/services',
  asyncHandler(async (_req, res) => {
    const services = await Service.find({ isActive: true }).select('name type price unit');
    res.json({ services });
  })
);

router.get(
  '/settings',
  asyncHandler(async (_req, res) => {
    const settings = await getSettings();
    res.json({
      settings: {
        maxFileSizeMb: settings.maxFileSizeMb,
        maxFilesPerOrder: settings.maxFilesPerOrder,
        maxCopies: settings.maxCopies,
        residenceName: settings.residenceName,
      },
    });
  })
);

export default router;
