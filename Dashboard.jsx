import React from 'react';
import { 
  Camera,
  Users, 
  UserCheck, 
  UserPlus, 
  MapPin, 
  CreditCard, 
  Send, 
  HeartPulse, 
  Baby,
  Calendar,
  AlertCircle,
  TrendingUp,
  FileSpreadsheet,
  Upload
} from 'lucide-react';
import { calculateReportSummary } from '../utils/statistics';

export default function Dashboard({ records, setActiveTab, onOpenScanner, onExportExcel, onOpenImport, hcInfo }) {
  const stats = calculateReportSummary(records);
  const total = stats.zoneSummary.totalOPD.total || 0;
  const newOpd = stats.zoneSummary.newOPD.total || 0;
  const oldOpd = total - newOpd;
  const maleTotal = stats.zoneSummary.totalOPD.male || 0;
  const femaleTotal = stats.zoneSummary.totalOPD.female || 0;

  // Sorted diagnoses
  const sortedDiags = Object.entries(stats.topDiagnoses)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-medium mb-2 border border-white/20">
              <Calendar className="w-3.5 h-3.5" />
              របាយការណ៍សង្ខេបប្រចាំខែ {hcInfo?.reportMonth} ឆ្នាំ {hcInfo?.reportYear}
            </span>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              ប្រព័ន្ធកត់ត្រា និងគ្រប់គ្រងអ្នកជំងឺពិគ្រោះក្រៅ (OPD Register)
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-2xl">
              ផ្អែកតាមទម្រង់សៀវភៅបញ្ជីកត់ត្រាផ្លូវការ ៣២ ជួរ និងរបាយការណ៍ស្ថិតិសង្ខេបរបស់ក្រសួងសុខាភិបាលកម្ពុជា
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenScanner}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-950/30 transition flex items-center gap-2 border border-white/20"
            >
              <Camera className="w-4 h-4" />
              <span>📷 ស្កេនវេជ្ជបញ្ជា AI</span>
            </button>

            <button
              onClick={onOpenImport}
              className="px-4 py-2 bg-blue-500/80 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-md transition flex items-center gap-2 border border-white/20"
            >
              <Upload className="w-4 h-4" />
              <span>នាំចូល File (PDF/Excel)</span>
            </button>
            <button
              onClick={() => setActiveTab('new-entry')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold shadow-md transition flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ ចុះឈ្មោះអ្នកជំងឺថ្មី</span>
            </button>
            <button
              onClick={() => setActiveTab('monthly-report')}
              className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-sm font-medium border border-white/25 transition flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              <span>មើលតារាងសង្ខេប</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Visits */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>ពិគ្រោះជំងឺសរុប (Total OPD)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">{total}</span>
            <span className="text-xs text-slate-500">នាក់</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>ប្រុស៖ <b className="text-slate-700">{maleTotal}</b></span>
            <span>ស្រី៖ <b className="text-slate-700">{femaleTotal}</b></span>
          </div>
        </div>

        {/* Card 2: New Cases */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>ករណីថ្មី (New OPD)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700">{newOpd}</span>
            <span className="text-xs text-emerald-600 font-medium">
              ({total > 0 ? Math.round((newOpd / total) * 100) : 0}%)
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>ករណីចាស់/បន្ត៖ <b className="text-slate-700">{oldOpd}</b></span>
          </div>
        </div>

        {/* Card 3: Health Equity Fund (HEF) */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>មូលនិធិសមធម៌ (HEF Card)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-700">{stats.hefUsers.total}</span>
            <span className="text-xs text-slate-500">ករណី</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>ប.ស.ស (NSSF)៖ <b className="text-slate-700">{stats.nssfUsers.total}</b></span>
            <span>បង់ប្រាក់ P៖ <b className="text-slate-700">{stats.payingUsers.total}</b></span>
          </div>
        </div>

        {/* Card 4: Referrals & Maternal */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>បញ្ជូនទៅពេទ្យបង្អែក (Referral)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600">{stats.referrals.total}</span>
            <span className="text-xs text-slate-500">នាក់</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>ស្ត្រីមានផ្ទៃពោះ៖ <b className="text-indigo-600">{stats.pregnantCount}</b></span>
            <span>លើកលែង E៖ <b className="text-slate-700">{stats.exemptUsers.total}</b></span>
          </div>
        </div>
      </div>

      {/* Breakdown by Zone & Common Diagnoses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Zone Breakdown */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm">
          <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>បរិមាណសកម្មភាពតាមតំបន់ (Catchment Area)</span>
          </h2>

          <div className="space-y-4">
            {/* Zone A */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                <span>តំបន់ ក (Zone A - ជិតមណ្ឌល)</span>
                <span className="text-blue-700">{stats.zoneSummary.totalOPD.zoneA} នាក់</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${total > 0 ? (stats.zoneSummary.totalOPD.zoneA / total) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>ករណីថ្មី៖ {stats.zoneSummary.newOPD.zoneA}</span>
                <span>{total > 0 ? Math.round((stats.zoneSummary.totalOPD.zoneA / total) * 100) : 0}%</span>
              </div>
            </div>

            {/* Zone B */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                <span>តំបន់ ខ (Zone B - ឆ្ងាយបន្តិច)</span>
                <span className="text-indigo-700">{stats.zoneSummary.totalOPD.zoneB} នាក់</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-2 rounded-full" 
                  style={{ width: `${total > 0 ? (stats.zoneSummary.totalOPD.zoneB / total) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>ករណីថ្មី៖ {stats.zoneSummary.newOPD.zoneB}</span>
                <span>{total > 0 ? Math.round((stats.zoneSummary.totalOPD.zoneB / total) * 100) : 0}%</span>
              </div>
            </div>

            {/* Zone C */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                <span>តំបន់ គ (Zone C - ក្រៅតំបន់/ក្រៅឃុំ)</span>
                <span className="text-emerald-700">{stats.zoneSummary.totalOPD.zoneC} នាក់</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-emerald-600 h-2 rounded-full" 
                  style={{ width: `${total > 0 ? (stats.zoneSummary.totalOPD.zoneC / total) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>ករណីថ្មី៖ {stats.zoneSummary.newOPD.zoneC}</span>
                <span>{total > 0 ? Math.round((stats.zoneSummary.totalOPD.zoneC / total) * 100) : 0}%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => setActiveTab('monthly-report')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <span>មើលតារាងលម្អិត &rarr;</span>
            </button>
          </div>
        </div>

        {/* Right 2 cols: Top Diagnoses */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              <span>រោគវិនិច្ឆ័យទូទៅញឹកញាប់បំផុត (Top Diagnoses - ICD-10)</span>
            </h2>
            <span className="text-xs text-slate-500">ផ្អែកតាមទិន្នន័យជាក់ស្តែង</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sortedDiags.map(([name, count], index) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={index} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-xs font-medium text-slate-800 line-clamp-1">
                        {name}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-blue-700 shrink-0">
                      {count} ករណី
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2.5 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full" 
                      style={{ width: `${pct * 3}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Shortcuts */}
          <div className="mt-5 p-3 rounded-lg bg-blue-50/60 border border-blue-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-blue-900 font-medium">
              💡 អ្នកអាចទាញយករបាយការណ៍ពេញលេញជាទម្រង់ Excel ឬបោះពុម្ពបានគ្រប់ពេល
            </span>
            <button
              onClick={onExportExcel}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition flex items-center gap-1.5 shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>ទាញយក Excel (៣២ជួរ + សង្ខេប)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
