export const APPLICATION_SOURCES = Object.freeze({
  WEBSITE: 'website',
  LINE_ASSISTED: 'line_oa_assisted',
});

export const PACKAGE_INTERESTS = Object.freeze([
  { value: 'trial_request', label: 'สนใจทดลองใช้งาน' },
  { value: 'package_information', label: 'ขอข้อมูลแพ็กเกจ' },
  { value: 'undecided', label: 'ยังไม่ตัดสินใจ' },
]);

export function emptySchoolApplication(source = APPLICATION_SOURCES.WEBSITE) {
  return {
    source,
    schoolNameThai: '',
    schoolNameEnglish: '',
    province: '',
    district: '',
    address: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    packageInterest: 'undecided',
    expectedStudents: '',
    expectedTeachers: '',
    lineReference: '',
    privacyAccepted: false,
  };
}

function cleanText(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

function validCapacity(value, maximum) {
  return /^(0|[1-9]\d*)$/.test(value) && Number(value) <= maximum;
}

export function validateSchoolApplicationDraft(input, source = APPLICATION_SOURCES.WEBSITE) {
  const data = {
    source,
    schoolNameThai: cleanText(input.schoolNameThai),
    schoolNameEnglish: cleanText(input.schoolNameEnglish),
    province: cleanText(input.province),
    district: cleanText(input.district),
    address: cleanText(input.address),
    contactName: cleanText(input.contactName),
    contactEmail: cleanText(input.contactEmail).toLowerCase(),
    contactPhone: cleanText(input.contactPhone),
    packageInterest: cleanText(input.packageInterest),
    expectedStudents: String(input.expectedStudents ?? '').trim(),
    expectedTeachers: String(input.expectedTeachers ?? '').trim(),
    lineReference: source === APPLICATION_SOURCES.LINE_ASSISTED ? cleanText(input.lineReference) : '',
    privacyAccepted: input.privacyAccepted === true,
  };
  const errors = {};
  if (!Object.values(APPLICATION_SOURCES).includes(source)) errors.source = 'ช่องทางไม่ถูกต้อง';
  if (data.schoolNameThai.length < 3 || data.schoolNameThai.length > 150) errors.schoolNameThai = 'ระบุชื่อโรงเรียน 3–150 ตัวอักษร';
  if (data.schoolNameEnglish.length > 150) errors.schoolNameEnglish = 'ชื่อภาษาอังกฤษยาวเกินไป';
  if (!data.province || data.province.length > 100) errors.province = 'ระบุจังหวัด';
  if (!data.district || data.district.length > 100) errors.district = 'ระบุอำเภอ/เขต';
  if (data.address.length > 300) errors.address = 'ที่อยู่ยาวเกินไป';
  if (data.contactName.length < 2 || data.contactName.length > 120) errors.contactName = 'ระบุชื่อผู้ติดต่อ 2–120 ตัวอักษร';
  if (data.contactEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)) errors.contactEmail = 'ระบุอีเมลที่ถูกต้อง';
  if (data.contactPhone.length > 24 || !/^\+?[0-9][0-9\s()-]{6,22}$/.test(data.contactPhone)) errors.contactPhone = 'ระบุหมายเลขโทรศัพท์ที่ติดต่อได้';
  if (!PACKAGE_INTERESTS.some(option => option.value === data.packageInterest)) errors.packageInterest = 'เลือกความสนใจแพ็กเกจ';
  if (!validCapacity(data.expectedStudents, 100000)) errors.expectedStudents = 'ระบุจำนวนนักเรียน 0–100,000 คน';
  if (!validCapacity(data.expectedTeachers, 10000)) errors.expectedTeachers = 'ระบุจำนวนครู 0–10,000 คน';
  if (data.lineReference.length > 120) errors.lineReference = 'ข้อมูลอ้างอิงยาวเกินไป';
  if (!data.privacyAccepted) errors.privacyAccepted = 'โปรดยืนยันการแจ้งใช้ข้อมูลติดต่อ';
  return { data, errors, valid: Object.keys(errors).length === 0 };
}
