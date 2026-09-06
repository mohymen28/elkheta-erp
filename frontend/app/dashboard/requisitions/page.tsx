'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import {
  Plus,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  DRAFT: { label: 'مسودة', color: 'bg-slate-100 text-slate-600', icon: FileText },
  PENDING: { label: 'قيد المراجعة', color: 'bg-amber-100 text-amber-700', icon: Clock },
  APPROVED: { label: 'معتمد', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  REJECTED: { label: 'مرفوض', color: 'bg-rose-100 text-rose-700', icon: XCircle },
  CANCELLED: { label: 'ملغي', color: 'bg-slate-100 text-slate-500', icon: XCircle },
  CONVERTED_TO_PO: { label: 'تحويل لأمر شراء', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  CONVERTED_TO_TRANSFER: { label: 'تحويل لنقل مخزني', color: 'bg-purple-100 text-purple-700', icon: CheckCircle },
};

const urgencyConfig: Record<string, { label: string; color: string }> = {
  LOW: { label: 'منخفض', color: 'text-slate-500 bg-slate-50' },
  MEDIUM: { label: 'متوسط', color: 'text-amber-700 bg-amber-50' },
  HIGH: { label: 'عاجل جداً', color: 'text-rose-700 bg-rose-50' },
};

export default function RequisitionsPage() {
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [urgency, setUrgency] = useState('');

  const fetchRequisitions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (urgency) params.append('urgency', urgency);
      
      const { data } = await api.get(`/requisitions?${params}`);
      setRequisitions(data.data || []);
    } catch (err) {
      console.error('Failed to load requisitions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequisitions();
  }, [search, status, urgency]);

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800">طلبات الاحتياج (Internal Requisitions)</h1>
          <p className="text-slate-400 text-xs mt-0.5">سجل طلبات الاحتياج والمواد المطلوب شراؤها أو تحويلها</p>
        </div>
        <Link
          href="/dashboard/requisitions/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء طلب جديد</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="بحث برقم الطلب، العنوان، أو الملاحظات..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
        >
          <option value="">كل الحالات</option>
          <option value="DRAFT">مسودة</option>
          <option value="PENDING">قيد المراجعة</option>
          <option value="APPROVED">معتمد</option>
          <option value="REJECTED">مرفوض</option>
          <option value="CONVERTED_TO_PO">تم التحويل لأمر شراء</option>
          <option value="CONVERTED_TO_TRANSFER">تم التحويل لنقل مخزني</option>
        </select>

        <select
          value={urgency}
          onChange={(e) => setUrgency(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
        >
          <option value="">جميع درجات الأولوية</option>
          <option value="LOW">منخفض</option>
          <option value="MEDIUM">متوسط</option>
          <option value="HIGH">عاجل</option>
        </select>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs">جاري تحميل الطلبات...</p>
          </div>
        ) : requisitions.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <AlertCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-sm text-slate-600">لا توجد طلبات مطابقة</p>
            <p className="text-xs text-slate-400 mt-1">ابدأ بإنشاء طلب احتياج جديد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="py-3.5 px-4">رقم الطلب</th>
                  <th className="py-3.5 px-4">العنوان</th>
                  <th className="py-3.5 px-4">الفرع</th>
                  <th className="py-3.5 px-4">مقدم الطلب</th>
                  <th className="py-3.5 px-4">الأولوية</th>
                  <th className="py-3.5 px-4">الإجمالي التقديري</th>
                  <th className="py-3.5 px-4">الحالة</th>
                  <th className="py-3.5 px-4">تاريخ الطلب</th>
                  <th className="py-3.5 px-4 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requisitions.map((req) => {
                  const s = statusConfig[req.status] || statusConfig.DRAFT;
                  const u = urgencyConfig[req.urgency] || urgencyConfig.MEDIUM;
                  return (
                    <tr key={req.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        {req.requisitionNo}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 max-w-xs truncate">
                        {req.title}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{req.branch?.nameAr}</td>
                      <td className="py-3.5 px-4 text-slate-600">{req.createdBy?.nameAr}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${u.color}`}>
                          {u.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700 font-mono">
                        {req.estimatedTotal ? `${req.estimatedTotal.toLocaleString('ar-SA')} ر.س` : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold', s.color)}>
                          <s.icon className="w-3 h-3" />
                          <span>{s.label}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(req.createdAt).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Link
                          href={`/dashboard/requisitions/${req.id}`}
                          className="inline-flex items-center gap-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>التفاصيل</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
