'use client';

import { useState } from 'react';
import { useLanguageStore } from '@/store/language.store';
import {
  Wrench,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Building2,
  Cpu,
} from 'lucide-react';

export default function MaintenancePage() {
  const { language, t } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'contracts'>('orders');
  const [search, setSearch] = useState('');

  const workOrders = [
    {
      id: 'WO-2026-001',
      branch: 'سباهي',
      branchEn: 'Spahi',
      asset: 'وحدة التكييف المركزي رقم 2',
      assetEn: 'Central AC Unit #2',
      type: 'صيانة طارئة',
      typeEn: 'Emergency Repair',
      technician: 'شركة النيل للتبريد (جهة خارجية)',
      sparePartsNeeded: 'فلتر هواء + سير مروحة',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      date: '2026-09-08',
    },
    {
      id: 'WO-2026-002',
      branch: 'جليم 1',
      branchEn: 'Gleem 1',
      asset: 'لوحة التوزيع الكهربائي الرئيسية',
      assetEn: 'Main Electric Distribution Board',
      type: 'صيانة وقائية دورية',
      typeEn: 'Periodic Preventive',
      technician: 'فني الصيانة الداخلي',
      sparePartsNeeded: 'قواطع كهربائية 32A',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      date: '2026-09-07',
    },
    {
      id: 'WO-2026-003',
      branch: 'دار السالميه',
      branchEn: 'Dar El Salmiya',
      asset: 'طابعة الباركود ونقاط البيع',
      assetEn: 'POS Barcode Printer',
      type: 'صيانة معدات',
      typeEn: 'Equipment Repair',
      technician: 'فني الدعم الفني',
      sparePartsNeeded: 'رأس حراري للطباعة',
      status: 'PENDING',
      priority: 'MEDIUM',
      date: '2026-09-09',
    },
  ];

  const contracts = [
    {
      contractNo: 'CNT-2026-01',
      serviceProvider: 'شركة النيل للتبريد والتكييف',
      scope: 'صيانة دورية للتكييفات بكافة الفروع الـ 7',
      expiryDate: '2027-01-15',
      annualCost: 48000,
      status: 'ACTIVE',
    },
    {
      contractNo: 'CNT-2026-02',
      serviceProvider: 'مؤسسة السلامة لأنظمة مكافحة الحريق',
      scope: 'فحص وتعبئة طفايات الحريق وخراطيم الطوارئ',
      expiryDate: '2026-12-31',
      annualCost: 22000,
      status: 'EXPIRING_SOON',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-blue-600" />
            <span>{language === 'ar' ? 'إدارة صيانة الفروع والأصول' : 'Branch Maintenance & Asset Management'}</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            {language === 'ar'
              ? 'متابعة أوامر الصيانة الدورية والطارئة للفروع وربطها بسحب قطع الغيار وعقود الصيانة'
              : 'Track preventive and emergency work orders, spare parts requisition, and service contracts'}
          </p>
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>{language === 'ar' ? 'فتح أمر صيانة جديد' : 'New Maintenance Order'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {language === 'ar' ? 'أوامر الصيانة الحالية (Work Orders)' : 'Active Work Orders'}
        </button>
        <button
          onClick={() => setActiveTab('contracts')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeTab === 'contracts'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {language === 'ar' ? 'عقود الصيانة الدورية وتنبيهات التجديد' : 'Maintenance Contracts & Renewals'}
        </button>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {activeTab === 'orders' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'رقم الأمر' : 'Order No'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'الفرع' : 'Branch'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'المعدة / الأصل' : 'Asset / Equipment'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'نوع الصيانة' : 'Type'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'قطع الغيار المطلوبة' : 'Spare Parts Required'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'جهة التنفيذ' : 'Technician'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workOrders.map((wo) => (
                  <tr key={wo.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{wo.id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {language === 'ar' ? wo.branch : wo.branchEn}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {language === 'ar' ? wo.asset : wo.assetEn}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        wo.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {language === 'ar' ? wo.type : wo.typeEn}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{wo.sparePartsNeeded}</td>
                    <td className="py-3.5 px-4 text-slate-500">{wo.technician}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        wo.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                        wo.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {wo.status === 'COMPLETED' ? (language === 'ar' ? 'تم الإصلاح' : 'Completed') :
                         wo.status === 'IN_PROGRESS' ? (language === 'ar' ? 'جاري العمل' : 'In Progress') :
                         (language === 'ar' ? 'بانتظار قطع الغيار' : 'Pending Parts')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'رقم العقد' : 'Contract No'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'الشركة مقدمة الخدمة' : 'Service Provider'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'نطاق الصيانة' : 'Scope'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'تاريخ التجديد / الانتهاء' : 'Expiry Date'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'التكلفة السنوية' : 'Annual Cost'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'حالة العقد' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contracts.map((c) => (
                  <tr key={c.contractNo} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{c.contractNo}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{c.serviceProvider}</td>
                    <td className="py-3.5 px-4 text-slate-600">{c.scope}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{c.expiryDate}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{c.annualCost.toLocaleString()} EGP</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        c.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800 animate-pulse'
                      }`}>
                        {c.status === 'ACTIVE' ? (language === 'ar' ? 'ساري ونشط' : 'Active') : (language === 'ar' ? 'يقترب من موعد التجديد ⚠️' : 'Expiring Soon ⚠️')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
