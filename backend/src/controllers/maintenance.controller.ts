import { Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth.middleware';

const generateOrderNo = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await prisma.maintenanceOrder.count();
  const seq = String(count + 1).padStart(4, '0');
  return `WO-${year}-${seq}`;
};

// GET /api/maintenance/orders
export const getMaintenanceOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { branchId, status, priority } = req.query;
    const orders = await prisma.maintenanceOrder.findMany({
      where: {
        ...(branchId && { branchId: branchId as string }),
        ...(status && { status: status as string }),
        ...(priority && { priority: priority as string }),
      },
      include: {
        branch: { select: { id: true, nameAr: true, code: true, managerName: true } },
        createdBy: { select: { id: true, nameAr: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) { next(err); }
};

// POST /api/maintenance/orders
export const createMaintenanceOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { branchId, assetName, type, priority, description, technician, sparePartsNeeded, cost } = req.body;
    if (!branchId || !assetName) {
      throw new AppError('يرجى تحديد الفرع والمعدة / الأصل', 400);
    }

    const orderNo = await generateOrderNo();

    const order = await prisma.maintenanceOrder.create({
      data: {
        orderNo,
        branchId,
        createdById: req.user!.id,
        assetName,
        type: type || 'PREVENTIVE',
        priority: priority || 'MEDIUM',
        description: description || null,
        technician: technician || null,
        sparePartsNeeded: sparePartsNeeded || null,
        cost: cost ? Number(cost) : 0,
        status: 'IN_PROGRESS',
      },
      include: { branch: true },
    });

    res.status(201).json({ success: true, message: `تم فتح أمر الصيانة ${orderNo} بنجاح`, data: order });
  } catch (err) { next(err); }
};

// PATCH /api/maintenance/orders/:id/status
export const updateMaintenanceOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { status, cost, technician } = req.body;

    const updated = await prisma.maintenanceOrder.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(cost !== undefined && { cost: Number(cost) }),
        ...(technician && { technician }),
      },
    });

    res.json({ success: true, message: 'تم تحديث أمر الصيانة', data: updated });
  } catch (err) { next(err); }
};

// GET /api/maintenance/contracts
export const getMaintenanceContracts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const contracts = await prisma.maintenanceContract.findMany({
      orderBy: { expiryDate: 'asc' },
    });
    res.json({ success: true, count: contracts.length, data: contracts });
  } catch (err) { next(err); }
};

// POST /api/maintenance/contracts
export const createMaintenanceContract = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { contractNo, title, serviceProvider, scope, annualCost, startDate, expiryDate } = req.body;
    if (!contractNo || !title || !serviceProvider || !expiryDate) {
      throw new AppError('يرجى إدخال جميع بيانات العقد وتاريخ الانتهاء', 400);
    }

    const contract = await prisma.maintenanceContract.create({
      data: {
        contractNo,
        title,
        serviceProvider,
        scope: scope || null,
        annualCost: annualCost ? Number(annualCost) : 0,
        startDate: startDate ? new Date(startDate) : null,
        expiryDate: new Date(expiryDate),
        status: 'ACTIVE',
      },
    });

    res.status(201).json({ success: true, message: 'تم حفظ عقد الصيانة بنجاح', data: contract });
  } catch (err) { next(err); }
};
