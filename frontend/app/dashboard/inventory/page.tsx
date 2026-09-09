'use client';

import { useState } from 'react';
import { useLanguageStore } from '@/store/language.store';
import {
  Warehouse,
  ArrowLeftRight,
  AlertTriangle,
  Package,
  Search,
  Plus,
  Building2,
  CheckCircle2,
} from 'lucide-react';

export default function InventoryPage() {
  const { language, t } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<'balances' | 'transfers'>('balances');
  const [search, setSearch] = useState('');

  const branchStocks = [
    {
      code: 'SPH-01',
      branch: 'سباهي',
      branchEn: 'Spahi',
      manager: 'أ/ أحمد محمود',
      itemsCount: 142,
      lowStockCount: 2,
      totalValuation: 85400,
    },
    {
      code: 'GLM-01',
      branch: 'جليم 1',
      branchEn: 'Gleem 1',
      manager: 'أ/ طارق فهمي',
      itemsCount: 98,
      lowStockCount: 0,
      totalValuation: 62100,
    },
    {
      code: 'GLM-02',
      branch: 'جليم 2',
      branchEn: 'Gleem 2',
      manager: 'أ/ يوسف إبراهيم',
      itemsCount: 115,
      lowStockCount: 1,
      totalValuation: 71500,
    },
    {
      code: 'RNN-01',
      branch: 'رنين',
      branchEn: 'Raneen',
      manager: 'أ/ كريم عبدالعزيز',
      itemsCount: 210,
      lowStockCount: 4,
      totalValuation: 142000,
    },
    {
      code: 'MBR-01',
      branch: 'المبره',
      branchEn: 'El Mabara',
      manager: 'أ/ سارة النجار',
      itemsCount: 88,
      lowStockCount: 0,
      totalValuation: 48900,
    },
    {
      code: 'SLM-01',
      branch: 'دار السالميه',
      branchEn: 'Dar El Salmiya',
      manager: 'أ/ هاني شاكر',
      itemsCount: 76,
      lowStockCount: 1,
      totalValuation: 53200,
    },
    {
      code: 'HQ',
      branch: 'المخزن الرئيسي المركزي',
      branchEn: 'Central Warehouse (HQ)',
      manager: 'م/ عبدالرحمن السعدون',
      itemsCount: 850,
      lowStockCount: 3,
      totalValuation: 520000,
    },
  ];

  const transfers = [
    {
      transferNo: 'TR-2026-001',
      from: 'المخزن الرئيسي المركزي',
      to: 'سباهي',
      item: 'ورق طباعة ممتاز A4',
      qty: '20 كرتون',
      date: '2026-09-08',
      status: 'DELIVERED',
    },
    {
      transferNo: 'TR-2026-002',
      from: 'المخزن الرئيسي المركزي',
      to: 'جليم 1',
      item: 'حبر طابعة ليزر أسود HP',
      qty: '5 علب',
      date: '2026-09-09',
      status: 'IN_TRANSIT',
    },
    {
      transferNo: 'TR-2026-003',
      from: 'رنين',
      to: 'دار السالميه',
      item: 'فلتر هواء مكيف مركزي',
      qty: '4 قطع',
      date: '2026-09-09',
      status: 'PENDING_DISPATCH',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
            <Warehouse className="w-6 h-6 text-blue-600" />
            <span>{language === 'ar' ? 'إدارة المخازن والتحويلات الداخلية' : 'Inventory & Internal Transfers'}</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            {language === 'ar'
              ? 'متابعة الأرصدة المخزنية في كافة الفروع والتحويلات بين المخزن الرئيسي ومخازن الفروع'
              : 'Monitor branch stock levels and manage transfers between Central Warehouse and branches'}
          </p>
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition cursor-pointer">
          <ArrowLeftRight className="w-4 h-4" />
          <span>{language === 'ar' ? 'إذن تحويل مخزني جديد' : 'New Internal Transfer'}</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold">{language === 'ar' ? 'عدد المخازن والفروع' : 'Branches & Warehouses'}</p>
            <p className="text-2xl font-black text-slate-800 mt-1">7 فروع ومخازن</p>
          </div>
          <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold">{language === 'ar' ? 'إجمالي تقييم المخزون' : 'Total Stock Valuation'}</p>
            <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">983,000 <span className="text-xs">EGP</span></p>
          </div>
          <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold">{language === 'ar' ? 'تنبيهات انخفاض الحد الأدنى' : 'Low Stock Alerts'}</p>
            <p className="text-2xl font-black text-rose-600 mt-1">11 صنف</p>
          </div>
          <div className="w-11 h-11 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('balances')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeTab === 'balances'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {language === 'ar' ? 'أرصدة الفروع والمخازن' : 'Branch Stock Levels'}
        </button>
        <button
          onClick={() => setActiveTab('transfers')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeTab === 'transfers'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {language === 'ar' ? 'حركات التحويل الداخلي (Transfers)' : 'Internal Transfers'}
        </button>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {activeTab === 'balances' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'كود الفرع' : 'Code'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'الفرع / المخزن' : 'Branch / Store'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'المدير المسؤول' : 'Assigned Manager'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'عدد الأصناف المتوفرة' : 'Available SKUs'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'تنبيهات النقص' : 'Low Stock Alerts'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'إجمالي القيمة التقديرية' : 'Estimated Value'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {branchStocks.map((b) => (
                  <tr key={b.code} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{b.code}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {language === 'ar' ? b.branch : b.branchEn}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {b.manager}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{b.itemsCount} صنف</td>
                    <td className="py-3.5 px-4">
                      {b.lowStockCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{b.lowStockCount} {language === 'ar' ? 'أصناف قاربت النفاد' : 'low items'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{language === 'ar' ? 'المخزون آمن' : 'Stock Optimal'}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {b.totalValuation.toLocaleString()} EGP
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
                  <th className="py-3.5 px-4">{language === 'ar' ? 'رقم الإذن' : 'Transfer No'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'من مخزن' : 'From Warehouse'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'إلى مخزن' : 'To Warehouse'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'الصنف والكمية' : 'Item & Quantity'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'حالة الشحن' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transfers.map((tr) => (
                  <tr key={tr.transferNo} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{tr.transferNo}</td>
                    <td className="py-3.5 px-4 text-slate-800 font-medium">{tr.from}</td>
                    <td className="py-3.5 px-4 text-slate-800 font-medium">{tr.to}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{tr.item} ({tr.qty})</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{tr.date}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        tr.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' :
                        tr.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {tr.status === 'DELIVERED' ? (language === 'ar' ? 'تم الاستلام في الفرع' : 'Delivered') :
                         tr.status === 'IN_TRANSIT' ? (language === 'ar' ? 'في طريق الشحن' : 'In Transit') :
                         (language === 'ar' ? 'قيد التجهيز' : 'Pending Dispatch')}
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
