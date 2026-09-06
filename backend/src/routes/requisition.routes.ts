import { Router } from 'express';
import {
  createRequisition, getRequisitions, getRequisitionById,
  submitRequisition, approveRequisition, rejectRequisition,
  cancelRequisition, getPendingApprovals, getRequisitionStats,
} from '../controllers/requisition.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/stats', getRequisitionStats);
router.get('/pending-approvals', getPendingApprovals);
router.get('/', getRequisitions);
router.get('/:id', getRequisitionById);
router.post('/', createRequisition);
router.patch('/:id/submit', submitRequisition);
router.patch('/:id/approve', approveRequisition);
router.patch('/:id/reject', rejectRequisition);
router.patch('/:id/cancel', cancelRequisition);

export default router;
