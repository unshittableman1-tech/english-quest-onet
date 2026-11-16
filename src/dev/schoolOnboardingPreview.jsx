import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardList, Info, LockKeyhole, MessageCircle, School, ShieldCheck } from 'lucide-react';
import EnglishQuestLogo from '../components/landing/EnglishQuestLogo';
import {
  APPLICATION_SOURCES,
  PACKAGE_INTERESTS,
  emptySchoolApplication,
  validateSchoolApplicationDraft,
} from '../utils/schoolApplicationDraft';
import '../styles/schoolOnboardingPreview.css';

const LOCAL_PREVIEW = import.meta.env.DEV && ['127.0.0.1', 'localhost', '[::1]'].includes(window.location.hostname);

const EXAMPLE_APPLICATIONS = [
  { reference: 'ตัวอย่าง A', name: 'โรงเรียนตัวอย่างสายรุ้ง', source: 'เว็บไซต์', status: 'รอตรวจสอบ', date: 'ข้อมูลสมมติ' },
  { reference: 'ตัวอย่าง B', name: 'โรงเรียนตัวอย่างภูเขา', source: 'LINE OA', status: 'ขอข้อมูลเพิ่ม', date: 'ข้อมูลสมมติ' },
];

const FIELD_GROUPS = [
  {
    title: 'ข้อมูลโรงเรียน',
    fields: [
      { name: 'schoolNameThai', label: 'ชื่อโรงเรียน', placeholder: 'ชื่อที่ใช้ติดต่ออย่างเป็นทางการ', required: true },
      { name: 'schoolNameEnglish', label: 'ชื่อภาษาอังกฤษ (ถ้ามี)', placeholder: 'ไม่จำเป็น' },
      { name: 'province', label: 'จังหวัด', placeholder: 'จังหวัด', required: true },
      { name: 'district', label: 'อำเภอ / เขต', placeholder: 'อำเภอหรือเขต', required: true },
      { name: 'address', label: 'ที่อยู่ (ถ้าจำเป็น)', placeholder: 'ไม่จำเป็น' },
    ],
  },
  {
    title: 'ผู้ติดต่อ',
    fields: [
      { name: 'contactName', label: 'ชื่อผู้ติดต่อ', placeholder: 'ผู้ประสานงานโรงเรียน', required: true },
      { name: 'contactEmail', label: 'อีเมล', placeholder: 'name@school.example', type: 'email', required: true },
      { name: 'contactPhone', label: 'โทรศัพท์', placeholder: 'หมายเลขที่ติดต่อได้', type: 'tel', required: true },
    ],
  },
];

function FormField({ field, value, error, onChange }) {
  return <div className="so-field">
    <label htmlFor={`so-${field.name}`}>{field.label}{field.required && <span aria-hidden="true"> *</span>}</label>
    <input id={`so-${field.name}`} name={field.name} type={field.type || 'text'} required={field.required}
      value={value} placeholder={field.placeholder} onChange={event => onChange(field.name, event.target.value)}
      aria-invalid={Boolean(error)} aria-describedby={error ? `so-error-${field.name}` : undefined} />
    {error && <p id={`so-error-${field.name}`} className="so-error">{error}</p>}
  </div>;
}

