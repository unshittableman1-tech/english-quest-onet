import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import GameMissionRouter from '../components/games/GameMissionRouter';
import '../index.css';

const mission = {
  id: 'c3_ordering_preview_v1', questId: 'c3_ordering_quest', type: 'rearrange',
  title: 'Ordering Quest', subtitle: 'เรียงคำและเรียงเหตุการณ์', xpReward: 0, previewOnly: true,
  wordSentences: [
    { id: 'ow1', words: ['Where', 'is', 'the', 'school', '?'], correct: 'Where is the school ?' },
    { id: 'ow2', words: ['She', 'is', 'reading', 'a', 'book', '.'], correct: 'She is reading a book .' },
    { id: 'ow3', words: ['They', 'went', 'to', 'the', 'market', 'yesterday', '.'], correct: 'They went to the market yesterday .' },
  ],
  sentences: [
    { id: 'oe1', title: 'Getting ready for school', steps: [
      { id: 'a', text: 'Nida wakes up.' }, { id: 'b', text: 'After waking up, she brushes her teeth.' },
      { id: 'c', text: 'After brushing her teeth, she eats breakfast.' }, { id: 'd', text: 'After breakfast, she goes to school.' },
    ], correctOrder: ['a', 'b', 'c', 'd'] },
    { id: 'oe2', title: 'Planting a seed', steps: [
      { id: 'a', text: 'Dig a small hole.' }, { id: 'b', text: 'Put the seed in the hole.' },
      { id: 'c', text: 'Cover it with soil.' }, { id: 'd', text: 'Water the seed.' },
    ], correctOrder: ['a', 'b', 'c', 'd'] },
  ],
};

function Preview() {
  const [playing, setPlaying] = useState(false);
  if (playing) return <main className="labeling-preview-root"><GameMissionRouter mission={mission} onComplete={async () => setPlaying(false)} onBack={() => setPlaying(false)} /></main>;
  return <main className="labeling-preview-root"><section className="labeling-preview-menu"><h1>Ordering Quest</h1><p>ฝึกเรียงคำเป็นประโยคและเรียงเหตุการณ์ตามลำดับ รวม 5 ข้อในสองกิจกรรม</p><p>Local Staging เท่านั้น · ไม่ให้ XP และไม่บันทึกข้อมูลนักเรียน</p><button type="button" onClick={() => setPlaying(true)}>เริ่มภารกิจทดลอง</button><p><a href="/">กลับ English Quest AI</a></p></section></main>;
}

createRoot(document.getElementById('root')).render(<Preview />);
