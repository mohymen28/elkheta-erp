'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useLanguageStore } from '@/store/language.store';
import {
  ShoppingCart,
  Plus,
  Search,
  Users,
  FileCheck,
  Building,
  DollarSign,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function PurchasingPage() {
  const { language } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'vendors'>('orders');
  const [search, setSearch] = useState('');

  const [orders, setOrders] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [poModalOpen, setPoModalOpen] = useState(false);
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  // PO Form
  const [poForm, setPoForm] = useState({
    vendorId: '',
    branchId: '',
    productId: '',
    quantity: 1,
    unitPrice: 0,
    notes: '',
  });

  // Vendor Form
  const [vendorForm, setVendorForm] = useState({
    nameAr: '',
    nameEn: '',
    category: 'مواد خام وتوريدات',
    phone: '',
    email: '',
    taxNumber: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [poRes, vRes, bRes, pRes] = await Promise.all([
        api.get('/purchase-orders'),
        api.get('/vendors'),
        api.get('/branches'),
        api.get('/products'),
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
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poForm.vendorId || !poForm.branchId || !poForm.productId) {
      setErr(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }
    setSubmitting(true);
    setErr('');
    try {
      await api.post('/purchase-orders', {
        vendorId: poForm.vendorId,
        branchId: poForm.branchId,
        notes: poForm.notes,
        items: [
          {
            productId: poForm.productId,
            quantity: Number(poForm.quantity),
            unitPrice: Number(poForm.unitPrice),
          },
        ],
      });
      setMsg(language === 'ar' ? 'تم إنشاء أمر الشراء بنجاح' : 'PO created successfully');
      setPoModalOpen(false);
      fetchData();
      setTimeout(() => setMsg(''), 4000);
    } catch (e: any) {
      setErr(e.response?.data?.message || 'حدث خطأ أثناء إصدار أمر الشراء');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorForm.nameAr.trim()) {
      setErr(language === 'ar' ? 'يرجى إدخال اسم المورد' : 'Please enter vendor name');
      return;
    }
    setSubmitting(true);
    setErr('');
    try {
      await api.post('/vendors', vendorForm);
      setMsg(language === 'ar' ? 'تم إضافة المورد المعتمد بنجاح' : 'Vendor added successfully');
      setVendorModalOpen(false);
      fetchData();
      setTimeout(() => setMsg(''), 4000);
    } catch (e: any) {
      setErr(e.response?.data?.message || 'حدث خطأ أثناء إضافة المورد');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredOrders = orders.filter((o) =>
    search ? (o.poNumber.includes(search) || o.vendor?.nameAr?.includes(search) || o.branch?.nameAr?.includes(search)) : true
  );

  const filteredVendors = vendors.filter((v) =>
    search ? (v.nameAr?.includes(search) || v.category?.includes(search)) : true
  );

  const totalValue = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            <span>{language === 'ar' ? 'إدارة المشتريات وأوامر الشراء (POs)' : 'Purchasing & Purchase Orders'}</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            {language === 'ar'
              ? 'أوامر الشراء الرسمية، المطابقة الثلاثية (3-Way Matching)، وقائمة الموردين المعتمدين'
              : 'Official purchase orders, 3-way matching, and certified vendors list'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setErr(''); setVendorModalOpen(true); }}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl transition cursor-pointer"
          >
            {language === 'ar' ? 'إضافة مورد' : 'Add Vendor'}
          </button>
          <button
            onClick={() => { setErr(''); setPoModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? 'إنشاء أمر شراء' : 'New PO'}</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold">{language === 'ar' ? 'إجمالي أوامر الشراء' : 'Total Purchase Orders'}</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{orders.length}</p>
          </div>
          <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold">{language === 'ar' ? 'إجمالي قيمة المشتريات' : 'Total Purchases Value'}</p>
            <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">{totalValue.toLocaleString()} <span className="text-xs">EGP</span></p>
          </div>
          <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold">{language === 'ar' ? 'الموردون المعتمدون' : 'Active Vendors'}</p>
            <p className="text-2xl font-black text-purple-600 mt-1">{vendors.length}</p>
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
            activeTab === 'orders' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {language === 'ar' ? `أوامر الشراء (${orders.length})` : `Purchase Orders (${orders.length})`}
        </button>
        <button
          onClick={() => setActiveTab('vendors')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeTab === 'vendors' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {language === 'ar' ? `دليل الموردين (${vendors.length})` : `Vendors Catalog (${vendors.length})`}
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="relative">
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
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs">جاري تحميل البيانات الحقيقية من الخادم...</p>
          </div>
        ) : activeTab === 'orders' ? (
          filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">لا توجد أوامر شراء مطابقة</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <tr>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'رقم أمر الشراء' : 'PO Number'}</th>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'المورد' : 'Vendor'}</th>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'الفرع المستفيد' : 'Branch'}</th>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'القيمة' : 'Amount'}</th>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'المطابقة الثلاثية (3-Way)' : '3-Way Match'}</th>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{po.poNumber}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{po.vendor?.nameAr}</td>
                      <td className="py-3.5 px-4 text-slate-600">{po.branch?.nameAr}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {po.totalAmount.toLocaleString()} EGP
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>{po.matchVerified ? 'مطابق ومعتمد (3-Way)' : 'قيد التدقيق'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          po.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                          po.status === 'RECEIVED' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {po.status === 'APPROVED' ? 'معتمد' : po.status === 'RECEIVED' ? 'تم الاستلام' : 'مسودة'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono">
                        {new Date(po.createdAt).toLocaleDateString('ar-EG')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          filteredVendors.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">لا يوجد موردون مسجلون</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <tr>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'اسم المورد' : 'Vendor Name'}</th>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'مجال التوريد' : 'Category'}</th>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'رقم الهاتف' : 'Phone'}</th>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'الرقم الضريبي' : 'Tax ID'}</th>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'التقييم' : 'Rating'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVendors.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-800">{v.nameAr}</td>
                      <td className="py-3.5 px-4 text-slate-600">{v.category}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{v.phone || '—'}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">{v.taxNumber || '—'}</td>
                      <td className="py-3.5 px-4 font-bold text-amber-600">⭐ {v.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Create PO Modal */}
      {poModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-base text-slate-800">إنشاء أمر شراء رسمي جديد (PO)</h3>
              <button onClick={() => setPoModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreatePO} className="p-6 space-y-4">
              {err && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">{err}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المورد المعتمد *</label>
                  <select
                    required
                    value={poForm.vendorId}
                    onChange={(e) => setPoForm({ ...poForm, vendorId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="">اختر المورد...</option>
                    {vendors.map((v) => <option key={v.id} value={v.id}>{v.nameAr}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الفرع المستفيد *</label>
                  <select
                    required
                    value={poForm.branchId}
                    onChange={(e) => setPoForm({ ...poForm, branchId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="">اختر الفرع...</option>
                    {branches.map((b) => <option key={b.id} value={b.id}>{b.nameAr}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">الصنف المطلوب *</label>
                  <select
                    required
                    value={poForm.productId}
                    onChange={(e) => setPoForm({ ...poForm, productId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="">اختر الصنف من الدليل...</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.nameAr} ({p.unit})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الكمية *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={poForm.quantity}
                    onChange={(e) => setPoForm({ ...poForm, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">سعر الوحدة (EGP) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={poForm.unitPrice}
                    onChange={(e) => setPoForm({ ...poForm, unitPrice: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات التوريد</label>
                  <input
                    type="text"
                    value={poForm.notes}
                    onChange={(e) => setPoForm({ ...poForm, notes: e.target.value })}
                    placeholder="شروط التسليم أو الملاحظات..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setPoModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">إلغاء</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md">
                  {submitting ? 'جاري الإصدار...' : 'إصدار أمر الشراء'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Vendor Modal */}
      {vendorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-base text-slate-800">إضافة مورد جديد معتمد</h3>
              <button onClick={() => setVendorModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateVendor} className="p-6 space-y-4">
              {err && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">{err}</div>}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المورد / الشركة *</label>
                <input
                  type="text"
                  required
                  value={vendorForm.nameAr}
                  onChange={(e) => setVendorForm({ ...vendorForm, nameAr: e.target.value })}
                  placeholder="مثلاً: شركة النيل للتوريدات"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">مجال التوريد *</label>
                <input
                  type="text"
                  required
                  value={vendorForm.category}
                  onChange={(e) => setVendorForm({ ...vendorForm, category: e.target.value })}
                  placeholder="مواد خام، قطع غيار، مستلزمات..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={vendorForm.phone}
                    onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                    placeholder="010XXXXXXXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الرقم الضريبي</label>
                  <input
                    type="text"
                    value={vendorForm.taxNumber}
                    onChange={(e) => setVendorForm({ ...vendorForm, taxNumber: e.target.value })}
                    placeholder="XXX-XXX-XXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setVendorModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">إلغاء</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md">
                  {submitting ? 'جاري الإضافة...' : 'حفظ المورد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