function ApplicationForm({ source }) {
  const [form, setForm] = useState(() => emptySchoolApplication(source));
  const [errors, setErrors] = useState({});
  const [review, setReview] = useState(null);

  const update = (field, value) => {
    setForm(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: undefined }));
  };

  const check = event => {
    event.preventDefault();
    const result = validateSchoolApplicationDraft(form, source);
    setErrors(result.errors);
    if (result.valid) setReview(result.data);
  };

  const assisted = source === APPLICATION_SOURCES.LINE_ASSISTED;
  return <section className="so-form-card">
    <div className="so-card-heading">
      <div className="so-section-icon">{assisted ? <MessageCircle size={23} /> : <School size={23} />}</div>
      <div><p className="so-eyebrow">{assisted ? 'ช่องทาง B · LINE OA' : 'ช่องทาง A · เว็บไซต์'}</p><h2>{assisted ? 'บันทึกข้อมูลแทนโรงเรียน' : 'สมัครใช้งานสำหรับโรงเรียน'}</h2></div>
    </div>
    <p className="so-intro">{assisted
      ? 'ตัวอย่างหน้าสำหรับ Platform Admin เท่านั้น ต้องยืนยันข้อมูลกับโรงเรียนก่อนอนุมัติ'
      : 'กรอกข้อมูลเบื้องต้นเพื่อให้ทีมงานติดต่อกลับ การส่งแบบฟอร์มจริงยังไม่เปิดใช้งาน'}</p>
    {review ? <div className="so-review" aria-live="polite">
      <CheckCircle2 size={28} aria-hidden="true" />
      <h3>ตรวจรูปแบบข้อมูลผ่านแล้ว</h3>
      <p>นี่เป็นการตรวจในเบราว์เซอร์เท่านั้น <strong>ยังไม่ส่งคำขอและไม่บันทึกข้อมูล</strong></p>
      <dl>
        <div><dt>โรงเรียน</dt><dd>{review.schoolNameThai}</dd></div>
        <div><dt>พื้นที่</dt><dd>{review.district}, {review.province}</dd></div>
        <div><dt>ผู้ติดต่อ</dt><dd>{review.contactName}</dd></div>
        <div><dt>จำนวนนักเรียน / ครูที่คาด</dt><dd>{review.expectedStudents} / {review.expectedTeachers}</dd></div>
      </dl>
      <button type="button" className="so-secondary-button" onClick={() => setReview(null)}><ArrowLeft size={17} /> กลับไปแก้ไข</button>
      <p className="so-notice"><LockKeyhole size={17} /> ปุ่มส่งจริงจะเปิดได้หลังมี API และฐานข้อมูลที่ผ่านการอนุมัติ</p>
    </div> : <form onSubmit={check} noValidate>
      {FIELD_GROUPS.map(group => <fieldset key={group.title} className="so-fieldset"><legend>{group.title}</legend><div className="so-field-grid">{group.fields.map(field => <FormField key={field.name} field={field} value={form[field.name]} error={errors[field.name]} onChange={update} />)}</div></fieldset>)}
      <fieldset className="so-fieldset"><legend>ความต้องการเบื้องต้น</legend><div className="so-field-grid">
        <div className="so-field"><label htmlFor="so-packageInterest">ความสนใจแพ็กเกจ *</label><select id="so-packageInterest" value={form.packageInterest} onChange={event => update('packageInterest', event.target.value)}>{PACKAGE_INTERESTS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select><small>เป็นเพียงความสนใจ ไม่ใช่ราคา สัญญา หรือสิทธิ์ใช้งาน</small>{errors.packageInterest && <p className="so-error">{errors.packageInterest}</p>}</div>
        <div className="so-field"><label htmlFor="so-expectedStudents">นักเรียนที่คาดว่าจะใช้งาน *</label><input id="so-expectedStudents" type="number" min="0" max="100000" value={form.expectedStudents} onChange={event => update('expectedStudents', event.target.value)} aria-invalid={Boolean(errors.expectedStudents)} />{errors.expectedStudents && <p className="so-error">{errors.expectedStudents}</p>}</div>
        <div className="so-field"><label htmlFor="so-expectedTeachers">ครูที่คาดว่าจะใช้งาน *</label><input id="so-expectedTeachers" type="number" min="0" max="10000" value={form.expectedTeachers} onChange={event => update('expectedTeachers', event.target.value)} aria-invalid={Boolean(errors.expectedTeachers)} />{errors.expectedTeachers && <p className="so-error">{errors.expectedTeachers}</p>}</div>
        {assisted && <div className="so-field"><label htmlFor="so-lineReference">เลขอ้างอิงการติดต่อ LINE (ถ้ามี)</label><input id="so-lineReference" value={form.lineReference} onChange={event => update('lineReference', event.target.value)} placeholder="ไม่ใส่บทสนทนาหรือข้อมูลนักเรียน" />{errors.lineReference && <p className="so-error">{errors.lineReference}</p>}</div>}
      </div></fieldset>
      <label className="so-privacy"><input type="checkbox" checked={form.privacyAccepted} onChange={event => update('privacyAccepted', event.target.checked)} /><span>รับทราบว่าจะใช้ข้อมูลผู้ติดต่อเพื่อประสานงานคำขอสมัครเท่านั้น และต้องมีประกาศความเป็นส่วนตัวฉบับจริงก่อนเปิดรับสมัคร</span></label>
      {errors.privacyAccepted && <p className="so-error">{errors.privacyAccepted}</p>}
      <button className="so-primary-button" type="submit">ตรวจรูปแบบข้อมูล <ArrowRight size={18} /></button>
      <p className="so-form-footnote">ยังไม่มีการส่งอีเมล สร้างโรงเรียน เปิดสมาชิก หรือบันทึกข้อมูลจากหน้านี้</p>
    </form>}
  </section>;
}

