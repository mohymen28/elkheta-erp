import { Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth.middleware';

const generateTransferNo = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await prisma.stockTransfer.count();
  const seq = String(count + 1).padStart(4, '0');
  return `TR-${year}-${seq}`;
};

// GET /api/inventory/stocks
export const getStockBalances = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { branchId, productId, lowStockOnly } = req.query;

    const stocks = await prisma.stock.findMany({
      where: {
        ...(branchId && { branchId: branchId as string }),
        ...(productId && { productId: productId as string }),
      },
      include: {
        branch: { select: { id: true, nameAr: true, code: true, managerName: true } },
        product: { select: { id: true, nameAr: true, nameEn: true, code: true, unit: true, minStock: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const result = lowStockOnly === 'true'
      ? stocks.filter(s => s.quantity <= (s.minStock || s.product.minStock))
      : stocks;

    res.json({ success: true, count: result.length, data: result });
  } catch (err) { next(err); }
};

// POST /api/inventory/stocks
export const updateStock = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { branchId, productId, quantity, minStock } = req.body;
    if (!branchId || !productId || quantity === undefined) {
      throw new AppError('يرجى تحديد الفرع والصنف والكمية', 400);
    }

    const stock = await prisma.stock.upsert({
      where: { branchId_productId: { branchId, productId } },
      update: {
        quantity: Number(quantity),
        ...(minStock !== undefined && { minStock: Number(minStock) }),
      },
      create: {
        branchId,
        productId,
        quantity: Number(quantity),
        minStock: Number(minStock || 0),
      },
      include: { branch: true, product: true },
    });

    res.json({ success: true, message: 'تم تحديث رصيد المخزن بنجاح', data: stock });
  } catch (err) { next(err); }
};

// GET /api/inventory/transfers
export const getTransfers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, branchId } = req.query;
    const whereClause: any = {
      ...(status && { status: status as string }),
      ...(branchId && {
        OR: [
          { fromBranchId: branchId as string },
          { toBranchId: branchId as string },
        ],
      }),
    };

    const transfers = await prisma.stockTransfer.findMany({
      where: whereClause,
      include: {
        fromBranch: { select: { id: true, nameAr: true, code: true, managerName: true } },
        toBranch: { select: { id: true, nameAr: true, code: true, managerName: true } },
        createdBy: { select: { id: true, nameAr: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, count: transfers.length, data: transfers });
  } catch (err) { next(err); }
};

// POST /api/inventory/transfers
export const createTransfer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { fromBranchId, toBranchId, items, notes } = req.body;
    if (!fromBranchId || !toBranchId || !items || items.length === 0) {
      throw new AppError('يرجى تحديد المخزن المرسل والمستلم والأصناف', 400);
    }
    if (fromBranchId === toBranchId) {
      throw new AppError('لا يمكن التحويل لنفس المخزن', 400);
    }

    const transferNo = await generateTransferNo();

    const transfer = await prisma.stockTransfer.create({
      data: {
        transferNo,
        fromBranchId,
        toBranchId,
        createdById: req.user!.id,
        status: 'IN_TRANSIT',
        notes: notes || null,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: Number(item.quantity),
          })),
        },
      },
      include: {
        fromBranch: true,
        toBranch: true,
        items: { include: { product: true } },
      },
    });

    // خصم الكميات مبدئياً من المخزن المرسل
    for (const it of items) {
      await prisma.stock.upsert({
        where: { branchId_productId: { branchId: fromBranchId, productId: it.productId } },
        update: { quantity: { decrement: Number(it.quantity) } },
        create: { branchId: fromBranchId, productId: it.productId, quantity: 0 },
      });
    }

    res.status(201).json({ success: true, message: `تم إصدار إذن التحويل ${transferNo} بنجاح`, data: transfer });
  } catch (err) { next(err); }
};

// PATCH /api/inventory/transfers/:id/status
export const updateTransferStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body; // DELIVERED, CANCELLED

    const transfer = await prisma.stockTransfer.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!transfer) throw new AppError('إذن التحويل غير موجود', 404);

    if (status === 'DELIVERED' && transfer.status !== 'DELIVERED') {
      // إضافة الكميات للمخزن المستلم
      for (const it of transfer.items) {
        await prisma.stock.upsert({
          where: { branchId_productId: { branchId: transfer.toBranchId, productId: it.productId } },
          update: { quantity: { increment: it.quantity } },
          create: { branchId: transfer.toBranchId, productId: it.productId, quantity: it.quantity },
        });
      }
    }

    const updated = await prisma.stockTransfer.update({
      where: { id },
      data: { status },
    });

    res.json({ success: true, message: 'تم تحديث حالة إذن التحويل', data: updated });
  } catch (err) { next(err); }
};
