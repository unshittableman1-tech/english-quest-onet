import { getPreTestResult } from './preTestResult.js';

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const format = value => Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100);

export function buildExecutivePretestReport(students) {
  const records = students.flatMap(student => {
    if (!student.preTest || typeof student.preTest !== 'object' || Array.isArray(student.preTest)) return [];
    if (student.preTest.score != null && (typeof student.preTest.score === 'boolean' || Number(student.preTest.score) !== Number(student.preTest.totalScore))) return [];
    const result = getPreTestResult(student);
    if (result.total === null || result.percent === null) return [];
    if (student.preTest.percent != null && (typeof student.preTest.percent === 'boolean' || !Number.isFinite(Number(student.preTest.percent)) || Number(student.preTest.percent) < 0 || Number(student.preTest.percent) > 100 || Math.round(Number(student.preTest.percent)) !== result.percent)) return [];
    return [{ percent: result.score * 100 / result.total, total: result.total, version: typeof student.preTest.version === 'string' && student.preTest.version.trim() ? student.preTest.version.trim() : null }];
  });
  const versions = [...new Set(records.map(record => record.version))];
  const comparable = versions.length === 1 && versions[0] !== null && new Set(records.map(record => record.total)).size === 1;
  return {
    eligible: students.length,
    completed: records.length,
    participation: students.length ? records.length * 100 / students.length : null,
    average: records.length && comparable ? records.reduce((sum, record) => sum + record.percent, 0) / records.length : null,
    versions,
    comparable,
  };
}

