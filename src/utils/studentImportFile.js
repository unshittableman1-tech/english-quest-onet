export function parseDelimitedRows(source) {
  const text=source.replace(/^\uFEFF/,'').replaceAll('\r\n','\n');
  const header=text.split('\n')[0];
  const delimiter=header.includes('\t')?'\t':header.includes(';')?';':',';
  const rows=[];let row=[];let field='';let quoted=false;
  const push=()=>{row.push(field.trim());field='';};
  for(let i=0;i<text.length;i++) {
    const c=text[i];
    if(c==='"') {
      if(quoted&&text[i+1]==='"') {field+='"';i++;} else quoted=!quoted;
    } else if(c===delimiter&&!quoted) push();
    else if((c==='\n'||c==='\r')&&!quoted) {push();if(row.some(Boolean))rows.push(row);row=[];}
    else field+=c;
  }
  push();if(row.some(Boolean))rows.push(row);return rows;
}

export function importMatrixToText(rows) {
  if (!Array.isArray(rows) || rows.length > 201) throw new Error('นำเข้าได้ครั้งละไม่เกิน 200 คน');
  return rows.map(row => row.map(value => {
    const text = value == null ? '' : String(value);
    return `"${text.replaceAll('"','""')}"`;
  }).join(',')).join('\n');
}

export async function readStudentImportFile(file) {
  if (!file || file.size > 2 * 1024 * 1024) throw new Error('กรุณาเลือกไฟล์ขนาดไม่เกิน 2 MB');
  if (/\.(csv|tsv)$/i.test(file.name)) return (await file.text()).replace(/^\uFEFF/,'');
  if (!/\.xlsx$/i.test(file.name)) throw new Error('รองรับไฟล์ .csv, .tsv และ .xlsx');
  const { readSheet } = await import('read-excel-file/browser');
  return importMatrixToText(await readSheet(file,1));
}

