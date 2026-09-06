import { Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth.middleware';

export const getDepartments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { branchId } = req.query;
    const departments = await prisma.department.findMany({
      where: { isActive: true, ...(branchId && { branchId: branchId as string }) },
      include: {
        branch: { select: { id: true, nameAr: true } },
        _count: { select: { users: true } },
      },
      orderBy: { nameAr: 'asc' },
    });
    res.json({ success: true, data: departments });
  } catch (err) { next(err); }
};

export const createDepartment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { nameAr, nameEn, code, branchId } = req.body;
    if (!nameAr || !branchId) throw new AppError('يرجى إدخال اسم القسم والفرع', 400);
    const dept = await prisma.department.create({ data: { nameAr, nameEn, code, branchId } });
    res.status(201).json({ success: true, message: 'تم إنشاء القسم بنجاح', data: dept });
  } catch (err) { next(err); }
};

export const updateDepartment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const dept = await prisma.department.update({ where: { id }, data: req.body });
    res.json({ success: true, message: 'تم التحديث بنجاح', data: dept });
  } catch (err) { next(err); }
};

export const deleteDepartment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await prisma.department.update({ where: { id }, data: { isActive: false } });
    res.json({ success: true, message: 'تم حذف القسم' });
  } catch (err) { next(err); }
};
