import {useState} from 'react';
import ThemeManagement from './ThemeManagement';
import {useTheme} from './ThemeProvider';
import {AppContext} from '../App';
import VocabDrillHub from '../components/VocabDrillHub';
import QuestMap from '../components/QuestMap';
import OnetArena from '../components/OnetArena';
import StudentReport from '../components/StudentReport';
import LandingPage from '../components/LandingPage';
const roles={platform:{role:'super_admin',authVerified:true,user_id:'local-theme-review'},school:{role:'teacher',membership_role:'school_admin',authVerified:true,user_id:'local-school-review'},teacher:{role:'teacher',membership_role:'teacher',authVerified:true,user_id:'local-teacher-review'},student:{role:'student',authVerified:true,user_id:'local-student-review'}};
export default function ThemeReview(){
 const [role,setRole]=useState('platform'),[screen,setScreen]=useState('settings');const {theme}=useTheme();
 const [student,setStudent]=useState({id:'theme-preview-student',name:'นักผจญภัยตัวอย่าง',role:'student',isDemo:true,xp:0,level:1,questProgress:{},badges:[],badgeStats:{},school_id:'local-theme-review',preTest:null});
 const [page,setPage]=useState('map');
 const context={student,setStudent,page,navigate:target=>{setPage(target);setScreen(({map:'quest','vocab-drill':'vocab',report:'progress',arena:'arena'})[target]||'quest');},checkBadges:()=>{},showToast:()=>{},addXP:()=>{},handleLogout:()=>{},onLogout:()=>{},setCurrentQuest:()=>{}};
 return <AppContext.Provider value={context}><div className="theme-review"><div className="theme-review-banner"><strong>ห้องตรวจธีม · localhost เท่านั้น</strong><span>ใช้ข้อมูลตัวอย่าง ไม่ใช่การเข้าสู่ระบบหรือสิทธิ์จาก Backend</span><label>ตรวจบทบาท <select aria-label="ตรวจบทบาท" value={role} onChange={e=>setRole(e.target.value)}><option value="platform">Platform Admin</option><option value="school">School Admin</option><option value="teacher">Teacher</option><option value="student">Student</option></select></label><span>ธีมปัจจุบัน: {theme.name}</span></div>
 <nav className="theme-review-links" aria-label="หน้าตัวอย่างธีม">{[['settings','จัดการธีม'],['landing','หน้าแรก'],['quest','แผนที่เควสต์'],['vocab','คำศัพท์'],['arena','สนามสอบ'],['progress','ผลเรียน']].map(([id,name])=><button key={id} onClick={()=>setScreen(id)}>{name}</button>)}</nav>
 {screen==='settings'&&(role==='platform'?<ThemeManagement actor={roles[role]}/>:<section className="theme-review-stage"><h2>ธีมปัจจุบัน: {theme.name}</h2><p>{role==='school'?'ผู้ดูแลโรงเรียนดูข้อมูลธีมได้ แต่เปลี่ยนธีมไม่ได้':'บทบาทนี้ไม่มีเมนูจัดการธีมในแอปจริง'}</p><ThemeManagement actor={roles[role]}/></section>)}
 {screen==='landing'&&<LandingPage/>}{screen==='quest'&&<QuestMap/>}{screen==='vocab'&&<VocabDrillHub onBack={()=>setScreen('settings')}/>} {screen==='arena'&&<OnetArena student={student} onBack={()=>setScreen('settings')} onSelectMission={()=>{}}/>}{screen==='progress'&&<StudentReport onBack={()=>setScreen('settings')}/>}
 </div></AppContext.Provider>;
}
