// Helper utility to categorize age into MoH Standard 8 groups
export function getAgeCategory(ageValue, ageUnit = 'years') {
  const val = parseFloat(ageValue);
  if (isNaN(val)) return '25_49y';

  if (ageUnit === 'days') {
    if (val <= 28) return '0_28d';
    // over 28 days
    const months = val / 30;
    if (months <= 11) return '29d_11m';
    const years = months / 12;
    if (years < 5) return '1_4y';
    if (years < 15) return '5_14y';
    if (years < 25) return '15_24y';
    if (years < 50) return '25_49y';
    if (years < 65) return '50_64y';
    return 'ge65y';
  }

  if (ageUnit === 'months') {
    if (val < 1) return '0_28d';
    if (val <= 11) return '29d_11m';
    const years = val / 12;
    if (years < 5) return '1_4y';
    if (years < 15) return '5_14y';
    if (years < 25) return '15_24y';
    if (years < 50) return '25_49y';
    if (years < 65) return '50_64y';
    return 'ge65y';
  }

  // ageUnit === 'years'
  if (val === 0) return '0_28d';
  if (val < 1) return '29d_11m';
  if (val >= 1 && val <= 4) return '1_4y';
  if (val >= 5 && val <= 14) return '5_14y';
  if (val >= 15 && val <= 24) return '15_24y';
  if (val >= 25 && val <= 49) return '25_49y';
  if (val >= 50 && val <= 64) return '50_64y';
  return 'ge65y';
}

export const AGE_GROUP_LABELS = {
  '0_28d': '0-28 ថ្ងៃ',
  '29d_11m': '29 ថ្ងៃ-11 ខែ',
  '1_4y': '1-4 ឆ្នាំ',
  '5_14y': '5-14 ឆ្នាំ',
  '15_24y': '15-24 ឆ្នាំ',
  '25_49y': '25-49 ឆ្នាំ',
  '50_64y': '50-64 ឆ្នាំ',
  'ge65y': '>=64 ឆ្នាំ'
};

export const AGE_GROUP_KEYS = [
  '0_28d',
  '29d_11m',
  '1_4y',
  '5_14y',
  '15_24y',
  '25_49y',
  '50_64y',
  'ge65y'
];

