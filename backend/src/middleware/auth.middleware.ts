import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import prisma from '../utils/prisma';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    branchId?: string | null;
    departmentId?: string | null;
    nameAr: string;
  };
}

// Middleware للتحقق من JWT Token
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('غير مصرح لك بالوصول - يرجى تسجيل الدخول', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key') as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId, isActive: true },
      select: {
        id: true,
        email: true,
        role: true,
        branchId: true,
        departmentId: true,
        nameAr: true,
      },
    });

    if (!user) {
      throw new AppError('المستخدم غير موجود أو تم تعطيله', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return next(new AppError('رمز المصادقة غير صالح', 401));
    }
    if (err instanceof jwt.TokenExpiredError) {
      return next(new AppError('انتهت صلاحية الجلسة - يرجى تسجيل الدخول مجدداً', 401));
    }
    next(err);
  }
};

// Middleware للتحقق من الصلاحيات (RBAC)
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('غير مصرح لك بالوصول', 401));
    }
    if (!roles.includes(req.user.role) && req.user.role !== 'SUPER_ADMIN') {
      return next(new AppError('ليس لديك صلاحية للقيام بهذا الإجراء', 403));
    }
    next();
  };
};
