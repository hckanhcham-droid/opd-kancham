import React from 'react';
import { 
  Activity, 
  Camera,
  Table, 
  UserPlus, 
  FileText, 
  Users, 
  Download, 
  Upload,
  Printer, 
  RotateCcw,
  Building2,
  FileSpreadsheet
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenScanner,
  onExportExcel, 
  onOpenImport,
  onResetData, 
  recordsCount, 
  hcInfo 
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm no-print">
      {/* Top Bar with Ministry of Health banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center font-bold text-emerald-400 border border-white/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-wide text-white flex items-center gap-2">
                <span>ព្រះរាជាណាចក្រកម្ពុជា • ក្រសួងសុខាភិបាល</span>
                <span className="hidden sm:inline-block text-blue-300 text-xs font-normal">| {hcInfo?.province}</span>
              </div>
              <div className="text-xs text-blue-200 font-medium">
                {hcInfo?.nameKhmer} ({hcInfo?.nameEnglish}) • {hcInfo?.od}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* AI Prescription Scanner Button */}
            <button
              onClick={onOpenScanner}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg text-xs font-bold transition shadow-sm border border-emerald-400/50"
              title="ថតរូប ឬស្កេនវេជ្ជបញ្ជាដើម្បីស្រង់ទិន្នន័យស្វ័យប្រវត្តិ"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>📷 ស្កេនវេជ្ជបញ្ជា AI</span>
            </button>

            {/* Import Button */}
            <button
              onClick={onOpenImport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition shadow-sm border border-blue-400/40"
              title="ទាញចូលទិន្នន័យពី File Excel (.xlsx) ឬ File PDF ចូលទៅក្នុងប្រព័ន្ធ"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>នាំចូល File (PDF/Excel)</span>
            </button>

            {/* Export Excel Button */}
            <button
              onClick={onExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition shadow-sm"
              title="ទាញយករបាយការណ៍ជា Excel ទាំង ៣២ ជួរ និងតារាងសង្ខេប"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ទាញយក</span> <span>Excel</span>
            </button>

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition border border-white/20"
              title="បោះពុម្ពតារាង ឬរបាយការណ៍សង្ខេប"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">បោះពុម្ព</span>
            </button>

            {/* Reset Button */}
            <button
              onClick={onResetData}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs transition"
              title="ផ្ទុកឡើងវិញនូវទិន្នន័យគំរូដើម"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">ទិន្នន័យគំរូ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto py-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>ផ្ទាំងគ្រប់គ្រង (Dashboard)</span>
          </button>

          <button
            onClick={onOpenScanner}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 transition whitespace-nowrap shadow-sm"
          >
            <Camera className="w-4 h-4 text-emerald-600" />
            <span>📷 ស្កេនវេជ្ជបញ្ជា AI</span>
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'register'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>សៀវភៅកត់ត្រា ៣២ជួរ (Logbook)</span>
            <span className="ml-1 px-1.5 py-0.5 text-[11px] rounded-full bg-blue-100 text-blue-800 font-semibold">
              {recordsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('new-entry')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'new-entry'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-700 font-semibold">+ កត់ត្រាពិគ្រោះជំងឺថ្មី</span>
          </button>

          <button
            onClick={() => setActiveTab('monthly-report')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'monthly-report'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>របាយការណ៍ស្ថិតិសង្ខេប (Page 235)</span>
          </button>

          <button
            onClick={() => setActiveTab('patients')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'patients'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>ប្រវត្តិអ្នកជំងឺ (Patients)</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
