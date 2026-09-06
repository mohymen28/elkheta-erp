import { Router } from 'express';
import { getApprovalFlows, createApprovalFlow, updateApprovalFlow } from '../controllers/approvalFlow.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);
router.get('/', getApprovalFlows);
router.post('/', authorize('SUPER_ADMIN', 'PURCHASE_MANAGER'), createApprovalFlow);
router.put('/:id', authorize('SUPER_ADMIN', 'PURCHASE_MANAGER'), updateApprovalFlow);
export default router;
