import UIIcon, { UIIconText } from './UIIcon';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { forceClearAppCache } from '../utils/cacheHelper';
import { playClickSound } from '../utils/audio';

export default function CuteUpdateModal({ isOpen }) {
  const [clearing, setClearing] = useState(false);

  const handleUpdate = async () => {
    if (clearing) return;
    try {
      playClickSound();
    } catch {}
    setClearing(true);

    // Perform SW & Cache clear, then force immediate location.replace
    setTimeout(async () => {
      await forceClearAppCache('student-login');
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-md glass-card border-2 border-amber-300 rounded-3xl p-6 md:p-8 shadow-2xl shadow-amber-200/50 text-center overflow-hidden animate-bounce-in"
        >
          {/* Top glow background */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-300/30 rounded-full blur-2xl pointer-events-none" />

          {/* Icon Hero Graphic */}
          <div className="relative mb-4 inline-block">
            <motion.div
              animate={{
                y: clearing ? [0, -25, 0] : [0, -8, 0],
                rotate: clearing ? [0, 20, -20, 0] : 0
              }}
              transition={{ repeat: Infinity, duration: clearing ? 0.4 : 2, ease: "easeInOut" }}
              className="text-7xl md:text-8xl filter drop-shadow-[0_10px_10px_rgba(245,158,11,0.4)]"
            >
              <UIIconText value={clearing ? '🚀' : '⚡'} />
            </motion.div>
            
            {/* Sparkles */}
            <motion.span
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute -top-2 -right-2 text-2xl"
            >
              <UIIcon value={"✨"} />
            </motion.span>
            <motion.span
              animate={{ scale: [1.3, 1, 1.3], opacity: [1, 0.6, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute -bottom-1 -left-2 text-2xl"
            >
              <UIIcon value={"🌟"} />
            </motion.span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl md:text-3xl font-black text-amber-800 mb-2 drop-shadow-sm">
            {clearing ? 'กำลังเติมพลังระบบ...' : 'ชาร์จพลังก่อนเริ่มเกม!'}
          </h2>

          {/* Body Text */}
          <p className="text-sm md:text-base text-slate-700 font-medium mb-6 leading-relaxed">
            {clearing ? (
              <span className="text-amber-700 font-bold animate-pulse text-base">
                กำลังอัปเดตไฟล์ระบบเวอร์ชันล่าสุดเพื่อเข้าสู่หน้าล็อกอิน...
              </span>
            ) : (
              <>
                กดปุ่มด้านล่างนี้ <span className="text-amber-700 font-bold underline decoration-amber-400">ก่อนเข้าระบบทุกครั้ง</span> เพื่อให้ได้ข้อมูลคะแนน XP และภารกิจล่าสุดของคุณครู! <UIIcon value={"🎒"} /><UIIcon value={"✨"} />
              </>
            )}
          </p>

          {/* Single Main Action Button (No skip button) */}
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleUpdate}
              disabled={clearing}
              className="btn-primary w-full py-4 px-6 text-lg md:text-xl disabled:opacity-75 flex items-center justify-center gap-2"
            >
              <span className="text-2xl"><UIIconText value={clearing ? '🔄' : '🚀'} /></span>
              <span>{clearing ? 'กำลังเข้าสู่หน้าล็อกอิน...' : 'กดเพื่ออัปเดตข้อมูลล่าสุด!'}</span>
            </motion.button>
          </div>

          {/* Footer badge */}
          <div className="mt-6 pt-4 border-t border-amber-200 flex items-center justify-center gap-2 text-xs text-amber-700 font-semibold">
            <span><UIIcon value={"🛡️"} /></span>
            <span>แนะนำกดทุกครั้งที่เข้าเรียนคอมพิวเตอร์</span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
