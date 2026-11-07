import * as XLSX from 'xlsx';
import { calculateReportSummary, AGE_GROUP_LABELS, computeSequentialTallies } from './statistics';

export function exportRegisterToExcel(records, hcInfo) {
  // Sort in ascending register order (chronological by date, then id)
  const sorted = [...records].sort((a, b) => {
    if (a.date && b.date && a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return (a.id || 0) - (b.id || 0);
  });

  const recordsWithTallies = computeSequentialTallies(sorted);

  // Sheet 1: Daily Register 32 Columns
  const registerRows = recordsWithTallies.map((r, index) => {
    const isNew = r.isNew !== false && r.visitType !== 'old';
    const isMale = r.gender === 'male' || r.gender === 'ប្រុស';
    const isFemale = !isMale;
    const cat = r.ageCategory;

    return {
      'ល.រ (1)': index + 1,
      'លេខកូដ / ប័ណ្ណ (2)': r.code || '',
      'ឈ្មោះអ្នកជំងឺ (3)': r.name || '',
      'ឈ្មោះអាណាព្យាបាល (4)': r.guardianName || '',
      '០-២៨ ថ្ងៃ (5)': cat === '0_28d' ? r.age : '',
      '២៩ ថ្ងៃ - ១១ ខែ (6)': cat === '29d_11m' ? r.age : '',
      '១-៤ ឆ្នាំ (7)': cat === '1_4y' ? r.age : '',
      '៥-១៤ ឆ្នាំ (8)': cat === '5_14y' ? r.age : '',
      '១៥-២៤ ឆ្នាំ (9)': cat === '15_24y' ? r.age : '',
      '២៥-៤៩ ឆ្នាំ (10)': cat === '25_49y' ? r.age : '',
      '៥០-៦៤ ឆ្នាំ (11)': cat === '50_64y' ? r.age : '',
      '>=៦៤ ឆ្នាំ (12)': cat === 'ge65y' ? r.age : '',
      'ភេទ ស្រី (13)': r.seqFemale || '',
      'ភេទ ប្រុស (14)': r.seqMale || '',
      'តំបន់ ក (15)': r.seqZoneA || '',
      'តំបន់ ខ (16)': r.seqZoneB || '',
      'តំបន់ គ (17)': r.seqZoneC || '',
      'មានផ្ទៃពោះ សប្តាហ៍ (18)': r.pregnantWeeks || '',
      'អាសយដ្ឋាន និងលេខទូរស័ព្ទ (19)': `${r.address || ''} ${r.phone ? `(${r.phone})` : ''}`,
      'បញ្ជូនមកពី (20)': r.referredFrom || '',
      'ករណីថ្មី (21)': r.seqNew || '',
      'ករណីចាស់ (22)': r.seqOld || '',
      'រោគសញ្ញា (23)': r.symptoms || '',
      'សញ្ញាគ្រោះថ្នាក់ (24)': r.dangerSigns || '',
      'រោគវិនិច្ឆ័យ (25)': `${r.diagnosisCode || ''} ${r.diagnosisName ? `- ${r.diagnosisName}` : ''}`,
      'ការព្យាបាល / ថ្នាំ (26)': r.treatment || '',
      'អាហារូបត្ថម្ភធ្ងន់ធ្ងរ (27)': r.nutritionSevere || '',
      'ទម្ងន់/អាយុ (28)': r.weight || '',
      'ទម្ងន់/កម្ពស់ (29)': r.height || '',
      'បញ្ជូនទៅ (30)': r.referredTo || '',
      'ប្រភេទបង់ថ្លៃ (31)': r.paymentType || 'P',
      'សម្គាល់ (32)': r.remarks || ''
    };
  });

  const wb = XLSX.utils.book_new();

  // 1. Add Daily Register Sheet
  const wsRegister = XLSX.utils.json_to_sheet(registerRows);
  XLSX.utils.book_append_sheet(wb, wsRegister, 'បញ្ជីកត់ត្រា OPD Register');

  // 2. Add Monthly Summary Sheet (Matching Page 235)
  const stats = calculateReportSummary(records);
  const summaryRows = [
    { 'របាយការណ៍': `តារាងសង្ខេបស្ថិតិយោធិបាយប្រចាំខែ ${hcInfo?.reportMonth || 'សីហា'} ឆ្នាំ ${hcInfo?.reportYear || '២០២៦'}` },
    { 'របាយការណ៍': `មណ្ឌលសុខភាព៖ ${hcInfo?.nameKhmer || 'កញ្ចំ'} | ${hcInfo?.province || ''}` },
    {},
    { 'របាយការណ៍': '១. ការពិនិត្យជំងឺក្រៅ តាមតំបន់ និងភេទ' },
    {
      'បរិមាណសកម្មភាពតាមតំបន់': 'ករណីថ្មី (New OPD)',
      'តំបន់ក (Zone A)': stats.zoneSummary.newOPD.zoneA,
      'តំបន់ខ (Zone B)': stats.zoneSummary.newOPD.zoneB,
      'តំបន់គ (Zone C)': stats.zoneSummary.newOPD.zoneC,
      'សរុប (Total)': stats.zoneSummary.newOPD.total,
      'ប្រុស (Male)': stats.zoneSummary.newOPD.male,
      'ស្រី (Female)': stats.zoneSummary.newOPD.female,
    },
    {
      'បរិមាណសកម្មភាពតាមតំបន់': 'ចំនួនពិនិត្យពិគ្រោះជំងឺសរុប (Total OPD)',
      'តំបន់ក (Zone A)': stats.zoneSummary.totalOPD.zoneA,
      'តំបន់ខ (Zone B)': stats.zoneSummary.totalOPD.zoneB,
      'តំបន់គ (Zone C)': stats.zoneSummary.totalOPD.zoneC,
      'សរុប (Total)': stats.zoneSummary.totalOPD.total,
      'ប្រុស (Male)': stats.zoneSummary.totalOPD.male,
      'ស្រី (Female)': stats.zoneSummary.totalOPD.female,
    },
    {},
    { 'របាយការណ៍': '២. សរុបករណីថ្មីតាម អាយុ និងភេទ (New Cases by Age & Gender)' },
    {
      'ក្រុមអាយុ': '០-២៨ ថ្ងៃ',
      'ប្រុស': stats.newCasesByAgeAndGender['0_28d'].male,
      'ស្រី': stats.newCasesByAgeAndGender['0_28d'].female,
      'សរុប': stats.newCasesByAgeAndGender['0_28d'].male + stats.newCasesByAgeAndGender['0_28d'].female
    },
    {
      'ក្រុមអាយុ': '២៩ ថ្ងៃ - ១១ ខែ',
      'ប្រុស': stats.newCasesByAgeAndGender['29d_11m'].male,
      'ស្រី': stats.newCasesByAgeAndGender['29d_11m'].female,
      'សរុប': stats.newCasesByAgeAndGender['29d_11m'].male + stats.newCasesByAgeAndGender['29d_11m'].female
    },
    {
      'ក្រុមអាយុ': '១-៤ ឆ្នាំ',
      'ប្រុស': stats.newCasesByAgeAndGender['1_4y'].male,
      'ស្រី': stats.newCasesByAgeAndGender['1_4y'].female,
      'សរុប': stats.newCasesByAgeAndGender['1_4y'].male + stats.newCasesByAgeAndGender['1_4y'].female
    },
    {
      'ក្រុមអាយុ': '៥-១៤ ឆ្នាំ',
      'ប្រុស': stats.newCasesByAgeAndGender['5_14y'].male,
      'ស្រី': stats.newCasesByAgeAndGender['5_14y'].female,
      'សរុប': stats.newCasesByAgeAndGender['5_14y'].male + stats.newCasesByAgeAndGender['5_14y'].female
    },
    {
      'ក្រុមអាយុ': '១៥-២៤ ឆ្នាំ',
      'ប្រុស': stats.newCasesByAgeAndGender['15_24y'].male,
      'ស្រី': stats.newCasesByAgeAndGender['15_24y'].female,
      'សរុប': stats.newCasesByAgeAndGender['15_24y'].male + stats.newCasesByAgeAndGender['15_24y'].female
    },
    {
      'ក្រុមអាយុ': '២៥-៤៩ ឆ្នាំ',
      'ប្រុស': stats.newCasesByAgeAndGender['25_49y'].male,
      'ស្រី': stats.newCasesByAgeAndGender['25_49y'].female,
      'សរុប': stats.newCasesByAgeAndGender['25_49y'].male + stats.newCasesByAgeAndGender['25_49y'].female
    },
    {
      'ក្រុមអាយុ': '៥០-៦៤ ឆ្នាំ',
      'ប្រុស': stats.newCasesByAgeAndGender['50_64y'].male,
      'ស្រី': stats.newCasesByAgeAndGender['50_64y'].female,
      'សរុប': stats.newCasesByAgeAndGender['50_64y'].male + stats.newCasesByAgeAndGender['50_64y'].female
    },
    {
      'ក្រុមអាយុ': '>=៦៤ ឆ្នាំ',
      'ប្រុស': stats.newCasesByAgeAndGender['ge65y'].male,
      'ស្រី': stats.newCasesByAgeAndGender['ge65y'].female,
      'សរុប': stats.newCasesByAgeAndGender['ge65y'].male + stats.newCasesByAgeAndGender['ge65y'].female
    },
    {
      'ក្រុមអាយុ': 'សរុបករណីថ្មីទាំងអស់',
      'ប្រុស': stats.newCasesTotal.male,
      'ស្រី': stats.newCasesTotal.female,
      'សរុប': stats.newCasesTotal.total
    },
    {
      'ក្រុមអាយុ': 'បញ្ជូនទៅមន្ទីរពេទ្យ (Referral Out)',
      'ប្រុស': stats.referrals.male,
      'ស្រី': stats.referrals.female,
      'សរុប': stats.referrals.total
    },
    {
      'ក្រុមអាយុ': 'ប្រើប្រាស់មូលនិធិសមធម៌ (HEF Card)',
      'ប្រុស': stats.hefUsers.male,
      'ស្រី': stats.hefUsers.female,
      'សរុប': stats.hefUsers.total
    }
  ];

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'របាយការណ៍សង្ខេប Monthly Summary');

  // Generate filename
  const fileName = `របាយការណ៍អ្នកជំងឺ_មណ្ឌលសុខភាព_${hcInfo?.reportMonth || 'សីហា'}_${Date.now()}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
