'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useLanguageStore } from '@/store/language.store';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuthStore();
  const { language } = useLanguageStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('erp_token') : null;
    if (!isAuthenticated && !token) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!mounted || !isAuthenticated) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">
            {language === 'ar' ? 'جاري التحقق من الصلاحيات...' : 'Verifying permissions...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
