import { Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth.middleware';

export const getBranches = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const branches = await prisma.branch.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { users: true, departments: true } },
      },
      orderBy: { nameAr: 'asc' },
    });
    res.json({ success: true, data: branches });
  } catch (err) { next(err); }
};

export const getBranchById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const branch = await prisma.branch.findUnique({
      where: { id },
      include: {
        departments: true,
        users: { select: { id: true, nameAr: true, email: true, role: true, employeeId: true } },
      },
    });
    if (!branch) throw new AppError('الفرع غير موجود', 404);
    res.json({ success: true, data: branch });
  } catch (err) { next(err); }
};

export const createBranch = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { nameAr, nameEn, code, address, phone } = req.body;
    if (!nameAr || !code) throw new AppError('يرجى إدخال اسم الفرع والكود', 400);
    const branch = await prisma.branch.create({ data: { nameAr, nameEn, code, address, phone } });
    res.status(201).json({ success: true, message: 'تم إنشاء الفرع بنجاح', data: branch });
  } catch (err) { next(err); }
};

export const updateBranch = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const branch = await prisma.branch.update({
      where: { id },
      data: req.body,
    });
    res.json({ success: true, message: 'تم تحديث الفرع بنجاح', data: branch });
  } catch (err) { next(err); }
};

export const deleteBranch = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await prisma.branch.update({ where: { id }, data: { isActive: false } });
    res.json({ success: true, message: 'تم تعطيل الفرع بنجاح' });
  } catch (err) { next(err); }
};
