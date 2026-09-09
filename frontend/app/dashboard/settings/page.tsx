'use client';

import { useState } from 'react';
import { useLanguageStore } from '@/store/language.store';
import {
  Settings,
  Globe,
  Building2,
  ShieldCheck,
  Database,
  CheckCircle2,
  Bell,
  Cpu,
  Save,
} from 'lucide-react';

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguageStore();
  const [saved, setSaved] = useState(false);

  const [companyInfo, setCompanyInfo] = useState({
    name: 'منظومة الخطة لإدارة الموارد',
    taxId: '100-234-567',
    currency: 'EGP (جنيه مصري)',
    fiscalYear: '2026',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600" />
          <span>{t('nav.settings')}</span>
        </h1>
        <p className="text-slate-400 text-xs mt-0.5">
          {language === 'ar'
            ? 'تخصيص لغة النظام، بيانات المؤسسة، وإعدادات المزامنة'
            : 'Customize system language, enterprise data, and synchronization settings'}
        </p>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{language === 'ar' ? 'تم حفظ الإعدادات بنجاح!' : 'Settings saved successfully!'}</span>
        </div>
      )}

      {/* Language Preference Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800">
              {language === 'ar' ? 'لغة واجهة النظام (Language)' : 'System Interface Language'}
            </h2>
            <p className="text-slate-400 text-xs">
              {language === 'ar' ? 'اختر لغة العرض واتجاه النصوص (RTL / LTR)' : 'Select display language and text direction'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => setLanguage('ar')}
            className={`p-4 rounded-xl border-2 text-right transition cursor-pointer flex items-center justify-between ${
              language === 'ar'
                ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div>
              <p className="font-bold text-sm">🇪🇬 اللغة العربية (Arabic)</p>
              <p className="text-xs text-slate-500 mt-0.5">اتجاه الكتابة من اليمين إلى اليسار (RTL)</p>
            </div>
            {language === 'ar' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
          </button>

          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`p-4 rounded-xl border-2 text-left transition cursor-pointer flex items-center justify-between ${
              language === 'en'
                ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div>
              <p className="font-bold text-sm">🇬🇧 English (US)</p>
              <p className="text-xs text-slate-500 mt-0.5">Left-to-right reading direction (LTR)</p>
            </div>
            {language === 'en' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
          </button>
        </div>
      </div>

      {/* Enterprise Information Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-9 h-9 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800">
              {language === 'ar' ? 'بيانات المنشأة والنظام' : 'Enterprise Information'}
            </h2>
            <p className="text-slate-400 text-xs">
              {language === 'ar' ? 'المعلومات العامة التي تظهر في التقارير والمستندات' : 'General details shown on reports and documents'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'ar' ? 'اسم المنظومة / الشركة' : 'Company Name'}
            </label>
            <input
              type="text"
              value={companyInfo.name}
              onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'ar' ? 'الرقم الضريبي / السجل التجاري' : 'Tax / Commercial ID'}
            </label>
            <input
              type="text"
              value={companyInfo.taxId}
              onChange={(e) => setCompanyInfo({ ...companyInfo, taxId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'ar' ? 'العملة الافتراضية' : 'Default Currency'}
            </label>
            <input
              type="text"
              value={companyInfo.currency}
              onChange={(e) => setCompanyInfo({ ...companyInfo, currency: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'ar' ? 'السنة المالية' : 'Fiscal Year'}
            </label>
            <input
              type="text"
              value={companyInfo.fiscalYear}
              onChange={(e) => setCompanyInfo({ ...companyInfo, fiscalYear: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{t('common.save')}</span>
          </button>
        </div>
      </div>

      {/* System Status & Database Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800">
              {language === 'ar' ? 'حالة قاعدة البيانات والمزامنة' : 'Database & Sync Status'}
            </h2>
            <p className="text-slate-400 text-xs">
              {language === 'ar' ? 'قاعدة البيانات المتصلة وحالة GitHub' : 'Connected Database and GitHub synchronization'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <p className="text-slate-400 font-bold">{language === 'ar' ? 'محرك قاعدة البيانات' : 'Database Engine'}</p>
            <p className="font-mono font-black text-slate-800">SQLite (dev.db) / Prisma ORM</p>
            <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-bold pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'متصل وجاهز للعمل' : 'Connected & Synced'}</span>
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <p className="text-slate-400 font-bold">{language === 'ar' ? 'مستودع GitHub المتزامن' : 'GitHub Repository'}</p>
            <p className="font-mono font-black text-blue-600 truncate">mohymen28/elkheta-erp</p>
            <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-bold pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'أحدث كود متزامن بنجاح' : 'Latest Code Synced'}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
