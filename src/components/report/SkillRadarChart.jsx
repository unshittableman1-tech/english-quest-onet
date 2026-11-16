import { useMemo } from 'react';
import {
  BookOpen,
  Headphones,
  MessageCircle,
  PenTool,
  Sparkles,
  Zap,
  ClipboardList,
  Compass,
} from 'lucide-react';

const SKILL_AXES = [
  { id: 'vocabulary', name: 'คำศัพท์', english: 'Vocabulary', defaultPct: 40, icon: BookOpen },
  { id: 'reading', name: 'การอ่าน', english: 'Reading', defaultPct: 30, icon: BookOpen },
  { id: 'listening', name: 'การฟัง', english: 'Listening', defaultPct: 35, icon: Headphones },
  { id: 'writing', name: 'การเขียน', english: 'Writing', defaultPct: 20, icon: PenTool },
  { id: 'speaking', name: 'การพูด', english: 'Speaking', defaultPct: 25, icon: MessageCircle },
  { id: 'grammar', name: 'ไวยากรณ์', english: 'Grammar', defaultPct: 30, icon: Zap },
];

export default function SkillRadarChart({ profile = {}, isDemo = false }) {
  const profileSkills = Array.isArray(profile.skills) ? profile.skills : [];
  const withPractice = profileSkills.filter(skill => skill.total > 0 || skill.status === 'practice_only').length;
  const wordAnswers = (profile.wordPractice?.unassisted?.total || 0) + (profile.wordPractice?.assisted?.total || 0);

  // Compute percentage for each of the 6 skills
  const skillsData = useMemo(() => {
    return SKILL_AXES.map((axis, index) => {
      const match = profileSkills.find(s => s.id === axis.id);
      let pct = axis.defaultPct;
      let hasRealData = false;

      if (match && typeof match.percent === 'number' && Number.isFinite(match.percent)) {
        pct = Math.max(10, Math.min(100, match.percent));
        hasRealData = true;
      } else if (!isDemo && withPractice === 0) {
        pct = axis.defaultPct;
      }

      return {
        ...axis,
        index,
        percent: pct,
        hasRealData,
      };
    });
  }, [profileSkills, isDemo, withPractice]);

  // Center & radius
  const cx = 170;
  const cy = 160;
  const maxR = 100;
  const numAxes = 6;

  // Concentric polygon rings (20%, 40%, 60%, 80%, 100%)
  const rings = [0.2, 0.4, 0.6, 0.8, 1.0];

  const getCoordinates = (index, fraction) => {
    const angle = -Math.PI / 2 + index * ((2 * Math.PI) / numAxes);
    const r = maxR * fraction;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  const getRingPoints = (fraction) => {
    return Array.from({ length: numAxes }, (_, i) => {
      const { x, y } = getCoordinates(i, fraction);
      return `${x},${y}`;
    }).join(' ');
  };

  // Data polygon points
  const dataPolygonPoints = skillsData.map(skill => {
    const fraction = Math.max(0.15, Math.min(1.0, skill.percent / 100));
    const { x, y } = getCoordinates(skill.index, fraction);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="report-radar-wrapper">
      <div className="report-radar-container">
        <div className="report-radar-svg-wrap">
          <svg className="report-radar-svg" viewBox="0 0 340 320" aria-label="กราฟประเมินทักษะ 6 ด้าน">
            <defs>
              <linearGradient id="radarPolygonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.25" />
              </linearGradient>
              <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#8b5cf6" floodOpacity="0.3" />
              </filter>
            </defs>

            {/* Background hexagon rings */}
            {rings.map((fraction, idx) => (
              <polygon
                key={idx}
                points={getRingPoints(fraction)}
                fill={idx === 4 ? '#f8faff' : 'none'}
                stroke="#dbeafe"
                strokeWidth={idx === 4 ? '1.5' : '1'}
                strokeDasharray={idx < 4 ? '3 3' : 'none'}
              />
            ))}

            {/* Axis radial lines */}
            {Array.from({ length: numAxes }).map((_, i) => {
              const { x, y } = getCoordinates(i, 1.0);
              return (
                <line
                  key={i}
                  x1={cx}
                  y1={cy}
                  x2={x}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1.2"
                />
              );
            })}

            {/* Data filled polygon */}
            <polygon
              points={dataPolygonPoints}
              fill="url(#radarPolygonGrad)"
              stroke="#7c3aed"
              strokeWidth="2.5"
              filter="url(#radarGlow)"
            />

            {/* Point vertex markers */}
            {skillsData.map((skill) => {
              const fraction = Math.max(0.15, Math.min(1.0, skill.percent / 100));
              const { x, y } = getCoordinates(skill.index, fraction);
              return (
                <g key={skill.id}>
                  <circle cx={x} cy={y} r="5" fill="#fff" stroke="#7c3aed" strokeWidth="2.5" />
                  <circle cx={x} cy={y} r="2" fill="#7c3aed" />
                </g>
              );
            })}
          </svg>

          {/* Skill Labels around the chart */}
          <div className="report-radar-labels" aria-hidden="true">
            {skillsData.map((skill) => {
              const Icon = skill.icon;
              return (
                <div key={skill.id} className={`report-radar-badge axis-${skill.index}`}>
                  <div className="report-radar-badge-icon">
                    <Icon size={14} />
                  </div>
                  <div className="report-radar-badge-text">
                    <span className="badge-name">{skill.name}</span>
                    <span className="badge-eng">({skill.english})</span>
                    <strong className="badge-pct">{skill.percent}%</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Honest EdTech Evidence Caption & Statistics */}
      <div className="report-evidence-overview">
        <div className="report-evidence-counts">
          <div>
            <ClipboardList aria-hidden="true" size={18} />
            <strong>{withPractice} <small>จาก 8 ด้าน</small></strong>
            <span>มีหลักฐานจากการฝึกในระบบ</span>
          </div>
          <div>
            <Compass aria-hidden="true" size={18} />
            <strong>8 <small>ด้าน</small></strong>
            <span>เกณฑ์ประเมินทักษะทั้งหมด</span>
          </div>
        </div>
        <p className="report-evidence-activity">
          <BookOpen size={16} aria-hidden="true" />
          ฝึกด่าน {withPractice} ด้าน · คลังศัพท์ {wordAnswers} คำตอบในเบราว์เซอร์นี้
        </p>
      </div>
    </div>
  );
}
