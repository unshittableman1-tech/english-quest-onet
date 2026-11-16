import useArenaProgress from '../../hooks/useArenaProgress';
import { canSyncArena, buildArenaProgressOverview } from '../../utils/arenaProgress';
export default function ArenaDeliveryStatus({student,attemptId}) {
 const progress=useArenaProgress(student);
 if(!canSyncArena(student))return <p>ผลทดลองบนเครื่อง · ไม่ส่งเป็นผลนักเรียนจริง</p>;
 const row=buildArenaProgressOverview(progress.snapshot,progress.queue).attempts.find(a=>a.attemptId===attemptId);
 return <section className="p-4 rounded-xl border border-sky-200 bg-white/90 text-slate-800" aria-label="สถานะส่งผลให้ครู">
  <strong>{progress.storageError?'บันทึกคิวไม่ได้ · อย่าปิดหน้านี้':row?.syncState==='synced'?'บันทึกบนระบบแล้ว':row?.syncState==='conflict'?'ข้อมูลขัดกัน · ติดต่อครู':row?.lastError?'ส่งผลไม่สำเร็จ · เก็บคิวไว้ลองใหม่':row?'รอส่งผล':'ยังไม่มีหลักฐานยืนยันการส่งผล'}</strong>
  <p>ครูอ่านผลจากแหล่งเดียวกันเมื่อบันทึกสำเร็จ สถานะนี้ไม่ได้หมายความว่าครูเปิดอ่านแล้ว</p>
  <button type="button" className="metric-action-btn" onClick={progress.retry}>ลองส่งผลและตรวจใหม่</button>
 </section>;
}
