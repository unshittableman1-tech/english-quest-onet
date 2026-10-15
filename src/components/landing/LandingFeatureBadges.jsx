import { Target, RotateCcw, ChartNoAxesCombined } from 'lucide-react';

const features = [
  { Icon: Target, text: 'O-NET Blueprint', color: 'text-sky-700' },
  { Icon: RotateCcw, text: 'ทบทวนข้อผิด', color: 'text-rose-600' },
  { Icon: ChartNoAxesCombined, text: 'รายงานสำหรับครู', color: 'text-emerald-700' },
];

export default function LandingFeatureBadges() {
  return (
    <ul className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-10 gap-y-4">
      {features.map(({ Icon, text, color }) => <li key={text} className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Icon size={18} className={color} aria-hidden="true" />{text}</li>)}
    </ul>
  );
}
