import { Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth.middleware';

export const getApprovalFlows = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const flows = await prisma.approvalFlowTemplate.findMany({
      where: { isActive: true },
      include: { steps: { orderBy: { stepOrder: 'asc' } } },
    });
    res.json({ success: true, data: flows });
  } catch (err) { next(err); }
};

export const createApprovalFlow = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, steps } = req.body;
    if (!name || !steps || steps.length === 0) {
      throw new AppError('يرجى إدخال اسم المسار وخطوات الموافقة', 400);
    }

    const flow = await prisma.approvalFlowTemplate.create({
      data: {
        name,
        description,
        steps: {
          create: steps.map((step: any, idx: number) => ({
            stepOrder: idx + 1,
            stepNameAr: step.stepNameAr,
            approverRole: step.approverRole,
            approverId: step.approverId || null,
            isRequired: step.isRequired !== false,
          })),
        },
      },
      include: { steps: { orderBy: { stepOrder: 'asc' } } },
    });

    res.status(201).json({ success: true, message: 'تم إنشاء مسار الموافقات بنجاح', data: flow });
  } catch (err) { next(err); }
};

export const updateApprovalFlow = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { name, description, isActive } = req.body;
    const flow = await prisma.approvalFlowTemplate.update({
      where: { id },
      data: { name, description, isActive },
      include: { steps: { orderBy: { stepOrder: 'asc' } } },
    });
    res.json({ success: true, message: 'تم تحديث مسار الموافقات', data: flow });
  } catch (err) { next(err); }
};
