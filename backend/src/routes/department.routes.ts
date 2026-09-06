import { Router } from 'express';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../controllers/department.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);
router.get('/', getDepartments);
router.post('/', authorize('SUPER_ADMIN', 'BRANCH_MANAGER'), createDepartment);
router.put('/:id', authorize('SUPER_ADMIN', 'BRANCH_MANAGER'), updateDepartment);
router.delete('/:id', authorize('SUPER_ADMIN'), deleteDepartment);
export default router;
