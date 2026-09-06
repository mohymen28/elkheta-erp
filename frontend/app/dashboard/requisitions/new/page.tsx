'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Plus, Trash2, ArrowRight, Save, Send, AlertTriangle } from 'lucide-react';

interface ItemRow {
  productId: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  notes: string;
}

export default function NewRequisitionPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [flows, setFlows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    type: 'PURCHASE',
    urgency: 'MEDIUM',
    notes: '',
    justification: '',
    requiredDate: '',
    flowTemplateId: '',
  });

  const [items, setItems] = useState<ItemRow[]>([
    { productId: '', quantity: 1, unit: 'قطعة', estimatedPrice: 0, notes: '' },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, flowsRes] = await Promise.all([
          api.get('/products'),
          api.get('/approval-flows'),
        ]);
        setProducts(prodRes.data.data || []);
        setFlows(flowsRes.data.data || []);
        if (flowsRes.data.data && flowsRes.data.data.length > 0) {
          setForm((prev) => ({ ...prev, flowTemplateId: flowsRes.data.data[0].id }));
        }
      } catch (err) {
        console.error('Failed to load form prerequisites:', err);
      }
    };
    fetchData();
  }, []);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { productId: '', quantity: 1, unit: 'قطعة', estimatedPrice: 0, notes: '' },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateItem = (index: number, field: keyof ItemRow, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      // Auto-populate unit if product changed
      if (field === 'productId') {
        const selectedProd = products.find((p) => p.id === value);
        if (selectedProd) {
          updated[index].unit = selectedProd.unit || 'قطعة';
        }
      }
      return updated;
    });
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.estimatedPrice) || 0), 0);
  };

  const handleSubmit = async (e: React.FormEvent, submitDirectly: boolean) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) {
      setError('يرجى إدخال عنوان الطلب');
      return;
    }

    const validItems = items.filter((i) => i.productId && Number(i.quantity) > 0);
    if (validItems.length === 0) {
      setError('يرجى اختيار صنف وتحديد الكمية بشكل صحيح لبند واحد على الأقل');
      return;
    }

    setLoading(true);

    try {
      // 1. Create requisition
      const { data } = await api.post('/requisitions', {
        title: form.title,
        type: form.type,
        urgency: form.urgency,
        notes: form.notes || null,
        justification: form.justification || null,
        requiredDate: form.requiredDate || null,
        flowTemplateId: form.flowTemplateId || null,
        items: validItems.map((i) => ({
          productId: i.productId,
          quantity: Number(i.quantity),
          unit: i.unit,
          estimatedPrice: Number(i.estimatedPrice) || 0,
          notes: i.notes || null,
        })),
      });

      const newId = data.data.id;

      // 2. If user chose to submit for approval immediately
      if (submitDirectly) {
        await api.patch(`/requisitions/${newId}/submit`);
      }

      router.push(`/dashboard/requisitions/${newId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء حفظ الطلب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition"
        >
          <ArrowRight className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800">إنشاء طلب احتياج داخلي جديد</h1>
          <p className="text-slate-400 text-xs">قم بتحديد الأصناف والكميات ومسار الموافقات المطلوب</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3">بيانات الطلب العامة</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">عنوان الطلب *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="مثلاً: طلب مواد خام لشهر أكتوبر - فرع الرياض"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">نوع الطلب</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              >
                <option value="PURCHASE">شراء خارجي (Central Purchasing)</option>
                <option value="TRANSFER">نقل من المخزن الرئيسي (Internal Transfer)</option>
                <option value="SERVICE">طلب خدمة أو صيانة خارجية</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">درجة الأهمية / الأولوية</label>
              <select
                value={form.urgency}
                onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              >
                <option value="LOW">عادية / منخفضة</option>
                <option value="MEDIUM">متوسطة</option>
                <option value="HIGH">عاجلة جداً (تتطلب اعتماد سريع)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">التاريخ المطلوب لتوافر المواد</label>
              <input
                type="date"
                value={form.requiredDate}
                onChange={(e) => setForm({ ...form, requiredDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">مسار الموافقات</label>
              <select
                value={form.flowTemplateId}
                onChange={(e) => setForm({ ...form, flowTemplateId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              >
                {flows.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.description || 'قياسي'})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">مبررات ودواعي الطلب</label>
              <textarea
                rows={2}
                value={form.justification}
                onChange={(e) => setForm({ ...form, justification: e.target.value })}
                placeholder="وضح سبب الحاجة لهذه المواد (مثلاً: لتنفيذ خطة الإنتاج أو نفاد المخزون)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Items Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-black text-slate-800">بنود وأصناف الطلب</h2>
              <p className="text-slate-400 text-xs">أضف الأصناف والكميات المطلوبة</p>
            </div>
            <button
              type="button"
              onClick={addItem}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة صنف</span>
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-4">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">الصنف *</label>
                  <select
                    value={item.productId}
                    onChange={(e) => updateItem(idx, 'productId', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">اختر الصنف من الدليل...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nameAr} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">الكمية *</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">الوحدة</label>
                  <input
                    type="text"
                    value={item.unit}
                    onChange={(e) => updateItem(idx, 'unit', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">السعر التقديري (ر.س)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={item.estimatedPrice}
                    onChange={(e) => updateItem(idx, 'estimatedPrice', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div className="md:col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    disabled={items.length <= 1}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition disabled:opacity-30"
                    title="حذف البند"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Total Calculation */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-600">الإجمالي التقديري للطلب:</span>
            <span className="font-black text-sm text-blue-600 font-mono">
              {calculateTotal().toLocaleString('ar-SA')} ر.س
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
          >
            إلغاء
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={(e) => handleSubmit(e, false)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-blue-600 text-blue-600 font-bold text-xs hover:bg-blue-50 flex items-center justify-center gap-2 transition disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>حفظ كمسودة</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            onClick={(e) => handleSubmit(e, true)}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition disabled:opacity-60"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>إرسال الطلب للموافقة مباشرة</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
