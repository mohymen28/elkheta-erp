'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Package, Search, Plus, Tag } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCat) params.append('categoryId', selectedCat);

      const [pRes, cRes] = await Promise.all([
        api.get(`/products?${params}`),
        api.get('/categories'),
      ]);
      setProducts(pRes.data.data || []);
      setCategories(cRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, selectedCat]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            <span>دليل الأصناف والمواد (Product Catalog)</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            إدارة كافة المواد الخام، قطع الغيار، والمستلزمات ووحدات القياس
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="بحث باسم أو كود الصنف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
        >
          <option value="">جميع الفئات</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nameAr}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs">جاري تحميل دليل الأصناف...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-sm text-slate-700">لا توجد أصناف مطابقة</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="py-3.5 px-4">كود الصنف</th>
                  <th className="py-3.5 px-4">اسم الصنف (عربي)</th>
                  <th className="py-3.5 px-4">الاسم بالإنجليزية</th>
                  <th className="py-3.5 px-4">الفئة</th>
                  <th className="py-3.5 px-4">الوحدة</th>
                  <th className="py-3.5 px-4">الحد الأدنى للطلب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{p.code}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{p.nameAr}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-sans">{p.nameEn || '—'}</td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                        {p.category?.nameAr}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{p.unit}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 font-semibold">{p.minStock}</td>
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