function ReviewPreview() {
  return <section className="so-admin-card">
    <div className="so-card-heading"><div className="so-section-icon"><ClipboardList size={23} /></div><div><p className="so-eyebrow">Platform Admin · Preview</p><h2>คำขอสมัครโรงเรียน</h2></div></div>
    <p className="so-intro">ข้อมูลในตารางเป็นตัวอย่างสังเคราะห์ ไม่มีการอ่านคำขอจากเซิร์ฟเวอร์ และทุกการดำเนินการยังปิดอยู่</p>
    <div className="so-table-wrap"><table><thead><tr><th>อ้างอิง</th><th>โรงเรียน</th><th>ช่องทาง</th><th>สถานะ</th><th>วันที่</th></tr></thead><tbody>{EXAMPLE_APPLICATIONS.map(item => <tr key={item.reference}><td>{item.reference}</td><td>{item.name}</td><td>{item.source}</td><td><span className="so-status">{item.status}</span></td><td>{item.date}</td></tr>)}</tbody></table></div>
    <div className="so-review-steps"><article><b>1. ตรวจคำขอ</b><p>ตรวจข้อมูล ความซ้ำ และการยืนยันผู้สมัคร</p></article><article><b>2. อนุมัติคำขอ</b><p>ยังไม่ใช่การเปิดสมาชิกหรือรับชำระเงิน</p></article><article><b>3. สร้างโรงเรียน</b><p>กำหนดสิทธิ์ใช้งาน เชิญผู้ดูแล แล้วจึงออกลิงก์/QR</p></article></div>
    <button type="button" className="so-disabled-button" disabled>อนุมัติ / ปฏิเสธ — รอ Server API</button>
  </section>;
}

function SchoolOnboardingPreview() {
  const [tab, setTab] = useState('website');
  if (!LOCAL_PREVIEW) return <main className="so-unavailable" role="alert">หน้านี้เปิดเฉพาะ Vite บนเครื่องนักพัฒนา</main>;
  return <main className="so-page">
    <header className="so-header"><a href="/" aria-label="กลับหน้า English Quest AI"><EnglishQuestLogo size="compact" /></a><span className="so-header-badge"><ShieldCheck size={15} /> LOCAL PREVIEW</span></header>
    <section className="so-hero"><p className="so-eyebrow">ENGLISH QUEST AI · SCHOOL ONBOARDING</p><h1>เริ่มต้นการผจญภัย<br /><span>สำหรับโรงเรียนของคุณ</span></h1><p>หนึ่งระบบรับคำขอ สองช่องทางติดต่อ — เว็บไซต์และ LINE OA ใช้การพิจารณาชุดเดียวกัน</p><div className="so-safety"><Info size={18} /> หน้านี้เป็นต้นแบบในเครื่อง ไม่รับสมัครจริง ไม่ส่งข้อมูล และไม่สร้างบัญชี</div></section>
    <nav className="so-tabs" aria-label="ตัวอย่างช่องทางสมัคร"><button type="button" className={tab === 'website' ? 'active' : ''} aria-current={tab === 'website' ? 'page' : undefined} onClick={() => setTab('website')}><School size={18} /> สมัครผ่านเว็บไซต์</button><button type="button" className={tab === 'line' ? 'active' : ''} aria-current={tab === 'line' ? 'page' : undefined} onClick={() => setTab('line')}><MessageCircle size={18} /> เจ้าหน้าที่ LINE OA</button><button type="button" className={tab === 'review' ? 'active' : ''} aria-current={tab === 'review' ? 'page' : undefined} onClick={() => setTab('review')}><ClipboardList size={18} /> ดูหน้าพิจารณา</button></nav>
    <div className="so-content">{tab === 'website' ? <ApplicationForm key="website" source={APPLICATION_SOURCES.WEBSITE} /> : tab === 'line' ? <ApplicationForm key="line" source={APPLICATION_SOURCES.LINE_ASSISTED} /> : <ReviewPreview />}</div>
    <footer className="so-footer"><span>English Quest AI · School Onboarding Preview</span><a href="/">กลับหน้าหลัก</a></footer>
  </main>;
}

createRoot(document.getElementById('school-onboarding-root')).render(<SchoolOnboardingPreview />);
