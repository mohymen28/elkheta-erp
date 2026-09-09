import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'ar' | 'en';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

export const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Brand & Header
    'brand.title': 'منظومة الخطة',
    'brand.subtitle': 'نظام إدارة العمليات ERP',
    'header.title': 'نظام إدارة طلبات الاحتياج والمشتريات والمخازن',
    'header.logout': 'تسجيل الخروج',
    'header.connected': 'الخادم متصل',

    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.requisitions': 'طلبات الاحتياج',
    'nav.pendingApprovals': 'بانتظار موافقتي',
    'nav.purchasing': 'أوامر الشراء (POs)',
    'nav.inventory': 'المخازن والتحويلات',
    'nav.maintenance': 'أوامر الصيانة',
    'nav.products': 'دليل الأصناف',
    'nav.branches': 'الفروع والأقسام',
    'nav.users': 'المستخدمون والصلاحيات',
    'nav.settings': 'إعدادات النظام',

    // Dashboard
    'dashboard.welcome': 'أهلاً بك',
    'dashboard.stats.total': 'إجمالي الطلبات',
    'dashboard.stats.pending': 'قيد الاعتماد والمراجعة',
    'dashboard.stats.approved': 'طلبات معتمدة',
    'dashboard.stats.rejected': 'طلبات مرفوضة',
    'dashboard.newRequest': 'إنشاء طلب احتياج جديد',
    'dashboard.recentRequests': 'أحدث طلبات الاحتياج',
    'dashboard.viewAll': 'عرض الكل',

    // Branches
    'branches.title': 'هيكل الفروع والمخازن',
    'branches.subtitle': 'الفروع الجغرافية والمخازن التابعة لها وأسماء المديرين المسؤولين',
    'branches.add': 'إضافة فرع جديد',
    'branches.edit': 'تعديل الفرع',
    'branches.delete': 'تعطيل الفرع',
    'branches.nameAr': 'اسم الفرع (بالعربي)',
    'branches.nameEn': 'اسم الفرع (بالإنجليزي)',
    'branches.code': 'كود الفرع',
    'branches.manager': 'المدير المسؤول',
    'branches.phone': 'رقم الهاتف / التواصل',
    'branches.address': 'العنوان / الموقع',
    'branches.save': 'حفظ البيانات',
    'branches.cancel': 'إلغاء',
    'branches.employeeCount': 'موظف',
    'branches.deptCount': 'أقسام',

    // Statuses
    'status.DRAFT': 'مسودة',
    'status.PENDING': 'قيد المراجعة',
    'status.APPROVED': 'معتمد',
    'status.REJECTED': 'مرفوض',
    'status.CANCELLED': 'ملغي',
    'status.CONVERTED_TO_PO': 'تم التحويل لأمر شراء',
    'status.CONVERTED_TO_TRANSFER': 'تم التحويل لنقل مخزني',

    // Urgency
    'urgency.LOW': 'منخفض',
    'urgency.MEDIUM': 'متوسط',
    'urgency.HIGH': 'عاجل جداً',

    // Common
    'common.search': 'بحث...',
    'common.actions': 'الإجراءات',
    'common.date': 'التاريخ',
    'common.status': 'الحالة',
    'common.total': 'الإجمالي',
    'common.loading': 'جاري التحميل...',
    'common.empty': 'لا توجد بيانات متاحة حالياً',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.edit': 'تعديل',
    'common.delete': 'حذف',
    'common.close': 'إغلاق',
    'common.success': 'تمت العملية بنجاح',
    'common.error': 'حدث خطأ، يرجى المحاولة لاحقاً',
  },
  en: {
    // Brand & Header
    'brand.title': 'Elkheta System',
    'brand.subtitle': 'Operations ERP System',
    'header.title': 'Procurement, Inventory & Requisitions System',
    'header.logout': 'Logout',
    'header.connected': 'Server Connected',

    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.requisitions': 'Internal Requisitions',
    'nav.pendingApprovals': 'Pending Approvals',
    'nav.purchasing': 'Purchase Orders (POs)',
    'nav.inventory': 'Inventory & Transfers',
    'nav.maintenance': 'Maintenance Orders',
    'nav.products': 'Product Catalog',
    'nav.branches': 'Branches & Structure',
    'nav.users': 'Users & Permissions',
    'nav.settings': 'Settings',

    // Dashboard
    'dashboard.welcome': 'Welcome back',
    'dashboard.stats.total': 'Total Requests',
    'dashboard.stats.pending': 'Under Approval',
    'dashboard.stats.approved': 'Approved Requests',
    'dashboard.stats.rejected': 'Rejected Requests',
    'dashboard.newRequest': 'New Requisition Request',
    'dashboard.recentRequests': 'Recent Requisitions',
    'dashboard.viewAll': 'View All',

    // Branches
    'branches.title': 'Branches & Stores Structure',
    'branches.subtitle': 'Geographical branches, associated warehouses and assigned managers',
    'branches.add': 'Add New Branch',
    'branches.edit': 'Edit Branch',
    'branches.delete': 'Deactivate Branch',
    'branches.nameAr': 'Branch Name (Arabic)',
    'branches.nameEn': 'Branch Name (English)',
    'branches.code': 'Branch Code',
    'branches.manager': 'Assigned Manager',
    'branches.phone': 'Phone / Contact',
    'branches.address': 'Address / Location',
    'branches.save': 'Save Branch',
    'branches.cancel': 'Cancel',
    'branches.employeeCount': 'Employees',
    'branches.deptCount': 'Departments',

    // Statuses
    'status.DRAFT': 'Draft',
    'status.PENDING': 'Pending Approval',
    'status.APPROVED': 'Approved',
    'status.REJECTED': 'Rejected',
    'status.CANCELLED': 'Cancelled',
    'status.CONVERTED_TO_PO': 'Converted to PO',
    'status.CONVERTED_TO_TRANSFER': 'Converted to Transfer',

    // Urgency
    'urgency.LOW': 'Low',
    'urgency.MEDIUM': 'Medium',
    'urgency.HIGH': 'Urgent',

    // Common
    'common.search': 'Search...',
    'common.actions': 'Actions',
    'common.date': 'Date',
    'common.status': 'Status',
    'common.total': 'Total',
    'common.loading': 'Loading...',
    'common.empty': 'No data available',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.close': 'Close',
    'common.success': 'Operation completed successfully',
    'common.error': 'An error occurred, please try again',
  },
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'ar',
      setLanguage: (lang: Language) => set({ language: lang }),
      toggleLanguage: () =>
        set((state) => ({ language: state.language === 'ar' ? 'en' : 'ar' })),
      t: (key: string) => {
        const lang = get().language || 'ar';
        return translations[lang]?.[key] || key;
      },
    }),
    {
      name: 'elkheta_language_pref',
    }
  )
);
