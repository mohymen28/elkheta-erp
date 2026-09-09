'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import {
  Users, Search, Plus, Shield, Building, Mail, Phone,
  Edit2, Lock, ToggleLeft, ToggleRight, X, CheckCircle2,
  AlertCircle, Loader2, UserPlus, KeyRound, Eye, EyeOff,
} from 'lucide-react';

type Role = 'SUPER_ADMIN' | 'PURCHASE_MANAGER' | 'BRANCH_MANAGER' | 'DEPARTMENT_HEAD' | 'WAREHOUSE_KEEPER' | 'ACCOUNTANT' | 'EMPLOYEE';

const roleConfig: Record<Role, { label: string; color: string }> = {
  SUPER_ADMIN:      { label: 'مدير النظام',      color: 'bg-purple-100 text-purple-700' },
  PURCHASE_MANAGER: { label: 'مدير المشتريات',   color: 'bg-blue-100 text-blue-700' },
  BRANCH_MANAGER:   { label: 'مدير الفرع',        color: 'bg-emerald-100 text-emerald-700' },
  DEPARTMENT_HEAD:  { label: 'رئيس القسم',        color: 'bg-amber-100 text-amber-700' },
  WAREHOUSE_KEEPER: { label: 'أمين المخزن',       color: 'bg-orange-100 text-orange-700' },
  ACCOUNTANT:       { label: 'محاسب',             color: 'bg-teal-100 text-teal-700' },
  EMPLOYEE:         { label: 'موظف',              color: 'bg-slate-100 text-slate-600' },
};

const allRoles = Object.entries(roleConfig) as [Role, { label: string; color: string }][];

const emptyUserForm = {
  employeeId: '', nameAr: '', nameEn: '', email: '',
  password: '', role: 'EMPLOYEE' as Role, branchId: '', phone: '',
};

