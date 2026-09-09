import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 بدء تعبئة البيانات الأولية المحدثة للفروع...');

  // 1. الفروع المحدثة
  const branchesData = [
    {
      code: 'HQ',
      nameAr: 'المقر الرئيسي والمخزن المركزي',
      nameEn: 'Headquarters & Central Warehouse',
      address: 'الإدارة المركزية والمستودع الرئيسي',
      phone: '01000000000',
      managerName: 'م/ عبدالرحمن السعدون',
    },
    {
      code: 'SPH-01',
      nameAr: 'سباهي',
      nameEn: 'Spahi Branch',
      address: 'فرع سباهي',
      phone: '01011112222',
      managerName: 'أ/ أحمد محمود',
    },
    {
      code: 'GLM-01',
      nameAr: 'جليم 1',
      nameEn: 'Gleem 1 Branch',
      address: 'طريق الكورنيش، جليم',
      phone: '01022223333',
      managerName: 'أ/ طارق فهمي',
    },
    {
      code: 'GLM-02',
      nameAr: 'جليم 2',
      nameEn: 'Gleem 2 Branch',
      address: 'شارع أبو قير، جليم',
      phone: '01033334444',
      managerName: 'أ/ يوسف إبراهيم',
    },
    {
      code: 'RNN-01',
      nameAr: 'رنين',
      nameEn: 'Raneen Branch',
      address: 'فرع رنين الرئيسي',
      phone: '01044445555',
      managerName: 'أ/ كريم عبدالعزيز',
    },
    {
      code: 'MBR-01',
      nameAr: 'المبره',
      nameEn: 'El Mabara Branch',
      address: 'فرع المبرة',
      phone: '01055556666',
      managerName: 'أ/ سارة النجار',
    },
    {
      code: 'SLM-01',
      nameAr: 'دار السالميه',
      nameEn: 'Dar El Salmiya Branch',
      address: 'فرع دار السالمية',
      phone: '01066667777',
      managerName: 'أ/ هاني شاكر',
    },
  ];

  const createdBranches: Record<string, any> = {};

  for (const b of branchesData) {
    const branch = await prisma.branch.upsert({
      where: { code: b.code },
      update: {
        nameAr: b.nameAr,
        nameEn: b.nameEn,
        address: b.address,
        phone: b.phone,
        managerName: b.managerName,
        isActive: true,
      },
      create: b,
    });
    createdBranches[b.code] = branch;
  }

  console.log('✅ تم إنشاء وتحديث كافة الفروع الـ 7 مع أسماء المديرين بنجاح');

  // 2. إنشاء الأقسام
  const hq = createdBranches['HQ'];
  const spahi = createdBranches['SPH-01'];
  const gleem1 = createdBranches['GLM-01'];

  const deptPurchasing = await prisma.department.upsert({
    where: { id: 'dept-purchasing' },
    update: { branchId: hq.id },
    create: {
      id: 'dept-purchasing',
      nameAr: 'إدارة المشتريات المركزية',
      nameEn: 'Central Purchasing Dept',
      code: 'PURCH',
      branchId: hq.id,
    },
  });

  const deptOpsSpahi = await prisma.department.upsert({
    where: { id: 'dept-ops-spahi' },
    update: { branchId: spahi.id },
    create: {
      id: 'dept-ops-spahi',
      nameAr: 'قسم العمليات والصيانة',
      nameEn: 'Operations & Maintenance',
      code: 'OPS-SPH',
      branchId: spahi.id,
    },
  });

  const deptOpsGleem = await prisma.department.upsert({
    where: { id: 'dept-ops-gleem' },
    update: { branchId: gleem1.id },
    create: {
      id: 'dept-ops-gleem',
      nameAr: 'قسم التشغيل',
      nameEn: 'Operations',
      code: 'OPS-GLM1',
      branchId: gleem1.id,
    },
  });

  console.log('✅ تم إنشاء الأقسام التشغيلية');

  // 3. إنشاء المستخدمين
  const hashPwd = async (pwd: string) => await bcrypt.hash(pwd, 12);

  await prisma.user.upsert({
    where: { email: 'admin@elkheta.com' },
    update: { branchId: hq.id },
    create: {
      employeeId: 'EMP-001',
      nameAr: 'عبدالرحمن السعدون (الإدارة العليا)',
      nameEn: 'System Admin',
      email: 'admin@elkheta.com',
      password: await hashPwd('Admin@1234'),
      role: 'SUPER_ADMIN',
      branchId: hq.id,
      phone: '01000000001',
    },
  });

  await prisma.user.upsert({
    where: { email: 'purchase@elkheta.com' },
    update: { branchId: hq.id, departmentId: deptPurchasing.id },
    create: {
      employeeId: 'EMP-002',
      nameAr: 'أحمد الزهراني (مدير المشتريات)',
      nameEn: 'Ahmed Al-Zahrani',
      email: 'purchase@elkheta.com',
      password: await hashPwd('Purchase@1234'),
      role: 'PURCHASE_MANAGER',
      branchId: hq.id,
      departmentId: deptPurchasing.id,
      phone: '01000000002',
    },
  });

  // تحديث مديري الفروع لربطهم بالفروع الجديدة بدون تعارض في employeeId
  await prisma.user.upsert({
    where: { employeeId: 'EMP-003' },
    update: {
      nameAr: 'أحمد محمود (مدير فرع سباهي)',
      nameEn: 'Ahmed Mahmoud (Spahi Manager)',
      email: 'manager.spahi@elkheta.com',
      branchId: spahi.id,
      departmentId: deptOpsSpahi.id,
      role: 'BRANCH_MANAGER',
    },
    create: {
      employeeId: 'EMP-003',
      nameAr: 'أحمد محمود (مدير فرع سباهي)',
      nameEn: 'Ahmed Mahmoud (Spahi Manager)',
      email: 'manager.spahi@elkheta.com',
      password: await hashPwd('Manager@1234'),
      role: 'BRANCH_MANAGER',
      branchId: spahi.id,
      departmentId: deptOpsSpahi.id,
      phone: '01011112222',
    },
  });

  await prisma.user.upsert({
    where: { employeeId: 'EMP-004' },
    update: {
      nameAr: 'علي حسن (موظف فرع سباهي)',
      nameEn: 'Ali Hassan',
      email: 'employee.spahi@elkheta.com',
      branchId: spahi.id,
      departmentId: deptOpsSpahi.id,
      role: 'EMPLOYEE',
    },
    create: {
      employeeId: 'EMP-004',
      nameAr: 'علي حسن (موظف فرع سباهي)',
      nameEn: 'Ali Hassan',
      email: 'employee.spahi@elkheta.com',
      password: await hashPwd('Employee@1234'),
      role: 'EMPLOYEE',
      branchId: spahi.id,
      departmentId: deptOpsSpahi.id,
      phone: '01011112223',
    },
  });

  await prisma.user.upsert({
    where: { employeeId: 'EMP-005' },
    update: {
      nameAr: 'طارق فهمي (مدير فرع جليم 1)',
      nameEn: 'Tarek Fahmy',
      email: 'manager.gleem1@elkheta.com',
      branchId: gleem1.id,
      departmentId: deptOpsGleem.id,
      role: 'BRANCH_MANAGER',
    },
    create: {
      employeeId: 'EMP-005',
      nameAr: 'طارق فهمي (مدير فرع جليم 1)',
      nameEn: 'Tarek Fahmy',
      email: 'manager.gleem1@elkheta.com',
      password: await hashPwd('Manager@1234'),
      role: 'BRANCH_MANAGER',
      branchId: gleem1.id,
      departmentId: deptOpsGleem.id,
      phone: '01022223333',
    },
  });

  console.log('✅ تم إنشاء وتحديث المستخدمين');

  // 4. فئات الأصناف
  const catMaterials = await prisma.category.upsert({
    where: { id: 'cat-materials' },
    update: {},
    create: { id: 'cat-materials', nameAr: 'مواد خام وتشغيل', nameEn: 'Raw Materials' },
  });

  const catEquipment = await prisma.category.upsert({
    where: { id: 'cat-equipment' },
    update: {},
    create: { id: 'cat-equipment', nameAr: 'معدات وأدوات صيانة', nameEn: 'Equipment & Tools' },
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

  // 6. مسار الموافقات الافتراضي
  await prisma.approvalFlowTemplate.upsert({
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
  console.log('\n🎉 اكتملت تهيئة وتحديث قاعدة البيانات بكافة الفروع السبعة بنجاح!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
