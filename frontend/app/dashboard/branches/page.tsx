'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useLanguageStore } from '@/store/language.store';
import {
  Building2,
  Phone,
  MapPin,
  Users,
  Layers,
  UserCheck,
  Plus,
  Edit2,
  CheckCircle2,
  X,
  AlertCircle,
} from 'lucide-react';

interface Branch {
  id: string;
  nameAr: string;
  nameEn?: string | null;
  code: string;
  address?: string | null;
  phone?: string | null;
  managerName?: string | null;
  isActive: boolean;
  _count?: {
    users: number;
    departments: number;
  };
}

export default function BranchesPage() {
  const { language, t } = useLanguageStore();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [form, setForm] = useState({
    nameAr: '',
    nameEn: '',
    code: '',
    managerName: '',
    phone: '',
    address: '',
  });

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await api.get('/branches');
      setBranches(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleOpenCreate = () => {
    setEditingBranch(null);
    setForm({
      nameAr: '',
      nameEn: '',
      code: '',
      managerName: '',
      phone: '',
      address: '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setForm({
      nameAr: branch.nameAr,
      nameEn: branch.nameEn || '',
      code: branch.code,
      managerName: branch.managerName || '',
      phone: branch.phone || '',
      address: branch.address || '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nameAr.trim() || !form.code.trim()) {
      setError(language === 'ar' ? 'يرجى ملء اسم الفرع وكود الفرع' : 'Please fill branch name and code');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (editingBranch) {
        // Update
        await api.put(`/branches/${editingBranch.id}`, form);
        setSuccess(language === 'ar' ? 'تم تحديث بيانات الفرع واسم المدير بنجاح' : 'Branch and manager updated successfully');
      } else {
        // Create
        await api.post('/branches', form);
        setSuccess(language === 'ar' ? 'تم إضافة الفرع الجديد بنجاح' : 'New branch added successfully');
      }
      setModalOpen(false);
      fetchBranches();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء حفظ الفرع');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <span>{t('branches.title')}</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            {t('branches.subtitle')}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{t('branches.add')}</span>
        </button>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Branches Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs">{t('common.loading')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {branches.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-4 relative flex flex-col justify-between"
            >
              <div>
                {/* Header card info */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                    {b.code}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(b)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title={t('branches.edit')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  </div>
                </div>

                {/* Branch Name */}
                <div>
                  <h3 className="font-black text-base text-slate-800">
                    {language === 'ar' ? b.nameAr : (b.nameEn || b.nameAr)}
                  </h3>
                  {b.nameEn && language === 'ar' && (
                    <p className="text-xs text-slate-400 font-sans">{b.nameEn}</p>
                  )}
                </div>

                {/* Manager Name Badge */}
                <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50/60 rounded-xl border border-blue-100 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                      {t('branches.manager')}
                    </p>
                    <p className="text-xs font-black text-slate-800 truncate">
                      {b.managerName || (language === 'ar' ? 'لم يُحدد بعد' : 'Not assigned yet')}
                    </p>
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-2 text-xs text-slate-600 pt-3 mt-3 border-t border-slate-100">
                  {b.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{b.address}</span>
                    </div>
                  )}
                  {b.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-mono">{b.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Counters footer */}
              <div className="flex items-center justify-between text-slate-400 text-xs pt-3 border-t border-slate-100 mt-2">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-bold text-slate-700">{b._count?.users || 0}</span> {t('branches.employeeCount')}
                </span>
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-purple-500" />
                  <span className="font-bold text-slate-700">{b._count?.departments || 0}</span> {t('branches.deptCount')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Branch Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-base text-slate-800">
                {editingBranch ? t('branches.edit') : t('branches.add')}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('branches.nameAr')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nameAr}
                    onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                    placeholder="مثلاً: فرع سباهي"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('branches.code')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="مثلاً: SPH-01"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('branches.nameEn')}
                  </label>
                  <input
                    type="text"
                    value={form.nameEn}
                    onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                    placeholder="e.g. Spahi Branch"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-blue-700 mb-1 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{t('branches.manager')} *</span>
                  </label>
                  <input
                    type="text"
                    value={form.managerName}
                    onChange={(e) => setForm({ ...form, managerName: e.target.value })}
                    placeholder="اسم مدير الفرع المسؤول"
                    className="w-full bg-blue-50/50 border border-blue-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('branches.phone')}
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="010XXXXXXXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('branches.address')}
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="الموقع / العنوان"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  {t('branches.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-600/20 transition disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? t('common.loading') : t('branches.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
