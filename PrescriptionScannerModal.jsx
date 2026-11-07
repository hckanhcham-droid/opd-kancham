import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  X, 
  Key, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  FileText 
} from 'lucide-react';

const PRESCRIPTION_PROMPT = `You are an expert Cambodian medical transcriptionist reading a Health Center / Hospital OPD prescription or patient encounter record (វេជ្ជបញ្ជា / ប័ណ្ណពិគ្រោះជំងឺក្រៅ).

Analyze the uploaded prescription or medical document image carefully and extract all patient and prescription information into a single clean JSON object.

Fields to extract:
- register_date: Admission or prescription date in YYYY-MM-DD format (e.g. 2026-10-30). If year is 2 digits like 26, use 2026.
- card_number: Patient health/HEF card number (e.g. 030-338-104-9).
- name: Patient's Khmer full name (e.g. មុត ស្រីណែ).
- guardian: Guardian/parent name if mentioned for children, else empty string.
- age: Number of age (e.g. 4, 10, 25).
- age_unit: Must be one of: "years", "months", "days".
- gender: Must be "ស្រី" (Female) or "ប្រុស" (Male).
- pregnancy_weeks: Weeks of pregnancy if pregnant, else empty string.
- address: Patient village/commune/district/province (e.g. ព្រៃវែង - ពារាំង - កញ្ចំ - ដំបូកធំ).
- phone: Phone number if present (e.g. 066847892), else empty string.
- patient_type: Must be "ថ្មី" (New case) or "ចាស់" (Old case). If image says "ករណីថ្មី", output "ថ្មី".
- symptoms: Clinical symptoms in Khmer (e.g. ក្តៅខ្លួន, ឈឺបំពង់ក, ក្អកហៀរសំបោរ).
- diagnosis_code: ICD-10 code if present (e.g. J02.9 or J02).
- diagnosis_name: Disease name in Khmer / English (e.g. ជំងឺរលាកបំពង់កស្រួចស្រាវ/Acute Pharyngitis).
- diagnosis: Full diagnosis text (ICD-10 code + disease name).
- medical_history: Medical history if mentioned, else "គ្មាន".
- treatment: All prescribed medications formatted line by line in OPD style:
  [Drug Name and dosage], [instruction: e.g. 7.5ml or 2គ្រាប់] x [times per day, e.g. 3ដង]= [total quantity, e.g. 1ដប or 30គ្រាប់]
  Example:
  Amoxillin powder 100ml 125mg/5ml, 7.5ml x 3ដង= 1ដប
  Paracetamol 100mg, 2គ្រាប់ x 3ដង= 30គ្រាប់
  Chlorpheniramine 4mg, 0.5គ្រាប់ x 2ដង= 5គ្រាប់
- payment_type: "HEF" (if card starts with 030 or poor/equity card) or "P" (paying) or "ប.ស.ស" (NSSF).
- doctor: Doctor name if present (e.g. លន់ តុលា).

Return ONLY valid raw JSON with no Markdown backticks or explanation.`;

