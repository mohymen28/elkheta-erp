import { Router } from 'express';
import {
  getMaintenanceOrders,
  createMaintenanceOrder,
  updateMaintenanceOrderStatus,
  getMaintenanceContracts,
  createMaintenanceContract,
} from '../controllers/maintenance.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/orders', getMaintenanceOrders);
router.post('/orders', createMaintenanceOrder);
router.patch('/orders/:id/status', updateMaintenanceOrderStatus);

router.get('/contracts', getMaintenanceContracts);
router.post('/contracts', authorize('SUPER_ADMIN', 'BRANCH_MANAGER'), createMaintenanceContract);

export default router;
