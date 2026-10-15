import UIIcon, { UIIconText } from './UIIcon';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { forceClearAppCache } from '../utils/cacheHelper';

export default function ClearCacheBtn({ className = '', showBanner = false }) {
  const [clearing, setClearing] = useState(false);

  const handleClick = async () => {
    if (clearing) return;
    setClearing(true);
    setTimeout(async () => {
      await forceClearAppCache();
    }, 600);
  };

  return (
    <>
      <div className={`inline-flex flex-col items-center gap-1 ${className}`}>
        <button
          onClick={handleClick}
          disabled={clearing}
          className="relative group overflow-hidden inline-flex items-center justify-center gap-2 px-4 py-2 text-xs md:text-sm font-bold text-amber-200 bg-gradient-to-r from-amber-500/25 via-orange-500/25 to-yellow-500/25 hover:from-amber-500/40 hover:to-yellow-500/40 active:scale-95 rounded-xl border-2 border-amber-400/80 shadow-lg shadow-amber-500/25 backdrop-blur-md transition-all duration-200 cursor-pointer disabled:opacity-50"
          title="กดปุ่มนี้ ก่อน เข้าระบบ ทุกครั้ง เพื่ออัปเดตระบบเวอร์ชันล่าสุด"
        >
          {/* Subtle pulse ring */}
          <span className="absolute inset-0 rounded-xl bg-amber-400/20 animate-ping opacity-75 pointer-events-none" />

          <motion.span
            animate={{ rotate: clearing ? 360 : 0 }}
            transition={{ repeat: clearing ? Infinity : 0, duration: 1, ease: 'linear' }}
            className="text-base"
          >
            <UIIcon value={"🔄"} />
          </motion.span>

          <span className="relative z-10 text-slate-800 font-extrabold tracking-wide drop-shadow-md">
            {clearing ? 'กำลังอัปเดตระบบ...' : 'ล้างแคช / อัปเดตระบบ'}
          </span>
        </button>

        {showBanner && (
          <span className="text-[11px] font-bold text-amber-300 animate-pulse tracking-wide drop-shadow">
            <UIIcon value={"⚡"} /> กดปุ่มนี้ ก่อน เข้าระบบ ทุกครั้ง <UIIcon value={"⚡"} />
          </span>
        )}
      </div>

      {/* Loading Overlay Modal */}
      <AnimatePresence>
        {clearing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-900 border-2 border-amber-400/50 rounded-2xl p-6 max-w-sm text-center shadow-2xl space-y-4"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="text-3xl"
                  >
                    <UIIcon value={"🔄"} />
                  </motion.span>
                </div>
              </div>
              <h3 className="text-lg font-black text-slate-800">กำลังล้างแคช & อัปเดตระบบ...</h3>
              <p className="text-xs text-amber-200/90 font-medium">
                กำลังอัปเดตข้อมูลล่าสุดจากเซิร์ฟเวอร์ กรุณารอสักครู่...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
