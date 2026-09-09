import { Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth.middleware';

const generatePONumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await prisma.purchaseOrder.count();
  const seq = String(count + 1).padStart(4, '0');
  return `PO-${year}-${seq}`;
};

// GET /api/purchase-orders
export const getPurchaseOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, branchId, vendorId, search } = req.query;
    const user = req.user!;

    const whereClause: any = {
      ...(status && { status: status as string }),
      ...(branchId && { branchId: branchId as string }),
      ...(vendorId && { vendorId: vendorId as string }),
      ...(search && {
        OR: [
          { poNumber: { contains: search as string } },
          { notes: { contains: search as string } },
        ],
      }),
    };

    if (user.role === 'BRANCH_MANAGER' && !branchId) {
      whereClause.branchId = user.branchId || undefined;
    }

    const orders = await prisma.purchaseOrder.findMany({
      where: whereClause,
      include: {
        vendor: { select: { id: true, nameAr: true, nameEn: true, phone: true } },
        branch: { select: { id: true, nameAr: true, code: true, managerName: true } },
        createdBy: { select: { id: true, nameAr: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) { next(err); }
};

// GET /api/purchase-orders/:id
export const getPurchaseOrderById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const order = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        vendor: true,
        branch: true,
        createdBy: { select: { id: true, nameAr: true, role: true } },
        requisition: true,
        items: { include: { product: true } },
      },
    });
    if (!order) throw new AppError('أمر الشراء غير موجود', 404);
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
};

// POST /api/purchase-orders
export const createPurchaseOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { vendorId, branchId, requisitionId, items, notes, deliveryDate } = req.body;
    if (!vendorId || !branchId || !items || items.length === 0) {
      throw new AppError('يرجى تحديد المورد والفرع والأصناف المطلوبة', 400);
    }

    const poNumber = await generatePONumber();

    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + (Number(item.quantity) * Number(item.unitPrice));
    }, 0);

    const order = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        vendorId,
        branchId,
        requisitionId: requisitionId || null,
        createdById: req.user!.id,
        status: 'APPROVED',
        matchVerified: true,
        totalAmount,
        notes: notes || null,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            totalPrice: Number(item.quantity) * Number(item.unitPrice),
          })),
        },
      },
      include: {
        vendor: true,
        branch: true,
        items: { include: { product: true } },
      },
    });

    // إذا كان مرتبطاً بطلب احتياج، حدّث حالته
    if (requisitionId) {
      await prisma.requisition.update({
        where: { id: requisitionId },
        data: { status: 'CONVERTED_TO_PO' },
      });
    }

    res.status(201).json({ success: true, message: `تم إصدار أمر الشراء ${poNumber} بنجاح`, data: order });
  } catch (err) { next(err); }
};

// PATCH /api/purchase-orders/:id/status
export const updatePurchaseOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { status, matchVerified } = req.body;

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(matchVerified !== undefined && { matchVerified }),
      },
    });

    res.json({ success: true, message: 'تم تحديث أمر الشراء بنجاح', data: updated });
  } catch (err) { next(err); }
};
