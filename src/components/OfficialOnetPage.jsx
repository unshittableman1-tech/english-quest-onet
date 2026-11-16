import OfficialOnetExam from './OfficialOnetExam';
import {ONET_2569,onetReviewKey} from '../data/onet2569Metadata';
import '../styles/officialOnet.css';

// Separate exam destination; normal accounts never receive private review access.
export default function OfficialOnetPage({student,onBack}){
 const key=student?.isDemo?onetReviewKey():null;
 if(key)return <OfficialOnetExam reviewKey={key} onBack={onBack}/>;
 return <section className="official-exam"><button type="button" onClick={onBack}>← กลับสนามสอบ</button><h1>{ONET_2569.name}</h1><p>32 ข้อ · 100 คะแนน · 60 นาที</p><p role="status">ยังไม่เปิดสอบจริงในระบบ</p></section>;
}
