import { Router } from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);
router.get('/', getCategories);
router.post('/', authorize('SUPER_ADMIN', 'PURCHASE_MANAGER'), createCategory);
router.put('/:id', authorize('SUPER_ADMIN', 'PURCHASE_MANAGER'), updateCategory);
router.delete('/:id', authorize('SUPER_ADMIN'), deleteCategory);
export default router;
