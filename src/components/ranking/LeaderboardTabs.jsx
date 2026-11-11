import UIIcon, { UIIconText } from '../UIIcon';
import React from 'react';

const TABS = [
  { id: 'overall', label: 'Overall', icon: '🏆' },
  { id: 'growth', label: 'Growth', icon: '🚀' },
  { id: 'accuracy', label: 'Accuracy', icon: '🎯' },
  { id: 'streak', label: 'Streak', icon: '🔥' },
  { id: 'mistakes', label: 'Mistake Fix', icon: '🛠️' },
  { id: 'skill', label: 'Skill', icon: '⚔️' },
  { id: 'fastguess', label: 'กดมั่ว', icon: '⚠️' },
];

export default function LeaderboardTabs({ activeTab, setActiveTab }) {
  return (
    <div className="ranking-tabs hide-scrollbar" role="tablist" aria-label="ประเภทอันดับ">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`ranking-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={isActive}
            aria-controls="ranking-results"
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-full font-bold whitespace-nowrap snap-start transition-all text-sm border
              ${isActive 
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-md border-amber-300' 
                : 'bg-white text-slate-600 hover:bg-amber-50 border-slate-200 hover:border-amber-300'}
            `}
          >
            <span><UIIcon value={tab.icon} /></span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
