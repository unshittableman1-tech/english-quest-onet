import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import GameMissionRouter from '../components/games/GameMissionRouter';
import '../index.css';
import '../styles/theme.css';
import '../styles/labelingLab.css';

function LabelingPreview() {
  const [mission, setMission] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const local = import.meta.env.DEV && ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
  if (!local) return <p role="alert">หน้านี้ใช้ได้เฉพาะการทดสอบในเครื่อง</p>;
  async function open(id) {
    setLoading(true); setError('');
    try {
      const response = await fetch(`/__local/labeling/mission?id=${id}`, { credentials: 'same-origin' });
      if (!response.ok) throw new Error('preview_unavailable');
      setMission(await response.json());
    } catch { setError('เปิดชุดทดสอบไม่ได้ กรุณาตรวจว่าใช้ Vite ในเครื่อง'); }
    finally { setLoading(false); }
  }
  return <main className="labeling-preview-root">{mission
    ? <GameMissionRouter mission={mission} onBack={() => setMission(null)} />
    : <section className="labeling-preview-menu"><h1>Labeling Lab</h1><p>ชุดทดสอบสังเคราะห์ในเครื่อง ยังไม่ใช่เนื้อหาที่ครูรับรอง ไม่บันทึกข้อมูลนักเรียนหรือให้ XP</p><button type="button" disabled={loading} onClick={() => open('labeling_classroom_preview_v1')}>School & Classroom</button><button type="button" disabled={loading} onClick={() => open('labeling_duplicate_preview_v1')}>คำซ้ำ — ชุดทดสอบ</button>{loading && <p role="status">กำลังเปิดชุดทดสอบ</p>}{error && <p role="alert">{error}</p>}<p style={{ marginTop: 20 }}><a href="/">กลับ English Quest AI</a></p></section>}</main>;
}

createRoot(document.getElementById('labeling-root')).render(<LabelingPreview />);
