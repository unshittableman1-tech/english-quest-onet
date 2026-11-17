import { getPreTestResult } from './preTestResult.js';
import { REMEDIAL_PATHWAYS, getTeacherVerifiedIndicators } from './learningAnalysis.js';
import { BLUEPRINT_2569_STRUCTURE } from '../data/pretestBlueprint32.js';
import { POSTTEST_BLUEPRINT_2569_STRUCTURE } from '../data/posttestBlueprint32.js';

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const format = value => Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100);

export function buildExecutivePretestReport(students, options = {}) {
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

  const scoreDistribution = {
    high: records.filter(r => r.percent >= 70).length,
    medium: records.filter(r => r.percent >= 50 && r.percent < 70).length,
    low: records.filter(r => r.percent < 50).length,
  };

  const verifiedIndicators = getTeacherVerifiedIndicators(options.storage || (typeof localStorage !== 'undefined' ? localStorage : null));

  const standardsRemedial = (BLUEPRINT_2569_STRUCTURE?.standards || []).map(std => {
    const pathway = REMEDIAL_PATHWAYS[std.standard] || {};
    const verifiedCount = verifiedIndicators.filter(v => v.standard === std.standard).length;
    return {
      standard: std.standard,
      name: std.name,
      items: std.items,
      score: std.score,
      indicators: std.candidateIndicators || [],
      focus: pathway.focus || 'ทักษะตามหลักสูตรแกนกลาง',
      recommendedQuests: pathway.recommendedQuests || [],
      recommendedVocab: pathway.recommendedVocab || '',
      verifiedCount,
    };
  });

  return {
    eligible: students.length,
    completed: records.length,
    participation: students.length ? records.length * 100 / students.length : null,
    average: records.length && comparable ? records.reduce((sum, record) => sum + record.percent, 0) / records.length : null,
    versions,
    comparable,
    scoreDistribution,
    verifiedIndicators,
    standardsRemedial,
    blueprintComparison: {
      baseline: { version: versions[0] || 'pretest-v2', items: records[0]?.total || 20, name: 'Pre-Test ก่อนเรียน (20 ข้อ)' },
      targetBlueprint: { name: BLUEPRINT_2569_STRUCTURE.name, items: BLUEPRINT_2569_STRUCTURE.totalItems, totalScore: BLUEPRINT_2569_STRUCTURE.totalScore, scorePerItem: BLUEPRINT_2569_STRUCTURE.scorePerItem },
      parallelPostTest: { name: POSTTEST_BLUEPRINT_2569_STRUCTURE.name, items: POSTTEST_BLUEPRINT_2569_STRUCTURE.totalItems, totalScore: POSTTEST_BLUEPRINT_2569_STRUCTURE.totalScore, scorePerItem: POSTTEST_BLUEPRINT_2569_STRUCTURE.scorePerItem },
    },
  };
}

