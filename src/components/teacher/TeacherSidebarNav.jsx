import { LayoutDashboard, Users, ChartNoAxesCombined, GraduationCap, TriangleAlert, Trophy, ClipboardCheck, Brain } from 'lucide-react';

const GROUPS = [
  { label: 'ห้องเรียน', ids: ['overview', 'table', 'warning'] },
  { label: 'วิเคราะห์ผล', ids: ['skills', 'strategy', 'ranking'] },
  { label: 'การสอบ', ids: ['final_exam', 'arena'] },
];
const ICONS = { overview: LayoutDashboard, table: Users, skills: ChartNoAxesCombined, final_exam: GraduationCap, warning: TriangleAlert, ranking: Trophy, arena: ClipboardCheck, strategy: Brain };

export default function TeacherSidebarNav({ items, activeTab, onChange }) {
  return (
    <nav aria-label="เมนูครู" className="space-y-5">
      {GROUPS.map(group => <div key={group.label}>
        <p className="mb-2 px-3 text-[11px] font-semibold text-slate-500">{group.label}</p>
        <div className="space-y-1">{group.ids.map(id => {
          const item = items.find(i => i.id === id);
          const Icon = ICONS[id];
          if (!item) return null;
          const active = activeTab === id;
          return <button key={id} onClick={() => onChange(id)} aria-current={active ? 'page' : undefined} title={item.desc} className={`flex min-h-10 w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors ${active ? 'bg-sky-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <span className="flex min-w-0 items-center gap-2.5"><Icon size={17} className="shrink-0" aria-hidden="true" /><span>{item.label}</span></span>
            {item.badge && <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${item.badgeColor || 'bg-slate-700 text-white'}`} aria-label={id === 'warning' ? `นักเรียนที่ต้องติดตาม ${item.badge} คน` : item.badge}>{item.badge}</span>}
          </button>;
        })}</div>
      </div>)}
    </nav>
  );
}
