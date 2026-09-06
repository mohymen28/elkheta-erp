'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore, roleLabels } from '@/store/auth.store';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  PlusCircle,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  Layers,
} from 'lucide-react';

interface Stats {
  total: number;
  draft: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsRes, reqsRes] = await Promise.all([
          api.get('/requisitions/stats'),
          api.get('/requisitions?limit=5'),
        ]);
        setStats(statsRes.data.data);
        setRecentRequests(reqsRes.data.data || []);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const statCards = [
    { label: 'إجمالي الطلبات', value: stats?.total ?? 0, icon: FileText, bg: 'bg-blue-500', text: 'text-blue-500', light: 'bg-blue-50 border-blue-100' },
    { label: 'قيد الاعتماد والمراجعة', value: stats?.pending ?? 0, icon: Clock, bg: 'bg-amber-500', text: 'text-amber-500', light: 'bg-amber-50 border-amber-100' },
    { label: 'طلبات معتمدة', value: stats?.approved ?? 0, icon: CheckCircle2, bg: 'bg-emerald-500', text: 'text-emerald-500', light: 'bg-emerald-50 border-emerald-100' },
    { label: 'طلبات مرفوضة', value: stats?.rejected ?? 0, icon: XCircle, bg: 'bg-rose-500', text: 'text-rose-500', light: 'bg-rose-50 border-rose-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold mb-3 border border-blue-400/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{user?.role ? roleLabels[user.role] : 'مستخدم'}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">أهلاً بك، {user?.nameAr} 👋</h1>
            <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-xl">
              مرحباً بك في نظام إدارة ومتابعة دورة المشتريات والمخازن لفرع <span className="text-blue-400 font-bold">{user?.branch?.nameAr || 'المقر الرئيسي'}</span>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/requisitions/new"
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إنشاء طلب احتياج جديد</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className={`p-5 rounded-2xl border ${card.light} bg-white shadow-sm flex items-center justify-between`}>
            <div>
              <p className="text-slate-500 text-xs font-bold">{card.label}</p>
              <p className="text-2xl md:text-3xl font-black text-slate-800 mt-1">
                {loading ? '...' : card.value}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-2xl ${card.bg} flex items-center justify-center text-white shadow-md`}>
              <card.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Dashboard Quick Workflow Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-800">1. طلبات الاحتياج</h3>
            <p className="text-slate-500 text-xs mt-1">
              تسجيل احتياجات الفرع من الأدوات، قطع الغيار، أو المواد الخام وتحديد الكميات والأسعار التقديرية.
            </p>
          </div>
          <Link href="/dashboard/requisitions" className="mt-4 text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
            <span>استعراض الطلبات</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-800">2. سلسلة الموافقات</h3>
            <p className="text-slate-500 text-xs mt-1">
              محرك موافقات تسلسلي ينقل الطلب للمدير المباشر ثم لمدير المشتريات للتحقق والاعتماد.
            </p>
          </div>
          <Link href="/dashboard/pending-approvals" className="mt-4 text-xs font-bold text-amber-600 flex items-center gap-1 hover:underline">
            <span>الطلبات بانتظار الاعتماد</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-3">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-800">3. التحويل والشراء</h3>
            <p className="text-slate-500 text-xs mt-1">
              تحويل الطلبات المعتمدة إلى أوامر شراء رسمية من الموردين أو أذونات نقل من المخزن المركزي.
            </p>
          </div>
          <Link href="/dashboard/products" className="mt-4 text-xs font-bold text-emerald-600 flex items-center gap-1 hover:underline">
            <span>دليل الأصناف والمخزون</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Recent Requisitions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-base">أحدث طلبات الاحتياج</h3>
            <p className="text-slate-400 text-xs">قائمة بآخر 5 طلبات تم تسجيلها على النظام</p>
          </div>
          <Link href="/dashboard/requisitions" className="text-xs font-bold text-blue-600 hover:underline">
            عرض الكل
          </Link>
        </div>

        {recentRequests.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            لا توجد طلبات مسجلة حالياً.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                <tr>
                  <th className="py-3 px-4">رقم الطلب</th>
                  <th className="py-3 px-4">العنوان</th>
                  <th className="py-3 px-4">الفرع</th>
                  <th className="py-3 px-4">مقدم الطلب</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      <Link href={`/dashboard/requisitions/${req.id}`} className="hover:underline">
                        {req.requisitionNo}
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{req.title}</td>
                    <td className="py-3 px-4 text-slate-500">{req.branch?.nameAr}</td>
                    <td className="py-3 px-4 text-slate-500">{req.createdBy?.nameAr}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        req.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        req.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {req.status === 'APPROVED' ? 'معتمد' :
                         req.status === 'PENDING' ? 'قيد المراجعة' :
                         req.status === 'REJECTED' ? 'مرفوض' : 'مسودة'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(req.createdAt).toLocaleDateString('ar-SA')}
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
