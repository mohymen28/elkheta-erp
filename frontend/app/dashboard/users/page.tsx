'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { roleLabels } from '@/store/auth.store';
import { Users, Search, Shield, Building, Mail, Phone } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const { data } = await api.get(`/users?${params}`);
      setUsers(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          <span>المستخدمون وهيكل الصلاحيات (RBAC)</span>
        </h1>
        <p className="text-slate-400 text-xs mt-0.5">
          قائمة بحسابات الموظفين والمدراء وتوزيع أدوارهم على الفروع
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="بحث بالاسم، البريد، أو رقم الموظف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs">جاري تحميل المستخدمين...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-sm text-slate-700">لا يوجد مستخدمون مطابقون</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="py-3.5 px-4">رقم الموظف</th>
                  <th className="py-3.5 px-4">الاسم</th>
                  <th className="py-3.5 px-4">البريد الإلكتروني</th>
                  <th className="py-3.5 px-4">الدور / الصلاحية</th>
                  <th className="py-3.5 px-4">الفرع</th>
                  <th className="py-3.5 px-4">القسم</th>
                  <th className="py-3.5 px-4">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-600">{u.employeeId}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{u.nameAr}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        {roleLabels[u.role as keyof typeof roleLabels] || u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{u.branch?.nameAr || 'المقر الرئيسي'}</td>
                    <td className="py-3.5 px-4 text-slate-500">{u.department?.nameAr || '—'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {u.isActive ? 'نشط' : 'معطل'}
                      </span>
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
