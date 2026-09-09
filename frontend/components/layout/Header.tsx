'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore, roleLabels } from '@/store/auth.store';
import { useLanguageStore } from '@/store/language.store';
import { LogOut, User, ShieldCheck, Globe } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuthStore();
  const { language, toggleLanguage, t } = useLanguageStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const todayStr = new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
      <div>
        <h2 className="text-slate-800 font-bold text-base">{t('header.title')}</h2>
        <p className="text-slate-400 text-xs mt-0.5">{todayStr}</p>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {/* Language Switcher Button */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 px-3 py-1.5 rounded-xl border border-slate-200 transition text-xs font-bold shadow-sm cursor-pointer"
          title={language === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
        >
          <Globe className="w-4 h-4 text-blue-600" />
          <span>{language === 'ar' ? 'English (EN)' : 'العربية (AR)'}</span>
        </button>

        {/* User Role Tag */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-medium">{user?.role ? roleLabels[user.role] : 'User'}</span>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 border-x border-slate-200 px-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">
            <User className="w-4 h-4" />
          </div>
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-slate-800 leading-tight">{user?.nameAr}</p>
            <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{user?.email}</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          title={t('header.logout')}
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
