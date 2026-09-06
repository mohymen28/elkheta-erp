import { Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth.middleware';

// Helper: توليد رقم الطلب التلقائي
const generateRequisitionNo = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await prisma.requisition.count({
    where: { requisitionNo: { startsWith: `REQ-${year}` } },
  });
  const seq = String(count + 1).padStart(4, '0');
  return `REQ-${year}-${seq}`;
};

// POST /api/requisitions
export const createRequisition = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      title, type, urgency, notes, justification,
      requiredDate, flowTemplateId, items,
    } = req.body;

    if (!title || !items || items.length === 0) {
      throw new AppError('يرجى إدخال عنوان الطلب وبنود الأصناف المطلوبة', 400);
    }

    const user = req.user!;
    if (!user.branchId) {
      throw new AppError('يجب أن يكون المستخدم مرتبطاً بفرع لإنشاء طلب احتياج', 400);
    }

    const requisitionNo = await generateRequisitionNo();

    // حساب الإجمالي التقديري
    const estimatedTotal = items.reduce((sum: number, item: any) => {
      return sum + (Number(item.quantity) * (Number(item.estimatedPrice) || 0));
    }, 0);

    const requisition = await prisma.requisition.create({
      data: {
        requisitionNo,
        title,
        type: type || 'PURCHASE',
        urgency: urgency || 'MEDIUM',
        status: 'DRAFT',
        notes,
        justification,
        requiredDate: requiredDate ? new Date(requiredDate) : null,
        flowTemplateId: flowTemplateId || null,
        createdById: user.id,
        branchId: user.branchId,
        departmentId: user.departmentId || null,
        estimatedTotal,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            description: item.description || null,
            quantity: Number(item.quantity),
            unit: item.unit,
            estimatedPrice: item.estimatedPrice ? Number(item.estimatedPrice) : null,
            totalPrice: Number(item.quantity) * (Number(item.estimatedPrice) || 0),
            notes: item.notes || null,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        createdBy: { select: { id: true, nameAr: true, role: true } },
        branch: { select: { id: true, nameAr: true } },
        department: { select: { id: true, nameAr: true } },
        flowTemplate: true,
      },
    });

    res.status(201).json({
      success: true,
      message: `تم إنشاء طلب الاحتياج ${requisitionNo} بنجاح`,
      data: requisition,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/requisitions
export const getRequisitions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, branchId, urgency, type, search, page = '1', limit = '20' } = req.query;
    const user = req.user!;

    const whereClause: any = {
      ...(status && { status: status as string }),
      ...(urgency && { urgency: urgency as string }),
      ...(type && { type: type as string }),
      ...(search && {
        OR: [
          { title: { contains: search as string } },
          { requisitionNo: { contains: search as string } },
        ],
      }),
    };

    if (user.role === 'EMPLOYEE') {
      whereClause.createdById = user.id;
    } else if (user.role === 'BRANCH_MANAGER' || user.role === 'DEPARTMENT_HEAD') {
      whereClause.branchId = user.branchId || undefined;
      if (branchId) whereClause.branchId = branchId as string;
    } else {
      if (branchId) whereClause.branchId = branchId as string;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [total, requisitions] = await Promise.all([
      prisma.requisition.count({ where: whereClause }),
      prisma.requisition.findMany({
        where: whereClause,
        include: {
          items: { include: { product: true } },
          createdBy: { select: { id: true, nameAr: true, role: true } },
          branch: { select: { id: true, nameAr: true } },
          department: { select: { id: true, nameAr: true } },
          _count: { select: { approvalLogs: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    res.json({
      success: true,
      data: requisitions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/requisitions/:id
export const getRequisitionById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const requisition = await prisma.requisition.findUnique({
      where: { id },
      include: {
        items: { include: { product: { include: { category: true } } } },
        createdBy: { select: { id: true, nameAr: true, role: true, email: true } },
        branch: true,
        department: true,
        flowTemplate: { include: { steps: { orderBy: { stepOrder: 'asc' } } } },
        approvalLogs: {
          include: { approver: { select: { id: true, nameAr: true, role: true } } },
          orderBy: { actionAt: 'asc' },
        },
      },
    });

    if (!requisition) throw new AppError('طلب الاحتياج غير موجود', 404);

    res.json({ success: true, data: requisition });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/requisitions/:id/submit
export const submitRequisition = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const requisition = await prisma.requisition.findUnique({
      where: { id },
    });

    if (!requisition) throw new AppError('طلب الاحتياج غير موجود', 404);
    if (requisition.createdById !== req.user!.id && req.user!.role !== 'SUPER_ADMIN') {
      throw new AppError('ليس لديك صلاحية لهذا الطلب', 403);
    }
    if (requisition.status !== 'DRAFT') {
      throw new AppError('يمكن إرسال الطلبات في مرحلة المسودة فقط', 400);
    }

    const updated = await prisma.requisition.update({
      where: { id },
      data: { status: 'PENDING', currentStep: 1 },
    });

    res.json({ success: true, message: 'تم إرسال الطلب للموافقة بنجاح', data: updated });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/requisitions/:id/approve
export const approveRequisition = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { comments } = req.body;
    const user = req.user!;

    const requisition = await prisma.requisition.findUnique({
      where: { id },
      include: {
        flowTemplate: {
          include: { steps: { orderBy: { stepOrder: 'asc' } } },
        },
      },
    });

    if (!requisition) throw new AppError('طلب الاحتياج غير موجود', 404);
    if (requisition.status !== 'PENDING') {
      throw new AppError('هذا الطلب لا يقبل الموافقة في وضعه الحالي', 400);
    }

    const steps = requisition.flowTemplate?.steps || [];
    const currentStepDef = steps.find((s: any) => s.stepOrder === requisition.currentStep);

    if (currentStepDef) {
      if (currentStepDef.approverRole !== user.role && user.role !== 'SUPER_ADMIN') {
        throw new AppError(`هذه الخطوة تتطلب موافقة بدور: ${currentStepDef.approverRole}`, 403);
      }
    }

    await prisma.approvalLog.create({
      data: {
        requisitionId: requisition.id,
        approverId: user.id,
        stepOrder: requisition.currentStep,
        stepNameAr: currentStepDef?.stepNameAr || 'موافقة',
        action: 'APPROVED',
        comments,
      },
    });

    const nextStep = steps.find((s: any) => s.stepOrder === requisition.currentStep + 1);
    let newStatus: string;
    let newStep = requisition.currentStep;

    if (nextStep) {
      newStep = requisition.currentStep + 1;
      newStatus = 'PENDING';
    } else {
      newStatus = 'APPROVED';
    }

    const updated = await prisma.requisition.update({
      where: { id },
      data: { status: newStatus, currentStep: newStep },
    });

    const message = newStatus === 'APPROVED'
      ? '✅ تم اعتماد الطلب نهائياً'
      : `✅ تمت الموافقة - انتقل الطلب للمرحلة التالية (الخطوة ${newStep})`;

    res.json({ success: true, message, data: updated });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/requisitions/:id/reject
export const rejectRequisition = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { comments } = req.body;
    const user = req.user!;

    if (!comments) throw new AppError('يرجى إدخال سبب الرفض', 400);

    const requisition = await prisma.requisition.findUnique({
      where: { id },
      include: {
        flowTemplate: { include: { steps: true } },
      },
    });

    if (!requisition) throw new AppError('طلب الاحتياج غير موجود', 404);
    if (requisition.status !== 'PENDING') {
      throw new AppError('هذا الطلب لا يمكن رفضه في وضعه الحالي', 400);
    }

    const currentStepDef = requisition.flowTemplate?.steps.find(
      (s: any) => s.stepOrder === requisition.currentStep
    );

    await prisma.approvalLog.create({
      data: {
        requisitionId: requisition.id,
        approverId: user.id,
        stepOrder: requisition.currentStep,
        stepNameAr: currentStepDef?.stepNameAr || 'مراجعة',
        action: 'REJECTED',
        comments,
      },
    });

    const updated = await prisma.requisition.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    res.json({ success: true, message: '❌ تم رفض الطلب', data: updated });
  } catch (err) {
    next(err);
  }
};

// GET /api/requisitions/pending-approvals
export const getPendingApprovals = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;

    const allPending = await prisma.requisition.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        items: true,
        createdBy: { select: { id: true, nameAr: true, role: true } },
        branch: { select: { id: true, nameAr: true } },
        department: { select: { id: true, nameAr: true } },
        flowTemplate: { include: { steps: { orderBy: { stepOrder: 'asc' } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const matching = allPending.filter((reqItem) => {
      if (user.role === 'SUPER_ADMIN') return true;
      const steps = reqItem.flowTemplate?.steps || [];
      const currentStepDef = steps.find((s: any) => s.stepOrder === reqItem.currentStep);
      return currentStepDef?.approverRole === user.role;
    });

    res.json({ success: true, count: matching.length, data: matching });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/requisitions/:id/cancel
export const cancelRequisition = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const requisition = await prisma.requisition.findUnique({
      where: { id },
    });

    if (!requisition) throw new AppError('طلب الاحتياج غير موجود', 404);

    const canCancel =
      requisition.createdById === req.user!.id ||
      ['SUPER_ADMIN', 'PURCHASE_MANAGER'].includes(req.user!.role);

    if (!canCancel) throw new AppError('ليس لديك صلاحية لإلغاء هذا الطلب', 403);

    await prisma.requisition.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    res.json({ success: true, message: 'تم إلغاء الطلب' });
  } catch (err) {
    next(err);
  }
};

// GET /api/requisitions/stats
export const getRequisitionStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const branchFilter = user.role === 'EMPLOYEE' || user.role === 'BRANCH_MANAGER'
      ? { branchId: user.branchId || undefined }
      : {};

    const [total, draft, pending, approved, rejected] = await Promise.all([
      prisma.requisition.count({ where: branchFilter }),
      prisma.requisition.count({ where: { ...branchFilter, status: 'DRAFT' } }),
      prisma.requisition.count({ where: { ...branchFilter, status: 'PENDING' } }),
      prisma.requisition.count({ where: { ...branchFilter, status: 'APPROVED' } }),
      prisma.requisition.count({ where: { ...branchFilter, status: 'REJECTED' } }),
    ]);

    res.json({
      success: true,
      data: { total, draft, pending, approved, rejected },
    });
  } catch (err) {
    next(err);
  }
};
