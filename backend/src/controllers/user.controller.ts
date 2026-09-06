import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth.middleware';

// GET /api/users
export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { role, branchId, isActive, search } = req.query;

    const users = await prisma.user.findMany({
      where: {
        ...(role && { role: role as string }),
        ...(branchId && { branchId: branchId as string }),
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
        ...(search && {
          OR: [
            { nameAr: { contains: search as string } },
            { email: { contains: search as string } },
            { employeeId: { contains: search as string } },
          ],
        }),
      },
      include: {
        branch: { select: { id: true, nameAr: true } },
        department: { select: { id: true, nameAr: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const sanitized = users.map(({ password, ...u }) => u);
    res.json({ success: true, count: sanitized.length, data: sanitized });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id
export const getUserById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        branch: { select: { id: true, nameAr: true } },
        department: { select: { id: true, nameAr: true } },
      },
    });

    if (!user) throw new AppError('المستخدم غير موجود', 404);

    const { password, ...sanitized } = user;
    res.json({ success: true, data: sanitized });
  } catch (err) {
    next(err);
  }
};

// POST /api/users
export const createUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { employeeId, nameAr, nameEn, email, password, role, branchId, departmentId, phone } = req.body;

    if (!employeeId || !nameAr || !email || !password || !role) {
      throw new AppError('يرجى إدخال جميع البيانات المطلوبة', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        employeeId,
        nameAr,
        nameEn,
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        branchId: branchId || null,
        departmentId: departmentId || null,
        phone,
      },
    });

    const { password: _, ...sanitized } = user;
    res.status(201).json({ success: true, message: 'تم إنشاء المستخدم بنجاح', data: sanitized });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/:id
export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { nameAr, nameEn, email, role, branchId, departmentId, phone, isActive, password } = req.body;

    const updateData: any = {
      nameAr, nameEn, email: email?.toLowerCase(), role,
      branchId: branchId || null, departmentId: departmentId || null,
      phone, isActive,
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    Object.keys(updateData).forEach(k => updateData[k] === undefined && delete updateData[k]);

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    const { password: _, ...sanitized } = user;
    res.json({ success: true, message: 'تم تحديث بيانات المستخدم بنجاح', data: sanitized });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id
export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    if (id === req.user!.id) {
      throw new AppError('لا يمكنك حذف حسابك الخاص', 400);
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ success: true, message: 'تم تعطيل المستخدم بنجاح' });
  } catch (err) {
    next(err);
  }
};
