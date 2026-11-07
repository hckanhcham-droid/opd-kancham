import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Upload,
  Printer, 
  Edit3, 
  Trash2, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Calendar,
  Layers
} from 'lucide-react';
import { AGE_GROUP_LABELS, computeSequentialTallies } from '../utils/statistics';

export default function DailyRegister({ 
  records, 
  onEdit, 
  onDelete, 
  onAddNew, 
  onExportExcel,
  onOpenImport,
  hcInfo 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [zoneFilter, setZoneFilter] = useState('ALL');
  const [caseFilter, setCaseFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [displayMode, setDisplayMode] = useState('sequential'); // 'sequential' (1,2,3...) or 'static' (1, 1, 1...)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Pre-calculate chronological sequential tallies (1, 2, 3...) for ស្រី, ប្រុស, ក, ខ, គ, ថ្មី, ចាស់
  const recordsWithTallies = useMemo(() => {
    const sorted = [...records].sort((a, b) => {
      if (a.date && b.date && a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return (a.id || 0) - (b.id || 0);
    });
    return computeSequentialTallies(sorted);
  }, [records]);

  // Filter logic
  const filteredRecords = useMemo(() => {
    return recordsWithTallies.filter(r => {
      // Search
      const search = searchTerm.toLowerCase();
      const matchSearch = !searchTerm || 
        r.name?.toLowerCase().includes(search) ||
        r.code?.toLowerCase().includes(search) ||
        r.diagnosisCode?.toLowerCase().includes(search) ||
        r.diagnosisName?.toLowerCase().includes(search) ||
        r.symptoms?.toLowerCase().includes(search) ||
        r.address?.toLowerCase().includes(search) ||
        r.remarks?.toLowerCase().includes(search);

      // Date
      const matchDate = !dateFilter || r.date === dateFilter;

      // Zone
      const matchZone = zoneFilter === 'ALL' || r.zone === zoneFilter;

      // Case type
      const isNew = r.isNew !== false && r.visitType !== 'old';
      const matchCase = caseFilter === 'ALL' || (caseFilter === 'NEW' && isNew) || (caseFilter === 'OLD' && !isNew);

      // Payment
      const matchPayment = paymentFilter === 'ALL' || 
        (paymentFilter === 'P' && r.paymentType === 'P') ||
        (paymentFilter === 'HEF' && r.paymentType?.includes('HEF')) ||
        (paymentFilter === 'NSSF' && r.paymentType?.includes('ប.ស.ស')) ||
        (paymentFilter === 'E' && r.paymentType === 'E');

      return matchSearch && matchDate && matchZone && matchCase && matchPayment;
    });
  }, [recordsWithTallies, searchTerm, dateFilter, zoneFilter, caseFilter, paymentFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    if (pageSize === -1) return filteredRecords;
    const start = (page - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, page, pageSize]);

  return (
    <div className="space-y-4">
      {/* Control Bar (Filters & Search) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm space-y-3 no-print">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ស្វែងរកតាមឈ្មោះ, លេខកូដ, រោគវិនិច្ឆ័យ, អាសយដ្ឋាន, ឬលេខប័ណ្ណ..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onAddNew}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>កត់ត្រាថ្មី</span>
            </button>

            <button
              onClick={onOpenImport}
              className="px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 border border-blue-200"
              title="នាំចូលទិន្នន័យពី File Excel ឬ PDF"
            >
              <Upload className="w-4 h-4 text-blue-600" />
              <span>នាំចូល File</span>
            </button>

            <button
              onClick={onExportExcel}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-medium transition flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>ទាញយក Excel</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs sm:text-sm font-medium transition flex items-center gap-1.5 border border-slate-300"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ព</span>
            </button>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="font-semibold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> តម្រង៖
          </span>

          {/* Date Filter */}
          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-200">
            <Calendar className="w-3 h-3 text-slate-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
              className="bg-transparent outline-none text-xs text-slate-700 cursor-pointer"
            />
            {dateFilter && (
              <button 
                onClick={() => setDateFilter('')} 
                className="text-slate-400 hover:text-slate-600 font-bold ml-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Case Type Filter */}
          <select
            value={caseFilter}
            onChange={(e) => { setCaseFilter(e.target.value); setPage(1); }}
            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 outline-none"
          >
            <option value="ALL">ករណីទាំងអស់ (All cases)</option>
            <option value="NEW">ករណីថ្មី (New OPD)</option>
            <option value="OLD">ករណីចាស់ (Old OPD)</option>
          </select>

          {/* Zone Filter */}
          <select
            value={zoneFilter}
            onChange={(e) => { setZoneFilter(e.target.value); setPage(1); }}
            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 outline-none"
          >
            <option value="ALL">គ្រប់តំបន់ (All Zones)</option>
            <option value="ក">តំបន់ ក (Zone A)</option>
            <option value="ខ">តំបន់ ខ (Zone B)</option>
            <option value="គ">តំបន់ គ (Zone C)</option>
          </select>

          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 outline-none"
          >
            <option value="ALL">គ្រប់ប្រភេទបង់ថ្លៃ (All Payments)</option>
            <option value="P">បង់ប្រាក់ផ្ទាល់ (P)</option>
            <option value="HEF">មូលនិធិសមធម៌ (HEF)</option>
            <option value="NSSF">ប.ស.ស (NSSF)</option>
            <option value="E">លើកលែងថ្លៃ (E)</option>
          </select>

          {/* Sequential Tally Mode Toggle */}
          <div className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 ml-1">
            <span className="text-[11px] font-semibold text-blue-900">របៀបរាប់លេខ៖</span>
            <button
              type="button"
              onClick={() => setDisplayMode(m => m === 'sequential' ? 'static' : 'sequential')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition flex items-center gap-1 ${
                displayMode === 'sequential'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
              title="ចុចដើម្បីប្តូររវាងស្វ៊ីតលេខបន្ត (1,2,3...) និងលេខ 1 ធម្មតា"
            >
              <span>{displayMode === 'sequential' ? '✓ ស្វ៊ីតលេខបន្ត (1, 2, 3...)' : 'លេខ 1 ធម្មតា'}</span>
            </button>
          </div>

          <span className="text-slate-400 text-xs ml-auto">
            រកឃើញ {filteredRecords.length} ក្នុងចំណោម {records.length} កំណត់ត្រា
          </span>
        </div>
      </div>

      {/* Official Print Header for Print Mode Only */}
      <div className="hidden print-only mb-4 text-center">
        <h2 className="text-base font-bold">ព្រះរាជាណាចក្រកម្ពុជា • ជាតិ សាសនា ព្រះមហាក្សត្រ</h2>
        <h3 className="text-sm font-semibold">ក្រសួងសុខាភិបាល • {hcInfo?.province}</h3>
        <h1 className="text-lg font-bold mt-1">
          សៀវភៅកត់ត្រាអ្នកជំងឺពិគ្រោះក្រៅ (OPD Consultation Register) - {hcInfo?.nameKhmer}
        </h1>
        <p className="text-xs text-slate-600">
          ខែ {hcInfo?.reportMonth} ឆ្នាំ {hcInfo?.reportYear} | ចំនួនអ្នកជំងឺសរុប៖ {filteredRecords.length} នាក់
        </p>
      </div>

      {/* Main 32-Column Register Table */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[72vh]">
          <table className="w-full border-collapse text-center text-[11px] min-w-[1950px]">
            {/* Table Header Row 1 */}
            <thead className="bg-slate-100 text-slate-800 font-bold sticky top-0 z-20 shadow-sm border-b-2 border-slate-400">
              <tr>
                <th rowSpan="2" className="border border-slate-300 px-2 py-1.5 w-12 bg-slate-200/80">
                  ល.រ<br /><span className="text-[9px] text-slate-500 font-normal">1</span>
                </th>
                <th rowSpan="2" className="border border-slate-300 px-2 py-1.5 w-28 bg-slate-200/80">
                  លេខកូដប័ណ្ណ<br /><span className="text-[9px] text-slate-500 font-normal">2</span>
                </th>
                <th rowSpan="2" className="border border-slate-300 px-3 py-1.5 min-w-[130px] bg-slate-200/80 text-left">
                  ឈ្មោះអ្នកជំងឺ<br /><span className="text-[9px] text-slate-500 font-normal">3</span>
                </th>
                <th rowSpan="2" className="border border-slate-300 px-2 py-1.5 min-w-[120px] bg-slate-200/80 text-left">
                  ឈ្មោះអាណាព្យាបាល<br />(សម្រាប់កុមារ) <span className="text-[9px] text-slate-500 font-normal">4</span>
                </th>
                <th colSpan="8" className="border border-slate-300 py-1 bg-amber-50 text-amber-900">
                  អាយុ (Age Groups)
                </th>
                <th colSpan="2" className="border border-slate-300 py-1 bg-blue-50 text-blue-900">
                  ភេទ
                </th>
                <th colSpan="3" className="border border-slate-300 py-1 bg-emerald-50 text-emerald-900">
                  តំបន់ទទួលខុសត្រូវ
                </th>
                <th rowSpan="2" className="border border-slate-300 px-1.5 py-1.5 w-14 bg-pink-50 text-pink-900">
                  មានផ្ទៃពោះ<br />(សប្តាហ៍)<br /><span className="text-[9px] text-slate-500 font-normal">18</span>
                </th>
                <th rowSpan="2" className="border border-slate-300 px-3 py-1.5 min-w-[180px] bg-slate-200/80 text-left">
                  អាសយដ្ឋាន និងលេខទូរស័ព្ទ<br /><span className="text-[9px] text-slate-500 font-normal">19</span>
                </th>
                <th rowSpan="2" className="border border-slate-300 px-2 py-1.5 w-24 bg-slate-200/80">
                  បញ្ជូនមកពី<br /><span className="text-[9px] text-slate-500 font-normal">20</span>
                </th>
                <th colSpan="2" className="border border-slate-300 py-1 bg-indigo-50 text-indigo-900">
                  អ្នកជំងឺ (Case)
                </th>
                <th rowSpan="2" className="border border-slate-300 px-2 py-1.5 min-w-[150px] bg-slate-200/80 text-left">
                  រោគសញ្ញា (Symptoms)<br /><span className="text-[9px] text-slate-500 font-normal">23</span>
                </th>
                <th rowSpan="2" className="border border-slate-300 px-1 py-1.5 w-16 bg-slate-200/80">
                  សញ្ញាគ្រោះថ្នាក់<br /><span className="text-[9px] text-slate-500 font-normal">24</span>
                </th>
                <th rowSpan="2" className="border border-slate-300 px-2 py-1.5 min-w-[160px] bg-slate-200/80 text-left">
                  រោគវិនិច្ឆ័យ (ICD-10)<br /><span className="text-[9px] text-slate-500 font-normal">25</span>
                </th>
                <th rowSpan="2" className="border border-slate-300 px-3 py-1.5 min-w-[220px] bg-slate-200/80 text-left">
                  ការព្យាបាល / វេជ្ជបញ្ជា<br /><span className="text-[9px] text-slate-500 font-normal">26</span>
                </th>
                <th colSpan="3" className="border border-slate-300 py-1 bg-yellow-50 text-yellow-900">
                  ស្ថានភាពអាហារូបត្ថម្ភ
                </th>
                <th rowSpan="2" className="border border-slate-300 px-2 py-1.5 w-24 bg-slate-200/80">
                  បញ្ជូនទៅ<br /><span className="text-[9px] text-slate-500 font-normal">30</span>
                </th>
                <th rowSpan="2" className="border border-slate-300 px-1.5 py-1.5 w-16 bg-slate-200/80">
                  បង់ថ្លៃ<br /><span className="text-[9px] text-slate-500 font-normal">31</span>
                </th>
                <th rowSpan="2" className="border border-slate-300 px-2 py-1.5 min-w-[120px] bg-slate-200/80 text-left">
                  សម្គាល់<br /><span className="text-[9px] text-slate-500 font-normal">32</span>
                </th>
                <th rowSpan="2" className="border border-slate-300 px-2 py-1.5 w-16 bg-slate-300 text-slate-800 no-print">
                  សកម្មភាព
                </th>
              </tr>

              {/* Table Header Row 2 (Sub-headers) */}
              <tr className="text-[10px]">
                {/* 5 - 12 Age columns */}
                <th className="border border-slate-300 px-1 py-1 w-11 bg-amber-50">0-28 ថ្ងៃ<br /><span className="text-[8px] text-slate-400">5</span></th>
                <th className="border border-slate-300 px-1 py-1 w-12 bg-amber-50">29ថ្ងៃ-11ខែ<br /><span className="text-[8px] text-slate-400">6</span></th>
                <th className="border border-slate-300 px-1 py-1 w-11 bg-amber-50">1-4 ឆ្នាំ<br /><span className="text-[8px] text-slate-400">7</span></th>
                <th className="border border-slate-300 px-1 py-1 w-11 bg-amber-50">5-14 ឆ្នាំ<br /><span className="text-[8px] text-slate-400">8</span></th>
                <th className="border border-slate-300 px-1 py-1 w-11 bg-amber-50">15-24 ឆ្នាំ<br /><span className="text-[8px] text-slate-400">9</span></th>
                <th className="border border-slate-300 px-1 py-1 w-11 bg-amber-50">25-49 ឆ្នាំ<br /><span className="text-[8px] text-slate-400">10</span></th>
                <th className="border border-slate-300 px-1 py-1 w-11 bg-amber-50">50-64 ឆ្នាំ<br /><span className="text-[8px] text-slate-400">11</span></th>
                <th className="border border-slate-300 px-1 py-1 w-11 bg-amber-50">&gt;=64 ឆ្នាំ<br /><span className="text-[8px] text-slate-400">12</span></th>

                {/* 13 - 14 Gender */}
                <th className="border border-slate-300 px-1 py-1 w-9 bg-blue-50">ស្រី<br /><span className="text-[8px] text-slate-400">13</span></th>
                <th className="border border-slate-300 px-1 py-1 w-9 bg-blue-50">ប្រុស<br /><span className="text-[8px] text-slate-400">14</span></th>

                {/* 15 - 17 Zones */}
                <th className="border border-slate-300 px-1 py-1 w-8 bg-emerald-50">ក<br /><span className="text-[8px] text-slate-400">15</span></th>
                <th className="border border-slate-300 px-1 py-1 w-8 bg-emerald-50">ខ<br /><span className="text-[8px] text-slate-400">16</span></th>
                <th className="border border-slate-300 px-1 py-1 w-8 bg-emerald-50">គ<br /><span className="text-[8px] text-slate-400">17</span></th>

                {/* 21 - 22 Case */}
                <th className="border border-slate-300 px-1 py-1 w-9 bg-indigo-50">ថ្មី<br /><span className="text-[8px] text-slate-400">21</span></th>
                <th className="border border-slate-300 px-1 py-1 w-9 bg-indigo-50">ចាស់<br /><span className="text-[8px] text-slate-400">22</span></th>

                {/* 27 - 29 Nutrition */}
                <th className="border border-slate-300 px-1 py-1 w-10 bg-yellow-50">ធ្ងន់ធ្ងរ<br /><span className="text-[8px] text-slate-400">27</span></th>
                <th className="border border-slate-300 px-1 py-1 w-12 bg-yellow-50">ទម្ងន់/អាយុ<br /><span className="text-[8px] text-slate-400">28</span></th>
                <th className="border border-slate-300 px-1 py-1 w-12 bg-yellow-50">ទម្ងន់/កម្ពស់<br /><span className="text-[8px] text-slate-400">29</span></th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan="33" className="py-12 text-center text-slate-400 text-sm">
                    មិនមានទិន្នន័យត្រូវតាមលក្ខខណ្ឌស្វែងរកទេ
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r, idx) => {
                  const globalIdx = (page - 1) * (pageSize === -1 ? 0 : pageSize) + idx + 1;
                  const isNew = r.isNew !== false && r.visitType !== 'old';
                  const isMale = r.gender === 'male' || r.gender === 'ប្រុស';
                  const isFemale = !isMale;
                  const cat = r.ageCategory;

                  return (
                    <tr 
                      key={r.id || idx} 
                      className={`hover:bg-blue-50/60 transition ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
                    >
                      {/* 1. ល.រ */}
                      <td className="border border-slate-300 py-1.5 font-bold text-slate-700 bg-slate-50">
                        {globalIdx}
                      </td>

                      {/* 2. លេខកូដ */}
                      <td className="border border-slate-300 px-1 py-1.5 text-xs text-blue-900 font-mono">
                        {r.code || '-'}
                      </td>

                      {/* 3. ឈ្មោះអ្នកជំងឺ */}
                      <td className="border border-slate-300 px-2 py-1.5 text-left font-semibold text-slate-900">
                        {r.name}
                      </td>

                      {/* 4. ឈ្មោះអាណាព្យាបាល */}
                      <td className="border border-slate-300 px-2 py-1.5 text-left text-slate-600">
                        {r.guardianName || '-'}
                      </td>

                      {/* 5 - 12 Age Columns */}
                      <td className="border border-slate-300 px-1 py-1 text-slate-800 font-medium">
                        {cat === '0_28d' ? r.age : ''}
                      </td>
                      <td className="border border-slate-300 px-1 py-1 text-slate-800 font-medium">
                        {cat === '29d_11m' ? r.age : ''}
                      </td>
                      <td className="border border-slate-300 px-1 py-1 text-slate-800 font-medium">
                        {cat === '1_4y' ? r.age : ''}
                      </td>
                      <td className="border border-slate-300 px-1 py-1 text-slate-800 font-medium">
                        {cat === '5_14y' ? r.age : ''}
                      </td>
                      <td className="border border-slate-300 px-1 py-1 text-slate-800 font-medium">
                        {cat === '15_24y' ? r.age : ''}
                      </td>
                      <td className="border border-slate-300 px-1 py-1 text-slate-800 font-medium">
                        {cat === '25_49y' ? r.age : ''}
                      </td>
                      <td className="border border-slate-300 px-1 py-1 text-slate-800 font-medium">
                        {cat === '50_64y' ? r.age : ''}
                      </td>
                      <td className="border border-slate-300 px-1 py-1 text-slate-800 font-medium">
                        {cat === 'ge65y' ? r.age : ''}
                      </td>

                      {/* 13 - 14 Gender (Sequential Counter 1, 2, 3...) */}
                      <td className="border border-slate-300 px-1 py-1 text-rose-600 font-bold">
                        {isFemale ? (displayMode === 'sequential' ? r.seqFemale : '1') : ''}
                      </td>
                      <td className="border border-slate-300 px-1 py-1 text-blue-600 font-bold">
                        {isMale ? (displayMode === 'sequential' ? r.seqMale : '1') : ''}
                      </td>

                      {/* 15 - 17 Zone (Sequential Counter 1, 2, 3...) */}
                      <td className="border border-slate-300 px-1 py-1 font-bold text-slate-700">
                        {(r.zone === 'ក' || r.zone === 'A') ? (displayMode === 'sequential' ? r.seqZoneA : '1') : ''}
                      </td>
                      <td className="border border-slate-300 px-1 py-1 font-bold text-slate-700">
                        {(r.zone === 'ខ' || r.zone === 'B') ? (displayMode === 'sequential' ? r.seqZoneB : '1') : ''}
                      </td>
                      <td className="border border-slate-300 px-1 py-1 font-bold text-slate-700">
                        {(r.zone === 'គ' || r.zone === 'C') ? (displayMode === 'sequential' ? r.seqZoneC : '1') : ''}
                      </td>

                      {/* 18. មានផ្ទៃពោះ */}
                      <td className="border border-slate-300 px-1 py-1 text-pink-700 font-semibold">
                        {r.pregnantWeeks ? `${r.pregnantWeeks}` : ''}
                      </td>

                      {/* 19. អាសយដ្ឋាន និងលេខទូរស័ព្ទ */}
                      <td className="border border-slate-300 px-2 py-1.5 text-left text-slate-700">
                        <div>{r.address || '-'}</div>
                        {r.phone && <div className="text-[10px] text-blue-600 font-medium">{r.phone}</div>}
                      </td>

                      {/* 20. បញ្ជូនមកពី */}
                      <td className="border border-slate-300 px-1 py-1.5 text-slate-600">
                        {r.referredFrom || ''}
                      </td>

                      {/* 21 - 22 Case: ថ្មី / ចាស់ (Sequential Counter 1, 2, 3...) */}
                      <td className="border border-slate-300 px-1 py-1 text-emerald-700 font-bold">
                        {isNew ? (displayMode === 'sequential' ? r.seqNew : '1') : ''}
                      </td>
                      <td className="border border-slate-300 px-1 py-1 text-indigo-700 font-bold">
                        {!isNew ? (displayMode === 'sequential' ? r.seqOld : '1') : ''}
                      </td>

                      {/* 23. រោគសញ្ញា */}
                      <td className="border border-slate-300 px-2 py-1.5 text-left text-slate-800">
                        {r.symptoms || '-'}
                      </td>

                      {/* 24. សញ្ញាគ្រោះថ្នាក់ */}
                      <td className="border border-slate-300 px-1 py-1 text-amber-600 font-bold">
                        {r.dangerSigns || ''}
                      </td>

                      {/* 25. រោគវិនិច្ឆ័យ */}
                      <td className="border border-slate-300 px-2 py-1.5 text-left">
                        <span className="font-bold text-blue-800">{r.diagnosisCode}</span>
                        {r.diagnosisName && <span className="text-slate-700 font-medium"> - {r.diagnosisName}</span>}
                      </td>

                      {/* 26. ការព្យាបាល */}
                      <td className="border border-slate-300 px-2 py-1.5 text-left whitespace-pre-line text-slate-800 font-mono text-[10px]">
                        {r.treatment || '-'}
                      </td>

                      {/* 27 - 29 Nutrition */}
                      <td className="border border-slate-300 px-1 py-1 text-slate-700">
                        {r.nutritionSevere || ''}
                      </td>
                      <td className="border border-slate-300 px-1 py-1 text-slate-700">
                        {r.weight || ''}
                      </td>
                      <td className="border border-slate-300 px-1 py-1 text-slate-700">
                        {r.height || ''}
                      </td>

                      {/* 30. បញ្ជូនទៅ */}
                      <td className="border border-slate-300 px-1 py-1.5 text-rose-700 font-semibold">
                        {r.referredTo || ''}
                      </td>

                      {/* 31. បង់ថ្លៃ */}
                      <td className="border border-slate-300 px-1 py-1.5 font-bold">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          r.paymentType?.includes('HEF') ? 'bg-amber-100 text-amber-800' :
                          r.paymentType?.includes('ប.ស.ស') ? 'bg-blue-100 text-blue-800' :
                          r.paymentType === 'E' ? 'bg-purple-100 text-purple-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {r.paymentType || 'P'}
                        </span>
                      </td>

                      {/* 32. សម្គាល់ */}
                      <td className="border border-slate-300 px-2 py-1.5 text-left text-slate-600 font-mono text-[10px]">
                        {r.remarks || ''}
                      </td>

                      {/* Action buttons (hidden when printing) */}
                      <td className="border border-slate-300 px-1 py-1.5 no-print bg-slate-50">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEdit(r)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition"
                            title="កែប្រែ"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(r.id)}
                            className="p-1 text-rose-600 hover:bg-rose-100 rounded transition"
                            title="លុប"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs no-print">
          <div className="flex items-center gap-2 text-slate-600">
            <span>បង្ហាញក្នុងមួយទំព័រ៖</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="px-2 py-1 border border-slate-300 rounded bg-white outline-none"
            >
              <option value="15">15 ជួរ</option>
              <option value="25">25 ជួរ</option>
              <option value="50">50 ជួរ</option>
              <option value="100">100 ជួរ</option>
              <option value="-1">ទាំងអស់ ({filteredRecords.length})</option>
            </select>
          </div>

          {pageSize !== -1 && (
            <div className="flex items-center gap-2">
              <span className="text-slate-600">
                ទំព័រ {page} នៃ {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="p-1.5 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="p-1.5 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
