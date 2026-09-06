import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth.middleware';

// POST /api/auth/login
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('يرجى إدخال البريد الإلكتروني وكلمة المرور', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        branch: { select: { id: true, nameAr: true, code: true } },
        department: { select: { id: true, nameAr: true } },
      },
    });

    if (!user || !user.isActive) {
      throw new AppError('البريد الإلكتروني أو كلمة المرور غير صحيحة', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('البريد الإلكتروني أو كلمة المرور غير صحيحة', 401);
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: `مرحباً ${user.nameAr}`,
      data: {
        token,
        user: userWithoutPassword,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        branch: { select: { id: true, nameAr: true, code: true } },
        department: { select: { id: true, nameAr: true } },
      },
    });

    if (!user) throw new AppError('المستخدم غير موجود', 404);

    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, data: userWithoutPassword });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/change-password
export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError('يرجى إدخال كلمة المرور الحالية والجديدة', 400);
    }

    if (newPassword.length < 8) {
      throw new AppError('يجب أن تكون كلمة المرور الجديدة 8 أحرف على الأقل', 400);
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    const isValid = await bcrypt.compare(currentPassword, user!.password);

    if (!isValid) {
      throw new AppError('كلمة المرور الحالية غير صحيحة', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { password: hashedPassword },
    });

    res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (err) {
    next(err);
  }
};
