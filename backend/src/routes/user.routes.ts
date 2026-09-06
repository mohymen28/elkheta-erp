import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', authorize('SUPER_ADMIN', 'PURCHASE_MANAGER', 'BRANCH_MANAGER'), getUsers);
router.get('/:id', getUserById);
router.post('/', authorize('SUPER_ADMIN'), createUser);
router.put('/:id', authorize('SUPER_ADMIN'), updateUser);
router.delete('/:id', authorize('SUPER_ADMIN'), deleteUser);

export default router;
