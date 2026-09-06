import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 بدء تعبئة البيانات الأولية للنظام...');

  // 1. إنشاء الفروع
  const mainBranch = await prisma.branch.upsert({
    where: { code: 'HQ' },
    update: {},
    create: {
      nameAr: 'المقر الرئيسي (الرياض)',
      nameEn: 'Headquarters',
      code: 'HQ',
      address: 'طريق الملك فهد، الرياض، المملكة العربية السعودية',
      phone: '0112345678',
    },
  });

  const branchRiyadh = await prisma.branch.upsert({
    where: { code: 'BR-01' },
    update: {},
    create: {
      nameAr: 'فرع الرياض - العليا',
      nameEn: 'Riyadh Branch - Olaya',
      code: 'BR-01',
      address: 'حي العليا، الرياض',
      phone: '0119876543',
    },
  });

  const branchJeddah = await prisma.branch.upsert({
    where: { code: 'BR-02' },
    update: {},
    create: {
      nameAr: 'فرع جدة - الروضة',
      nameEn: 'Jeddah Branch - Rawdah',
      code: 'BR-02',
      address: 'حي الروضة، جدة',
      phone: '0122345678',
    },
  });

  console.log('✅ تم إنشاء الفروع الثلاثة');

  // 2. إنشاء الأقسام
  const deptPurchasing = await prisma.department.upsert({
    where: { id: 'dept-purchasing' },
    update: {},
    create: {
      id: 'dept-purchasing',
      nameAr: 'إدارة المشتريات المركزية',
      nameEn: 'Central Purchasing Dept',
      code: 'PURCH',
      branchId: mainBranch.id,
    },
  });

  const deptOps1 = await prisma.department.upsert({
    where: { id: 'dept-ops-1' },
    update: {},
    create: {
      id: 'dept-ops-1',
      nameAr: 'قسم التشغيل والصيانة',
      nameEn: 'Operations & Maintenance',
      code: 'OPS-01',
      branchId: branchRiyadh.id,
    },
  });

  const deptOps2 = await prisma.department.upsert({
    where: { id: 'dept-ops-2' },
    update: {},
    create: {
      id: 'dept-ops-2',
      nameAr: 'قسم العمليات والمخازن',
      nameEn: 'Operations & Warehouse',
      code: 'OPS-02',
      branchId: branchJeddah.id,
    },
  });

  console.log('✅ تم إنشاء الأقسام التشغيلية');

  // 3. إنشاء المستخدمين
  const hashPwd = async (pwd: string) => await bcrypt.hash(pwd, 12);

  await prisma.user.upsert({
    where: { email: 'admin@elkheta.com' },
    update: {},
    create: {
      employeeId: 'EMP-001',
      nameAr: 'عبدالرحمن السعدون (الإدارة العليا)',
      nameEn: 'System Admin',
      email: 'admin@elkheta.com',
      password: await hashPwd('Admin@1234'),
      role: 'SUPER_ADMIN',
      branchId: mainBranch.id,
      phone: '0500000001',
    },
  });

  await prisma.user.upsert({
    where: { email: 'purchase@elkheta.com' },
    update: {},
    create: {
      employeeId: 'EMP-002',
      nameAr: 'أحمد الزهراني (مدير المشتريات)',
      nameEn: 'Ahmed Al-Zahrani',
      email: 'purchase@elkheta.com',
      password: await hashPwd('Purchase@1234'),
      role: 'PURCHASE_MANAGER',
      branchId: mainBranch.id,
      departmentId: deptPurchasing.id,
      phone: '0500000002',
    },
  });

  await prisma.user.upsert({
    where: { email: 'manager.riyadh@elkheta.com' },
    update: {},
    create: {
      employeeId: 'EMP-003',
      nameAr: 'محمد العتيبي (مدير فرع الرياض)',
      nameEn: 'Mohammed Al-Otaibi',
      email: 'manager.riyadh@elkheta.com',
      password: await hashPwd('Manager@1234'),
      role: 'BRANCH_MANAGER',
      branchId: branchRiyadh.id,
      departmentId: deptOps1.id,
      phone: '0500000003',
    },
  });

  await prisma.user.upsert({
    where: { email: 'employee.riyadh@elkheta.com' },
    update: {},
    create: {
      employeeId: 'EMP-004',
      nameAr: 'خالد الدوسري (موظف فرع الرياض)',
      nameEn: 'Khalid Al-Dosari',
      email: 'employee.riyadh@elkheta.com',
      password: await hashPwd('Employee@1234'),
      role: 'EMPLOYEE',
      branchId: branchRiyadh.id,
      departmentId: deptOps1.id,
      phone: '0500000004',
    },
  });

  await prisma.user.upsert({
    where: { email: 'manager.jeddah@elkheta.com' },
    update: {},
    create: {
      employeeId: 'EMP-005',
      nameAr: 'عبدالله القحطاني (مدير فرع جدة)',
      nameEn: 'Abdullah Al-Qahtani',
      email: 'manager.jeddah@elkheta.com',
      password: await hashPwd('Manager@1234'),
      role: 'BRANCH_MANAGER',
      branchId: branchJeddah.id,
      departmentId: deptOps2.id,
      phone: '0500000005',
    },
  });

  console.log('✅ تم إنشاء المستخدمين بمختلف الصلاحيات والأدوار');

  // 4. فئات الأصناف
  const catMaterials = await prisma.category.upsert({
    where: { id: 'cat-materials' },
    update: {},
    create: { id: 'cat-materials', nameAr: 'مواد خام وتشغيل', nameEn: 'Raw Materials' },
  });

  const catEquipment = await prisma.category.upsert({
    where: { id: 'cat-equipment' },
    update: {},
    create: { id: 'cat-equipment', nameAr: 'معدات وأدوات صيانة', nameEn: 'Equipment & Maintenance Tools' },
  });

  const catSpares = await prisma.category.upsert({
    where: { id: 'cat-spares' },
    update: {},
    create: { id: 'cat-spares', nameAr: 'قطع غيار آلات ومعدات', nameEn: 'Spare Parts' },
  });

  const catOffice = await prisma.category.upsert({
    where: { id: 'cat-office' },
    update: {},
    create: { id: 'cat-office', nameAr: 'مستلزمات مكتبية وتقنية', nameEn: 'Office & IT Supplies' },
  });

  console.log('✅ تم إنشاء الفئات الرئيسية');

  // 5. الأصناف
  await prisma.product.upsert({
    where: { code: 'PRD-001' },
    update: {},
    create: { nameAr: 'ورق طباعة ممتاز A4 (80g)', nameEn: 'Premium A4 Paper (80g)', code: 'PRD-001', unit: 'كرتون (5 رزم)', categoryId: catOffice.id, minStock: 10 },
  });

  await prisma.product.upsert({
    where: { code: 'PRD-002' },
    update: {},
    create: { nameAr: 'حبر طابعة ليزر أسود HP 85A', nameEn: 'HP 85A Black Toner Cartridge', code: 'PRD-002', unit: 'علبة', categoryId: catOffice.id, minStock: 5 },
  });

  await prisma.product.upsert({
    where: { code: 'PRD-003' },
    update: {},
    create: { nameAr: 'دريل / مفك براغي شحن كهربائي Bosch', nameEn: 'Bosch Cordless Screwdriver Drill', code: 'PRD-003', unit: 'طقم', categoryId: catEquipment.id, minStock: 2 },
  });

  await prisma.product.upsert({
    where: { code: 'PRD-004' },
    update: {},
    create: { nameAr: 'زيت تشحيم هيدروليكي صناعي 68', nameEn: 'Hydraulic Industrial Oil 68', code: 'PRD-004', unit: 'برميل (20 لتر)', categoryId: catMaterials.id, minStock: 15 },
  });

  await prisma.product.upsert({
    where: { code: 'PRD-005' },
    update: {},
    create: { nameAr: 'فلتر هواء لوحدات التكييف المركزية', nameEn: 'Central AC Heavy Duty Air Filter', code: 'PRD-005', unit: 'قطعة', categoryId: catSpares.id, minStock: 6 },
  });

  console.log('✅ تم إنشاء الأصناف في الدليل');

  // 6. مسار الموافقات الافتراضي (Approval Flow)
  const defaultFlow = await prisma.approvalFlowTemplate.upsert({
    where: { id: 'flow-standard' },
    update: {},
    create: {
      id: 'flow-standard',
      name: 'مسار المشتريات القياسي (مدير الفرع ⬅️ مدير المشتريات)',
      description: 'يمر الطلب أولاً على مدير الفرع للاعتماد ثم على مدير المشتريات المركزي',
      steps: {
        create: [
          { stepOrder: 1, stepNameAr: 'موافقة واعتماد مدير الفرع', approverRole: 'BRANCH_MANAGER', isRequired: true },
          { stepOrder: 2, stepNameAr: 'موافقة واعتماد مدير المشتريات', approverRole: 'PURCHASE_MANAGER', isRequired: true },
        ],
      },
    },
  });

  console.log('✅ تم إنشاء مسار الموافقات القياسي');

  // 7. إنشاء طلب احتياج تجريبي لإظهار الواجهة ممتلئة
  const emp = await prisma.user.findUnique({ where: { email: 'employee.riyadh@elkheta.com' } });
  const prod1 = await prisma.product.findUnique({ where: { code: 'PRD-001' } });
  const prod2 = await prisma.product.findUnique({ where: { code: 'PRD-002' } });

  if (emp && prod1 && prod2) {
    const existingReq = await prisma.requisition.findFirst({ where: { requisitionNo: 'REQ-2026-0001' } });
    if (!existingReq) {
      await prisma.requisition.create({
        data: {
          requisitionNo: 'REQ-2026-0001',
          title: 'طلب مستلزمات مكتبية وأحبار لفرع الرياض',
          type: 'PURCHASE',
          urgency: 'MEDIUM',
          status: 'PENDING',
          notes: 'مطلوبة لبدء الدورة المستندية للشهر الجديد',
          justification: 'نفاد مخزون الورق والأحبار في قسم الاستقبال والعمليات بالفرع',
          createdById: emp.id,
          branchId: branchRiyadh.id,
          departmentId: deptOps1.id,
          flowTemplateId: defaultFlow.id,
          currentStep: 1,
          estimatedTotal: 1250,
          items: {
            create: [
              { productId: prod1.id, quantity: 10, unit: prod1.unit, estimatedPrice: 75, totalPrice: 750 },
              { productId: prod2.id, quantity: 2, unit: prod2.unit, estimatedPrice: 250, totalPrice: 500 },
            ],
          },
        },
      });
      console.log('✅ تم إنشاء طلب احتياج تجريبي معتمد في الخطوة الأولى');
    }
  }

  console.log('\n🎉 اكتملت تهيئة وتعبئة قاعدة البيانات بنجاح!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
