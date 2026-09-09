import { Router } from 'express';
import {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
} from '../controllers/vendor.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', getVendors);
router.get('/:id', getVendorById);
router.post('/', authorize('SUPER_ADMIN', 'PURCHASE_MANAGER'), createVendor);
router.put('/:id', authorize('SUPER_ADMIN', 'PURCHASE_MANAGER'), updateVendor);
router.delete('/:id', authorize('SUPER_ADMIN', 'PURCHASE_MANAGER'), deleteVendor);

export default router;
