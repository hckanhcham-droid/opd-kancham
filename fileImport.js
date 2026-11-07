import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { getAgeCategory } from './statistics';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * Clean and normalize a record object to ensure all 32 fields conform to system schema
 */
export function normalizeRecord(raw, index = 1) {
  const age = raw.age !== undefined && raw.age !== null && raw.age !== '' ? raw.age : (raw['អាយុ'] || 25);
  const ageUnit = raw.ageUnit || (raw['ខ្នាតអាយុ'] || 'years');
  const ageCat = raw.ageCategory || getAgeCategory(age, ageUnit);

  let gender = raw.gender || raw['ភេទ'] || 'ស្រី';
  if (gender === 'female' || gender === 'F' || gender === 'ស្រ' || gender === 'ស') gender = 'ស្រី';
  if (gender === 'male' || gender === 'M' || gender === 'ប' || gender === 'ប្រ') gender = 'ប្រុស';

  let zone = raw.zone || raw['តំបន់'] || 'ក';
  if (zone === 'A' || zone === 'Zone A' || zone === 'zoneA') zone = 'ក';
  if (zone === 'B' || zone === 'Zone B' || zone === 'zoneB') zone = 'ខ';
  if (zone === 'C' || zone === 'Zone C' || zone === 'zoneC') zone = 'គ';

  const isNew = raw.isNew !== undefined 
    ? Boolean(raw.isNew) 
    : (raw.visitType ? raw.visitType === 'new' : true);

  return {
    id: raw.id || index,
    date: raw.date || raw['កាលបរិច្ឆេទ'] || new Date().toISOString().split('T')[0],
    code: String(raw.code || raw['លេខកូដ'] || raw['លេខប័ណ្ណ'] || '').trim(),
    name: String(raw.name || raw['ឈ្មោះ'] || raw['ឈ្មោះអ្នកជំងឺ'] || `អ្នកជំងឺ #${index}`).trim(),
    guardianName: String(raw.guardianName || raw['ឈ្មោះអាណាព្យាបាល'] || '').trim(),
    age: Number(age) || 0,
    ageUnit: ageUnit,
    ageCategory: ageCat,
    gender: gender,
    zone: zone,
    pregnantWeeks: raw.pregnantWeeks || raw['មានផ្ទៃពោះ'] || '',
    address: String(raw.address || raw['អាសយដ្ឋាន'] || 'ភូមិកញ្ចំ ស្រុកពារាំង').trim(),
    phone: String(raw.phone || raw['ទូរស័ព្ទ'] || raw['លេខទូរស័ព្ទ'] || '').trim(),
    referredFrom: String(raw.referredFrom || raw['បញ្ជូនមកពី'] || '').trim(),
    visitType: isNew ? 'new' : 'old',
    isNew: isNew,
    symptoms: String(raw.symptoms || raw['រោគសញ្ញា'] || '').trim(),
    dangerSigns: String(raw.dangerSigns || raw['សញ្ញាគ្រោះថ្នាក់'] || '').trim(),
    diagnosisCode: String(raw.diagnosisCode || raw['កូដរោគវិនិច្ឆ័យ'] || '').trim(),
    diagnosisName: String(raw.diagnosisName || raw['រោគវិនិច្ឆ័យ'] || '').trim(),
    treatment: String(raw.treatment || raw['ការព្យាបាល'] || raw['វេជ្ជបញ្ជា'] || '').trim(),
    nutritionSevere: raw.nutritionSevere || raw['អាហារូបត្ថម្ភធ្ងន់ធ្ងរ'] || '',
    weight: raw.weight || raw['ទម្ងន់'] || '',
    height: raw.height || raw['កម្ពស់'] || '',
    referredTo: String(raw.referredTo || raw['បញ្ជូនទៅ'] || '').trim(),
    paymentType: String(raw.paymentType || raw['ប្រភេទបង់ថ្លៃ'] || raw['បង់ថ្លៃ'] || 'P').trim(),
    remarks: String(raw.remarks || raw['សម្គាល់'] || '').trim()
  };
}

/**
 * Parse an Excel file (.xlsx, .xls, .csv)
 */
