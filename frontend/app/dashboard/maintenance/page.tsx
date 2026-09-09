'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useLanguageStore } from '@/store/language.store';
import {
  Wrench,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  FileText,
} from 'lucide-react';

export default function MaintenancePage() {
  const { language } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'contracts'>('orders');
  const [search, setSearch] = useState('');

  const [orders, setOrders] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  // Order Form
  const [orderForm, setOrderForm] = useState({
    branchId: '',
    assetName: '',
    type: 'PREVENTIVE',
    priority: 'MEDIUM',
    description: '',
    technician: '',
    sparePartsNeeded: '',
    cost: 0,
  });

  // Contract Form
  const [contractForm, setContractForm] = useState({
    contractNo: '',
    title: '',
    serviceProvider: '',
    scope: '',
    annualCost: 0,
    expiryDate: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [oRes, cRes, bRes] = await Promise.all([
        api.get('/maintenance/orders'),
        api.get('/maintenance/contracts'),
        api.get('/branches'),
      ]);
      setOrders(oRes.data.data || []);
      setContracts(cRes.data.data || []);
      setBranches(bRes.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderForm.branchId || !orderForm.assetName) {
      setErr('يرجى تحديد الفرع والمعدة / الأصل');
      return;
    }
    setSubmitting(true);
    setErr('');
    try {
      await api.post('/maintenance/orders', orderForm);
      setMsg('تم فتح أمر الصيانة بنجاح');
      setOrderModalOpen(false);
      fetchData();
      setTimeout(() => setMsg(''), 4000);
    } catch (e: any) {
      setErr(e.response?.data?.message || 'حدث خطأ أثناء فتح أمر الصيانة');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractForm.contractNo || !contractForm.title || !contractForm.serviceProvider || !contractForm.expiryDate) {
      setErr('يرجى ملء جميع الحقول الإلزامية');
      return;
    }
    setSubmitting(true);
    setErr('');
    try {
      await api.post('/maintenance/contracts', contractForm);
      setMsg('تم تسجيل عقد الصيانة بنجاح');
      setContractModalOpen(false);
      fetchData();
      setTimeout(() => setMsg(''), 4000);
    } catch (e: any) {
      setErr(e.response?.data?.message || 'حدث خطأ أثناء حفظ العقد');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      await api.patch(`/maintenance/orders/${orderId}/status`, { status: 'COMPLETED' });
      setMsg('تم تأكيد إتمام الصيانة وإغلاق أمر العمل بنجاح ✅');
      fetchData();
      setTimeout(() => setMsg(''), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredOrders = orders.filter((o) =>
    search ? (o.orderNo.includes(search) || o.assetName.includes(search) || o.branch?.nameAr?.includes(search)) : true
  );

  const filteredContracts = contracts.filter((c) =>
    search ? (c.contractNo.includes(search) || c.title.includes(search) || c.serviceProvider.includes(search)) : true
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-blue-600" />
            <span>{language === 'ar' ? 'إدارة صيانة الفروع والأصول الفعلية' : 'Branch Maintenance & Real Orders'}</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            {language === 'ar'
              ? 'متابعة أوامر الصيانة الدورية والطارئة، قطع الغيار المستهلكة، وسجل عقود الصيانة الرسمية'
              : 'Official preventive & emergency work orders and periodic maintenance contracts'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setErr(''); setContractModalOpen(true); }}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl transition cursor-pointer"
          >
            {language === 'ar' ? 'إضافة عقد صيانة' : 'Add Contract'}
          </button>
          <button
            onClick={() => { setErr(''); setOrderModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? 'فتح أمر صيانة جديد' : 'New Work Order'}</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeTab === 'orders' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {language === 'ar' ? `أوامر الصيانة (${orders.length})` : `Work Orders (${orders.length})`}
        </button>
        <button
          onClick={() => setActiveTab('contracts')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeTab === 'contracts' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {language === 'ar' ? `عقود الصيانة وتنبيهات التجديد (${contracts.length})` : `Maintenance Contracts (${contracts.length})`}
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={language === 'ar' ? 'بحث برقم الأمر أو اسم الأصل أو الفرع...' : 'Search by order no, asset, or branch...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs">جاري تحميل سجلات الصيانة من الخادم...</p>
          </div>
        ) : activeTab === 'orders' ? (
          filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">لا توجد أوامر صيانة مسجلة</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <tr>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'رقم الأمر' : 'Order No'}</th>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'الفرع' : 'Branch'}</th>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'المعدة / الأصل' : 'Asset'}</th>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'نوع الصيانة' : 'Type'}</th>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'قطع الغيار المطلوبة' : 'Spare Parts'}</th>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'جهة التنفيذ' : 'Technician'}</th>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'التكلفة' : 'Cost'}</th>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                    <th className="py-3.5 px-4 text-center">{language === 'ar' ? 'الإجراء' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((wo) => (
                    <tr key={wo.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{wo.orderNo}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{wo.branch?.nameAr}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{wo.assetName}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          wo.type === 'EMERGENCY' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {wo.type === 'EMERGENCY' ? 'طارئة' : 'وقائية'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{wo.sparePartsNeeded || '—'}</td>
                      <td className="py-3.5 px-4 text-slate-500">{wo.technician || 'فني الصيانة'}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-800 font-bold">{wo.cost ? `${wo.cost} EGP` : '—'}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          wo.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                          wo.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {wo.status === 'COMPLETED' ? 'تم الإصلاح' : wo.status === 'IN_PROGRESS' ? 'جاري العمل' : 'معلق'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {wo.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleCompleteOrder(wo.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg shadow-sm transition cursor-pointer"
                          >
                            إغلاق وتم
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          filteredContracts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">لا توجد عقود صيانة مسجلة</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <tr>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'رقم العقد' : 'Contract No'}</th>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'عنوان العقد' : 'Contract Title'}</th>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'الشركة مقدمة الخدمة' : 'Service Provider'}</th>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'التكلفة السنوية' : 'Annual Cost'}</th>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'تاريخ الانتهاء' : 'Expiry Date'}</th>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredContracts.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{c.contractNo}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{c.title}</td>
                      <td className="py-3.5 px-4 text-slate-600">{c.serviceProvider}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{c.annualCost.toLocaleString()} EGP</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {new Date(c.expiryDate).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-bold">
                          ساري ونشط
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Order Modal */}
      {orderModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-base text-slate-800">فتح أمر صيانة وتشغيل جديد</h3>
              <button onClick={() => setOrderModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
              {err && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">{err}</div>}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الفرع التابع له الأصل *</label>
                  <select
                    required
                    value={orderForm.branchId}
                    onChange={(e) => setOrderForm({ ...orderForm, branchId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="">اختر الفرع...</option>
                    {branches.map((b) => <option key={b.id} value={b.id}>{b.nameAr}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع الصيانة *</label>
                  <select
                    value={orderForm.type}
                    onChange={(e) => setOrderForm({ ...orderForm, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="PREVENTIVE">صيانة وقائية دورية</option>
                    <option value="EMERGENCY">صيانة طارئة / عطل مفاجئ</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المعدة أو الأصل المطلوب صيانته *</label>
                <input
                  type="text"
                  required
                  value={orderForm.assetName}
                  onChange={(e) => setOrderForm({ ...orderForm, assetName: e.target.value })}
                  placeholder="مثال: وحدة التكييف المركزي رقم 1، رافعة شوكية، خط سير..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">قطع الغيار المقترح استهلاكها</label>
                  <input
                    type="text"
                    value={orderForm.sparePartsNeeded}
                    onChange={(e) => setOrderForm({ ...orderForm, sparePartsNeeded: e.target.value })}
                    placeholder="فلاتر، سيور، قواطع..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">جهة التنفيذ / الفني</label>
                  <input
                    type="text"
                    value={orderForm.technician}
                    onChange={(e) => setOrderForm({ ...orderForm, technician: e.target.value })}
                    placeholder="فني داخلي أو شركة متخصصة"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">وصف العطل أو متطلبات العمل</label>
                <textarea
                  rows={2}
                  value={orderForm.description}
                  onChange={(e) => setOrderForm({ ...orderForm, description: e.target.value })}
                  placeholder="تفاصيل الفحص أو الخلل المطلوب إصلاحه..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setOrderModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">إلغاء</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md">
                  {submitting ? 'جاري الحفظ...' : 'فتح أمر الصيانة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contract Modal */}
      {contractModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-base text-slate-800">تسجيل عقد صيانة دوري رسمي</h3>
              <button onClick={() => setContractModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateContract} className="p-6 space-y-4">
              {err && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">{err}</div>}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم العقد *</label>
                <input
                  type="text"
                  required
                  value={contractForm.contractNo}
                  onChange={(e) => setContractForm({ ...contractForm, contractNo: e.target.value })}
                  placeholder="CNT-2026-003"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان العقد *</label>
                <input
                  type="text"
                  required
                  value={contractForm.title}
                  onChange={(e) => setContractForm({ ...contractForm, title: e.target.value })}
                  placeholder="مثال: عقد صيانة المصاعد والسلالم الكهربائية"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الشركة مقدمة الخدمة *</label>
                <input
                  type="text"
                  required
                  value={contractForm.serviceProvider}
                  onChange={(e) => setContractForm({ ...contractForm, serviceProvider: e.target.value })}
                  placeholder="اسم الشركة المنفذة"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">التكلفة السنوية (EGP)</label>
                  <input
                    type="number"
                    min="0"
                    value={contractForm.annualCost}
                    onChange={(e) => setContractForm({ ...contractForm, annualCost: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الانتهاء والتجديد *</label>
                  <input
                    type="date"
                    required
                    value={contractForm.expiryDate}
                    onChange={(e) => setContractForm({ ...contractForm, expiryDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setContractModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">إلغاء</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md">
                  {submitting ? 'جاري الحفظ...' : 'تسجيل العقد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
