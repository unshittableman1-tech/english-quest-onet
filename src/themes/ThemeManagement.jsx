import {useState} from 'react';
import {Palette,Check,RotateCcw,ShieldCheck} from 'lucide-react';
import {useTheme} from './ThemeProvider';
import {themeRegistry} from './themeRegistry';
import {canManageThemes} from './themeSettings';
export default function ThemeManagement({actor}){
 const {settings,change,localOnly}=useTheme();const [error,setError]=useState('');
 if(!canManageThemes(actor))return null;
 const act=(type,key)=>{try{change({type,key},actor);setError('');}catch{setError('เปลี่ยนธีมไม่สำเร็จ กรุณาตรวจสิทธิ์และพื้นที่บันทึกของเบราว์เซอร์');}};
 return <section className="theme-manager" aria-labelledby="theme-manager-title">
  <header><div><p className="theme-manager-kicker"><ShieldCheck size={16}/> สำหรับผู้ดูแลแพลตฟอร์ม</p><h2 id="theme-manager-title"><Palette size={26}/> จัดการธีม</h2><p>สลับบรรยากาศการผจญภัย โดยใช้บทเรียนและข้อมูลเดิม</p></div><button type="button" className="theme-action" disabled={!localOnly} onClick={()=>act('activate','classic')}><RotateCcw size={17}/> กลับ Classic</button></header>
  <p className="theme-local-notice" role="status">{localOnly?'รุ่นทดลองบน localhost · บันทึกเฉพาะเบราว์เซอร์นี้ · ยังไม่บันทึกบนเซิร์ฟเวอร์หรือเปลี่ยนธีมของโรงเรียนอื่น':'ยังไม่เปิดการจัดการธีมบนระบบจริง · ใช้ Classic'}</p>
  {error&&<p role="alert">{error}</p>}
  <div className="theme-manager-current">กำลังใช้ <strong>{themeRegistry[settings.activeTheme].name}</strong><span>ค่าเริ่มต้นเมื่อไม่มีธีมที่เลือก: {themeRegistry[settings.defaultTheme].name}</span></div>
  <div className="theme-choice-grid">{Object.values(themeRegistry).map(theme=>{
   const enabled=settings.enabled.includes(theme.key),active=settings.activeTheme===theme.key;
   return <article key={theme.key} className={`theme-choice ${theme.key} ${active?'selected':''}`}>
    <div className="theme-choice-art"><img src={theme.assets.logo} alt=""/>{active&&<span><Check size={15}/> กำลังใช้</span>}<div className="theme-choice-landscape"/></div>
    <div className="theme-choice-body"><h3>{theme.name}</h3><p>{theme.description}</p><p className="theme-availability">{enabled?'พร้อมเลือกใช้':'ปิดการใช้งาน'}{settings.defaultTheme===theme.key?' · ค่าเริ่มต้น':''}</p>
    <div className="theme-choice-actions"><button type="button" disabled={!localOnly||!enabled||active} onClick={()=>act('activate',theme.key)}>ใช้ธีมนี้</button><button type="button" disabled={!localOnly||!enabled||settings.defaultTheme===theme.key} onClick={()=>act('default',theme.key)}>ตั้งเป็นค่าเริ่มต้น</button>{theme.key!=='classic'&&<button type="button" disabled={!localOnly} onClick={()=>act(enabled?'disable':'enable',theme.key)}>{enabled?'ปิดธีม':'เปิดธีม'}</button>}</div></div>
   </article>;
  })}</div>
  <div className="theme-history"><h3>ประวัติการเปลี่ยนธีมบนเครื่องนี้</h3>{!settings.history.length?<p>ยังไม่มีการเปลี่ยนธีม</p>:<ol>{settings.history.slice(0,10).map(row=><li key={row.id}><time>{new Date(row.at).toLocaleString('th-TH')}</time><span>{({activate:'ใช้ธีม',default:'ตั้งค่าเริ่มต้น',enable:'เปิดธีม',disable:'ปิดธีม'})[row.action]} · {themeRegistry[row.key || row.to]?.name || 'Classic'}</span><small>{row.actorId}</small></li>)}</ol>}</div>
  <p className="theme-manager-footnote">รองรับ 2 ธีมในรอบนี้ · การกำหนดรายโรงเรียนและประวัติจากเซิร์ฟเวอร์อยู่ในแผนถัดไป</p>
 </section>;
}
