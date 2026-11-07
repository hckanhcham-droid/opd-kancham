import React, { useState, useEffect } from 'react';
import { 
  Camera,
  UserPlus, 
  Save, 
  X, 
  Search, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  Stethoscope,
  Pill,
  Heart,
  Baby,
  Calendar
} from 'lucide-react';
import { commonICD10 } from '../data/icd10Data';
import { commonMedicines } from '../data/medicinesData';
import { getAgeCategory, AGE_GROUP_LABELS } from '../utils/statistics';

export default function PatientForm({ onSave, onCancel, onOpenScanner, existingPatients = [], initialRecord = null, nextId = 1 }) {
  const [formData, setFormData] = useState({
    id: nextId,
    date: new Date().toISOString().split('T')[0],
    code: '',
    name: '',
    guardianName: '',
    age: '',
    ageUnit: 'years',
    gender: 'ស្រី',
    zone: 'ក',
    pregnantWeeks: '',
    address: 'ភូមិស្វា ឃុំកញ្ចំ ស្រុកពារាំង',
    phone: '',
    referredFrom: '',
    visitType: 'new', // new or old
    symptoms: '',
    dangerSigns: '',
    diagnosisCode: '',
    diagnosisName: '',
    treatment: '',
    nutritionSevere: '',
    weight: '',
    height: '',
    referredTo: '',
    paymentType: 'P',
    remarks: ''
  });

  // Prescription builder temporary item
  const [selectedMed, setSelectedMed] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medQuantity, setMedQuantity] = useState('');
  const [searchDiag, setSearchDiag] = useState('');
  const [diagSuggestions, setDiagSuggestions] = useState([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);

  useEffect(() => {
    if (initialRecord) {
      setFormData({
        ...initialRecord,
        ageUnit: initialRecord.ageUnit || 'years',
        visitType: initialRecord.visitType || (initialRecord.isNew === false ? 'old' : 'new')
      });
    }
  }, [initialRecord]);

  // Handle Diagnosis Search
  const handleDiagnosisSearch = (query) => {
    setSearchDiag(query);
    if (!query.trim()) {
      setDiagSuggestions([]);
      return;
    }
    const q = query.toLowerCase();
    const matches = commonICD10.filter(item => 
      item.code.toLowerCase().includes(q) || 
      item.khmer.toLowerCase().includes(q) ||
      item.english.toLowerCase().includes(q)
    ).slice(0, 7);
    setDiagSuggestions(matches);
  };

  const selectDiagnosis = (item) => {
    setFormData(prev => ({
      ...prev,
      diagnosisCode: item.code,
      diagnosisName: `${item.khmer} (${item.english})`
    }));
    setSearchDiag('');
    setDiagSuggestions([]);
  };

  // Add medicine to treatment text
  const handleAddMedicine = () => {
    if (!selectedMed) return;
    const medObj = commonMedicines.find(m => m.name === selectedMed);
    const dosage = medDosage || medObj?.defaultDosage || '1 គ្រាប់ x 3 ដង';
    const qty = medQuantity ? ` = ${medQuantity} ${medObj?.unit || 'គ្រាប់'}` : '';
    const newLine = `${selectedMed}, ${dosage}${qty}`;
    
    setFormData(prev => ({
      ...prev,
      treatment: prev.treatment ? `${prev.treatment}\n${newLine}` : newLine
    }));

    setSelectedMed('');
    setMedDosage('');
    setMedQuantity('');
  };

  // Auto-calculated age category
  const currentAgeCat = getAgeCategory(formData.age, formData.ageUnit);
  const currentAgeCatLabel = AGE_GROUP_LABELS[currentAgeCat] || '';

  // Quick symptoms presets
  const quickSymptoms = [
    'គ្រុនក្តៅ ក្អក ឈឺបំពង់ក',
    'សុខភាពធម្មតា មកបើកថ្នាំបន្ត',
    'ចុកពោះ រាគ អស់កម្លាំង',
    'ឈឺក្បាល វិលមុខ ធីងធោង',
    'លាងរបួស និងកាត់ចេស',
    'ឈឺចាប់ធ្មេញ រលាកអញ្ចាញធ្មេញ',
    'រមាស់ស្បែក កន្ទាលត្រអាក',
    'ក្អក ហត់ ពិបាកដកដង្ហើម'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('សូមបញ្ចូលឈ្មោះអ្នកជំងឺ!');
      return;
    }

    const payload = {
      ...formData,
      isNew: formData.visitType === 'new',
      ageCategory: currentAgeCat
    };

    onSave(payload);
  };

  // Quick Patient Lookup
  const handlePatientSearch = (term) => {
    setPatientSearch(term);
    if (!term.trim()) {
      setFilteredPatients([]);
      return;
    }
    const t = term.toLowerCase();
    const hits = existingPatients.filter(p => 
      p.name?.toLowerCase().includes(t) || 
      p.code?.toLowerCase().includes(t) ||
      p.phone?.includes(t)
    ).slice(0, 5);
    setFilteredPatients(hits);
  };

  const populateFromExisting = (p) => {
    setFormData(prev => ({
      ...prev,
      name: p.name,
      code: p.code || prev.code,
      guardianName: p.guardianName || '',
      age: p.age,
      ageUnit: p.ageUnit || 'years',
      gender: p.gender,
      zone: p.zone,
      address: p.address,
      phone: p.phone,
      paymentType: p.paymentType || 'P',
      visitType: 'old' // repeat visit
    }));
    setPatientSearch('');
    setFilteredPatients([]);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-5 sm:p-7 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {initialRecord ? 'កែប្រែទិន្នន័យពិគ្រោះជំងឺ' : 'កត់ត្រាការពិគ្រោះជំងឺក្រៅ (OPD Register)'}
            </h2>
            <p className="text-xs text-slate-500">
              បំពេញព័ត៌មានគ្រប់ ៣២ ជួរ តាមទម្រង់ក្រសួងសុខាភិបាល
            </p>
          </div>
        </div>

        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* AI Scanner Banner */}
      {onOpenScanner && (
        <div className="mt-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-dashed border-emerald-300 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center text-lg flex-shrink-0 shadow-md shadow-emerald-500/20">
              📸
            </div>
            <div>
              <div className="text-sm font-bold text-emerald-950">ស្កេនវេជ្ជបញ្ជាដោយស្វ័យប្រវត្តិ (AI Prescription Scanner)</div>
              <div className="text-xs text-emerald-700">ថតរូប ឬផ្ទុកវេជ្ជបញ្ជាដើម្បីឱ្យ AI បំពេញឈ្មោះ លេខប័ណ្ណ រោគវិនិច្ឆ័យ និងថ្នាំស្វ័យប្រវត្តិ</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenScanner}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg text-xs sm:text-sm font-bold shadow-md transition whitespace-nowrap"
          >
            <Camera className="w-4 h-4" />
            <span>📸 ថត / ស្កេនវេជ្ជបញ្ជាឥឡូវនេះ</span>
          </button>
        </div>
      )}

      {/* Patient Search / Autofill for existing patients */}
      {!initialRecord && existingPatients.length > 0 && (
        <div className="my-4 p-3 bg-blue-50/70 rounded-xl border border-blue-100 relative">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-600" />
            <input
              type="text"
              placeholder="ស្វែងរកអ្នកជំងឺចាស់ (តាមឈ្មោះ, លេខកូដប័ណ្ណ ឬលេខទូរស័ព្ទ)..."
              value={patientSearch}
              onChange={(e) => handlePatientSearch(e.target.value)}
              className="bg-transparent text-xs sm:text-sm text-slate-800 placeholder-blue-900/50 outline-none w-full"
            />
          </div>
          {filteredPatients.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto p-1.5">
              <div className="text-[11px] font-semibold text-slate-400 px-2 py-1">ជ្រើសរើសដើម្បីបំពេញស្វ័យប្រវត្តិ៖</div>
              {filteredPatients.map(p => (
                <div
                  key={p.id}
                  onClick={() => populateFromExisting(p)}
                  className="px-3 py-2 hover:bg-blue-50 rounded-lg cursor-pointer text-xs flex justify-between items-center transition"
                >
                  <span className="font-semibold text-slate-800">{p.name} ({p.gender}, {p.age} {p.ageUnit === 'years' ? 'ឆ្នាំ' : p.ageUnit})</span>
                  <span className="text-slate-500 text-[11px]">{p.address} | {p.code || 'គ្មានកូដ'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-6">
        {/* Section 1: General Info (Columns 1 - 20) */}
        <div>
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3 pb-1 border-b border-slate-100">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">1</span>
            <span>ព័ត៌មានទូទៅអ្នកជំងឺ (General Patient Information)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                កាលបរិច្ឆេទពិគ្រោះ <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Code / Card No */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                លេខកូដ / លេខប័ណ្ណ (Col 2)
              </label>
              <input
                type="text"
                placeholder="ឧ. 031-647-243-1"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Patient Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ឈ្មោះអ្នកជំងឺ (Col 3) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="ឧ. សុខ ម៉ាលី"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-900"
              />
            </div>

            {/* Guardian Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ឈ្មោះអាណាព្យាបាល (សម្រាប់កុមារ) (Col 4)
              </label>
              <input
                type="text"
                placeholder="ឧ. ម្តាយឈ្មោះ គង់ ចិន្តា"
                value={formData.guardianName}
                onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Age + Age Unit */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                អាយុ និងខ្នាត (Cols 5-12) <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  placeholder="អាយុ"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-2/3 px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <select
                  value={formData.ageUnit}
                  onChange={(e) => setFormData({ ...formData, ageUnit: e.target.value })}
                  className="w-1/3 px-1 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 outline-none font-medium"
                >
                  <option value="years">ឆ្នាំ</option>
                  <option value="months">ខែ</option>
                  <option value="days">ថ្ងៃ</option>
                </select>
              </div>
              {formData.age && (
                <div className="mt-1 text-[11px] font-semibold text-blue-700 flex items-center gap-1">
                  <span>➜ ក្រុមអាយុ៖</span>
                  <span className="px-1.5 py-0.5 bg-blue-100 rounded text-blue-800">{currentAgeCatLabel}</span>
                </div>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ភេទ (Cols 13-14) <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              >
                <option value="ស្រី">ស្រី (Female)</option>
                <option value="ប្រុស">ប្រុស (Male)</option>
              </select>
            </div>

            {/* Zone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                តំបន់ទទួលខុសត្រូវ (Cols 15-17) <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.zone}
                onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800"
              >
                <option value="ក">តំបន់ ក (Zone A - ជិត)</option>
                <option value="ខ">តំបន់ ខ (Zone B - ឆ្ងាយ)</option>
                <option value="គ">តំបន់ គ (Zone C - ក្រៅតំបន់)</option>
              </select>
            </div>

            {/* Pregnant Weeks */}
            {formData.gender === 'ស្រី' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>មានផ្ទៃពោះ (សប្តាហ៍) (Col 18)</span>
                </label>
                <input
                  type="number"
                  placeholder="ចំនួនសប្តាហ៍ (បើមាន)"
                  value={formData.pregnantWeeks}
                  onChange={(e) => setFormData({ ...formData, pregnantWeeks: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            )}

            {/* Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                អាសយដ្ឋាន (ភូមិ, ឃុំ, ស្រុក) (Col 19)
              </label>
              <input
                type="text"
                placeholder="ឧ. ភូមិដូង ឃុំកញ្ចំ ស្រុកពារាំង"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                លេខទូរស័ព្ទ (Col 19)
              </label>
              <input
                type="tel"
                placeholder="012 xxx xxx"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Referred From */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                បញ្ជូនមកពី (Col 20)
              </label>
              <input
                type="text"
                placeholder="ឧ. VHSG, សហគមន៍, គ្លីនិក..."
                value={formData.referredFrom}
                onChange={(e) => setFormData({ ...formData, referredFrom: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Clinical & Diagnosis (Columns 21 - 25) */}
        <div>
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3 pb-1 border-b border-slate-100">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">2</span>
            <span>រោគសញ្ញា និងការធ្វើរោគវិនិច្ឆ័យ (Symptoms & Diagnosis)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Visit Type (New vs Old) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ប្រភេទករណីពិគ្រោះ (Cols 21-22) <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, visitType: 'new' })}
                  className={`py-2 text-xs font-semibold rounded-lg border transition ${
                    formData.visitType === 'new'
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ✓ ករណីថ្មី (New OPD)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, visitType: 'old' })}
                  className={`py-2 text-xs font-semibold rounded-lg border transition ${
                    formData.visitType === 'old'
                      ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ✓ ករណីចាស់ (Old OPD)
                </button>
              </div>
            </div>

            {/* Danger Signs */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>សញ្ញាគ្រោះថ្នាក់ (Col 24)</span>
              </label>
              <input
                type="text"
                placeholder="ឧ. ហត់ខ្លាំង, ប្រកាច់, សន្លប់..."
                value={formData.dangerSigns}
                onChange={(e) => setFormData({ ...formData, dangerSigns: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Payment Scheme */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ប្រភេទបង់ថ្លៃសេវា (Col 31) <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.paymentType}
                onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-800"
              >
                <option value="P">P: បង់ប្រាក់ផ្ទាល់ (Paying)</option>
                <option value="HEF">HEF: មូលនិធិសមធម៌ (ប័ណ្ណក្រីក្រ)</option>
                <option value="HEFR">HEFR: មូលនិធិសមធម៌ ប្រើឡើងវិញ</option>
                <option value="ប.ស.ស ក្រៅ">ប.ស.ស ក្រៅ (NSSF Out-catchment)</option>
                <option value="ប.ស.ស ក្នុង">ប.ស.ស ក្នុង (NSSF In-catchment)</option>
                <option value="E">E: លើកលែងថ្លៃ (Exempt / Free)</option>
              </select>
            </div>

            {/* Symptoms */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                រោគសញ្ញា (Col 23)
              </label>
              <input
                type="text"
                placeholder="រៀបរាប់រោគសញ្ញាអ្នកជំងឺ..."
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[11px] text-slate-400 self-center">ជ្រើសរើសរហ័ស៖</span>
                {quickSymptoms.map((sym, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      symptoms: prev.symptoms ? `${prev.symptoms}, ${sym}` : sym 
                    }))}
                    className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 rounded-full transition"
                  >
                    + {sym}
                  </button>
                ))}
              </div>
            </div>

            {/* Diagnosis with ICD-10 Search */}
            <div className="sm:col-span-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                <span>រោគវិនិច្ឆ័យ និងកូដ ICD-10 (Col 25)</span>
                <span className="text-[11px] font-normal text-slate-500">ស្វែងរកតាមកូដ ឬឈ្មោះជំងឺ</span>
              </label>

              <div className="relative mb-2">
                <input
                  type="text"
                  placeholder="វាយឈ្មោះជំងឺ ឬកូដ ICD-10 (ឧ. J02, I10, រលាកក្រពះ, រាគ, ទឹកនោមផ្អែម...)"
                  value={searchDiag}
                  onChange={(e) => handleDiagnosisSearch(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {diagSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto">
                    {diagSuggestions.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => selectDiagnosis(item)}
                        className="p-2 hover:bg-blue-50 cursor-pointer border-b border-slate-100 text-xs flex justify-between items-center"
                      >
                        <span className="font-bold text-blue-700 w-16">{item.code}</span>
                        <span className="flex-1 text-slate-800">{item.khmer}</span>
                        <span className="text-slate-400 italic text-[11px]">{item.english}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="កូដ ICD (ឧ. J02)"
                  value={formData.diagnosisCode}
                  onChange={(e) => setFormData({ ...formData, diagnosisCode: e.target.value })}
                  className="px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white font-bold text-blue-800 outline-none"
                />
                <input
                  type="text"
                  placeholder="ឈ្មោះរោគវិនិច្ឆ័យ (ខ្មែរ / អង់គ្លេស)"
                  value={formData.diagnosisName}
                  onChange={(e) => setFormData({ ...formData, diagnosisName: e.target.value })}
                  className="sm:col-span-3 px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white outline-none font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Treatment & Medicines (Column 26) */}
        <div>
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3 pb-1 border-b border-slate-100">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">3</span>
            <span>ការព្យាបាល និងការចេញវេជ្ជបញ្ជាថ្នាំ (Treatment & Prescription - Col 26)</span>
          </h3>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 mb-3">
            <div className="text-xs font-semibold text-slate-700 mb-2">ឧបករណ៍ជំនួយបន្ថែមថ្នាំរហ័ស (Medicine Selector):</div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <select
                value={selectedMed}
                onChange={(e) => {
                  setSelectedMed(e.target.value);
                  const med = commonMedicines.find(m => m.name === e.target.value);
                  if (med) setMedDosage(med.defaultDosage);
                }}
                className="sm:col-span-2 px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none"
              >
                <option value="">-- ជ្រើសរើសឱសថមណ្ឌលសុខភាព --</option>
                {commonMedicines.map((m, i) => (
                  <option key={i} value={m.name}>{m.name}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="កម្រិត/របៀបប្រើ (ឧ. 1គ្រាប់ x 3ដង)"
                value={medDosage}
                onChange={(e) => setMedDosage(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none"
              />

              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="ចំនួនសរុប (15)"
                  value={medQuantity}
                  onChange={(e) => setMedQuantity(e.target.value)}
                  className="w-2/3 px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddMedicine}
                  className="w-1/3 px-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ថែម</span>
                </button>
              </div>
            </div>
          </div>

          <textarea
            rows="3"
            placeholder="សេចក្តីលម្អិតការព្យាបាល និងវេជ្ជបញ្ជា..."
            value={formData.treatment}
            onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
            className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-sans"
          />
        </div>

        {/* Section 4: Child Nutrition, Referral & Remarks (Cols 27 - 32) */}
        <div>
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3 pb-1 border-b border-slate-100">
            <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center">4</span>
            <span>ស្ថានភាពអាហារូបត្ថម្ភកុមារ និងការបញ្ជូន (Nutrition, Referral & Remarks)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Severe Malnutrition */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                អាហារូបត្ថម្ភធ្ងន់ធ្ងរ (Col 27)
              </label>
              <input
                type="text"
                placeholder="ឧ. កម្រិត ១, ២..."
                value={formData.nutritionSevere}
                onChange={(e) => setFormData({ ...formData, nutritionSevere: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg outline-none"
              />
            </div>

            {/* Weight */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ទម្ងន់ / អាយុ (Kg) (Col 28)
              </label>
              <input
                type="text"
                placeholder="ឧ. 12.5"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg outline-none"
              />
            </div>

            {/* Height */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ទម្ងន់ / កម្ពស់ (Cm) (Col 29)
              </label>
              <input
                type="text"
                placeholder="ឧ. 85.0"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg outline-none"
              />
            </div>

            {/* Referred To */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                បញ្ជូនទៅ (Col 30)
              </label>
              <input
                type="text"
                placeholder="ឧ. មន្ទីរពេទ្យបង្អែកពារាំង"
                value={formData.referredTo}
                onChange={(e) => setFormData({ ...formData, referredTo: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg outline-none"
              />
            </div>

            {/* Remarks / ID card no */}
            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                សម្គាល់ / លេខកាត ប.ស.ស ឬ មូលនិធិសមធម៌ (Col 32)
              </label>
              <input
                type="text"
                placeholder="ឧ. ប.ស.ស កូដ: 2030524-3546697-ច ឬ ប័ណ្ណសមធម៌: 457886653"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs sm:text-sm font-medium transition"
            >
              បោះបង់
            </button>
          )}

          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>រក្សាទុកទិន្នន័យ (Save Record)</span>
          </button>
        </div>
      </form>
    </div>
  );
}