export function renderExecutivePretestReport(report, school, options = {}) {
  const schoolName = escapeHtml(school?.name || 'โรงเรียนบ้านน้ำใส');
  const schoolCode = escapeHtml(school?.code || 'BNS69');
  const schoolArea = escapeHtml(school?.area || 'สำนักงานเขตพื้นที่การศึกษาประถมศึกษา');
  const scope = escapeHtml(options.scope || 'นักเรียนชั้นประถมศึกษาปีที่ 6 ทั้งหมด');
  const teacherName = escapeHtml(options.teacherName || 'ครูผู้สอนวิชาภาษาอังกฤษ');
  const reportDate = escapeHtml(options.date || new Date().toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok', year: 'numeric', month: 'long', day: 'numeric' }));
  const versions = report.versions.length ? report.versions.map(v => escapeHtml(v || 'ไม่ทราบรุ่น')).join(', ') : 'pretest-v2';
  const average = report.average === null ? '—' : `${format(report.average)}%`;
  const participation = report.participation === null ? '—' : `${format(report.participation)}%`;

  const finding = report.completed === 0
    ? 'ยังไม่มีข้อมูลผลสอบ Pre-Test ที่ตรวจสอบคะแนนและจำนวนข้อได้ จึงยังไม่สามารถสรุปผลสัมฤทธิ์ของผู้เรียน'
    : report.comparable
      ? `นักเรียนเข้าทดสอบแล้ว ${report.completed} จาก ${report.eligible} คน (${participation}) ได้คะแนนเฉลี่ย ${average} โดยพบนักเรียนผ่านเกณฑ์ (≥70%) จำนวน ${report.scoreDistribution.high} คน, ปานกลาง (50-69%) จำนวน ${report.scoreDistribution.medium} คน และต้องการความช่วยเหลือเร่งด่วน (<50%) จำนวน ${report.scoreDistribution.low} คน`
      : 'พบผลสอบจากแบบทดสอบต่างรุ่นหรือไม่ทราบรุ่น จึงยังไม่รวมคะแนนเฉลี่ยจนกว่าจะยืนยันความเทียบเคียงได้';

  const verifiedCount = report.verifiedIndicators?.length || 0;

  return `<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>รายงานผล Pre-Test และแผนพัฒนา O-NET ป.6 — ${schoolName}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm 15mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #edf3f6;
      color: #17334a;
      font: 13.5px/1.6 Sarabun, 'TH Sarabun New', Tahoma, sans-serif;
    }
    .toolbar {
      max-width: 900px;
      margin: 18px auto 0;
      padding: 0 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      color: #3b5768;
      font-size: 13px;
    }
    .btn-print {
      min-height: 42px;
      border: 0;
      border-radius: 9px;
      background: #144963;
      color: #fff;
      padding: 0 20px;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(20,73,99,0.25);
    }
    .btn-print:hover { background: #0e374c; }
    .page {
      max-width: 860px;
      margin: 14px auto 36px;
      padding: 38px 44px;
      background: #ffffff;
      box-shadow: 0 10px 32px rgba(23,51,74,0.1);
      border-radius: 4px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
      border-bottom: 2.5px solid #144963;
      padding-bottom: 18px;
    }
    .header-brand {
      color: #1a6f8f;
      font-weight: 800;
      font-size: 11px;
      letter-spacing: .08em;
      text-transform: uppercase;
    }
    h1 {
      font-size: 23px;
      line-height: 1.35;
      margin: 6px 0 6px;
      color: #0f3246;
      font-weight: 800;
    }
    .school-name {
      font-size: 16px;
      font-weight: 700;
      color: #164e6b;
    }
    .header-meta {
      color: #556e7e;
      font-size: 12px;
      margin-top: 4px;
    }
    .header-date {
      min-width: 160px;
      text-align: right;
      color: #556e7e;
      font-size: 11.5px;
      line-height: 1.5;
    }
    .section-title {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 10px;
      margin: 22px 0 10px;
    }
    h2 {
      font-size: 15px;
      margin: 0;
      color: #10384e;
      font-weight: 800;
      border-left: 3.5px solid #196b8a;
      padding-left: 8px;
    }
    .caption {
      font-size: 11.5px;
      color: #637c8c;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      border: 1px solid #d4e1e8;
      border-radius: 9px;
      overflow: hidden;
      margin-bottom: 12px;
    }
    .stat {
      padding: 13px 12px;
      border-right: 1px solid #d4e1e8;
      color: #526c7c;
      font-size: 11.5px;
      line-height: 1.4;
      background: #fafcfe;
    }
    .stat:last-child {
      border: 0;
      background: #eef7fa;
    }
    .stat-val {
      font-size: 24px;
      line-height: 1.25;
      font-weight: 800;
      color: #12445e;
      margin-bottom: 4px;
    }
    .dist-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 8px;
      font-size: 12px;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 600;
    }
    .chip-green { background: #e6f7ef; color: #107044; border: 1px solid #c2ebd5; }
    .chip-amber { background: #fef8eb; color: #9a660a; border: 1px solid #f9e2b1; }
    .chip-red { background: #fdf0ee; color: #ab2a1b; border: 1px solid #f7c7c1; }
    
    .insight {
      background: #f4f8fa;
      border-left: 4px solid #237b9b;
      padding: 14px 18px;
      margin-top: 10px;
      border-radius: 0 8px 8px 0;
    }
    .insight p { margin: 6px 0 0; font-size: 13px; line-height: 1.55; }
    .insight p:first-of-type { margin-top: 0; }

    .table-remedial {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 12px;
    }
    .table-remedial th {
      background: #174860;
      color: #fff;
      font-weight: 700;
      text-align: left;
      padding: 8px 10px;
      border: 1px solid #174860;
    }
    .table-remedial td {
      padding: 8px 10px;
      border: 1px solid #d7e4ea;
      vertical-align: top;
      line-height: 1.45;
    }
    .table-remedial tr:nth-child(even) { background: #f8fbfd; }
    .badge-std {
      display: inline-block;
      font-weight: 800;
      color: #0f4a64;
      background: #e2f1f7;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
    }

    .blueprint-box {
      border: 1px solid #cfe0e8;
      border-radius: 8px;
      padding: 12px 16px;
      background: #fdfefe;
      margin-top: 10px;
      font-size: 12px;
      line-height: 1.5;
    }
    .blueprint-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-top: 8px;
    }
    .bp-card {
      padding: 10px 12px;
      background: #f4f8fa;
      border-radius: 6px;
      border-left: 3px solid #1f7292;
    }
    .bp-card strong { display: block; color: #113f56; font-size: 12.5px; margin-bottom: 2px; }

    .approval {
      border-top: 1.5px solid #c9dbe3;
      margin-top: 26px;
      padding-top: 18px;
      break-inside: avoid;
    }
    .checks {
      display: flex;
      flex-wrap: wrap;
      gap: 12px 24px;
      margin: 10px 0;
      font-size: 12.5px;
    }
    .line {
      border-bottom: 1px dotted #8fa3b0;
      min-height: 28px;
      margin-bottom: 4px;
    }
    .signatures {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-top: 36px;
      text-align: center;
      color: #3b5566;
      font-size: 12px;
    }
    .signature-line {
      border-bottom: 1px solid #758e9e;
      height: 24px;
      max-width: 170px;
      margin: 0 auto 6px;
    }

    @media print {
      body { background: #fff; }
      .no-print { display: none !important; }
      .page {
        max-width: none;
        margin: 0;
        padding: 0;
        box-shadow: none;
      }
      .stats, .insight, .table-remedial, .blueprint-box, .approval {
        break-inside: avoid;
      }
      .stat:last-child, .insight, .chip, .table-remedial th {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar no-print">
    <span>📌 รายงานผู้บริหารเสนอผู้อำนวยการโรงเรียน (Executive Summary Report)</span>
    <button class="btn-print" onclick="window.print()">🖨️ พิมพ์ / บันทึกเป็น PDF</button>
  </div>

  <main class="page">
    <header class="header">
      <div>
        <div class="header-brand">ONEX ACADEMIC EVALUATION · O-NET ADVENTURE ป.6</div>
        <h1>รายงานผลการประเมินก่อนเรียน (Pre-Test) และแผนสอนซ่อมเสริม</h1>
        <div class="school-name">${schoolName}</div>
        <div class="header-meta">รหัสสถานศึกษา: ${schoolCode} · สังกัด: ${schoolArea} · ขอบเขต: ${scope}</div>
      </div>
      <div class="header-date">
        วันที่จัดทำเอกสาร<br>
        <strong>${reportDate}</strong><br>
        รุ่นข้อสอบ: <span style="font-family:monospace; font-weight:bold;">${versions}</span>
      </div>
    </header>

    <div class="section-title">
      <h2>1. ภาพรวมผลการประเมินเชิงประจักษ์</h2>
      <span class="caption">ข้อมูลที่ตรวจสอบได้จากระบบบันทึกคะแนน</span>
    </div>

    <div class="stats">
      <div class="stat">
        <div class="stat-val">${report.eligible}</div>
        นักเรียนกลุ่มเป้าหมาย (คน)
      </div>
      <div class="stat">
        <div class="stat-val">${report.completed}</div>
        เข้าทำ Pre-Test แล้ว (คน)
      </div>
      <div class="stat">
        <div class="stat-val">${participation}</div>
        สัดส่วนการเข้าทดสอบ
      </div>
      <div class="stat">
        <div class="stat-val">${average}</div>
        คะแนนเฉลี่ยก่อนเรียน
      </div>
    </div>

    ${report.comparable && report.completed > 0 ? `
    <div class="dist-chips">
      <span class="chip chip-green">🟢 ผ่านเกณฑ์ (≥70%): ${report.scoreDistribution.high} คน</span>
      <span class="chip chip-amber">🟡 ระดับปานกลาง (50-69%): ${report.scoreDistribution.medium} คน</span>
      <span class="chip chip-red">🔴 ต้องช่วยเหลือเร่งด่วน (&lt;50%): ${report.scoreDistribution.low} คน</span>
    </div>
    ` : ''}

    <div class="section-title">
      <h2>2. สรุปข้อค้นพบสำหรับผู้บริหาร</h2>
      <span class="caption">คุณภาพเครื่องมือและสถานะการตรวจสอบ</span>
    </div>

    <section class="insight">
      <p><strong>ผลการประเมิน:</strong> ${finding}</p>
      <p><strong>การรับรองตัวชี้วัดโดยครู:</strong> ตรวจยืนยันความถูกต้องของตัวชี้วัดแล้ว <strong>${verifiedCount} ข้อ</strong> โดยยึดหลักฐานเชิงประจักษ์ ไม่ประเมินหรือคาดการณ์ผลล่วงหน้า</p>
    </section>

    <div class="section-title">
      <h2>3. การวิเคราะห์ตามมาตรฐานตัวชี้วัด และแผนกิจกรรมสอนซ่อมเสริม</h2>
      <span class="caption">เชื่อมโยงแบบฝึกหัดในระบบจริง O-NET Adventure</span>
    </div>

    <table class="table-remedial">
      <thead>
        <tr>
          <th style="width: 14%;">มาตรฐาน</th>
          <th style="width: 10%;">โควตาผัง</th>
          <th style="width: 32%;">จุดเน้นและสาระสำคัญที่ควรพัฒนา</th>
          <th style="width: 32%;">กิจกรรมซ่อมเสริมในระบบที่มีอยู่จริง</th>
          <th style="width: 12%; text-align: center;">ครูยืนยัน</th>
        </tr>
      </thead>
      <tbody>
        ${report.standardsRemedial.map(std => `
          <tr>
            <td>
              <span class="badge-std">${escapeHtml(std.standard)}</span><br>
              <small style="color:#506a78;">${escapeHtml(std.name)}</small>
            </td>
            <td><strong>${std.items} ข้อ</strong><br><small style="color:#6e8593;">(${std.score} คะแนน)</small></td>
            <td>${escapeHtml(std.focus)}</td>
            <td>
              <strong style="color:#11526e;">Vocab Drill:</strong> ${escapeHtml(std.recommendedVocab)}<br>
              <strong style="color:#11526e;">Quest:</strong> ${escapeHtml(std.recommendedQuests.join(', ') || 'ตามแผนประจำบท')}
            </td>
            <td style="text-align: center;">
              ${std.verifiedCount > 0
                ? `<span style="color:#0f754b; font-weight:bold;">✓ ${std.verifiedCount} ข้อ</span>`
                : `<span style="color:#926715;">รอตรวจ</span>`}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="section-title">
      <h2>4. กรอบการประเมิน O-NET ป.6 ปี 2569 และการเตรียมวัดผลคู่ขนาน</h2>
      <span class="caption">ผังโครงสร้างข้อสอบ O-NET ป.6 (32 ข้อ 100 คะแนนเต็ม ข้อละ 3.125 คะแนน)</span>
    </div>

    <div class="blueprint-box">
      <div style="font-weight: bold; color: #113f56; margin-bottom: 4px;">
        ผังการดำเนินงานวัดผลและสอนซ่อมเสริม 3 ระยะ:
      </div>
      <div class="blueprint-grid">
        <div class="bp-card">
          <strong>ระยะที่ 1: Pre-Test ฐานข้อมูลเดิม</strong>
          <span>ใช้ชุด 20 ข้อเดิมเพื่อระบุจุดเริ่มต้นของนักเรียน โดยรักษาประวัติคะแนนเดิม 100% ไม่เขียนทับ</span>
        </div>
        <div class="bp-card">
          <strong>ระยะที่ 2: การสอนซ่อมเสริมรายด่าน</strong>
          <span>ฝึกคำศัพท์หมวดสำคัญ เช่น ประโยคคำถาม O-NET, กริยาและความรู้สึก 66 คำ และ Quest ตรงจุด</span>
        </div>
        <div class="bp-card">
          <strong>ระยะที่ 3: Post-Test คู่ขนาน (32 ข้อ)</strong>
          <span>วัดผลหลังเรียนด้วยข้อสอบคู่ขนาน 1:1 ตามผัง สทศ. 32 ข้อ 100 คะแนน เพื่อคำนวณ Growth Score จริง</span>
        </div>
      </div>
      <p style="margin: 8px 0 0; font-size: 11.5px; color: #58707e;">
        * หมายเหตุ: ระบบไม่มีการประมาณการคะแนนล่วงหน้าโดยไม่มีข้อสอบจริง ผลสัมฤทธิ์ปลายทางจะสรุปเมื่อนักเรียนทำแบบทดสอบคู่ขนานครบถ้วน
      </p>
    </div>

    <section class="approval">
      <h2>5. ข้อสั่งการและบันทึกความเห็นของผู้บริหารสถานศึกษา</h2>
      <div class="checks">
        <span>☐ เห็นชอบให้ดำเนินการสอนซ่อมเสริมตามแผน</span>
        <span>☐ มอบหมายครูผู้สอนติดตามนักเรียนกลุ่มคะแนนต่ำกว่า 70%</span>
        <span>☐ ให้รายงานผลความก้าวหน้าหลังเสร็จสิ้นการซ่อมเสริม</span>
      </div>
      <div style="margin-top: 8px; font-weight: bold; font-size: 12px; color: #365060;">ข้อสั่งการเพิ่มเติม:</div>
      <div class="line"></div>
      <div class="line"></div>

      <div class="signatures">
        <div>
          <div class="signature-line"></div>
          <strong>(${teacherName})</strong><br>
          ครูผู้รับผิดชอบรายวิชาภาษาอังกฤษ
        </div>
        <div>
          <div class="signature-line"></div>
          <strong>(......................................................)</strong><br>
          หัวหน้ากลุ่มสาระการเรียนรู้ / หัวหน้าฝ่ายวิชาการ
        </div>
        <div>
          <div class="signature-line"></div>
          <strong>(......................................................)</strong><br>
          ผู้อำนวยการโรงเรียน
        </div>
      </div>
    </section>
  </main>
</body>
</html>`;
}
