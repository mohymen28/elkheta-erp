import { Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth.middleware';

export const getProducts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { categoryId, search } = req.query;
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(categoryId && { categoryId: categoryId as string }),
        ...(search && {
          OR: [
            { nameAr: { contains: search as string } },
            { code: { contains: search as string } },
          ],
        }),
      },
      include: { category: { select: { id: true, nameAr: true } } },
      orderBy: { nameAr: 'asc' },
    });
    res.json({ success: true, count: products.length, data: products });
  } catch (err) { next(err); }
};

export const getProductById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) throw new AppError('المنتج غير موجود', 404);
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
};

export const createProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { nameAr, nameEn, code, description, unit, categoryId, minStock } = req.body;
    if (!nameAr || !code || !unit || !categoryId) {
      throw new AppError('يرجى إدخال جميع البيانات المطلوبة', 400);
    }
    const product = await prisma.product.create({
      data: { nameAr, nameEn, code, description, unit, categoryId, minStock: minStock || 0 },
    });
    res.status(201).json({ success: true, message: 'تم إضافة الصنف بنجاح', data: product });
  } catch (err) { next(err); }
};

export const updateProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const product = await prisma.product.update({ where: { id }, data: req.body });
    res.json({ success: true, message: 'تم تحديث الصنف بنجاح', data: product });
  } catch (err) { next(err); }
};

export const deleteProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await prisma.product.update({ where: { id }, data: { isActive: false } });
    res.json({ success: true, message: 'تم حذف الصنف' });
  } catch (err) { next(err); }
};
