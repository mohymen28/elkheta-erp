import { Router } from 'express';
import {
  getStockBalances,
  updateStock,
  getTransfers,
  createTransfer,
  updateTransferStatus,
} from '../controllers/inventory.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/stocks', getStockBalances);
router.post('/stocks', authorize('SUPER_ADMIN', 'WAREHOUSE_KEEPER', 'PURCHASE_MANAGER'), updateStock);
router.get('/transfers', getTransfers);
router.post('/transfers', authorize('SUPER_ADMIN', 'WAREHOUSE_KEEPER', 'BRANCH_MANAGER'), createTransfer);
router.patch('/transfers/:id/status', authorize('SUPER_ADMIN', 'WAREHOUSE_KEEPER', 'BRANCH_MANAGER'), updateTransferStatus);

export default router;
