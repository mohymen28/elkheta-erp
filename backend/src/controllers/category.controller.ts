import { Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth.middleware';

export const getCategories = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        children: true,
        _count: { select: { products: true } },
      },
      orderBy: { nameAr: 'asc' },
    });
    res.json({ success: true, data: categories });
  } catch (err) { next(err); }
};

export const createCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { nameAr, nameEn, parentId } = req.body;
    if (!nameAr) throw new AppError('يرجى إدخال اسم الفئة', 400);
    const category = await prisma.category.create({ data: { nameAr, nameEn, parentId } });
    res.status(201).json({ success: true, message: 'تم إنشاء الفئة بنجاح', data: category });
  } catch (err) { next(err); }
};

export const updateCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const category = await prisma.category.update({ where: { id }, data: req.body });
    res.json({ success: true, message: 'تم التحديث بنجاح', data: category });
  } catch (err) { next(err); }
};

export const deleteCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await prisma.category.update({ where: { id }, data: { isActive: false } });
    res.json({ success: true, message: 'تم حذف الفئة' });
  } catch (err) { next(err); }
};