export default function PrescriptionScannerModal({ isOpen, onClose, onScanComplete }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [isKeyBoxOpen, setIsKeyBoxOpen] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [imageMime, setImageMime] = useState('image/jpeg');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('gemini_api_key');
    if (saved) {
      setApiKey(saved);
      setKeyInput(saved);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveKey = () => {
    const trimmed = keyInput.trim();
    if (!trimmed) {
      alert('សូមបញ្ចូល API Key ត្រឹមត្រូវ');
      return;
    }
    localStorage.setItem('gemini_api_key', trimmed);
    setApiKey(trimmed);
    setIsKeyBoxOpen(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('សូមជ្រើសរើសឯកសារជារូបភាព (JPG, PNG, WEBP)');
      return;
    }

    setImageMime(file.type || 'image/jpeg');
    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(1) + ' KB');
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const fullUrl = event.target.result;
      setImagePreview(fullUrl);
      setImageBase64(fullUrl.split(',')[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setImagePreview(null);
    setImageBase64(null);
    setFileName('');
    setFileSize('');
    setErrorMsg('');
    setIsScanning(false);
  };

  const executeScan = async () => {
    if (!imageBase64) {
      setErrorMsg('សូមជ្រើសរើសរូបភាពវេជ្ជបញ្ជាជាមុនសិន');
      return;
    }

    if (!apiKey.trim()) {
      setIsKeyBoxOpen(true);
      setErrorMsg('សូមបញ្ចូល Gemini API Key (ចុច "កំណត់ Key" ខាងលើ)');
      return;
    }

    setIsScanning(true);
    setErrorMsg('');

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: PRESCRIPTION_PROMPT },
              { inline_data: { mime_type: imageMime, data: imageBase64 } }
            ]
          }],
          generationConfig: {
            response_mime_type: 'application/json',
            temperature: 0.1
          }
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const msg = errJson?.error?.message || `HTTP ${response.status}`;
        throw new Error(msg);
      }

      const result = await response.json();
      const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('AI មិនបានឆ្លើយតបព័ត៌មានត្រឹមត្រូវ');

      const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const extracted = JSON.parse(cleanJson);

      // Map to PatientForm structure
      const mappedRecord = {
        date: extracted.register_date || new Date().toISOString().split('T')[0],
        code: extracted.card_number || '',
        name: extracted.name || '',
        guardianName: extracted.guardian || '',
        age: extracted.age ? String(extracted.age) : '',
        ageUnit: extracted.age_unit || 'years',
        gender: extracted.gender || 'ស្រី',
        zone: 'ខ', // Default zone for Kancham villages like Dom Bok Thom
        pregnantWeeks: extracted.pregnancy_weeks || '',
        address: extracted.address || '',
        phone: extracted.phone || '',
        visitType: extracted.patient_type === 'ចាស់' ? 'old' : 'new',
        isNew: extracted.patient_type !== 'ចាស់',
        symptoms: extracted.symptoms || '',
        diagnosisCode: extracted.diagnosis_code || (extracted.diagnosis ? extracted.diagnosis.split(' ')[0] : ''),
        diagnosisName: extracted.diagnosis_name || extracted.diagnosis || '',
        treatment: extracted.treatment || '',
        paymentType: extracted.payment_type || (extracted.card_number?.startsWith('030') ? 'HEF' : 'P'),
        remarks: extracted.doctor ? `វេជ្ជបណ្ឌិត៖ ${extracted.doctor}` : ''
      };

      // Check village in address for Zone
      if (extracted.address) {
        const addr = extracted.address;
        if (addr.includes('កញ្ចំ(ខ)')) mappedRecord.zone = 'ក';
        else if (['កញ្ចំ(ក)', 'ជំទាវម៉ា', 'បង់បត់', 'ដំបូកធំ', 'តាំងរមាំង', 'វាល', 'ដូង', 'ថ្កូវ', 'ទន្លេជ្រៃ', 'ព្រៃទំពូង', 'ទ្រា'].some(v => addr.includes(v))) {
          mappedRecord.zone = 'ខ';
        } else {
          mappedRecord.zone = 'គ';
        }
      }

      onScanComplete(mappedRecord);
      onClose();
    } catch (err) {
      console.error('Scan error:', err);
      setErrorMsg('❌ ការអានរូបភាពមិនបានសម្រេច៖ ' + err.message);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">ស្កេនវេជ្ជបញ្ជាដោយ AI (Prescription Scanner)</h2>
              <p className="text-xs text-slate-500">ថតរូប ឬផ្ទុកវេជ្ជបញ្ជាដើម្បីស្រង់ទិន្នន័យអ្នកជំងឺ និងថ្នាំស្វ័យប្រវត្តិ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          
          {/* Key Status Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div>
                <span className="font-semibold text-emerald-950">Gemini API Key: </span>
                {apiKey ? (
                  <span className="text-emerald-700 font-mono font-medium">
                    ✅ រួចរាល់ ({apiKey.substring(0, 6)}...{apiKey.slice(-4)})
                  </span>
                ) : (
                  <span className="text-rose-600 font-semibold">❌ មិនទាន់មាន Key</span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsKeyBoxOpen(!isKeyBoxOpen)}
              className="px-2.5 py-1 bg-white border border-emerald-300 text-emerald-800 rounded-lg hover:bg-emerald-100/60 font-medium transition"
            >
              ⚙️ កំណត់ Key
            </button>
          </div>

          {/* Key Input Box */}
          {isKeyBoxOpen && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
              <label className="font-semibold text-slate-700 block">
                បញ្ចូល Google Gemini API Key (ឥតគិតថ្លៃ ១០០% ពី Google AI Studio)៖
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveKey}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition"
                >
                  រក្សាទុក
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                👉 <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-emerald-600 font-bold underline">ចុចទីនេះដើម្បីយក Gemini Key ឥតគិតថ្លៃ</a> (ចុច Create API key រួច Copy មកដាក់ទីនេះ)
              </p>
            </div>
          )}

          {/* Upload / Camera Dropzone */}
          {!imagePreview ? (
            <div className="border-2 border-dashed border-emerald-400 bg-emerald-50/40 hover:bg-emerald-50/80 rounded-2xl p-8 text-center transition cursor-pointer">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl">
                📸
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">ចុចទីនេះដើម្បីថតរូប ឬជ្រើសរូបភាពវេជ្ជបញ្ជា</h3>
              <p className="text-xs text-slate-500 mb-4">(គាំទ្រ JPG, PNG, WEBP ឬថតផ្ទាល់តាមកាមេរ៉ាទូរស័ព្ទ)</p>

              <div className="flex items-center justify-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer">
                  <Camera className="w-4 h-4" />
                  <span>ថតតាមកាមេរ៉ា</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>

                <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition border border-slate-200 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>ជ្រើសរូបភាពពីឯកសារ</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
          ) : (
            /* Image Preview & Scan Action */
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-4 items-start">
              <div className="w-28 h-36 bg-black rounded-xl overflow-hidden flex-shrink-0 border border-slate-300">
                <img
                  src={imagePreview}
                  alt="Prescription Preview"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 truncate">{fileName || 'រូបភាពវេជ្ជបញ្ជា'}</h4>
                  <p className="text-[11px] text-slate-500">{fileSize}</p>
                </div>

                {isScanning && (
                  <div className="flex items-center gap-2.5 text-xs text-emerald-700 font-bold bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>AI កំពុងអានឈ្មោះអ្នកជំងឺ និងថ្នាំពេទ្យ...</span>
                  </div>
                )}

                {errorMsg && (
                  <div className="flex items-start gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {!isScanning && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={executeScan}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>⚡ ចាប់ផ្តើមអាន (Scan Now)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-medium transition"
                    >
                      🔄 ប្តូររូបថ្មី
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
