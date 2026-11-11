import UIIcon, { UIIconText } from '../UIIcon';
import React from 'react';

export default function RankingTips({ onOpenModal }) {
  return (
    <section className="ranking-tips">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-black text-amber-800 flex items-center gap-1.5">
          <span className="text-xl"><UIIcon value={"✨"} /></span> วิธีเพิ่มอันดับ
        </h3>
        <button 
          onClick={() => onOpenModal()}
          className="text-xs font-bold text-amber-700 bg-white px-2 py-1 rounded-full hover:bg-amber-100 transition-colors border border-amber-200"
        >
          ดูแรงก์ทั้งหมด ⓘ
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-xl p-2 text-center shadow-sm flex flex-col items-center justify-center border border-slate-100 transition-transform hover:scale-105 cursor-default">
          <div className="text-2xl mb-1"><UIIcon value={"📜"} /></div>
          <div className="text-emerald-600 font-black text-sm">+50 XP</div>
          <div className="text-[10px] text-slate-500 font-bold leading-tight mt-0.5">ทำเควส<br/>ครบ</div>
        </div>
        
        <div className="bg-white rounded-xl p-2 text-center shadow-sm flex flex-col items-center justify-center border border-slate-100 transition-transform hover:scale-105 cursor-default">
          <div className="text-2xl mb-1"><UIIcon value={"🛠️"} /></div>
          <div className="text-sky-600 font-black text-sm">+10 XP</div>
          <div className="text-[10px] text-slate-500 font-bold leading-tight mt-0.5">ตอบถูก<br/>(ต่อ 1 ข้อ)</div>
        </div>
        
        <div className="bg-white rounded-xl p-2 text-center shadow-sm flex flex-col items-center justify-center border border-slate-100 transition-transform hover:scale-105 cursor-default">
          <div className="text-2xl mb-1"><UIIcon value={"🏅"} /></div>
          <div className="text-amber-600 font-black text-sm">+150 XP</div>
          <div className="text-[10px] text-slate-500 font-bold leading-tight mt-0.5">ผ่าน<br/>Final Boss</div>
        </div>
      </div>
    </section>
  );
}
