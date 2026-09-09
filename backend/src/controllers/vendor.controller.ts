import { Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth.middleware';

// GET /api/vendors
export const getVendors = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { category, search } = req.query;
    const vendors = await prisma.vendor.findMany({
      where: {
        isActive: true,
        ...(category && { category: category as string }),
        ...(search && {
          OR: [
            { nameAr: { contains: search as string } },
            { nameEn: { contains: search as string } },
            { phone: { contains: search as string } },
          ],
        }),
      },
      include: {
        _count: { select: { purchaseOrders: true } },
      },
      orderBy: { nameAr: 'asc' },
    });
    res.json({ success: true, count: vendors.length, data: vendors });
  } catch (err) { next(err); }
};

// GET /api/vendors/:id
export const getVendorById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        purchaseOrders: {
          include: { branch: { select: { id: true, nameAr: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
    if (!vendor) throw new AppError('المورد غير موجود', 404);
    res.json({ success: true, data: vendor });
  } catch (err) { next(err); }
};

// POST /api/vendors
export const createVendor = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { nameAr, nameEn, phone, email, address, taxNumber, category, rating } = req.body;
    if (!nameAr || !category) {
      throw new AppError('يرجى إدخال اسم المورد ومجال التوريد', 400);
    }
    const vendor = await prisma.vendor.create({
      data: {
        nameAr,
        nameEn: nameEn || null,
        phone: phone || null,
        email: email || null,
        address: address || null,
        taxNumber: taxNumber || null,
        category,
        rating: rating ? Number(rating) : 5.0,
      },
    });
    res.status(201).json({ success: true, message: 'تم إضافة المورد بنجاح', data: vendor });
  } catch (err) { next(err); }
};

// PUT /api/vendors/:id
export const updateVendor = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const vendor = await prisma.vendor.update({
      where: { id },
      data: req.body,
    });
    res.json({ success: true, message: 'تم تحديث بيانات المورد بنجاح', data: vendor });
  } catch (err) { next(err); }
};

// DELETE /api/vendors/:id
export const deleteVendor = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await prisma.vendor.update({ where: { id }, data: { isActive: false } });
    res.json({ success: true, message: 'تم تعطيل المورد بنجاح' });
  } catch (err) { next(err); }
};
