import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  FileJson, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ArrowRight,
  Database,
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { parseExcelFile, parsePDFFile, parseJSONFile } from '../utils/fileImport';

export default function ImportModal({ isOpen, onClose, onImportSuccess, existingCount = 0 }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parsedRecords, setParsedRecords] = useState([]);
  const [importMode, setImportMode] = useState('append'); // 'append' or 'replace'
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (uploadedFile) => {
    setError(null);
    setFile(uploadedFile);
    setIsLoading(true);

    try {
      const ext = uploadedFile.name.split('.').pop().toLowerCase();
      let records = [];

      if (['xlsx', 'xls', 'csv'].includes(ext)) {
        records = await parseExcelFile(uploadedFile);
      } else if (ext === 'pdf') {
        records = await parsePDFFile(uploadedFile);
      } else if (ext === 'json') {
        records = await parseJSONFile(uploadedFile);
      } else {
        throw new Error('ប្រភេទ File មិនគាំទ្រទេ! សូមជ្រើសរើស File .xlsx, .xls, .pdf ឬ .json');
      }

      if (!records || records.length === 0) {
        throw new Error('មិនអាចស្វែងរកទិន្នន័យអ្នកជំងឺពី File នេះបានទេ');
      }

      setParsedRecords(records);
    } catch (err) {
      console.error(err);
      setError(err.message || 'មានបញ្ហាក្នុងការអាន File');
      setParsedRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (parsedRecords.length === 0) return;
    onImportSuccess(parsedRecords, importMode);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setFile(null);
    setParsedRecords([]);
    setError(null);
    setIsLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                ទាញចូលទិន្នន័យ (Import File PDF ឬ Excel)
              </h2>
              <p className="text-xs text-slate-500">
                បញ្ចូលទិន្នន័យអ្នកជំងឺពី File Excel (.xlsx, .xls) ឬ File PDF ចូលទៅក្នុងប្រព័ន្ធ
              </p>
            </div>
          </div>

          <button 
            onClick={() => { handleReset(); onClose(); }}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* File Upload Box */}
          {!file && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50/70 scale-[0.99]' 
                  : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,.pdf,.json"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Upload className="w-8 h-8" />
              </div>

              <h3 className="text-sm font-bold text-slate-800 mb-1">
                ចុចទីនេះដើម្បីជ្រើសរើស File ឬ អូសទម្លាក់ (Drag & Drop) ចូលទីនេះ
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                គាំទ្រឯកសារ <b>Excel (.xlsx, .xls, .csv)</b>, <b>PDF (.pdf)</b> នៃរបាយការណ៍មណ្ឌលសុខភាព ឬ <b>JSON Backup</b>
              </p>

              {/* Supported Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Excel (.xlsx / .xls)
                </span>
                <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-medium flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  PDF (.pdf របាយការណ៍)
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium flex items-center gap-1.5">
                  <FileJson className="w-3.5 h-3.5" />
                  JSON (.json)
                </span>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <div className="text-sm font-bold text-slate-800">
                កំពុងអាន និងស្រង់ទិន្នន័យពី File...
              </div>
              <p className="text-xs text-slate-500">
                ប្រព័ន្ធកំពុងស្វែងរកជួរឈរទាំង ៣២ និងចាត់ថ្នាក់ក្រុមអាយុដោយស្វ័យប្រវត្តិ
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-bold">បរាជ័យក្នុងការនាំចូលទិន្នន័យ៖</div>
                <div className="mt-0.5">{error}</div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-2 px-3 py-1 bg-white border border-rose-300 rounded-lg text-rose-700 hover:bg-rose-50 font-semibold"
                >
                  សាកល្បង File ផ្សេង
                </button>
              </div>
            </div>
          )}

          {/* Parsed Result Preview */}
          {parsedRecords.length > 0 && (
            <div className="space-y-4">
              {/* File details banner */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                      <span>{file?.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                        រកឃើញ {parsedRecords.length} នាក់
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      ទំហំ៖ {(file?.size / 1024).toFixed(1)} KB | ត្រៀមនាំចូលទៅក្នុងប្រព័ន្ធ
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleReset}
                  className="text-xs text-slate-600 hover:text-slate-900 underline self-end sm:self-center"
                >
                  ប្តូរ File ផ្សេង
                </button>
              </div>

              {/* Import Mode Options */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-700 mb-2">ជ្រើសរើសរបៀបនាំចូលទិន្នន័យ៖</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className={`p-3 rounded-xl border cursor-pointer flex items-start gap-2.5 transition ${
                    importMode === 'append' 
                      ? 'bg-blue-50/80 border-blue-500 shadow-sm text-blue-900' 
                      : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="importMode"
                      value="append"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="mt-0.5 text-blue-600"
                    />
                    <div>
                      <div className="font-bold">➕ បន្ថែមលើទិន្នន័យចាស់ (Append)</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        រក្សាទុកអ្នកជំងឺបច្ចុប្បន្ន ({existingCount} នាក់) ហើយបន្ថែម {parsedRecords.length} នាក់ថ្មីចូល
                      </div>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border cursor-pointer flex items-start gap-2.5 transition ${
                    importMode === 'replace' 
                      ? 'bg-amber-50/80 border-amber-500 shadow-sm text-amber-900' 
                      : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="mt-0.5 text-amber-600"
                    />
                    <div>
                      <div className="font-bold">🔄 ជំនួសទិន្នន័យចាស់ទាំងអស់ (Replace All)</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        លុបទិន្នន័យចាស់ចោល ហើយជំនួសដោយ {parsedRecords.length} នាក់ចេញពី File នេះ
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Data Preview Table */}
              <div>
                <div className="text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>មើលទិន្នន័យគំរូមុននឹងរក្សាទុក (បង្ហាញ ៥ ជួរដំបូង)៖</span>
                  <span className="text-[11px] font-normal text-slate-500">សរុប {parsedRecords.length} ជួរ</span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-48 text-[11px]">
                  <table className="w-full text-center divide-y divide-slate-200">
                    <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                      <tr>
                        <th className="px-2 py-1.5">ល.រ</th>
                        <th className="px-2 py-1.5 text-left">ឈ្មោះ</th>
                        <th className="px-2 py-1.5">អាយុ</th>
                        <th className="px-2 py-1.5">ភេទ</th>
                        <th className="px-2 py-1.5">តំបន់</th>
                        <th className="px-2 py-1.5 text-left">រោគវិនិច្ឆ័យ</th>
                        <th className="px-2 py-1.5 text-left">ការព្យាបាល</th>
                        <th className="px-2 py-1.5">បង់ថ្លៃ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white text-slate-800">
                      {parsedRecords.slice(0, 5).map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-2 py-1 font-semibold">{i + 1}</td>
                          <td className="px-2 py-1 text-left font-bold text-slate-900">{r.name}</td>
                          <td className="px-2 py-1">{r.age} {r.ageUnit === 'years' ? 'ឆ្នាំ' : r.ageUnit}</td>
                          <td className="px-2 py-1">{r.gender}</td>
                          <td className="px-2 py-1">{r.zone}</td>
                          <td className="px-2 py-1 text-left">
                            <span className="font-bold text-blue-700">{r.diagnosisCode}</span> - {r.diagnosisName}
                          </td>
                          <td className="px-2 py-1 text-left font-mono text-[10px] truncate max-w-[180px]">
                            {r.treatment}
                          </td>
                          <td className="px-2 py-1 font-semibold">{r.paymentType}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => { handleReset(); onClose(); }}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition"
          >
            បោះបង់
          </button>

          <button
            type="button"
            disabled={parsedRecords.length === 0}
            onClick={handleConfirmImport}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition flex items-center gap-2"
          >
            <span>យល់ព្រមនាំចូលទិន្នន័យ ({parsedRecords.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
