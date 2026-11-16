import { useEffect, useState } from 'react';
import { fetchTeacherArenaProgress } from '../../utils/arenaProgress';
import { arenaModeName } from '../report/ArenaProgress';

export default function TeacherArenaProgress({actor,schoolId,students=[]}) {
 const [revision,setRevision]=useState(0),[load,setLoad]=useState({key:null,status:'loading',snapshot:null});
 const key=JSON.stringify([actor?.user_id,actor?.role,actor?.membership_role,actor?.authVerified,schoolId]);
 useEffect(()=>{let active=true;setLoad({key,status:'loading',snapshot:null});
  fetchTeacherArenaProgress(actor,schoolId).then(snapshot=>{if(active)setLoad({key,status:'ready',snapshot});})
   .catch(error=>{if(active)setLoad({key,status:error.code==='arena_sync_blocked'?'blocked':'error',snapshot:null});});
  return()=>{active=false;};
 },[key,revision]);
 const snapshot=load.key===key?load.snapshot:null;
 const roster=new Map(students.map(s=>[s.id,s]));
 const rows=(snapshot?.attempts || []).filter(row=>roster.has(row.studentId));
 return <section className="glass-card-dark p-5 space-y-3" aria-labelledby="teacher-arena-progress-title">
  <h3 id="teacher-arena-progress-title" className="font-bold text-lg">สนามสอบ · ผลที่ระบบได้รับ</h3>
  <p>อ่านจากแหล่งเดียวกับหน้าผลเรียนของนักเรียน แสดงตามรายชื่อห้องที่เลือก แยกผลฝึกจากอุปกรณ์กับผลตรวจโดยเซิร์ฟเวอร์</p>
  <button type="button" className="btn-primary" onClick={()=>setRevision(v=>v+1)}>โหลดผลสนามสอบล่าสุด</button>
  {!snapshot&&<p role={load.status==='loading'?'status':'alert'}>{load.key!==key||load.status==='loading'?'กำลังตรวจสิทธิ์และโหลดผล…':load.status==='blocked'?'ยังไม่เปิดตัวอ่านผลสนามสอบบนระบบ':'โหลดผลไม่ได้หรือไม่มีสิทธิ์อ่านโรงเรียนนี้ ไม่แสดงเป็นคะแนนศูนย์'}</p>}
  {snapshot&&<><p>พบผลที่บันทึกแล้ว {rows.length} รอบ{snapshot.truncated?' · แสดงเฉพาะ 1,000 รอบล่าสุดของโรงเรียน':''}</p>
   {!rows.length?<p>ยังไม่มีผลที่ระบบได้รับสำหรับรายชื่อที่เลือก</p>:<div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr><th>นักเรียน</th><th>สนาม / รุ่น</th><th>ผล</th><th>เวลาได้รับ</th><th>แหล่งคะแนน</th></tr></thead><tbody>{rows.map(row=><tr key={`${row.studentId}:${row.attemptId}`}>
    <td>{roster.get(row.studentId)?.name || row.studentId}</td><td>{arenaModeName(row.mode)}<br/>{row.version}</td>
    <td>{row.score}/{row.total} · {Math.round(row.percent)}%</td><td>{new Intl.DateTimeFormat('th-TH',{timeZone:'Asia/Bangkok',dateStyle:'medium',timeStyle:'short'}).format(new Date(row.receivedAt))}</td>
    <td>{row.grading==='server'?'เซิร์ฟเวอร์ตรวจ':'อุปกรณ์รายงาน'}</td>
   </tr>)}</tbody></table></div>}</>}
 </section>;
}