export async function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target.result;
        const workbook = XLSX.read(buffer, { type: 'array' });
        
        // Find best sheet (either named OPD/Register or the first sheet)
        const sheetName = workbook.SheetNames.find(s => 
          s.includes('OPD') || s.includes('Register') || s.includes('បញ្ជី')
        ) || workbook.SheetNames[0];

        const sheet = workbook.Sheets[sheetName];
        if (!sheet) {
          throw new Error('រកមិនឃើញសន្លឹកទិន្នន័យក្នុង File Excel ទេ');
        }

        // Convert to array of objects
        const rawRows = XLSX.utils.sheet_to_json(sheet);
        if (!rawRows || rawRows.length === 0) {
          throw new Error('File Excel មិនមានទិន្នន័យទេ');
        }

        // Map columns
        const records = rawRows.map((row, idx) => {
          // Check for keys that might match our exported format or arbitrary headers
          const name = row['ឈ្មោះអ្នកជំងឺ (3)'] || row['ឈ្មោះអ្នកជំងឺ'] || row['ឈ្មោះ'] || row['Name'] || row['Patient Name'] || '';
          if (!name && !row['ល.រ (1)'] && !row['ល.រ']) return null; // skip empty lines

          const code = row['លេខកូដ / ប័ណ្ណ (2)'] || row['លេខកូដ'] || row['លេខប័ណ្ណ'] || row['Code'] || '';
          const guardian = row['ឈ្មោះអាណាព្យាបាល (4)'] || row['អាណាព្យាបាល'] || row['Guardian'] || '';
          
          // Determine age from 8 columns if exported, or single age column
          let age = row['អាយុ'] || row['Age'] || '';
          let ageCategory = '';
          if (row['០-២៨ ថ្ងៃ (5)'] || row['0-28 ថ្ងៃ']) { age = row['០-២៨ ថ្ងៃ (5)'] || row['0-28 ថ្ងៃ']; ageCategory = '0_28d'; }
          else if (row['២៩ ថ្ងៃ - ១១ ខែ (6)'] || row['29 ថ្ងៃ-11 ខែ']) { age = row['២៩ ថ្ងៃ - ១១ ខែ (6)'] || row['29 ថ្ងៃ-11 ខែ']; ageCategory = '29d_11m'; }
          else if (row['១-៤ ឆ្នាំ (7)'] || row['1-4 ឆ្នាំ']) { age = row['១-៤ ឆ្នាំ (7)'] || row['1-4 ឆ្នាំ']; ageCategory = '1_4y'; }
          else if (row['៥-១៤ ឆ្នាំ (8)'] || row['5-14 ឆ្នាំ']) { age = row['៥-១៤ ឆ្នាំ (8)'] || row['5-14 ឆ្នាំ']; ageCategory = '5_14y'; }
          else if (row['១៥-២៤ ឆ្នាំ (9)'] || row['15-24 ឆ្នាំ']) { age = row['១៥-២៤ ឆ្នាំ (9)'] || row['15-24 ឆ្នាំ']; ageCategory = '15_24y'; }
          else if (row['២៥-៤៩ ឆ្នាំ (10)'] || row['25-49 ឆ្នាំ']) { age = row['២៥-៤៩ ឆ្នាំ (10)'] || row['25-49 ឆ្នាំ']; ageCategory = '25_49y'; }
          else if (row['៥០-៦៤ ឆ្នាំ (11)'] || row['50-64 ឆ្នាំ']) { age = row['៥០-៦៤ ឆ្នាំ (11)'] || row['50-64 ឆ្នាំ']; ageCategory = '50_64y'; }
          else if (row['>=៦៤ ឆ្នាំ (12)'] || row['>=64 ឆ្នាំ']) { age = row['>=៦៤ ឆ្នាំ (12)'] || row['>=64 ឆ្នាំ']; ageCategory = 'ge65y'; }

          // Gender
          let gender = 'ស្រី';
          if (row['ភេទ ប្រុស (14)'] || row['ប្រុស'] === '1' || row['ប្រុស'] === 1 || row['Gender'] === 'Male' || row['ភេទ'] === 'ប្រុស') {
            gender = 'ប្រុស';
          }

          // Zone
          let zone = 'ក';
          if (row['តំបន់ ខ (16)'] || row['តំបន់'] === 'ខ' || row['Zone'] === 'B') zone = 'ខ';
          if (row['តំបន់ គ (17)'] || row['តំបន់'] === 'គ' || row['Zone'] === 'C') zone = 'គ';

          // Case type (New vs Old)
          let isNew = true;
          if (row['ករណីចាស់ (22)'] || row['ចាស់'] === '1' || row['ចាស់'] === 1 || row['Case'] === 'Old') {
            isNew = false;
          }

          // Diagnosis
          const diagFull = row['រោគវិនិច្ឆ័យ (25)'] || row['រោគវិនិច្ឆ័យ'] || row['Diagnosis'] || '';
          let diagCode = row['កូដ'] || '';
          let diagName = diagFull;
          if (diagFull.includes('-')) {
            const parts = diagFull.split('-');
            diagCode = parts[0].trim();
            diagName = parts.slice(1).join('-').trim();
          }

          const rawData = {
            id: idx + 1,
            code,
            name: name || `អ្នកជំងឺ #${idx + 1}`,
            guardianName: guardian,
            age: age || 30,
            ageCategory,
            gender,
            zone,
            pregnantWeeks: row['មានផ្ទៃពោះ សប្តាហ៍ (18)'] || row['មានផ្ទៃពោះ'] || '',
            address: row['អាសយដ្ឋាន និងលេខទូរស័ព្ទ (19)'] || row['អាសយដ្ឋាន'] || '',
            referredFrom: row['បញ្ជូនមកពី (20)'] || row['បញ្ជូនមកពី'] || '',
            isNew,
            symptoms: row['រោគសញ្ញា (23)'] || row['រោគសញ្ញា'] || '',
            dangerSigns: row['សញ្ញាគ្រោះថ្នាក់ (24)'] || row['សញ្ញាគ្រោះថ្នាក់'] || '',
            diagnosisCode: diagCode,
            diagnosisName: diagName,
            treatment: row['ការព្យាបាល / ថ្នាំ (26)'] || row['ការព្យាបាល'] || row['Treatment'] || '',
            nutritionSevere: row['អាហារូបត្ថម្ភធ្ងន់ធ្ងរ (27)'] || '',
            weight: row['ទម្ងន់/អាយុ (28)'] || row['ទម្ងន់'] || '',
            height: row['ទម្ងន់/កម្ពស់ (29)'] || row['កម្ពស់'] || '',
            referredTo: row['បញ្ជូនទៅ (30)'] || row['បញ្ជូនទៅ'] || '',
            paymentType: row['ប្រភេទបង់ថ្លៃ (31)'] || row['ប្រភេទបង់ថ្លៃ'] || row['បង់ថ្លៃ'] || 'P',
            remarks: row['សម្គាល់ (32)'] || row['សម្គាល់'] || ''
          };

          return normalizeRecord(rawData, idx + 1);
        }).filter(Boolean);

        resolve(records);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parse a PDF file (.pdf)
 * Extracts text items per page and matches 2-page spreads (Page 1 + Page 2, Page 3 + Page 4, etc.)
 */
