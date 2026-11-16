import { buildArenaProgressOverview } from '../../utils/arenaProgress';
import { ARENA_MISSIONS } from '../../data/chapter4_config';
import { Trophy } from 'lucide-react';

export const arenaModeName = mode => ARENA_MISSIONS.find(m=>m.id===mode)?.name || ({final_exam:'สอบปลายภาค',chapter2_boss:'สนามสอบบทที่ 2',strategy_boss:'สนามสอบกลยุทธ์',finalboss:'สนามสอบบทที่ 4'}[mode]) || mode;
const when=value=>new Intl.DateTimeFormat('th-TH',{timeZone:'Asia/Bangkok',dateStyle:'medium',timeStyle:'short'}).format(new Date(value));
const syncLabel=row=>row.syncState==='synced'?'บันทึกบนระบบแล้ว':row.syncState==='conflict'?'ข้อมูลขัดกัน · ติดต่อครู':row.lastError?'ส่งไม่สำเร็จ · รอลองใหม่':'รอส่งผล';

export function ArenaProgressCard({progress,preResult,navigate}) {
 const model=buildArenaProgressOverview(progress.snapshot,progress.queue),last=model.latest;
 return <div className="overview-metric-card metric-test" data-arena-progress={progress.status}>
  <div className="metric-icon-wrap bg-purple-100 text-purple-600"><Trophy size={20} aria-hidden="true"/></div>
  <span className="metric-title">สนามสอบ</span>
  <strong className="metric-value">{last?`${last.score}/${last.total} ข้อ`:'—'}</strong>
  <p className="metric-sub">{last?`${arenaModeName(last.mode)} · ${Math.round(last.percent)}%`:progress.status==='loading'?'กำลังโหลดผลสอบ…':progress.status==='error'?'ยังโหลดผลไม่ได้':progress.status==='blocked'?'ยังไม่เปิดการเชื่อมผลสอบ':'ยังไม่มีผลสอบในข้อมูลที่อ่านได้'}</p>
  {last&&<p className="metric-sub">{syncLabel(last)} · {when(last.submittedAt)}</p>}
  <p className="metric-sub">ก่อนเรียน: {preResult.percent===null?'ยังไม่มีผล':`${preResult.score??'—'}/${preResult.total??'—'} ข้อ · ${preResult.percent}%`}</p>
  <button type="button" className="metric-action-btn" onClick={()=>navigate('arena')}>เข้าสนามสอบ</button>
  <button type="button" className="metric-action-btn" onClick={()=>document.getElementById('arena-progress-history')?.scrollIntoView({behavior:'smooth',block:'start'})}>ดูผลย้อนหลัง</button>
 </div>;
}

export function ArenaProgressHistory({progress}) {
 const model=buildArenaProgressOverview(progress.snapshot,progress.queue);
 return <section id="arena-progress-history" className="report-section report-exams" aria-labelledby="arena-progress-title">
  <div className="report-section-heading"><h2 id="arena-progress-title">สนามสอบ · ผลที่ส่งถึงระบบ</h2></div>
  <p>ผลฝึกเดิมที่อุปกรณ์ตรวจคะแนนแยกจากผลที่เซิร์ฟเวอร์ตรวจ การบันทึกสำเร็จไม่ได้หมายความว่าครูเปิดอ่านแล้ว</p>
  {progress.status==='loading'&&<p role="status">กำลังตรวจผลที่บันทึกบนระบบ…</p>}
  {progress.status==='blocked'&&<p role="alert">ยังไม่เปิดตัวเชื่อมผลสอบบนระบบ · เก็บรายการรอส่งไว้บนอุปกรณ์นี้</p>}
  {progress.status==='error'&&<p role="alert">ยังโหลดผลจากระบบไม่ได้ ผลที่แสดงอาจไม่ครบ</p>}
  {progress.storageError&&<p role="alert">อ่านหรือบันทึกคิวส่งผลบนเครื่องนี้ไม่ได้ กรุณาอย่าปิดหน้าและติดต่อครู</p>}
  <p>รอส่ง {model.pending} รอบ · ข้อมูลขัดกัน {model.conflicts} รอบ · แสดง {model.attempts.length} รอบ{model.truncated?'ล่าสุด (ประวัติมากกว่าที่แสดง)':''}</p>
  <button type="button" className="metric-action-btn" onClick={progress.retry}>ลองส่งผลและโหลดใหม่</button>
  {!model.attempts.length&&progress.status==='ready'&&<p>ยังไม่มีรอบสอบที่บันทึกบนระบบ</p>}
  <ul className="report-exam-list">{model.attempts.map(row=><li className="report-exam-row" key={row.attemptId}>
   <div><strong>{arenaModeName(row.mode)}</strong><p>{when(row.submittedAt)} · รุ่น {row.version}</p>
    <p>{row.grading==='server'?'ตรวจคะแนนโดยเซิร์ฟเวอร์':'ผลฝึกที่อุปกรณ์รายงาน'} · {syncLabel(row)}</p></div>
   <b>{row.score}/{row.total} ข้อ · {Math.round(row.percent)}%</b>
  </li>)}</ul>
  <p className="report-comparison-note">ยังไม่รวมคะแนนต่างชุดเป็นค่าเฉลี่ยหรือสรุปผลต่างเป็นพัฒนาการ</p>
 </section>;
}
