import { Router } from 'express';
import { getBranches, getBranchById, createBranch, updateBranch, deleteBranch } from '../controllers/branch.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);
router.get('/', getBranches);
router.get('/:id', getBranchById);
router.post('/', authorize('SUPER_ADMIN'), createBranch);
router.put('/:id', authorize('SUPER_ADMIN'), updateBranch);
router.delete('/:id', authorize('SUPER_ADMIN'), deleteBranch);
export default router;
