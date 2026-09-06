'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore, roleLabels } from '@/store/auth.store';
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  AlertTriangle,
  Building,
  Calendar,
  Send,
  Ban,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RequisitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const id = params?.id as string;

  const [requisition, setRequisition] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/requisitions/${id}`);
      setRequisition(data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'تعذر تحميل تفاصيل الطلب');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const handleAction = async (action: 'approve' | 'reject' | 'submit' | 'cancel') => {
    setActionLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (action === 'reject' && !comments.trim()) {
        setError('يرجى كتابة سبب الرفض في خانة الملاحظات');
        setActionLoading(false);
        return;
      }

      const { data } = await api.patch(`/requisitions/${id}/${action}`, {
        comments: comments || undefined,
      });

      setSuccessMsg(data.message || 'تم تنفيذ الإجراء بنجاح');
      setComments('');
      await fetchDetail();
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل تنفيذ الإجراء');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs">جاري تحميل بيانات الطلب...</p>
      </div>
    );
  }

  if (!requisition) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl text-center text-xs">
        لم يتم العثور على هذا الطلب.
      </div>
    );
  }

  const steps = requisition.flowTemplate?.steps || [];
  const currentStepInfo = steps.find((s: any) => s.stepOrder === requisition.currentStep);
  const canApprove =
    requisition.status === 'PENDING' &&
    currentStepInfo &&
    (user?.role === currentStepInfo.approverRole || user?.role === 'SUPER_ADMIN');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/requisitions')}
            className="p-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition"
          >
            <ArrowRight className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-slate-800 font-mono">
                {requisition.requisitionNo}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                requisition.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                requisition.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                requisition.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                {requisition.status === 'APPROVED' ? 'معتمد نهائياً' :
                 requisition.status === 'PENDING' ? `قيد المراجعة (خطوة ${requisition.currentStep})` :
                 requisition.status === 'REJECTED' ? 'مرفوض' : 'مسودة'}
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">{requisition.title}</p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2">
          {requisition.status === 'DRAFT' && requisition.createdById === user?.id && (
            <button
              onClick={() => handleAction('submit')}
              disabled={actionLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>إرسال للموافقة</span>
            </button>
          )}

          {requisition.status !== 'APPROVED' && requisition.status !== 'CANCELLED' && (
            <button
              onClick={() => handleAction('cancel')}
              disabled={actionLoading}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>إلغاء الطلب</span>
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Approval Timeline Stepper */}
      {steps.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
            مسار الموافقات: {requisition.flowTemplate?.name}
          </h2>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative">
            {steps.map((st: any, idx: number) => {
              const isPast = requisition.currentStep > st.stepOrder || requisition.status === 'APPROVED';
              const isCurrent = requisition.currentStep === st.stepOrder && requisition.status === 'PENDING';
              const isRejected = requisition.status === 'REJECTED' && requisition.currentStep === st.stepOrder;

              return (
                <div key={st.id} className="flex-1 flex items-center gap-3 w-full">
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 transition shadow-sm ${
                    isRejected ? 'bg-rose-500 text-white' :
                    isPast ? 'bg-emerald-500 text-white' :
                    isCurrent ? 'bg-amber-500 text-white animate-pulse' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {isPast ? <CheckCircle2 className="w-5 h-5" /> : st.stepOrder}
                  </div>

                  <div className="min-w-0">
                    <p className={`text-xs font-bold ${isCurrent ? 'text-amber-600' : isPast ? 'text-emerald-700' : 'text-slate-600'}`}>
                      {st.stepNameAr}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {roleLabels[st.approverRole as keyof typeof roleLabels] || st.approverRole}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Box for Approvers */}
      {canApprove && (
        <div className="bg-gradient-to-l from-amber-50 to-white border-2 border-amber-300 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center gap-2.5 text-amber-800">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <h3 className="font-black text-sm">أنت مخول بالموافقة على هذا الطلب في الخطوة الحالية</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات الاعتماد / أسباب الرفض</label>
            <textarea
              rows={2}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="اكتب ملاحظاتك هنا (إلزامية في حالة الرفض)..."
              className="w-full bg-white border border-amber-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => handleAction('reject')}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 transition disabled:opacity-60"
            >
              <XCircle className="w-4 h-4" />
              <span>رفض الطلب</span>
            </button>

            <button
              type="button"
              disabled={actionLoading}
              onClick={() => handleAction('approve')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition disabled:opacity-60"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>اعتماد والموافقة</span>
            </button>
          </div>
        </div>
      )}

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Requisition Meta */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
            بيانات الطلب والفرع
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-slate-400 text-[11px]">الفرع:</p>
              <p className="font-bold text-slate-800">{requisition.branch?.nameAr}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[11px]">القسم:</p>
              <p className="font-bold text-slate-800">{requisition.department?.nameAr || 'غير محدد'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[11px]">مقدم الطلب:</p>
              <p className="font-bold text-slate-800">{requisition.createdBy?.nameAr}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[11px]">تاريخ الإنشاء:</p>
              <p className="font-bold text-slate-800">
                {new Date(requisition.createdAt).toLocaleDateString('ar-SA')}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Justification */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
            المبررات والملاحظات
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            {requisition.justification || 'لا توجد مبررات مسجلة'}
          </p>
          {requisition.notes && (
            <p className="text-xs text-slate-500 italic mt-2">
              ملاحظة: {requisition.notes}
            </p>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-slate-800 text-sm">جدول الأصناف المطلوبة</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">كود الصنف</th>
                <th className="py-3 px-4">اسم الصنف</th>
                <th className="py-3 px-4">الكمية</th>
                <th className="py-3 px-4">الوحدة</th>
                <th className="py-3 px-4">السعر التقديري</th>
                <th className="py-3 px-4">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requisition.items?.map((item: any, idx: number) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-600">{item.product?.code}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{item.product?.nameAr}</td>
                  <td className="py-3 px-4 font-mono font-bold text-blue-600">{item.quantity}</td>
                  <td className="py-3 px-4 text-slate-500">{item.unit}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {item.estimatedPrice ? `${item.estimatedPrice.toLocaleString('ar-SA')} ر.س` : '—'}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    {item.totalPrice ? `${item.totalPrice.toLocaleString('ar-SA')} ر.س` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
              <tr>
                <td colSpan={6} className="py-3 px-4 text-left font-bold text-slate-700">
                  الإجمالي الكلي التقديري:
                </td>
                <td className="py-3 px-4 text-blue-600 font-black font-mono text-sm">
                  {requisition.estimatedTotal ? `${requisition.estimatedTotal.toLocaleString('ar-SA')} ر.س` : '—'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Audit & Approval History Log */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-slate-800 text-sm">سجل إجراءات وموافقات الطلب (Audit Trail)</h3>
        {requisition.approvalLogs?.length === 0 ? (
          <p className="text-slate-400 text-xs">لا توجد إجراءات مسجلة بعد.</p>
        ) : (
          <div className="space-y-3">
            {requisition.approvalLogs?.map((log: any) => (
              <div key={log.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${log.action === 'APPROVED' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                    <span className="font-bold text-slate-800">{log.stepNameAr}</span>
                    <span className="text-slate-400">بواسطة</span>
                    <span className="font-semibold text-blue-700">{log.approver?.nameAr}</span>
                  </div>
                  {log.comments && (
                    <p className="text-slate-600 text-xs mt-1.5 bg-white p-2 rounded-lg border border-slate-200">
                      &quot;{log.comments}&quot;
                    </p>
                  )}
                </div>
                <span className="text-slate-400 text-[11px] shrink-0">
                  {new Date(log.actionAt).toLocaleString('ar-SA')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
