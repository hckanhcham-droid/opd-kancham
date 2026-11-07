import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Calendar, 
  Clock, 
  Phone, 
  MapPin, 
  Pill, 
  Plus, 
  ChevronRight,
  UserCheck
} from 'lucide-react';

export default function PatientList({ records, onSelectPatientForNewVisit }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientName, setSelectedPatientName] = useState(null);

  // Group records by unique patient (by Name + Address/Code)
  const uniquePatients = useMemo(() => {
    const map = new Map();
    records.forEach(r => {
      const key = (r.name || '').trim().toLowerCase();
      if (!key) return;

      if (!map.has(key)) {
        map.set(key, {
          name: r.name,
          code: r.code,
          gender: r.gender,
          age: r.age,
          ageUnit: r.ageUnit,
          address: r.address,
          phone: r.phone,
          zone: r.zone,
          paymentType: r.paymentType,
          visits: []
        });
      }
      map.get(key).visits.push(r);
    });

    return Array.from(map.values()).sort((a, b) => b.visits.length - a.visits.length);
  }, [records]);

  // Filtered patients
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return uniquePatients;
    const q = searchTerm.toLowerCase();
    return uniquePatients.filter(p => 
      p.name?.toLowerCase().includes(q) ||
      p.code?.toLowerCase().includes(q) ||
      p.phone?.includes(q) ||
      p.address?.toLowerCase().includes(q)
    );
  }, [uniquePatients, searchTerm]);

  // Currently inspected patient
  const activePatient = selectedPatientName 
    ? uniquePatients.find(p => p.name === selectedPatientName) 
    : (filtered.length > 0 ? filtered[0] : null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
      {/* Left Column: Patients List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-4 md:col-span-1">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-800">
              បញ្ជីឈ្មោះអ្នកជំងឺ ({uniquePatients.length} នាក់)
            </h2>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ស្វែងរកតាមឈ្មោះ, លេខកូដ, ទូរស័ព្ទ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Scrollable list */}
        <div className="space-y-1.5 max-h-[65vh] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              រកមិនឃើញឈ្មោះអ្នកជំងឺទេ
            </div>
          ) : (
            filtered.map((p, idx) => {
              const isSelected = activePatient && activePatient.name === p.name;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedPatientName(p.name)}
                  className={`p-3 rounded-xl cursor-pointer transition border flex items-center justify-between ${
                    isSelected 
                      ? 'bg-blue-50/80 border-blue-400 shadow-sm text-blue-900' 
                      : 'bg-slate-50/50 border-slate-100 hover:bg-slate-100/70 text-slate-800'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span>{p.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-normal">
                        {p.gender} • {p.age} {p.ageUnit === 'years' ? 'ឆ្នាំ' : p.ageUnit}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                      {p.address}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      {p.visits.length} លើក
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Detailed Patient Consultation History */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 md:col-span-2 space-y-6">
        {activePatient ? (
          <div>
            {/* Patient Header Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{activePatient.name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    {activePatient.gender}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    តំបន់ {activePatient.zone}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {activePatient.address || 'មិនមានអាសយដ្ឋាន'}
                  </span>
                  {activePatient.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {activePatient.phone}
                    </span>
                  )}
                  {activePatient.code && (
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                      កូដ៖ {activePatient.code}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => onSelectPatientForNewVisit(activePatient)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ កត់ត្រាពិគ្រោះថ្មីសម្រាប់គាត់</span>
              </button>
            </div>

            {/* Visit History Timeline */}
            <div className="mt-5 space-y-4">
              <h4 className="text-xs font-bold text-slate-700 tracking-wider uppercase flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>ប្រវត្តិពិគ្រោះ និងព្យាបាល ({activePatient.visits.length} លើក)</span>
              </h4>

              <div className="space-y-3">
                {activePatient.visits.map((v, i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 hover:bg-slate-50 transition">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-blue-800 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        កាលបរិច្ឆេទ៖ {v.date}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          v.isNew ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {v.isNew ? 'ករណីថ្មី' : 'ករណីចាស់/បន្ត'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">
                          {v.paymentType || 'P'}
                        </span>
                      </div>
                    </div>

                    {/* Symptoms & Diagnosis */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                      <div>
                        <span className="text-slate-400 text-[11px] block">រោគសញ្ញា៖</span>
                        <span className="font-medium text-slate-800">{v.symptoms || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">រោគវិនិច្ឆ័យ (ICD-10)៖</span>
                        <span className="font-bold text-blue-700">{v.diagnosisCode}</span> - {v.diagnosisName || ''}
                      </div>
                    </div>

                    {/* Prescribed treatment */}
                    {v.treatment && (
                      <div className="pt-2 border-t border-slate-200/80 text-xs">
                        <span className="text-slate-400 text-[11px] flex items-center gap-1 mb-1">
                          <Pill className="w-3 h-3 text-indigo-500" />
                          ការព្យាបាល / វេជ្ជបញ្ជា៖
                        </span>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-[11px] whitespace-pre-line text-slate-700">
                          {v.treatment}
                        </div>
                      </div>
                    )}

                    {/* Remarks or Referral */}
                    {(v.remarks || v.referredTo) && (
                      <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-500">
                        {v.referredTo && (
                          <span className="text-rose-700 font-semibold">
                            🚨 បញ្ជូនទៅ៖ {v.referredTo}
                          </span>
                        )}
                        {v.remarks && <span>សម្គាល់៖ {v.remarks}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400 text-sm">
            សូមជ្រើសរើសអ្នកជំងឺពីបញ្ជីខាងឆ្វេង ដើម្បីមើលប្រវត្តិ
          </div>
        )}
      </div>
    </div>
  );
}
