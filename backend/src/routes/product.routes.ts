import { Router } from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', authorize('SUPER_ADMIN', 'PURCHASE_MANAGER'), createProduct);
router.put('/:id', authorize('SUPER_ADMIN', 'PURCHASE_MANAGER'), updateProduct);
router.delete('/:id', authorize('SUPER_ADMIN', 'PURCHASE_MANAGER'), deleteProduct);
export default router;
