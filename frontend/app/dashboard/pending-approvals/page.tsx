'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import {
  CheckSquare,
  Clock,
  Eye,
  AlertCircle,
  Building,
  User,
} from 'lucide-react';

export default function PendingApprovalsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/requisitions/pending-approvals');
      setRequests(data.data || []);
    } catch (err) {
      console.error('Failed to load pending approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-amber-500" />
          <span>طلبات بانتظار موافقتي</span>
        </h1>
        <p className="text-slate-400 text-xs mt-0.5">
          قائمة طلبات الاحتياج التي تقف حالياً في خطوة تتطلب موافقتك واعتمادك
        </p>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs">جاري تحميل الطلبات المعلقة...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-sm text-slate-700">لا توجد طلبات معلقة بانتظار موافقتك حالياً 🎉</p>
            <p className="text-xs text-slate-400 mt-1">تمت معالجة كافة الطلبات الواردة إليك بنجاح</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-5 hover:bg-slate-50 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-blue-600 text-xs bg-blue-50 px-2.5 py-0.5 rounded-md">
                      {req.requisitionNo}
                    </span>
                    <h3 className="font-bold text-sm text-slate-800">{req.title}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      الخطوة {req.currentStep}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {req.branch?.nameAr}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      مقدم الطلب: {req.createdBy?.nameAr}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(req.createdAt).toLocaleDateString('ar-SA')}
                    </span>
                    <span className="font-bold text-blue-700 font-mono">
                      {req.estimatedTotal ? `${req.estimatedTotal.toLocaleString('ar-SA')} ر.س` : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/requisitions/${req.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition"
                  >
                    <Eye className="w-4 h-4" />
                    <span>مراجعة واتخاذ قرار</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
