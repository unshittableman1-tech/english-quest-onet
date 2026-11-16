import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import GameMissionRouter from '../components/games/GameMissionRouter';
import '../index.css';
import '../styles/theme.css';
import '../styles/labelingLab.css';
import '../styles/graphComparison.css';

function GraphPreview() {
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  if (!import.meta.env.DEV || !['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)) return <p role="alert">หน้านี้ใช้เฉพาะการทดสอบในเครื่อง</p>;
  async function open() {
    setLoading(true); setError('');
    try { const response = await fetch('/__local/graph/mission', { credentials: 'same-origin' }); if (!response.ok) throw new Error('unavailable'); setMission(await response.json()); }
    catch { setError('เปิดชุดทดสอบไม่ได้ กรุณาตรวจว่าใช้ Vite ในเครื่อง'); }
    finally { setLoading(false); }
  }
  return <main className="labeling-preview-root">{mission ? <GameMissionRouter mission={mission} onBack={() => setMission(null)} /> : <section className="labeling-preview-menu"><h1>Graph & Comparison Challenge</h1><p>ฝึกอ่านกราฟ แล้วใช้ข้อมูลเดียวกันฝึกภาษาเปรียบเทียบ รวม 20 ข้อในสองกิจกรรม</p><p>ชุดข้อมูลสังเคราะห์สำหรับทดสอบ ไม่ให้ XP และไม่บันทึกข้อมูลนักเรียน</p><button type="button" disabled={loading} onClick={open}>{loading ? 'กำลังเปิดภารกิจ' : 'เริ่มภารกิจทดลอง'}</button>{error && <p role="alert">{error}</p>}<p><a href="/">กลับ English Quest AI</a></p></section>}</main>;
}
createRoot(document.getElementById('graph-root')).render(<GraphPreview />);