export function renderExecutivePretestReport(report, school, options = {}) {
  const schoolName = escapeHtml(school.name || 'โรงเรียน');
  const schoolCode = escapeHtml(school.code || '—');
  const scope = escapeHtml(options.scope || 'นักเรียนในขอบเขตที่เลือก');
  const reportDate = escapeHtml(options.date || new Date().toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok', year: 'numeric', month: 'long', day: 'numeric' }));
  const versions = report.versions.length ? report.versions.map(v => escapeHtml(v || 'ไม่ทราบรุ่น')).join(', ') : '—';
  const average = report.average === null ? '—' : `${format(report.average)}%`;
  const participation = report.participation === null ? '—' : `${format(report.participation)}%`;
  const finding = report.completed === 0
    ? 'ยังไม่มีข้อมูลผลสอบ Pre-Test ที่ตรวจสอบคะแนนและจำนวนข้อได้ จึงยังไม่สามารถระบุจุดอ่อนหรือผลสัมฤทธิ์ของผู้เรียน'
    : report.comparable
      ? 'คะแนนเฉลี่ยแสดงเฉพาะผลสอบที่มีข้อมูลคะแนนและจำนวนข้อครบถ้วน ควรตรวจสอบความครอบคลุมและคุณภาพของแบบทดสอบก่อนตีความผล'
      : 'พบผลสอบจากแบบทดสอบต่างรุ่น ไม่ทราบรุ่น หรือมีจำนวนข้อไม่ตรงกัน จึงไม่รวมคะแนนเฉลี่ยจนกว่าจะยืนยันความเทียบเคียงได้';
  return `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>รายงาน Pre-Test ${schoolName}</title><style>
    @page { size:A4; margin:14mm }
    * { box-sizing:border-box } body { margin:0; background:#edf3f6; color:#17334a; font:14px/1.65 Sarabun, Tahoma, sans-serif }
    .toolbar { max-width:900px; margin:20px auto 0; padding:0 24px; display:flex; align-items:center; justify-content:space-between; gap:12px; color:#526a7a }
    button { min-height:44px; border:0; border-radius:9px; background:#164b65; color:#fff; padding:0 18px; font:inherit; font-weight:700; cursor:pointer } button:focus-visible { outline:3px solid #e8a532; outline-offset:3px }
    .page { max-width:850px; margin:16px auto 32px; padding:40px 46px; background:white; box-shadow:0 10px 36px #24445a18 }
    .head { display:flex; justify-content:space-between; gap:24px; align-items:flex-start; border-bottom:2px solid #194e68; padding-bottom:20px }
    .brand { color:#257393; font-weight:800; font-size:12px; letter-spacing:.06em } h1 { font-size:25px; line-height:1.3; margin:7px 0 8px; color:#12394f } h2 { font-size:17px; margin:0 0 10px; color:#12394f }
    .school { font-size:16px; font-weight:700 } .meta { color:#607585; font-size:12px; margin-top:5px } .date { min-width:145px; text-align:right; color:#526a7a; font-size:12px }
    .section-head { display:flex; justify-content:space-between; align-items:baseline; gap:10px; margin:26px 0 10px } .section-head h2 { margin:0 } .caption { font-size:12px; color:#687e8d }
    .stats { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); border:1px solid #d9e5eb; border-radius:10px; overflow:hidden }
    .stat { min-width:0; padding:15px 13px; border-right:1px solid #d9e5eb; color:#526a7a; font-size:12px; line-height:1.45 } .stat:last-child { border:0; background:#eff8fa } .value { font-size:25px; line-height:1.3; font-weight:800; color:#164b65; margin-bottom:5px; overflow-wrap:anywhere }
    .insight { background:#f3f8fa; border-left:4px solid #3a8ca5; padding:17px 20px; margin-top:12px } .insight p { margin:8px 0 0 } .insight p:first-of-type { margin-top:0 }
    .note { color:#4f6574; font-size:12px; margin:10px 0 0 } .approval { border-top:1px solid #d9e5eb; margin-top:27px; padding-top:20px; break-inside:avoid }
    .checks { display:flex; flex-wrap:wrap; gap:8px 28px; margin:12px 0 } .line { border-bottom:1px dotted #9babb4; min-height:32px } .signatures { display:grid; grid-template-columns:1fr 1fr; gap:30px; margin-top:45px; text-align:center; color:#405969 } .signature-line { border-bottom:1px solid #889ca8; height:20px; max-width:210px; margin:0 auto 7px }
    @media(max-width:600px) { .toolbar { padding:0 16px; font-size:12px } .page { margin:12px; padding:24px 20px } .head { display:block } .date { text-align:left; margin-top:12px } .stats { grid-template-columns:repeat(2,minmax(0,1fr)) } .stat:nth-child(2) { border-right:0 } .stat:nth-child(-n+2) { border-bottom:1px solid #d9e5eb } .signatures { gap:15px } }
    @media print { body { background:#fff } .no-print { display:none !important } .page { max-width:none; margin:0; padding:0; box-shadow:none } .stats,.insight,.approval { break-inside:avoid } .stat:last-child,.insight { print-color-adjust:exact; -webkit-print-color-adjust:exact } }
    </style></head><body><div class="toolbar no-print"><span>ตรวจสอบรายงานก่อนพิมพ์หรือบันทึกเป็น PDF</span><button onclick="window.print()">พิมพ์ / บันทึก PDF</button></div><main class="page"><header class="head"><div><div class="brand">ONEX | รายงานสำหรับผู้บริหาร</div><h1>รายงานผลการทดสอบก่อนเรียน</h1><div class="school">${schoolName}</div><div class="meta">รหัสโรงเรียน ${schoolCode} · ${scope}</div></div><div class="date">วันที่จัดทำ<br><strong>${reportDate}</strong><br>รุ่นแบบทดสอบ ${versions}</div></header>
    <div class="section-head"><h2>ภาพรวมผลสอบ</h2><span class="caption">เฉพาะข้อมูลที่ตรวจสอบได้</span></div><div class="stats"><div class="stat"><div class="value">${report.eligible}</div>นักเรียนในขอบเขต</div><div class="stat"><div class="value">${report.completed}</div>ผลสอบที่ตรวจสอบได้</div><div class="stat"><div class="value">${participation}</div>สัดส่วนผลสอบที่ตรวจสอบได้</div><div class="stat"><div class="value">${average}</div>คะแนนเฉลี่ย</div></div>
    <div class="section-head"><h2>สรุปสำหรับผู้บริหาร</h2></div><section class="insight"><p>${finding}</p><p>ยังไม่สามารถวิเคราะห์รายตัวชี้วัดหรือจำนวนผู้เรียนที่ต้องการความช่วยเหลือรายตัวชี้วัดได้ เนื่องจากยังไม่มีหลักฐานคำตอบรายข้อและการจับคู่ตัวชี้วัดที่ผ่านการตรวจสอบในรายงานนี้</p></section><p class="note">แนวทางถัดไป: ให้ครูตรวจสอบแบบทดสอบและหลักฐานรายข้อก่อนกำหนดกิจกรรมเสริมและการประเมินซ้ำ</p>
    <section class="approval"><h2>ความเห็นและข้อสั่งการ</h2><div class="checks"><span>☐ เห็นชอบให้ตรวจสอบผล</span><span>☐ มอบหมายติดตาม</span></div><div>ข้อสั่งการเพิ่มเติม</div><div class="line"></div><div class="line"></div><div class="signatures"><div><div class="signature-line"></div>ครูผู้รายงาน</div><div><div class="signature-line"></div>ผู้อำนวยการโรงเรียน</div></div></section></main></body></html>`;
}