// Calculate full statistics matching Page 235 format
export function calculateReportSummary(records) {
  const summary = {
    // 1. បរិមាណសកម្មភាពតាមតំបន់
    zoneSummary: {
      newOPD: { zoneA: 0, zoneB: 0, zoneC: 0, total: 0, male: 0, female: 0 },
      totalOPD: { zoneA: 0, zoneB: 0, zoneC: 0, total: 0, male: 0, female: 0 }
    },
    // 2. សរុបករណីថ្មីតាម អាយុ និងភេទ
    newCasesByAgeAndGender: {
      '0_28d': { male: 0, female: 0 },
      '29d_11m': { male: 0, female: 0 },
      '1_4y': { male: 0, female: 0 },
      '5_14y': { male: 0, female: 0 },
      '15_24y': { male: 0, female: 0 },
      '25_49y': { male: 0, female: 0 },
      '50_64y': { male: 0, female: 0 },
      'ge65y': { male: 0, female: 0 },
    },
    newCasesTotal: { male: 0, female: 0, total: 0 },
    referrals: { male: 0, female: 0, total: 0 },
    hefUsers: { male: 0, female: 0, total: 0 },
    nssfUsers: { male: 0, female: 0, total: 0 },
    payingUsers: { male: 0, female: 0, total: 0 },
    exemptUsers: { male: 0, female: 0, total: 0 },
    pregnantCount: 0,
    topDiagnoses: {}
  };

  records.forEach((rec) => {
    const isNew = rec.isNew !== false && rec.visitType !== 'old';
    const isMale = rec.gender === 'male' || rec.gender === 'ប្រុស';
    const zone = (rec.zone || 'A').toUpperCase(); // A, B, C or ក, ខ, គ
    const zoneKey = (zone === 'A' || zone === 'ក') ? 'zoneA' : (zone === 'B' || zone === 'ខ') ? 'zoneB' : 'zoneC';

    // Total OPD
    summary.zoneSummary.totalOPD[zoneKey]++;
    summary.zoneSummary.totalOPD.total++;
    if (isMale) {
      summary.zoneSummary.totalOPD.male++;
    } else {
      summary.zoneSummary.totalOPD.female++;
    }

    // Pregnancy check
    if (rec.pregnantWeeks && parseFloat(rec.pregnantWeeks) > 0) {
      summary.pregnantCount++;
    }

    // Payment scheme checks
    const pType = (rec.paymentType || '').toUpperCase();
    if (pType.includes('HEF') || pType.includes('សមធម៌')) {
      if (isMale) summary.hefUsers.male++; else summary.hefUsers.female++;
      summary.hefUsers.total++;
    } else if (pType.includes('ប.ស.ស') || pType.includes('NSSF')) {
      if (isMale) summary.nssfUsers.male++; else summary.nssfUsers.female++;
      summary.nssfUsers.total++;
    } else if (pType === 'E' || pType.includes('លើកលែង')) {
      if (isMale) summary.exemptUsers.male++; else summary.exemptUsers.female++;
      summary.exemptUsers.total++;
    } else {
      if (isMale) summary.payingUsers.male++; else summary.payingUsers.female++;
      summary.payingUsers.total++;
    }

    // Referrals out
    if (rec.referredTo && rec.referredTo.trim()) {
      if (isMale) summary.referrals.male++; else summary.referrals.female++;
      summary.referrals.total++;
    }

    // Diagnosis count
    if (rec.diagnosisCode || rec.diagnosisName) {
      const diagKey = (rec.diagnosisCode || 'OTHER') + ' - ' + (rec.diagnosisName || 'ផ្សេងៗ');
      summary.topDiagnoses[diagKey] = (summary.topDiagnoses[diagKey] || 0) + 1;
    }

    // If case is NEW:
    if (isNew) {
      summary.zoneSummary.newOPD[zoneKey]++;
      summary.zoneSummary.newOPD.total++;
      if (isMale) {
        summary.zoneSummary.newOPD.male++;
        summary.newCasesTotal.male++;
      } else {
        summary.zoneSummary.newOPD.female++;
        summary.newCasesTotal.female++;
      }
      summary.newCasesTotal.total++;

      // Age category
      const ageCat = rec.ageCategory || getAgeCategory(rec.age, rec.ageUnit);
      if (summary.newCasesByAgeAndGender[ageCat]) {
        if (isMale) {
          summary.newCasesByAgeAndGender[ageCat].male++;
        } else {
          summary.newCasesByAgeAndGender[ageCat].female++;
        }
      }
    }
  });

  return summary;
}

/**
 * Compute running cumulative tallies (1, 2, 3...) for MoH Logbook:
 * - ភេទ: ស្រី (1, 2, 3...) & ប្រុស (1, 2, 3...)
 * - តំបន់: ក (1, 2, 3...), ខ (1, 2, 3...), គ (1, 2, 3...)
 * - អ្នកជំងឺ: ករណីថ្មី (1, 2, 3...) & ករណីចាស់ (1, 2, 3...)
 */
export function computeSequentialTallies(records) {
  let femaleCount = 0;
  let maleCount = 0;
  let zoneACount = 0;
  let zoneBCount = 0;
  let zoneCCount = 0;
  let newCaseCount = 0;
  let oldCaseCount = 0;

  return records.map((rec, index) => {
    const isNew = rec.isNew !== false && rec.visitType !== 'old';
    const isMale = rec.gender === 'male' || rec.gender === 'ប្រុស';
    const isFemale = !isMale;
    const zone = (rec.zone || 'ក').toUpperCase();
    const isZoneA = zone === 'ក' || zone === 'A';
    const isZoneB = zone === 'ខ' || zone === 'B';
    const isZoneC = zone === 'គ' || zone === 'C';

    if (isFemale) femaleCount++;
    if (isMale) maleCount++;
    if (isZoneA) zoneACount++;
    if (isZoneB) zoneBCount++;
    if (isZoneC) zoneCCount++;
    if (isNew) newCaseCount++;
    if (!isNew) oldCaseCount++;

    return {
      ...rec,
      rowNo: index + 1,
      seqFemale: isFemale ? femaleCount : null,
      seqMale: isMale ? maleCount : null,
      seqZoneA: isZoneA ? zoneACount : null,
      seqZoneB: isZoneB ? zoneBCount : null,
      seqZoneC: isZoneC ? zoneCCount : null,
      seqNew: isNew ? newCaseCount : null,
      seqOld: !isNew ? oldCaseCount : null,
    };
  });
}