export default function UsersPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');

  // Alerts
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  // Modals
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState<any | null>(null);
  const [resetModal, setResetModal] = useState<any | null>(null);

  // Forms
  const [addForm, setAddForm] = useState({ ...emptyUserForm });
  const [editForm, setEditForm] = useState<any>({});
  const [newPassword, setNewPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showEditPwd, setShowEditPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const flashMsg = (m: string, isErr = false) => {
    if (isErr) { setErr(m); setTimeout(() => setErr(''), 5000); }
    else { setMsg(m); setTimeout(() => setMsg(''), 5000); }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);
      if (branchFilter) params.append('branchId', branchFilter);
      const [uRes, bRes] = await Promise.all([
        api.get(`/users?${params}`),
        api.get('/branches'),
      ]);
      setUsers(uRes.data.data || []);
      setBranches(bRes.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, branchFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Add User
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.employeeId || !addForm.nameAr || !addForm.email || !addForm.password) {
      flashMsg('يرجى ملء جميع الحقول المطلوبة', true);
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/users', {
        ...addForm,
        branchId: addForm.branchId || null,
      });
      flashMsg(`تم إضافة الموظف ${addForm.nameAr} بنجاح ✅`);
      setAddForm({ ...emptyUserForm });
      setAddModal(false);
      fetchData();
    } catch (e: any) {
      flashMsg(e.response?.data?.message || 'فشل إنشاء المستخدم', true);
    } finally { setSubmitting(false); }
  };

  // Edit User
  const openEdit = (u: any) => {
    setEditForm({
      nameAr: u.nameAr || '',
      nameEn: u.nameEn || '',
      email: u.email || '',
      role: u.role || 'EMPLOYEE',
      branchId: u.branchId || '',
      phone: u.phone || '',
    });
    setEditModal(u);
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal) return;
    setSubmitting(true);
    try {
      await api.put(`/users/${editModal.id}`, {
        ...editForm,
        branchId: editForm.branchId || null,
      });
      flashMsg('تم تحديث بيانات الموظف بنجاح ✅');
      setEditModal(null);
      fetchData();
    } catch (e: any) {
      flashMsg(e.response?.data?.message || 'فشل تحديث البيانات', true);
    } finally { setSubmitting(false); }
  };

  // Toggle Active
  const handleToggleActive = async (u: any) => {
    try {
      await api.put(`/users/${u.id}`, { isActive: !u.isActive });
      flashMsg(u.isActive ? `تم تعطيل حساب ${u.nameAr}` : `تم تفعيل حساب ${u.nameAr} ✅`);
      fetchData();
    } catch (e: any) {
      flashMsg(e.response?.data?.message || 'حدث خطأ', true);
    }
  };

  // Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      flashMsg('كلمة المرور يجب أن تكون 6 أحرف على الأقل', true);
      return;
    }
    setSubmitting(true);
    try {
      await api.put(`/users/${resetModal.id}`, { password: newPassword });
      flashMsg(`تم إعادة تعيين كلمة مرور ${resetModal.nameAr} بنجاح ✅`);
      setResetModal(null);
      setNewPassword('');
    } catch (e: any) {
      flashMsg(e.response?.data?.message || 'فشل تغيير كلمة المرور', true);
    } finally { setSubmitting(false); }
  };

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-5 pb-10" dir="rtl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            إدارة المستخدمين والصلاحيات
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">إضافة الموظفين، تعديل الأدوار، إدارة الوصول</p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => setAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition"
          >
            <UserPlus className="w-4 h-4" />
            إضافة موظف
          </button>
        )}
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

      {/* Role Permission Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <p className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> دليل الأدوار والصلاحيات</p>
        <div className="flex flex-wrap gap-2">
          {allRoles.map(([role, cfg]) => (
            <span key={role} className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${cfg.color}`}>
              {cfg.label}
            </span>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="بحث بالاسم أو البريد أو رقم الموظف..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">كل الأدوار</option>
          {allRoles.map(([role, cfg]) => (
            <option key={role} value={role}>{cfg.label}</option>
          ))}
        </select>
        <select
          value={branchFilter}
          onChange={e => setBranchFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">كل الفروع</option>
          {branches.map(b => <option key={b.id} value={b.id}>{b.nameAr}</option>)}
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
            <p className="text-xs">جاري تحميل المستخدمين...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-semibold">لا يوجد مستخدمون</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">الموظف</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">رقم الموظف</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">الدور</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">الفرع</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600">الحالة</th>
                  {isSuperAdmin && <th className="text-center px-4 py-3 font-semibold text-slate-600">الإجراءات</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => {
                  const roleCfg = roleConfig[u.role as Role] || { label: u.role, color: 'bg-gray-100 text-gray-600' };
                  return (
                    <tr key={u.id} className={`hover:bg-slate-50 transition ${!u.isActive ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-800">{u.nameAr}</p>
                        <p className="text-slate-400 text-[10px] flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" /> {u.email}
                        </p>
                        {u.phone && (
                          <p className="text-slate-400 text-[10px] flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {u.phone}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600 font-bold">{u.employeeId}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${roleCfg.color}`}>
                          {roleCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {u.branch ? (
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3 text-slate-400" /> {u.branch.nameAr}
                          </span>
                        ) : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                          {u.isActive ? 'نشط' : 'معطل'}
                        </span>
                      </td>
                      {isSuperAdmin && (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Edit */}
                            <button
                              onClick={() => openEdit(u)}
                              title="تعديل البيانات"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {/* Reset Password */}
                            <button
                              onClick={() => { setResetModal(u); setNewPassword(''); }}
                              title="إعادة تعيين كلمة المرور"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                            {/* Toggle Active — can't deactivate self */}
                            {u.id !== currentUser?.id && (
                              <button
                                onClick={() => handleToggleActive(u)}
                                title={u.isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                                className={`p-1.5 rounded-lg transition ${u.isActive ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                              >
                                {u.isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== ADD USER MODAL ===== */}
      {addModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-600" /> إضافة موظف جديد
              </h2>
              <button onClick={() => setAddModal(false)} className="text-slate-400 hover:text-slate-700 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'رقم الموظف', field: 'employeeId', type: 'text', placeholder: 'EMP-010', required: true },
                  { label: 'الاسم بالعربي', field: 'nameAr', type: 'text', placeholder: 'أحمد محمد', required: true },
                  { label: 'الاسم بالإنجليزي', field: 'nameEn', type: 'text', placeholder: 'Ahmed Mohamed', required: false },
                  { label: 'البريد الإلكتروني', field: 'email', type: 'email', placeholder: 'ahmed@elkheta.com', required: true },
                  { label: 'رقم الهاتف', field: 'phone', type: 'text', placeholder: '0100 0000 000', required: false },
                ].map(f => (
                  <div key={f.field} className={f.field === 'employeeId' || f.field === 'nameAr' ? 'col-span-1' : 'col-span-1'}>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{f.label} {f.required && <span className="text-red-500">*</span>}</label>
                    <input
                      type={f.type}
                      required={f.required}
                      value={(addForm as any)[f.field]}
                      onChange={e => setAddForm(p => ({ ...p, [f.field]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}

                {/* Password */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={addForm.password}
                      onChange={e => setAddForm(p => ({ ...p, password: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 pl-9"
                    />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Role */}
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">الدور <span className="text-red-500">*</span></label>
                  <select
                    value={addForm.role}
                    onChange={e => setAddForm(p => ({ ...p, role: e.target.value as Role }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {allRoles.map(([role, cfg]) => (
                      <option key={role} value={role}>{cfg.label}</option>
                    ))}
                  </select>
                </div>

                {/* Branch */}
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">الفرع</label>
                  <select
                    value={addForm.branchId}
                    onChange={e => setAddForm(p => ({ ...p, branchId: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">بدون فرع (مقر رئيسي)</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.nameAr}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setAddModal(false)} className="px-5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition">
                  إلغاء
                </button>
                <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60 flex items-center gap-2">
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                  إضافة الموظف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== EDIT USER MODAL ===== */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" /> تعديل بيانات: {editModal.nameAr}
              </h2>
              <button onClick={() => setEditModal(null)} className="text-slate-400 hover:text-slate-700 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditUser} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'الاسم بالعربي', field: 'nameAr', type: 'text', required: true },
                  { label: 'الاسم بالإنجليزي', field: 'nameEn', type: 'text', required: false },
                  { label: 'البريد الإلكتروني', field: 'email', type: 'email', required: true },
                  { label: 'رقم الهاتف', field: 'phone', type: 'text', required: false },
                ].map(f => (
                  <div key={f.field}>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{f.label} {f.required && <span className="text-red-500">*</span>}</label>
                    <input
                      type={f.type}
                      required={f.required}
                      value={editForm[f.field] || ''}
                      onChange={e => setEditForm((p: any) => ({ ...p, [f.field]: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}

                {/* Role */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الدور / الصلاحية</label>
                  <select
                    value={editForm.role}
                    onChange={e => setEditForm((p: any) => ({ ...p, role: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {allRoles.map(([role, cfg]) => (
                      <option key={role} value={role}>{cfg.label}</option>
                    ))}
                  </select>
                </div>

                {/* Branch */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الفرع</label>
                  <select
                    value={editForm.branchId || ''}
                    onChange={e => setEditForm((p: any) => ({ ...p, branchId: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">بدون فرع (مقر رئيسي)</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.nameAr}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setEditModal(null)} className="px-5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition">إلغاء</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60 flex items-center gap-2">
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== RESET PASSWORD MODAL ===== */}
      {resetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" /> إعادة تعيين كلمة المرور
              </h2>
              <button onClick={() => setResetModal(null)} className="text-slate-400 hover:text-slate-700 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleResetPassword} className="p-5 space-y-4">
              <p className="text-xs text-slate-600">
                إعادة تعيين كلمة المرور للموظف: <strong>{resetModal.nameAr}</strong>
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">كلمة المرور الجديدة</label>
                <div className="relative">
                  <input
                    type={showEditPwd ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 pl-9"
                  />
                  <button type="button" onClick={() => setShowEditPwd(!showEditPwd)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showEditPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setResetModal(null)} className="px-5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition">إلغاء</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition disabled:opacity-60 flex items-center gap-2">
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                  تغيير كلمة المرور
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
