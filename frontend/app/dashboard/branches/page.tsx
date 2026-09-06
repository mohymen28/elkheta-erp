'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Building2, Phone, MapPin, Users, Layers } from 'lucide-react';

export default function BranchesPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/branches')
      .then((res) => setBranches(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-blue-600" />
          <span>هيكل الفروع والأقسام</span>
        </h1>
        <p className="text-slate-400 text-xs mt-0.5">
          الفروع الجغرافية والمخازن التابعة لها والأقسام التشغيلية
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs">جاري تحميل الفروع...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {branches.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                  {b.code}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-800">{b.nameAr}</h3>
                <p className="text-xs text-slate-400 font-sans">{b.nameEn || '—'}</p>
              </div>

              <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                {b.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{b.address}</span>
                  </div>
                )}
                {b.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{b.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-4 text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-bold text-slate-700">{b._count?.users || 0}</span> موظف
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-purple-500" />
                    <span className="font-bold text-slate-700">{b._count?.departments || 0}</span> أقسام
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