export async function parsePDFFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;

  const extractedRecords = [];

  // Helper to extract lines from a page
  async function getPageTextItems(pageNum) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    
    // Group text items by roughly the same vertical Y coordinate (within 4px)
    const rowsMap = new Map();
    content.items.forEach(item => {
      const y = Math.round(item.transform[5] / 4) * 4;
      if (!rowsMap.has(y)) rowsMap.set(y, []);
      rowsMap.get(y).push({
        x: item.transform[4],
        text: item.str.trim()
      });
    });

    // Sort rows from top to bottom (descending Y)
    const sortedY = Array.from(rowsMap.keys()).sort((a, b) => b - a);
    return sortedY.map(y => {
      // sort items in this row left to right (ascending X)
      const items = rowsMap.get(y).sort((a, b) => a.x - b.x);
      return items.map(it => it.text).filter(Boolean);
    }).filter(row => row.length > 0);
  }

  // Iterate pages in pairs (Odd = Columns 1-20, Even = Columns 21-32)
  for (let p = 1; p <= numPages; p += 2) {
    const page1Rows = await getPageTextItems(p);
    const page2Rows = (p + 1 <= numPages) ? await getPageTextItems(p + 1) : [];

    // Filter patient rows on page 1 (skip headers: rows that start with 1, 2, 3... or have numbers)
    const dataRowsP1 = page1Rows.filter(r => {
      const first = r[0];
      return first && /^\d+$/.test(first) && parseInt(first, 10) > 0 && r.length >= 3;
    });

    const dataRowsP2 = page2Rows.filter(r => {
      const first = r[0];
      return first && /^\d+$/.test(first) && parseInt(first, 10) > 0;
    });

    dataRowsP1.forEach((r1, i) => {
      const r2 = dataRowsP2[i] || [];
      
      const rowId = parseInt(r1[0], 10) || (extractedRecords.length + 1);
      
      // Look for code (format like 031-647-243-1 or 01-08-2026)
      let code = '';
      let name = '';
      let age = 30;
      let address = 'ភូមិកញ្ចំ ស្រុកពារាំង';

      // Scan r1 tokens
      r1.slice(1).forEach(token => {
        if (/\d{2,3}-\d{2,3}-\d{2,3}/.test(token) || /\d{2}-\d{2}-\d{4}/.test(token)) {
          code = token;
        } else if (/^\d{1,2}$/.test(token) && parseInt(token, 10) > 0 && parseInt(token, 10) <= 100) {
          age = parseInt(token, 10);
        } else if (token.includes('ភូមិ') || token.includes('ឃុំ') || token.includes('ស្រុក')) {
          address = token;
        } else if (!name && token.length > 2 && !/^\d+$/.test(token)) {
          name = token;
        }
      });

      // Analyze page 2 for Diagnosis, Symptoms, Treatment, Payment
      let symptoms = '';
      let diagCode = '';
      let diagName = '';
      let treatment = '';
      let paymentType = 'P';
      let remarks = '';
      let isNew = true;

      r2.forEach(tok => {
        if (/^[A-Z]\d{2}/.test(tok)) {
          diagCode = tok.split(/[- ]/)[0];
          diagName = tok;
        } else if (tok.includes('mg') || tok.includes('គ្រាប់') || tok.includes('ដង') || tok.includes('Amox') || tok.includes('Para')) {
          treatment += (treatment ? '\n' : '') + tok;
        } else if (tok === 'P' || tok === 'E' || tok.includes('HEF') || tok.includes('ប.ស.ស')) {
          paymentType = tok;
        } else if (/\d{7,10}-\d{7,10}/.test(tok)) {
          remarks = tok;
        } else if (tok.includes('គ្រុន') || tok.includes('ឈឺ') || tok.includes('ក្អក') || tok.includes('ចុក') || tok.includes('សុខភាព')) {
          symptoms = tok;
        }
      });

      const record = normalizeRecord({
        id: rowId,
        code: code,
        name: name || `អ្នកជំងឺ #${rowId}`,
        age: age,
        gender: 'ស្រី',
        zone: 'ក',
        address: address,
        isNew: isNew,
        symptoms: symptoms || 'គ្រុនក្តៅ ក្អក',
        diagnosisCode: diagCode || 'J02',
        diagnosisName: diagName || 'រលាកបំពង់កស្រួចស្រាវ',
        treatment: treatment || 'Paracetamol 500mg, 1គ្រាប់ x 3ដង=9គ្រាប់',
        paymentType: paymentType,
        remarks: remarks
      }, rowId);

      extractedRecords.push(record);
    });
  }

  if (extractedRecords.length === 0) {
    throw new Error('មិនអាចស្រង់ទិន្នន័យពី File PDF នេះបានទេ។ សូមប្រាកដថាជា File PDF របាយការណ៍មណ្ឌលសុខភាព។');
  }

  return extractedRecords;
}

/**
 * Parse JSON Backup File
 */
export async function parseJSONFile(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (Array.isArray(parsed)) {
    return parsed.map((r, i) => normalizeRecord(r, i + 1));
  } else if (parsed.records && Array.isArray(parsed.records)) {
    return parsed.records.map((r, i) => normalizeRecord(r, i + 1));
  }
  throw new Error('ទម្រង់ File JSON មិនត្រឹមត្រូវ');
}