export function normalizeClassName(raw) {
  if (raw == null) return '';
  if (raw instanceof Date && !isNaN(raw.getTime())) {
    const d = raw.getDate();
    const m = raw.getMonth() + 1;
    if (d === 6) return `ป.6/${m}`;
    if (m === 6) return `ป.6/${d}`;
    if (d >= 1 && d <= 6) return `ป.${d}/${m}`;
    if (m >= 1 && m <= 6) return `ป.${m}/${d}`;
    return `ป.${d}/${m}`;
  }

  let str = String(raw).trim();
  if (!str) return '';

  str = str.replace(/^["']|["']$/g, '').trim();

  // Excel Thai date auto-formatting handler (e.g. 6/1 -> 6-ม.ค., 6/2 -> 6-ก.พ.)
  const thaiMonths = {
    'ม.ค.': 1, 'มค': 1, 'มกราคม': 1,
    'ก.พ.': 2, 'กพ': 2, 'กุมภาพันธ์': 2,
    'มี.ค.': 3, 'มีค': 3, 'มีนาคม': 3,
    'เม.ย.': 4, 'เมย': 4, 'เมษายน': 4,
    'พ.ค.': 5, 'พค': 5, 'พฤษภาคม': 5,
    'มิ.ย.': 6, 'มิย': 6, 'มิถุนายน': 6,
    'ก.ค.': 7, 'กค': 7, 'กรกฎาคม': 7,
    'ส.ค.': 8, 'สค': 8, 'สิงหาคม': 8,
    'ก.ย.': 9, 'กย': 9, 'กันยายน': 9,
    'ต.ค.': 10, 'ตค': 10, 'ตุลาคม': 10,
    'พ.ย.': 11, 'พย': 11, 'พฤศจิกายน': 11,
    'ธ.ค.': 12, 'ธค': 12, 'ธันวาคม': 12,
  };

  const thaiPattern = /^([1-6])[\s\-_/]+(ม\.?ค\.?|ก\.?พ\.?|มี\.?ค\.?|เม\.?ย\.?|พ\.?ค\.?|มิ\.?ย\.?|ก\.?ค\.?|ส\.?ค\.?|ก\.?ย\.?|ต\.?ค\.?|พ\.?ย\.?|ธ\.?ค\.?|มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน|ตุลาคม|พฤศจิกายน|ธันวาคม)$/i;
  const thaiMatch = str.match(thaiPattern);
  if (thaiMatch) {
    const grade = thaiMatch[1];
    const monthStr = thaiMatch[2];
    for (const [key, room] of Object.entries(thaiMonths)) {
      if (key === monthStr || key.replace(/\./g, '') === monthStr.replace(/\./g, '')) {
        return `ป.${grade}/${room}`;
      }
    }
  }

  // Excel English date auto-formatting handler (e.g. 6-Jan, 1-Jun)
  const engMonths = {
    jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
    jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
  };
  const engMatch1 = str.match(/^([1-6])[\s\-_/]+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i);
  if (engMatch1) {
    const grade = engMatch1[1];
    const room = engMonths[engMatch1[2].toLowerCase()];
    if (room) return `ป.${grade}/${room}`;
  }
  const engMatch2 = str.match(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[\s\-_/]+0?([1-6])/i);
  if (engMatch2) {
    const room = engMonths[engMatch2[1].toLowerCase()];
    const grade = engMatch2[2];
    if (room) return `ป.${grade}/${room}`;
  }

  // ISO date like 2026-01-06
  const isoMatch = str.match(/^\d{4}-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const m = parseInt(isoMatch[1], 10);
    const d = parseInt(isoMatch[2], 10);
    if (d === 6) return `ป.6/${m}`;
    if (m === 6) return `ป.6/${d}`;
    if (d >= 1 && d <= 6) return `ป.${d}/${m}`;
    if (m >= 1 && m <= 6) return `ป.${m}/${d}`;
  }

  // Thai standard class format like ป.6/1, ป 6/1, ป6/1, ป.6-1
  const pMatch = str.match(/^ป\.?\s*([1-6])\s*[\/.\-_]\s*(\d+)$/);
  if (pMatch) {
    return `ป.${pMatch[1]}/${pMatch[2]}`;
  }

  // Mathayom format like ม.1/1, ม.3/2
  const mMatch = str.match(/^ม\.?\s*([1-6])\s*[\/.\-_]\s*(\d+)$/);
  if (mMatch) {
    return `ม.${mMatch[1]}/${mMatch[2]}`;
  }

  // Raw number slash number like 6/1 -> ป.6/1
  const bareSlash = str.match(/^([1-6])\s*\/\s*(\d+)$/);
  if (bareSlash) {
    return `ป.${bareSlash[1]}/${bareSlash[2]}`;
  }

  // Raw number dash number like 6-1 -> ป.6/1
  const bareDash = str.match(/^([1-6])\s*-\s*(\d+)$/);
  if (bareDash) {
    return `ป.${bareDash[1]}/${bareDash[2]}`;
  }

  if (/^[ปม]\.\d+/.test(str)) {
    return str;
  }

  return str;
}

export const STUDENT_IMPORT_TEMPLATE_CSV = '\uFEFF' + [
  'student_id,name,class,number',
  'BNS-60101,ด.ช. ภูผา สมบูรณ์,ป.6/1,1',
  'BNS-60102,ด.ญ. ฟ้าใส เรียนดี,ป.6/1,2',
  'BNS-60103,ด.ช. ตะวัน ขยันมั่นเพียร,ป.6/1,3',
  'BNS-60104,ด.ญ. มุกดา สดใส,ป.6/1,4',
  'BNS-60105,ด.ช. อารีย์ สุขเจริญ,ป.6/1,5',
].join('\r\n');

export function downloadStudentImportTemplate(filename = 'แบบฟอร์มนำเข้านักเรียน_EnglishQuest.csv') {
  if (typeof document === 'undefined') return;
  const blob = new Blob([STUDENT_IMPORT_TEMPLATE_CSV], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

