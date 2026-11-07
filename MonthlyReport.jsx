import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  Calendar, 
  Building2, 
  Award,
  CheckCircle,
  FileText
} from 'lucide-react';
import { calculateReportSummary } from '../utils/statistics';

export default function MonthlyReport({ records, hcInfo, onExportExcel }) {
  const [selectedMonth, setSelectedMonth] = useState('ALL');

  // Filter records by selected month if needed
  const filteredRecords = selectedMonth === 'ALL' 
    ? records 
    : records.filter(r => r.date?.includes(`-${selectedMonth.padStart(2, '0')}-`));

  const stats = calculateReportSummary(filteredRecords);
  const { zoneSummary, newCasesByAgeAndGender, newCasesTotal, referrals, hefUsers } = stats;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Action / Filter bar (Hidden on Print) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              របាយការណ៍សង្ខេបស្ថិតិប្រចាំខែ (HC1 Summary - គំរូទំព័រ ២៣៥)
            </h2>
            <p className="text-xs text-slate-500">
              គណនាដោយស្វ័យប្រវត្តិចេញពីសៀវភៅកត់ត្រា ៣២ ជួរ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Month Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent outline-none font-medium text-slate-700 cursor-pointer"
            >
              <option value="ALL">ទិន្នន័យទាំងអស់ ({records.length} នាក់)</option>
              <option value="08">ខែសីហា (August 2026)</option>
              <option value="07">ខែកក្កដា (July 2026)</option>
              <option value="09">ខែកញ្ញា (September 2026)</option>
              <option value="10">ខែតុលា (October 2026)</option>
            </select>
          </div>

          <button
            onClick={onExportExcel}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ទាញយក Excel</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>បោះពុម្ពរបាយការណ៍</span>
          </button>
        </div>
      </div>

      {/* Main Report Document - Exact Copy of Page 235 */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-lg p-6 sm:p-10 space-y-8 text-slate-900 print:shadow-none print:border-none print:p-0">
        
        {/* Ministry & Health Center Header */}
        <div className="text-center space-y-1">
          <div className="text-sm font-bold text-slate-800">ព្រះរាជាណាចក្រកម្ពុជា</div>
          <div className="text-xs font-semibold text-slate-600">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
          <div className="h-0.5 w-16 bg-slate-400 mx-auto my-1"></div>
          <div className="text-xs text-slate-600">
            ក្រសួងសុខាភិបាល • មន្ទីរសុខាភិបាល{hcInfo?.province} • {hcInfo?.od}
          </div>
          <div className="text-sm font-bold text-slate-900 pt-1">
            {hcInfo?.nameKhmer}
          </div>
          
          <h1 className="text-base sm:text-lg font-bold text-blue-900 pt-3 tracking-wide">
            តារាងសង្ខេបស្ថិតិយោធិបាយប្រចាំខែ{selectedMonth === 'ALL' ? hcInfo?.reportMonth : (selectedMonth === '08' ? 'សីហា' : selectedMonth)} ឆ្នាំ {hcInfo?.reportYear}
          </h1>
        </div>

        {/* ----------------- Table 1: ការពិនិត្យជំងឺក្រៅ ----------------- */}
        <div className="space-y-2">
          <h2 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
            <span>១. ការពិនិត្យជំងឺក្រៅ (Outpatient Consultations)</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border-2 border-slate-600 text-center text-xs">
              <thead className="bg-slate-100 font-bold text-slate-800">
                <tr>
                  <th className="border border-slate-400 px-3 py-2 text-left min-w-[200px]">
                    បរិមាណសកម្មភាពតាមតំបន់
                  </th>
                  <th className="border border-slate-400 px-2 py-2 w-24">
                    តំបន់ក<br /><span className="text-[10px] font-normal text-slate-600">ZoneA</span>
                  </th>
                  <th className="border border-slate-400 px-2 py-2 w-24">
                    តំបន់ខ<br /><span className="text-[10px] font-normal text-slate-600">ZoneB</span>
                  </th>
                  <th className="border border-slate-400 px-2 py-2 w-24">
                    តំបន់គ<br /><span className="text-[10px] font-normal text-slate-600">ZoneC</span>
                  </th>
                  <th className="border border-slate-400 px-2 py-2 w-28 bg-slate-200">
                    សរុប<br /><span className="text-[10px] font-normal text-slate-600">Total</span>
                  </th>
                  <th className="border border-slate-400 px-2 py-2 w-24 bg-blue-50">
                    ប្រុស<br /><span className="text-[10px] font-normal text-slate-600">Male</span>
                  </th>
                  <th className="border border-slate-400 px-2 py-2 w-24 bg-pink-50">
                    ស្រី<br /><span className="text-[10px] font-normal text-slate-600">Female</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {/* Row 1: New OPD */}
                <tr className="hover:bg-slate-50 transition">
                  <td className="border border-slate-400 px-3 py-2.5 text-left font-semibold text-slate-800">
                    សរុបករណីថ្មី New OPD
                  </td>
                  <td className="border border-slate-400 px-2 py-2.5 font-bold">
                    {zoneSummary.newOPD.zoneA}
                  </td>
                  <td className="border border-slate-400 px-2 py-2.5 font-bold">
                    {zoneSummary.newOPD.zoneB}
                  </td>
                  <td className="border border-slate-400 px-2 py-2.5 font-bold">
                    {zoneSummary.newOPD.zoneC}
                  </td>
                  <td className="border border-slate-400 px-2 py-2.5 font-bold bg-slate-100 text-blue-900">
                    {zoneSummary.newOPD.total}
                  </td>
                  <td className="border border-slate-400 px-2 py-2.5 font-bold text-blue-700 bg-blue-50/50">
                    {zoneSummary.newOPD.male}
                  </td>
                  <td className="border border-slate-400 px-2 py-2.5 font-bold text-rose-700 bg-pink-50/50">
                    {zoneSummary.newOPD.female}
                  </td>
                </tr>

                {/* Row 2: Total OPD */}
                <tr className="hover:bg-slate-50 transition bg-slate-50/30">
                  <td className="border border-slate-400 px-3 py-2.5 text-left font-semibold text-slate-800">
                    ចំនួនពិនិត្យពិគ្រោះជំងឺសរុប Total OPD
                  </td>
                  <td className="border border-slate-400 px-2 py-2.5 font-bold">
                    {zoneSummary.totalOPD.zoneA}
                  </td>
                  <td className="border border-slate-400 px-2 py-2.5 font-bold">
                    {zoneSummary.totalOPD.zoneB}
                  </td>
                  <td className="border border-slate-400 px-2 py-2.5 font-bold">
                    {zoneSummary.totalOPD.zoneC}
                  </td>
                  <td className="border border-slate-400 px-2 py-2.5 font-bold bg-slate-200/80 text-blue-900">
                    {zoneSummary.totalOPD.total}
                  </td>
                  <td className="border border-slate-400 px-2 py-2.5 font-bold text-blue-700 bg-blue-50/50">
                    {zoneSummary.totalOPD.male}
                  </td>
                  <td className="border border-slate-400 px-2 py-2.5 font-bold text-rose-700 bg-pink-50/50">
                    {zoneSummary.totalOPD.female}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ----------------- Table 2: សរុបករណីថ្មីតាម អាយុ និងភេទ ----------------- */}
        <div className="space-y-2 pt-2">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border-2 border-slate-600 text-center text-[11px] sm:text-xs">
              <thead className="bg-slate-100 font-bold text-slate-800">
                {/* Header Row 1 */}
                <tr>
                  <th rowSpan="2" className="border border-slate-400 px-2 py-2 min-w-[110px] text-left bg-slate-200">
                    សរុបករណីថ្មីតាម<br />អាយុ និងភេទ
                  </th>
                  <th colSpan="2" className="border border-slate-400 px-1 py-1.5 w-16">0-28 ថ្ងៃ</th>
                  <th colSpan="2" className="border border-slate-400 px-1 py-1.5 w-18">29 ថ្ងៃ-11 ខែ</th>
                  <th colSpan="2" className="border border-slate-400 px-1 py-1.5 w-16">1-4 ឆ្នាំ</th>
                  <th colSpan="2" className="border border-slate-400 px-1 py-1.5 w-16">5-14 ឆ្នាំ</th>
                  <th colSpan="2" className="border border-slate-400 px-1 py-1.5 w-16">15-24 ឆ្នាំ</th>
                  <th colSpan="2" className="border border-slate-400 px-1 py-1.5 w-16">25-49 ឆ្នាំ</th>
                  <th colSpan="2" className="border border-slate-400 px-1 py-1.5 w-16">50-64 ឆ្នាំ</th>
                  <th colSpan="2" className="border border-slate-400 px-1 py-1.5 w-16">&gt;=65 ឆ្នាំ</th>
                  <th colSpan="2" className="border border-slate-400 px-1 py-1.5 w-20 bg-slate-200">សរុប</th>
                  <th colSpan="2" className="border border-slate-400 px-1 py-1.5 w-16 bg-rose-50 text-rose-900">បញ្ជូនទៅ</th>
                  <th colSpan="2" className="border border-slate-400 px-1 py-1.5 w-20 bg-amber-50 text-amber-900">
                    ប្រើប្រាស់<br />HEF
                  </th>
                </tr>

                {/* Header Row 2: Male / Female sub-headers */}
                <tr className="text-[10px]">
                  <th className="border border-slate-400 py-1 bg-blue-50 text-blue-900">ប្រ</th>
                  <th className="border border-slate-400 py-1 bg-pink-50 text-pink-900">ស្រ</th>
                  <th className="border border-slate-400 py-1 bg-blue-50 text-blue-900">ប្រ</th>
                  <th className="border border-slate-400 py-1 bg-pink-50 text-pink-900">ស្រ</th>
                  <th className="border border-slate-400 py-1 bg-blue-50 text-blue-900">ប្រ</th>
                  <th className="border border-slate-400 py-1 bg-pink-50 text-pink-900">ស្រ</th>
                  <th className="border border-slate-400 py-1 bg-blue-50 text-blue-900">ប្រ</th>
                  <th className="border border-slate-400 py-1 bg-pink-50 text-pink-900">ស្រ</th>
                  <th className="border border-slate-400 py-1 bg-blue-50 text-blue-900">ប្រ</th>
                  <th className="border border-slate-400 py-1 bg-pink-50 text-pink-900">ស្រ</th>
                  <th className="border border-slate-400 py-1 bg-blue-50 text-blue-900">ប្រ</th>
                  <th className="border border-slate-400 py-1 bg-pink-50 text-pink-900">ស្រ</th>
                  <th className="border border-slate-400 py-1 bg-blue-50 text-blue-900">ប្រ</th>
                  <th className="border border-slate-400 py-1 bg-pink-50 text-pink-900">ស្រ</th>
                  <th className="border border-slate-400 py-1 bg-blue-50 text-blue-900">ប្រ</th>
                  <th className="border border-slate-400 py-1 bg-pink-50 text-pink-900">ស្រ</th>
                  <th className="border border-slate-400 py-1 bg-blue-100 font-bold">ប្រ</th>
                  <th className="border border-slate-400 py-1 bg-pink-100 font-bold">ស្រ</th>
                  <th className="border border-slate-400 py-1 bg-rose-100">ប្រ</th>
                  <th className="border border-slate-400 py-1 bg-rose-100">ស្រ</th>
                  <th className="border border-slate-400 py-1 bg-amber-100">ប្រ</th>
                  <th className="border border-slate-400 py-1 bg-amber-100">ស្រ</th>
                </tr>
              </thead>

              {/* Data Row */}
              <tbody>
                <tr className="font-bold text-slate-800">
                  <td className="border border-slate-400 px-2 py-3 bg-slate-50 text-left font-semibold">
                    ចំនួនករណី
                  </td>
                  {/* 0-28 ថ្ងៃ */}
                  <td className="border border-slate-400 py-3">{newCasesByAgeAndGender['0_28d'].male}</td>
                  <td className="border border-slate-400 py-3">{newCasesByAgeAndGender['0_28d'].female}</td>
                  {/* 29 ថ្ងៃ-11 ខែ */}
                  <td className="border border-slate-400 py-3">{newCasesByAgeAndGender['29d_11m'].male}</td>
                  <td className="border border-slate-400 py-3">{newCasesByAgeAndGender['29d_11m'].female}</td>
                  {/* 1-4 ឆ្នាំ */}
                  <td className="border border-slate-400 py-3">{newCasesByAgeAndGender['1_4y'].male}</td>
                  <td className="border border-slate-400 py-3">{newCasesByAgeAndGender['1_4y'].female}</td>
                  {/* 5-14 ឆ្នាំ */}
                  <td className="border border-slate-400 py-3">{newCasesByAgeAndGender['5_14y'].male}</td>
                  <td className="border border-slate-400 py-3">{newCasesByAgeAndGender['5_14y'].female}</td>
                  {/* 15-24 ឆ្នាំ */}
                  <td className="border border-slate-400 py-3">{newCasesByAgeAndGender['15_24y'].male}</td>
                  <td className="border border-slate-400 py-3">{newCasesByAgeAndGender['15_24y'].female}</td>
                  {/* 25-49 ឆ្នាំ */}
                  <td className="border border-slate-400 py-3">{newCasesByAgeAndGender['25_49y'].male}</td>
                  <td className="border border-slate-400 py-3">{newCasesByAgeAndGender['25_49y'].female}</td>
                  {/* 50-64 ឆ្នាំ */}
                  <td className="border border-slate-400 py-3">{newCasesByAgeAndGender['50_64y'].male}</td>
                  <td className="border border-slate-400 py-3">{newCasesByAgeAndGender['50_64y'].female}</td>
                  {/* >=65 ឆ្នាំ */}
                  <td className="border border-slate-400 py-3">{newCasesByAgeAndGender['ge65y'].male}</td>
                  <td className="border border-slate-400 py-3">{newCasesByAgeAndGender['ge65y'].female}</td>
                  {/* សរុប ប្រុស / ស្រី */}
                  <td className="border border-slate-400 py-3 bg-blue-50 text-blue-900">{newCasesTotal.male}</td>
                  <td className="border border-slate-400 py-3 bg-pink-50 text-rose-900">{newCasesTotal.female}</td>
                  {/* បញ្ជូនទៅ ប្រុស / ស្រី */}
                  <td className="border border-slate-400 py-3 bg-rose-50/70 text-rose-700">{referrals.male}</td>
                  <td className="border border-slate-400 py-3 bg-rose-50/70 text-rose-700">{referrals.female}</td>
                  {/* HEF ប្រុស / ស្រី */}
                  <td className="border border-slate-400 py-3 bg-amber-50/70 text-amber-800">{hefUsers.male}</td>
                  <td className="border border-slate-400 py-3 bg-amber-50/70 text-amber-800">{hefUsers.female}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ----------------- Table 3: បរិមាណសេវា និងការទូទាត់ (Payment & Indicators) ----------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="border border-slate-300 rounded-xl p-3 bg-slate-50/50">
            <h3 className="font-bold text-xs text-slate-800 mb-2 border-b border-slate-200 pb-1">
              សង្ខេបប្រភពចំណូល / យន្តការទូទាត់សេវាសុខាភិបាល
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2 rounded border border-slate-200 flex justify-between">
                <span>បង់ប្រាក់ផ្ទាល់ (P)៖</span>
                <b className="text-emerald-700">{stats.payingUsers.total} នាក់</b>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200 flex justify-between">
                <span>មូលនិធិសមធម៌ (HEF)៖</span>
                <b className="text-amber-700">{stats.hefUsers.total} នាក់</b>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200 flex justify-between">
                <span>បេឡាជាតិសន្តិសុខសង្គម (ប.ស.ស)៖</span>
                <b className="text-blue-700">{stats.nssfUsers.total} នាក់</b>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200 flex justify-between">
                <span>លើកលែងថ្លៃសេវា (E)៖</span>
                <b className="text-purple-700">{stats.exemptUsers.total} នាក់</b>
              </div>
            </div>
          </div>

          <div className="border border-slate-300 rounded-xl p-3 bg-slate-50/50">
            <h3 className="font-bold text-xs text-slate-800 mb-2 border-b border-slate-200 pb-1">
              សូចនាករសុខភាពមាតា និងអាហារូបត្ថម្ភ
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2 rounded border border-slate-200 flex justify-between">
                <span>ស្ត្រីមានផ្ទៃពោះមកពិនិត្យ៖</span>
                <b className="text-pink-700">{stats.pregnantCount} នាក់</b>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200 flex justify-between">
                <span>បញ្ជូនទៅពេទ្យបង្អែកសរុប៖</span>
                <b className="text-rose-700">{stats.referrals.total} នាក់</b>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200 flex justify-between col-span-2">
                <span>កុមារអាយុក្រោម ៥ឆ្នាំ ពិនិត្យសរុប៖</span>
                <b className="text-indigo-700">
                  {newCasesByAgeAndGender['0_28d'].male + newCasesByAgeAndGender['0_28d'].female +
                   newCasesByAgeAndGender['29d_11m'].male + newCasesByAgeAndGender['29d_11m'].female +
                   newCasesByAgeAndGender['1_4y'].male + newCasesByAgeAndGender['1_4y'].female} នាក់
                </b>
              </div>
            </div>
          </div>
        </div>

        {/* Signatures Block for Official MoH Submission */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-2 text-center text-xs">
          <div>
            <div className="text-slate-500 text-[11px]">បានឃើញ និងឯកភាព</div>
            <div className="font-bold text-slate-800 mt-1">ប្រធានមណ្ឌលសុខភាព</div>
            <div className="h-20"></div>
            <div className="font-semibold text-slate-700">(ហត្ថលេខា និងត្រា)</div>
          </div>

          <div>
            <div className="text-slate-500 text-[11px]">ថ្ងៃទី......... ខែ........... ឆ្នាំ ២០២៦</div>
            <div className="font-bold text-slate-800 mt-1">អ្នករៀបចំរបាយការណ៍</div>
            <div className="h-20"></div>
            <div className="font-semibold text-slate-700">(ហត្ថលេខា និងឈ្មោះ)</div>
          </div>
        </div>

      </div>
    </div>
  );
}
