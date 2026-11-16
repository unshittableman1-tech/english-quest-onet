import React from 'react';

const frame = { display: 'block', width: 'min(100%, 320px)', margin: '12px auto', borderRadius: 14, background: '#f1f9ff', border: '1px solid #c7deee' };

export default function Chapter5DemoVisual({ demo, isExam, questId, questionId }) {
  if (demo !== true || isExam !== false) return null;
  if (questId === 'adjectives_comp' && questionId === 'adjectives_comp_context_04') return (
    <svg style={frame} viewBox="0 0 320 150" role="img" aria-label="ดินสอสีแดงและสีน้ำเงินยาวเท่ากัน">
      <rect x="20" y="38" width="245" height="23" rx="5" fill="#dc4962" />
      <polygon points="265,38 295,49.5 265,61" fill="#d5a77a" /><polygon points="286,46 295,49.5 286,53" fill="#263445" />
      <rect x="20" y="89" width="245" height="23" rx="5" fill="#3186cc" />
      <polygon points="265,89 295,100.5 265,112" fill="#d5a77a" /><polygon points="286,97 295,100.5 286,104" fill="#263445" />
    </svg>
  );
  if (questId === 'adjectives_comp' && questionId === 'adjectives_comp_context_08') return (
    <svg style={frame} viewBox="0 0 320 145" role="img" aria-label="กล่องสีฟ้าหนัก 5 กิโลกรัมและกล่องสีแดงหนัก 5 กิโลกรัม">
      <rect x="35" y="25" width="105" height="90" rx="10" fill="#3186cc" /><rect x="180" y="25" width="105" height="90" rx="10" fill="#dc4962" />
      <text x="87.5" y="78" fill="white" fontSize="22" fontWeight="bold" textAnchor="middle">5 kg</text><text x="232.5" y="78" fill="white" fontSize="22" fontWeight="bold" textAnchor="middle">5 kg</text>
    </svg>
  );
  if (questId === 'nature_environment' && questionId === 'nature_environment_context_02') return (
    <svg style={frame} viewBox="0 0 320 160" role="img" aria-label="ถังขยะติดป้าย PAPER">
      <path d="M86 39 H234 L221 145 H99 Z" fill="#2984bb" stroke="#16527b" strokeWidth="4" />
      <rect x="78" y="25" width="164" height="17" rx="8" fill="#16527b" /><rect x="108" y="72" width="104" height="38" rx="6" fill="white" />
      <text x="160" y="98" fill="#123b58" fontSize="23" fontWeight="bold" textAnchor="middle">PAPER</text>
    </svg>
  );
  if (questId === 'school_subjects' && questionId === 'school_subjects_context_07') return (
    <figure style={{ ...frame, padding: '12px', color: '#173b58' }}>
      <figcaption style={{ fontWeight: 700, marginBottom: 8 }}>Timetable</figcaption>
      <table style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left' }}><thead><tr><th scope="col">Time</th><th scope="col">Subject</th></tr></thead><tbody><tr><td>10:00–11:00</td><td>Music</td></tr></tbody></table>
    </figure>
  );
  return null;
}
