'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import {
  ShoppingCart, Plus, Search, Trash2, CheckCircle2,
  PackageCheck, ChevronDown, ChevronUp, X, Building,
  DollarSign, Users, AlertCircle, FileText, Loader2,
} from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string }> = {
  DRAFT:     { label: 'مسودة',       color: 'bg-slate-100 text-slate-600' },
  APPROVED:  { label: 'معتمد',       color: 'bg-blue-100 text-blue-700' },
  RECEIVED:  { label: 'مستلم',       color: 'bg-emerald-100 text-emerald-700' },
  CANCELLED: { label: 'ملغي',        color: 'bg-red-100 text-red-600' },
};

const vendorCategories = [
  'مواد خام وتوريدات', 'قطع غيار ومعدات', 'خدمات صيانة',
  'مستلزمات طبية', 'أثاث ومفروشات', 'تقنية معلومات', 'أخرى',
];

export default function PurchasingPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'new' | 'vendors'>('orders');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [orders, setOrders] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  // New PO form
  const [poForm, setPoForm] = useState({
    vendorId: '',
    branchId: '',
    deliveryDate: '',
    notes: '',
  });
  const [poItems, setPoItems] = useState<{ productId: string; quantity: number; unitPrice: number }[]>([
    { productId: '', quantity: 1, unitPrice: 0 },
  ]);
  const [submittingPO, setSubmittingPO] = useState(false);

  // Vendor form
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [vendorForm, setVendorForm] = useState({
    nameAr: '', nameEn: '', category: vendorCategories[0], phone: '', email: '', taxNumber: '',
  });
  const [submittingVendor, setSubmittingVendor] = useState(false);

  const canApprove = ['SUPER_ADMIN', 'PURCHASE_MANAGER'].includes(user?.role || '');
  const canReceive = ['SUPER_ADMIN', 'PURCHASE_MANAGER', 'BRANCH_MANAGER', 'WAREHOUSE_KEEPER'].includes(user?.role || '');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      const [poRes, vRes, bRes, pRes] = await Promise.all([
        api.get(`/purchase-orders?${params}`),
        api.get('/vendors'),
        api.get('/branches'),
        api.get('/products?isActive=true'),
      ]);
      setOrders(poRes.data.data || []);
      setVendors(vRes.data.data || []);
      setBranches(bRes.data.data || []);
      setProducts(pRes.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const flashMsg = (m: string, isErr = false) => {
    if (isErr) { setErr(m); setTimeout(() => setErr(''), 5000); }
    else { setMsg(m); setTimeout(() => setMsg(''), 5000); }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id + '-approve');
    try {
      await api.patch(`/purchase-orders/${id}/approve`);
      flashMsg('تم اعتماد أمر الشراء بنجاح ✅');
      fetchData();
    } catch (e: any) {
      flashMsg(e.response?.data?.message || 'حدث خطأ في الاعتماد', true);
    } finally { setActionLoading(null); }
  };

  const handleReceive = async (id: string) => {
    setActionLoading(id + '-receive');
    try {
      await api.patch(`/purchase-orders/${id}/receive`);
      flashMsg('تم تسجيل الاستلام وتحديث المخزون تلقائياً ✅');
      fetchData();
    } catch (e: any) {
      flashMsg(e.response?.data?.message || 'حدث خطأ في تسجيل الاستلام', true);
    } finally { setActionLoading(null); }
  };

  const addItem = () => setPoItems(prev => [...prev, { productId: '', quantity: 1, unitPrice: 0 }]);
  const removeItem = (i: number) => setPoItems(prev => prev.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: string, val: any) => {
    setPoItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  };

  const totalPO = poItems.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);

  const handleSubmitPO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poForm.vendorId || !poForm.branchId) { flashMsg('يرجى اختيار المورد والفرع', true); return; }
    if (poItems.some(i => !i.productId)) { flashMsg('يرجى اختيار الصنف لجميع البنود', true); return; }
    setSubmittingPO(true);
    try {
      const { data } = await api.post('/purchase-orders', { ...poForm, items: poItems });
      flashMsg(`تم إصدار ${data.data.poNumber} — في انتظار الاعتماد`);
      setPoForm({ vendorId: '', branchId: '', deliveryDate: '', notes: '' });
      setPoItems([{ productId: '', quantity: 1, unitPrice: 0 }]);
      setActiveTab('orders');
      fetchData();
    } catch (e: any) {
      flashMsg(e.response?.data?.message || 'فشل إنشاء أمر الشراء', true);
    } finally { setSubmittingPO(false); }
  };

  const handleSubmitVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorForm.nameAr) { flashMsg('اسم المورد مطلوب', true); return; }
    setSubmittingVendor(true);
    try {
      await api.post('/vendors', vendorForm);
      flashMsg('تم إضافة المورد بنجاح ✅');
      setVendorForm({ nameAr: '', nameEn: '', category: vendorCategories[0], phone: '', email: '', taxNumber: '' });
      setShowVendorForm(false);
      fetchData();
    } catch (e: any) {
      flashMsg(e.response?.data?.message || 'فشل إضافة المورد', true);
    } finally { setSubmittingVendor(false); }
  };

  // Stats
  const stats = {
    total: orders.length,
    approved: orders.filter(o => o.status === 'APPROVED').length,
    received: orders.filter(o => o.status === 'RECEIVED').length,
    totalValue: orders.reduce((s, o) => s + (o.totalAmount || 0), 0),
  };

  return (
    <div className="space-y-5 pb-10" dir="rtl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            إدارة المشتريات
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">أوامر الشراء — الاعتماد — الاستلام — الموردون</p>
        </div>
        <button
          onClick={() => setActiveTab('new')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition"
        >
          <Plus className="w-4 h-4" />
          أمر شراء جديد
        </button>
      </div>

      {/* Alerts */}
      {msg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl p-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {msg}
        </div>
      )}
      {err && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {err}
        </div>
      )}

      {/* Stats */}
      {activeTab === 'orders' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'إجمالي الأوامر', value: stats.total, icon: FileText, color: 'text-slate-600', bg: 'bg-slate-50' },
            { label: 'معتمدة (قيد التنفيذ)', value: stats.approved, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'مستلمة', value: stats.received, icon: PackageCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'إجمالي قيمة الشراء', value: stats.totalValue.toLocaleString('ar-EG') + ' ج.م', icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border border-slate-200 p-4 ${s.bg}`}>
              <div className="flex items-center justify-between mb-1">
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className="text-lg font-black text-slate-800">{s.value}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-2xl p-1 w-fit">
        {[
          { key: 'orders', label: 'أوامر الشراء' },
          { key: 'new', label: 'إنشاء أمر جديد' },
          { key: 'vendors', label: 'الموردون' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === t.key ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ===== TAB: ORDERS ===== */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="بحث برقم الأمر أو الملاحظات..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">كل الحالات</option>
              {Object.entries(statusConfig).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
              <p className="text-xs">جاري تحميل أوامر الشراء...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-semibold">لا توجد أوامر شراء</p>
              <p className="text-xs mt-1">اضغط "أمر شراء جديد" لإنشاء أول أمر</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {orders.map(order => {
                const st = statusConfig[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-600' };
                const isExpanded = expandedRow === order.id;
                return (
                  <div key={order.id}>
                    <div className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-slate-800">{order.poNumber}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                        </div>
                        <div className="flex gap-3 mt-0.5 text-[11px] text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{order.vendor?.nameAr}</span>
                          <span className="flex items-center gap-1"><Building className="w-3 h-3" />{order.branch?.nameAr}</span>
                          <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{order.totalAmount?.toLocaleString('ar-EG')} ج.م</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Approve button */}
                        {order.status === 'DRAFT' && canApprove && (
                          <button
                            onClick={() => handleApprove(order.id)}
                            disabled={actionLoading === order.id + '-approve'}
                            className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60 flex items-center gap-1"
                          >
                            {actionLoading === order.id + '-approve' ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                            اعتماد
                          </button>
                        )}
                        {/* Receive button */}
                        {order.status === 'APPROVED' && canReceive && (
                          <button
                            onClick={() => handleReceive(order.id)}
                            disabled={actionLoading === order.id + '-receive'}
                            className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-60 flex items-center gap-1"
                          >
                            {actionLoading === order.id + '-receive' ? <Loader2 className="w-3 h-3 animate-spin" /> : <PackageCheck className="w-3 h-3" />}
                            تسجيل استلام
                          </button>
                        )}
                        <button
                          onClick={() => setExpandedRow(isExpanded ? null : order.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="bg-slate-50 border-t border-slate-100 px-4 py-3">
                        <p className="text-[11px] font-bold text-slate-500 mb-2">بنود أمر الشراء</p>
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-slate-500 border-b border-slate-200">
                              <th className="text-right pb-1 font-semibold">الصنف</th>
                              <th className="text-center pb-1 font-semibold">الكمية</th>
                              <th className="text-center pb-1 font-semibold">سعر الوحدة</th>
                              <th className="text-left pb-1 font-semibold">الإجمالي</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items?.map((item: any) => (
                              <tr key={item.id} className="border-b border-slate-100 last:border-0">
                                <td className="py-1.5 font-medium">{item.product?.nameAr}</td>
                                <td className="py-1.5 text-center">{item.quantity} {item.product?.unit}</td>
                                <td className="py-1.5 text-center">{item.unitPrice?.toLocaleString('ar-EG')} ج.م</td>
                                <td className="py-1.5 text-left font-bold text-slate-700">{item.totalPrice?.toLocaleString('ar-EG')} ج.م</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {order.notes && <p className="text-[11px] text-slate-500 mt-2">📝 {order.notes}</p>}
                        <p className="text-[11px] text-slate-400 mt-1">أُنشئ بواسطة: {order.createdBy?.nameAr} | {new Date(order.createdAt).toLocaleDateString('ar-EG')}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===== TAB: NEW PO ===== */}
      {activeTab === 'new' && (
        <form onSubmit={handleSubmitPO} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <h2 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3">إنشاء أمر شراء جديد</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vendor */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">المورد <span className="text-red-500">*</span></label>
              <select
                value={poForm.vendorId}
                onChange={e => setPoForm(p => ({ ...p, vendorId: e.target.value }))}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">اختر المورد</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.nameAr}</option>)}
              </select>
            </div>

            {/* Branch */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">الفرع المستفيد <span className="text-red-500">*</span></label>
              <select
                value={poForm.branchId}
                onChange={e => setPoForm(p => ({ ...p, branchId: e.target.value }))}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">اختر الفرع</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.nameAr}</option>)}
              </select>
            </div>

            {/* Delivery Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">تاريخ التسليم المتوقع</label>
              <input
                type="date"
                value={poForm.deliveryDate}
                onChange={e => setPoForm(p => ({ ...p, deliveryDate: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">ملاحظات</label>
              <input
                type="text"
                value={poForm.notes}
                onChange={e => setPoForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="أي تعليمات للمورد..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Items Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700">الأصناف المطلوبة</label>
              <button type="button" onClick={addItem} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-bold transition">
                <Plus className="w-3.5 h-3.5" /> إضافة صنف
              </button>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-right px-3 py-2 font-semibold text-slate-600">الصنف</th>
                    <th className="text-center px-3 py-2 font-semibold text-slate-600 w-24">الكمية</th>
                    <th className="text-center px-3 py-2 font-semibold text-slate-600 w-28">سعر الوحدة</th>
                    <th className="text-center px-3 py-2 font-semibold text-slate-600 w-28">الإجمالي</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {poItems.map((item, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2">
                        <select
                          value={item.productId}
                          onChange={e => updateItem(i, 'productId', e.target.value)}
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">اختر الصنف</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.nameAr} ({p.unit})</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number" min="1" step="0.01"
                          value={item.quantity}
                          onChange={e => updateItem(i, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full text-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number" min="0" step="0.01"
                          value={item.unitPrice}
                          onChange={e => updateItem(i, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full text-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2 text-center font-bold text-slate-700">
                        {(item.quantity * item.unitPrice).toLocaleString('ar-EG')}
                      </td>
                      <td className="px-3 py-2">
                        {poItems.length > 1 && (
                          <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 transition">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Total */}
            <div className="flex justify-end mt-2">
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-xs font-black text-blue-800">
                الإجمالي: {totalPO.toLocaleString('ar-EG')} ج.م
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className="px-5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submittingPO}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60 flex items-center gap-2"
            >
              {submittingPO ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
              إصدار أمر الشراء
            </button>
          </div>
        </form>
      )}

      {/* ===== TAB: VENDORS ===== */}
      {activeTab === 'vendors' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowVendorForm(!showVendorForm)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition"
            >
              {showVendorForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showVendorForm ? 'إغلاق' : 'إضافة مورد جديد'}
            </button>
          </div>

          {/* Vendor Form */}
          {showVendorForm && (
            <form onSubmit={handleSubmitVendor} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-xs font-black text-slate-800 mb-4">بيانات المورد الجديد</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { label: 'اسم المورد (عربي)', field: 'nameAr', required: true, placeholder: 'شركة التوريدات المتحدة' },
                  { label: 'اسم المورد (إنجليزي)', field: 'nameEn', required: false, placeholder: 'United Supplies Co.' },
                  { label: 'رقم الهاتف', field: 'phone', required: false, placeholder: '0100 0000 000' },
                  { label: 'البريد الإلكتروني', field: 'email', required: false, placeholder: 'info@supplier.com' },
                  { label: 'الرقم الضريبي / السجل التجاري', field: 'taxNumber', required: false, placeholder: '123456789' },
                ].map(f => (
                  <div key={f.field}>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{f.label} {f.required && <span className="text-red-500">*</span>}</label>
                    <input
                      type="text"
                      required={f.required}
                      value={(vendorForm as any)[f.field]}
                      onChange={e => setVendorForm(p => ({ ...p, [f.field]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">مجال التوريد</label>
                  <select
                    value={vendorForm.category}
                    onChange={e => setVendorForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {vendorCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowVendorForm(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition">إلغاء</button>
                <button type="submit" disabled={submittingVendor} className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60 flex items-center gap-2">
                  {submittingVendor ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  حفظ المورد
                </button>
              </div>
            </form>
          )}

          {/* Vendors Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {vendors.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-semibold">لا يوجد موردون مسجلون</p>
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">المورد</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">التصنيف</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">الهاتف</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">البريد</th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-600">التقييم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vendors.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-800">{v.nameAr}</p>
                        {v.nameEn && <p className="text-slate-400 text-[10px]">{v.nameEn}</p>}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{v.category}</td>
                      <td className="px-4 py-3 text-slate-600">{v.phone || '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{v.email || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full text-[10px]">
                          ⭐ {v.rating?.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
