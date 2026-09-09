import { Router } from 'express';
import {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrderStatus,
  approveOrder,
  receiveOrder,
} from '../controllers/purchaseOrder.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', getPurchaseOrders);
router.get('/:id', getPurchaseOrderById);
router.post('/', authorize('SUPER_ADMIN', 'PURCHASE_MANAGER'), createPurchaseOrder);
router.patch('/:id/status', authorize('SUPER_ADMIN', 'PURCHASE_MANAGER'), updatePurchaseOrderStatus);
router.patch('/:id/approve', authorize('SUPER_ADMIN', 'PURCHASE_MANAGER'), approveOrder);
router.patch('/:id/receive', authorize('SUPER_ADMIN', 'PURCHASE_MANAGER', 'BRANCH_MANAGER', 'WAREHOUSE_KEEPER'), receiveOrder);

export default router;
