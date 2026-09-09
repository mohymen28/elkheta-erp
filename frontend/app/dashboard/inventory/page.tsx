'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
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
  X,
  Send,
} from 'lucide-react';

export default function InventoryPage() {
  const { language } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<'balances' | 'transfers'>('balances');
  const [search, setSearch] = useState('');

  const [stocks, setStocks] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Transfer modal
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const [transferForm, setTransferForm] = useState({
    fromBranchId: '',
    toBranchId: '',
    productId: '',
    quantity: 1,
    notes: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, tRes, bRes, pRes] = await Promise.all([
        api.get('/inventory/stocks'),
        api.get('/inventory/transfers'),
        api.get('/branches'),
        api.get('/products'),
      ]);
      setStocks(sRes.data.data || []);
      setTransfers(tRes.data.data || []);
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

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferForm.fromBranchId || !transferForm.toBranchId || !transferForm.productId) {
      setErr('يرجى تحديد المخزن المرسل والمستلم والصنف المطلوب');
      return;
    }
    if (transferForm.fromBranchId === transferForm.toBranchId) {
      setErr('لا يمكن التحويل لنفس المخزن');
      return;
    }

    setSubmitting(true);
    setErr('');
    try {
      await api.post('/inventory/transfers', {
        fromBranchId: transferForm.fromBranchId,
        toBranchId: transferForm.toBranchId,
        notes: transferForm.notes,
        items: [
          {
            productId: transferForm.productId,
            quantity: Number(transferForm.quantity),
          },
        ],
      });
      setMsg('تم إصدار إذن التحويل وخصم الكميات من المخزن المرسل بنجاح');
      setTransferModalOpen(false);
      fetchData();
      setTimeout(() => setMsg(''), 4000);
    } catch (e: any) {
      setErr(e.response?.data?.message || 'حدث خطأ أثناء إصدار إذن التحويل');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeliverTransfer = async (transferId: string) => {
    try {
      await api.patch(`/inventory/transfers/${transferId}/status`, { status: 'DELIVERED' });
      setMsg('تم تأكيد استلام الشحنة وإضافة الأرصدة للمخزن المستلم بنجاح ✅');
      fetchData();
      setTimeout(() => setMsg(''), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredStocks = stocks.filter((s) =>
    search ? (s.product?.nameAr?.includes(search) || s.branch?.nameAr?.includes(search) || s.product?.code?.includes(search)) : true
  );

  const filteredTransfers = transfers.filter((t) =>
    search ? (t.transferNo.includes(search) || t.fromBranch?.nameAr?.includes(search) || t.toBranch?.nameAr?.includes(search)) : true
  );

  const lowStockItems = stocks.filter((s) => s.quantity <= (s.minStock || s.product?.minStock || 0));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
            <Warehouse className="w-6 h-6 text-blue-600" />
            <span>{language === 'ar' ? 'إدارة المخازن والتحويلات الفعلية' : 'Warehouse Inventory & Real Transfers'}</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            {language === 'ar'
              ? 'متابعة أرصدة الأصناف الحقيقية في الفروع السبعة وأذونات النقل والخصم والإضافة التلقائية'
              : 'Live inventory stock across all 7 branches and automated transfer receipts'}
          </p>
        </div>

        <button
          onClick={() => { setErr(''); setTransferModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>{language === 'ar' ? 'إذن تحويل مخزني جديد' : 'New Transfer'}</span>
        </button>
      </div>

      {msg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold">{language === 'ar' ? 'الفروع والمخازن المسجلة' : 'Registered Branches'}</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{branches.length} فروع ومخازن</p>
          </div>
          <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold">{language === 'ar' ? 'عدد حركات المخزون المسجلة' : 'Stock Balances Tracked'}</p>
            <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">{stocks.length} سجل</p>
          </div>
          <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold">{language === 'ar' ? 'تنبيهات انخفاض الحد الأدنى' : 'Low Stock Alerts'}</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{lowStockItems.length} صنف</p>
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
            activeTab === 'balances' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {language === 'ar' ? `الأرصدة الفعلية في الفروع والمخازن (${stocks.length})` : `Live Stock Balances (${stocks.length})`}
        </button>
        <button
          onClick={() => setActiveTab('transfers')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeTab === 'transfers' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {language === 'ar' ? `أذونات التحويل الداخلي (${transfers.length})` : `Stock Transfers (${transfers.length})`}
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={language === 'ar' ? 'بحث برقم الإذن، اسم الفرع، أو اسم الصنف...' : 'Search by transfer number, branch, or product...'}
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
            <p className="text-xs">جاري تحميل أرصدة المخازن الحقيقية...</p>
          </div>
        ) : activeTab === 'balances' ? (
          filteredStocks.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">لا توجد أرصدة مطابقة</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <tr>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'الفرع / المخزن' : 'Branch / Store'}</th>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'المدير المسؤول' : 'Manager'}</th>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'كود الصنف' : 'SKU'}</th>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'اسم الصنف' : 'Product'}</th>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'الرصيد المتوفر' : 'Current Stock'}</th>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'الحد الأدنى' : 'Min Reorder'}</th>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'حالة المخزون' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStocks.map((st) => {
                    const isLow = st.quantity <= (st.minStock || st.product?.minStock || 0);
                    return (
                      <tr key={st.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {st.branch?.nameAr} <span className="text-[10px] text-blue-600 font-mono">({st.branch?.code})</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {st.branch?.managerName || '—'}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-600">{st.product?.code}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{st.product?.nameAr}</td>
                        <td className="py-3.5 px-4 font-mono font-black text-blue-600 text-sm">
                          {st.quantity} {st.product?.unit}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-500">
                          {st.minStock || st.product?.minStock}
                        </td>
                        <td className="py-3.5 px-4">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-3 h-3" />
                              <span>منخفض (يتطلب طلب احتياج)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>متوفر وكافي</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          filteredTransfers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">لا توجد أذونات تحويل مسجلة</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <tr>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'رقم الإذن' : 'Transfer No'}</th>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'من مخزن' : 'From'}</th>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'إلى مخزن' : 'To'}</th>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'الأصناف' : 'Items'}</th>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                    <th className="py-3.5 px-4">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                    <th className="py-3.5 px-4 text-center">{language === 'ar' ? 'الإجراء' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransfers.map((tr) => (
                    <tr key={tr.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{tr.transferNo}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{tr.fromBranch?.nameAr}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{tr.toBranch?.nameAr}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {tr.items?.map((it: any) => `${it.product?.nameAr} (${it.quantity})`).join(', ')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          tr.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {tr.status === 'DELIVERED' ? 'تم الاستلام وإيداع الرصيد' : 'في طريق الشحن 🚚'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono">
                        {new Date(tr.createdAt).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {tr.status !== 'DELIVERED' && (
                          <button
                            onClick={() => handleDeliverTransfer(tr.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg shadow-sm transition"
                          >
                            تأكيد الاستلام بالفرع
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Transfer Modal */}
      {transferModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-base text-slate-800">إصدار إذن تحويل مخزني داخلي</h3>
              <button onClick={() => setTransferModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTransfer} className="p-6 space-y-4">
              {err && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">{err}</div>}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">من مخزن / فرع *</label>
                  <select
                    required
                    value={transferForm.fromBranchId}
                    onChange={(e) => setTransferForm({ ...transferForm, fromBranchId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="">اختر المخزن المرسل...</option>
                    {branches.map((b) => <option key={b.id} value={b.id}>{b.nameAr}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">إلى مخزن / فرع *</label>
                  <select
                    required
                    value={transferForm.toBranchId}
                    onChange={(e) => setTransferForm({ ...transferForm, toBranchId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="">اختر المخزن المستلم...</option>
                    {branches.map((b) => <option key={b.id} value={b.id}>{b.nameAr}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">الصنف المراد تحويله *</label>
                  <select
                    required
                    value={transferForm.productId}
                    onChange={(e) => setTransferForm({ ...transferForm, productId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="">اختر الصنف...</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.nameAr} ({p.unit})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الكمية *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={transferForm.quantity}
                    onChange={(e) => setTransferForm({ ...transferForm, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات الشحن والتحويل</label>
                <input
                  type="text"
                  value={transferForm.notes}
                  onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
                  placeholder="سبب التحويل أو بيانات السائق..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setTransferModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">إلغاء</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md">
                  {submitting ? 'جاري التحويل...' : 'تأكيد وإصدار الإذن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
