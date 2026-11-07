import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import DailyRegister from './components/DailyRegister';
import PatientForm from './components/PatientForm';
import MonthlyReport from './components/MonthlyReport';
import PatientList from './components/PatientList';
import ImportModal from './components/ImportModal';
import PrescriptionScannerModal from './components/PrescriptionScannerModal';
import { samplePatients, defaultHealthCenterInfo } from './data/initialData';
import { exportRegisterToExcel } from './utils/exportExcel';
import { getAgeCategory } from './utils/statistics';

const STORAGE_KEY = 'HC_PATIENT_RECORDS_V1';
const HC_INFO_KEY = 'HC_INFO_CONFIG_V1';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [importNotification, setImportNotification] = useState(null);
  
  // Health Center Settings
  const [hcInfo, setHcInfo] = useState(() => {
    try {
      const saved = localStorage.getItem(HC_INFO_KEY);
      return saved ? JSON.parse(saved) : defaultHealthCenterInfo;
    } catch (e) {
      return defaultHealthCenterInfo;
    }
  });

  // Patient Records State
  const [records, setRecords] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return samplePatients;
  });

  // Edit record state
  const [editingRecord, setEditingRecord] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error(e);
    }
  }, [records]);

  useEffect(() => {
    try {
      localStorage.setItem(HC_INFO_KEY, JSON.stringify(hcInfo));
    } catch (e) {
      console.error(e);
    }
  }, [hcInfo]);

  // Handle Save (Create or Update)
  const handleSaveRecord = (recordData) => {
    const ageCategory = recordData.ageCategory || getAgeCategory(recordData.age, recordData.ageUnit);
    const updatedData = {
      ...recordData,
      ageCategory
    };

    if (editingRecord) {
      setRecords(prev => prev.map(r => r.id === editingRecord.id ? { ...updatedData, id: r.id } : r));
      setEditingRecord(null);
    } else {
      const newId = records.length > 0 ? Math.max(...records.map(r => r.id || 0)) + 1 : 1;
      setRecords(prev => [{ ...updatedData, id: newId }, ...prev]);
    }

    setActiveTab('register');
  };

  // Handle Delete
  const handleDeleteRecord = (id) => {
    if (window.confirm('តើលោកអ្នកពិតជាចង់លុបកំណត់ត្រានេះមែនទេ?')) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  // Handle Edit
  const handleEditRecord = (rec) => {
    setEditingRecord(rec);
    setActiveTab('new-entry');
  };

  // Select patient for follow-up visit
  const handleSelectPatientForNewVisit = (patient) => {
    setEditingRecord({
      id: null,
      date: new Date().toISOString().split('T')[0],
      code: patient.code || '',
      name: patient.name,
      guardianName: '',
      age: patient.age,
      ageUnit: patient.ageUnit || 'years',
      gender: patient.gender,
      zone: patient.zone || 'ក',
      pregnantWeeks: '',
      address: patient.address || '',
      phone: patient.phone || '',
      referredFrom: '',
      visitType: 'old', // Repeat visit
      symptoms: '',
      dangerSigns: '',
      diagnosisCode: '',
      diagnosisName: '',
      treatment: '',
      nutritionSevere: '',
      weight: '',
      height: '',
      referredTo: '',
      paymentType: patient.paymentType || 'P',
      remarks: ''
    });
    setActiveTab('new-entry');
  };

  // Reset to initial sample data
  const handleResetData = () => {
    if (window.confirm('តើលោកអ្នកចង់ផ្ទុកទិន្នន័យគំរូដើមឡើងវិញមែនទេ?')) {
      setRecords(samplePatients);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(samplePatients));
      alert('បានផ្ទុកទិន្នន័យគំរូរួចរាល់!');
    }
  };

  // Export Excel
  const handleExportExcel = () => {
    exportRegisterToExcel(records, hcInfo);
  };

  // Handle successful prescription scan
  const handleScanComplete = (scannedRecord) => {
    setEditingRecord(scannedRecord);
    setActiveTab('new-entry');
    setImportNotification('🎉 បានស្កេន និងបំពេញព័ត៌មានអ្នកជំងឺ និងវេជ្ជបញ្ជាថ្នាំដោយជោគជ័យ!');
    setTimeout(() => {
      setImportNotification(null);
    }, 6000);
  };

  // Handle successful import of records
  const handleImportSuccess = (importedRecords, mode) => {
    if (mode === 'replace') {
      const reindexed = importedRecords.map((r, i) => ({ ...r, id: i + 1 }));
      setRecords(reindexed);
      setImportNotification(`បានជំនួសទិន្នន័យដោយជោគជ័យ! សរុប ${reindexed.length} កំណត់ត្រា។`);
    } else {
      // Append mode: make sure IDs don't collide
      const maxId = records.length > 0 ? Math.max(...records.map(r => r.id || 0)) : 0;
      const reindexed = importedRecords.map((r, i) => ({ ...r, id: maxId + i + 1 }));
      setRecords(prev => [...reindexed, ...prev]);
      setImportNotification(`បានបន្ថែមទិន្នន័យថ្មីចំនួន ${reindexed.length} កំណត់ត្រាដោយជោគជ័យ!`);
    }

    setActiveTab('register');

    // Auto-dismiss notification after 6s
    setTimeout(() => {
      setImportNotification(null);
    }, 6000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab !== 'new-entry') setEditingRecord(null);
          setActiveTab(tab);
        }}
        onOpenScanner={() => setIsScannerOpen(true)}
        onExportExcel={handleExportExcel}
        onOpenImport={() => setIsImportOpen(true)}
        onResetData={handleResetData}
        recordsCount={records.length}
        hcInfo={hcInfo}
      />

      {/* Floating Import Notification Banner */}
      {importNotification && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-md transition-all">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>🎉</span>
              <span>{importNotification}</span>
            </span>
            <button
              onClick={() => setImportNotification(null)}
              className="text-emerald-100 hover:text-white font-bold ml-4"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            records={records}
            setActiveTab={setActiveTab}
            onOpenScanner={() => setIsScannerOpen(true)}
            onExportExcel={handleExportExcel}
            onOpenImport={() => setIsImportOpen(true)}
            hcInfo={hcInfo}
          />
        )}

        {activeTab === 'register' && (
          <DailyRegister
            records={records}
            onEdit={handleEditRecord}
            onDelete={handleDeleteRecord}
            onAddNew={() => {
              setEditingRecord(null);
              setActiveTab('new-entry');
            }}
            onExportExcel={handleExportExcel}
            onOpenImport={() => setIsImportOpen(true)}
            hcInfo={hcInfo}
          />
        )}

        {activeTab === 'new-entry' && (
          <PatientForm
            onSave={handleSaveRecord}
            onCancel={() => {
              setEditingRecord(null);
              setActiveTab('register');
            }}
            onOpenScanner={() => setIsScannerOpen(true)}
            existingPatients={records}
            initialRecord={editingRecord}
            nextId={records.length + 1}
          />
        )}

        {activeTab === 'monthly-report' && (
          <MonthlyReport
            records={records}
            hcInfo={hcInfo}
            onExportExcel={handleExportExcel}
          />
        )}

        {activeTab === 'patients' && (
          <PatientList
            records={records}
            onSelectPatientForNewVisit={handleSelectPatientForNewVisit}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500 no-print mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            ប្រព័ន្ធគ្រប់គ្រង និងកត់ត្រាអ្នកជំងឺពិគ្រោះក្រៅ មណ្ឌលសុខភាព (Health Center OPD System) • គំរូក្រសួងសុខាភិបាល
          </span>
          <span className="text-slate-400">
            ទម្រង់ ៣២ ជួរ & របាយការណ៍សង្ខេបស្ថិតិប្រចាំខែ (HC1)
          </span>
        </div>
      </footer>

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={handleImportSuccess}
        existingCount={records.length}
      />

      {/* Floating Action Button for Quick Prescription Scan */}
      <button
        onClick={() => setIsScannerOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-full font-bold shadow-xl shadow-emerald-950/25 text-sm transition transform hover:-translate-y-1 hover:scale-105 border border-emerald-300/40 no-print"
        title="ថតរូប ឬស្កេនវេជ្ជបញ្ជា AI"
      >
        <span className="text-xl">📷</span>
        <span>ស្កេនវេជ្ជបញ្ជា AI</span>
      </button>

      {/* Prescription Scanner Modal */}
      <PrescriptionScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanComplete={handleScanComplete}
      />
    </div>
  );
}
