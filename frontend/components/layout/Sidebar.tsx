'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useLanguageStore } from '@/store/language.store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  ShoppingCart,
  Warehouse,
  Wrench,
  Building2,
  Package,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard, roles: ['all'] },
  { href: '/dashboard/requisitions', labelKey: 'nav.requisitions', icon: FileText, roles: ['all'] },
  { href: '/dashboard/pending-approvals', labelKey: 'nav.pendingApprovals', icon: CheckSquare, roles: ['SUPER_ADMIN', 'PURCHASE_MANAGER', 'BRANCH_MANAGER', 'DEPARTMENT_HEAD'] },
  { href: '/dashboard/purchasing', labelKey: 'nav.purchasing', icon: ShoppingCart, roles: ['SUPER_ADMIN', 'PURCHASE_MANAGER'] },
  { href: '/dashboard/inventory', labelKey: 'nav.inventory', icon: Warehouse, roles: ['SUPER_ADMIN', 'PURCHASE_MANAGER', 'WAREHOUSE_KEEPER', 'BRANCH_MANAGER'] },
  { href: '/dashboard/maintenance', labelKey: 'nav.maintenance', icon: Wrench, roles: ['SUPER_ADMIN', 'BRANCH_MANAGER', 'EMPLOYEE'] },
  { href: '/dashboard/products', labelKey: 'nav.products', icon: Package, roles: ['SUPER_ADMIN', 'PURCHASE_MANAGER', 'WAREHOUSE_KEEPER'] },
  { href: '/dashboard/branches', labelKey: 'nav.branches', icon: Building2, roles: ['SUPER_ADMIN', 'PURCHASE_MANAGER'] },
  { href: '/dashboard/users', labelKey: 'nav.users', icon: Users, roles: ['SUPER_ADMIN'] },
  { href: '/dashboard/settings', labelKey: 'nav.settings', icon: Settings, roles: ['SUPER_ADMIN'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { language, t } = useLanguageStore();

  const filteredItems = navItems.filter((item) =>
    item.roles.includes('all') || (user?.role && item.roles.includes(user.role))
  );

  return (
    <aside className={cn(
      "w-64 bg-slate-900 text-white flex flex-col h-full shadow-2xl select-none shrink-0",
      language === 'ar' ? "border-l border-slate-800" : "border-r border-slate-800"
    )}>
      {/* Brand */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 font-bold text-white text-lg">
            {language === 'ar' ? 'خ' : 'E'}
          </div>
          <div>
            <h1 className="font-bold text-base tracking-wide text-white">{t('brand.title')}</h1>
            <p className="text-slate-400 text-xs">{t('brand.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* User Badge */}
      <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-xs">
            {user?.nameAr ? user.nameAr.charAt(0) : 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.nameAr || 'User'}</p>
            <p className="text-[11px] text-blue-400 truncate">
              {language === 'ar'
                ? (user?.branch?.nameAr || 'المقر الرئيسي')
                : (user?.branch?.nameEn || user?.branch?.nameAr || 'Headquarters')}
            </p>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group',
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                  )}
                />
                <span>{t(item.labelKey)}</span>
              </div>
              {isActive && (
                language === 'ar' ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          {t('header.connected')}
        </span>
        <span className="text-slate-400 font-mono text-[10px]">v1.2.0</span>
      </div>
    </aside>
  );
}
