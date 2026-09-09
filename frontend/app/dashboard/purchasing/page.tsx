'use client';

import { useState } from 'react';
import { useLanguageStore } from '@/store/language.store';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Users,
  CheckCircle2,
  Clock,
  FileCheck,
  Building,
  TrendingUp,
  DollarSign,
} from 'lucide-react';

export default function PurchasingPage() {
  const { language, t } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'vendors'>('orders');
  const [search, setSearch] = useState('');

  const samplePOs = [
    {
      poNumber: 'PO-2026-001',
      vendor: 'شركة الأهرام للمستلزمات الصناعية',
      vendorEn: 'Al-Ahram Industrial Supplies',
      branch: 'سباهي',
      branchEn: 'Spahi',
      date: '2026-09-07',
      total: 12500,
      status: 'APPROVED',
      matching: '3-Way Match Verified',
    },
    {
      poNumber: 'PO-2026-002',
      vendor: 'مؤسسة الدلتا لقطع الغيار',
      vendorEn: 'Delta Spare Parts Est.',
      branch: 'جليم 1',
      branchEn: 'Gleem 1',
      date: '2026-09-08',
      total: 8400,
      status: 'PENDING',
      matching: 'Pending Goods Receipt',
    },
    {
      poNumber: 'PO-2026-003',
      vendor: 'الشركة المصرية للمعدات والأدوات',
      vendorEn: 'Egyptian Equipment Co.',
      branch: 'رنين',
      branchEn: 'Raneen',
      date: '2026-09-09',
      total: 19200,
      status: 'APPROVED',
      matching: '3-Way Match Verified',
    },
  ];

  const sampleVendors = [
    {
      name: 'شركة الأهرام للمستلزمات الصناعية',
      nameEn: 'Al-Ahram Industrial Supplies',
      category: 'مواد خام وتشغيل',
      rating: '⭐⭐⭐⭐⭐ 4.9',
      ordersCount: 14,
      phone: '01099887766',
    },
    {
      name: 'مؤسسة الدلتا لقطع الغيار',
      nameEn: 'Delta Spare Parts Est.',
      category: 'قطع غيار وصيانة',
      rating: '⭐⭐⭐⭐ 4.5',
      ordersCount: 8,
      phone: '01011223344',
    },
    {
      name: 'الشركة المصرية للمعدات والأدوات',
      nameEn: 'Egyptian Equipment Co.',
      category: 'معدات وأدوات',
      rating: '⭐⭐⭐⭐⭐ 4.8',
      ordersCount: 22,
      phone: '01055667788',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            <span>{language === 'ar' ? 'إدارة المشتريات وأوامر الشراء (POs)' : 'Purchasing & Purchase Orders (POs)'}</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            {language === 'ar'
              ? 'إدارة أوامر الشراء المركزية للفروع، عروض الأسعار، والمطابقة الثلاثية (3-Way Matching)'
              : 'Centralized branch purchase orders, quotations, and 3-way invoice matching'}
          </p>
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>{language === 'ar' ? 'إنشاء أمر شراء جديد' : 'New Purchase Order'}</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold">{language === 'ar' ? 'إجمالي أوامر الشراء' : 'Total Purchase Orders'}</p>
            <p className="text-2xl font-black text-slate-800 mt-1">24</p>
          </div>
          <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold">{language === 'ar' ? 'قيمة المشتريات المعتمدة' : 'Approved Purchases Value'}</p>
            <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">145,200 <span className="text-xs">EGP</span></p>
          </div>
          <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold">{language === 'ar' ? 'الموردون المعتمدون' : 'Active Vendors'}</p>
            <p className="text-2xl font-black text-purple-600 mt-1">18</p>
          </div>
          <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
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
          {language === 'ar' ? 'أوامر الشراء (POs)' : 'Purchase Orders'}
        </button>
        <button
          onClick={() => setActiveTab('vendors')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeTab === 'vendors'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {language === 'ar' ? 'دليل وتقييم الموردين (Vendors)' : 'Vendors & Ratings'}
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={language === 'ar' ? 'بحث برقم الأمر أو اسم المورد أو الفرع...' : 'Search by PO number, vendor, or branch...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {activeTab === 'orders' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'رقم أمر الشراء' : 'PO Number'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'المورد' : 'Vendor'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'الفرع المستفيد' : 'Branch'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'القيمة' : 'Amount'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'المطابقة الثلاثية (3-Way Match)' : '3-Way Match'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {samplePOs.map((po) => (
                  <tr key={po.poNumber} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{po.poNumber}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {language === 'ar' ? po.vendor : po.vendorEn}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {language === 'ar' ? po.branch : po.branchEn}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {po.total.toLocaleString()} EGP
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>{po.matching}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        po.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {po.status === 'APPROVED' ? (language === 'ar' ? 'معتمد ومؤكد' : 'Approved') : (language === 'ar' ? 'قيد التوريد' : 'Pending')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">{po.date}</td>
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
                  <th className="py-3.5 px-4">{language === 'ar' ? 'اسم المورد' : 'Vendor Name'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'مجال التوريد' : 'Category'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'تقييم الأداء والجودة' : 'Performance Rating'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'عدد الأوامر المنجزة' : 'Fulfilled Orders'}</th>
                  <th className="py-3.5 px-4">{language === 'ar' ? 'رقم التواصل' : 'Phone'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sampleVendors.map((v) => (
                  <tr key={v.name} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {language === 'ar' ? v.name : v.nameEn}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{v.category}</td>
                    <td className="py-3.5 px-4 font-bold text-amber-600">{v.rating}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{v.ordersCount}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{v.phone}</td>
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
