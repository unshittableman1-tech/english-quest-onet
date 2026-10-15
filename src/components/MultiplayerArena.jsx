import UIIcon, { UIIconText } from './UIIcon';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../App';
import confetti from 'canvas-confetti';
import { supabase } from '../utils/supabase';
import { playCorrectSound, playWrongSound } from '../utils/audio';
import { miniMockPool, speedMockPool } from '../data/chapter4_questions';
import { getQuestionTranslation } from '../utils/questionTranslator';
import { useSpeech } from '../utils/useSpeech';

// คลังข้อสอบจริง O-NET สำหรับ Raid
const COMBINED_QUESTIONS = [...miniMockPool, ...speedMockPool];

export default function MultiplayerArena() {
  const { navigate, student, addXP } = useApp();
  const { speak } = useSpeech();

  // Mode: 'menu' | 'solo' | 'host' | 'client'
  const [gameMode, setGameMode] = useState('menu');

  // Phase: 'lobby' | 'countdown' | 'battle' | 'victory'
  const [phase, setPhase] = useState('lobby');

  // Room State
  const [roomCode, setRoomCode] = useState('8899');
  const [pinInput, setPinInput] = useState('');
  const [playerName, setPlayerName] = useState(student?.name || 'นักเรียน');
  const [players, setPlayers] = useState([]); // [{ id, name, damage }]
  const [liveLog, setLiveLog] = useState([]); // [{ id, text, time }]

  // Boss & Combat State
  const [bossHp, setBossHp] = useState(3000);
  const [maxHp, setMaxHp] = useState(3000);
  const [combo, setCombo] = useState(0);
  const [floatingDamage, setFloatingDamage] = useState(null);
  const [bossShake, setBossShake] = useState(false);
  const [myTotalDamage, setMyTotalDamage] = useState(0);

  // Question State
  const [qIndex, setQIndex] = useState(0);
  const [feedback, setFeedback] = useState(null); // { isCorrect, explanation, translation }
  const [answeredCooldown, setAnsweredCooldown] = useState(false);

  // Supabase Channel & BroadcastChannel
  const channelRef = useRef(null);
  const broadcastRef = useRef(null);

  // สุ่มข้อสอบให้แต่ละรอบไม่ซ้ำกัน
  const randomizedQuestions = useMemo(() => {
    return [...COMBINED_QUESTIONS].sort(() => Math.random() - 0.5);
  }, [gameMode]);

  const currentQ = randomizedQuestions[qIndex % randomizedQuestions.length];

  // ─────────────────────────────────────────────────────────────
  // 1. REALTIME NETWORKING (Supabase Broadcast + BroadcastChannel)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameMode !== 'host' && gameMode !== 'client') return;

    const channelName = `raid_room_${roomCode}`;

    // 1. BroadcastChannel (Local browser sync across tabs)
    try {
      broadcastRef.current = new BroadcastChannel(channelName);
      broadcastRef.current.onmessage = (e) => handleNetworkMessage(e.data);
    } catch {
      // BroadcastChannel not supported in some older environments
    }

    // 2. Supabase Realtime Channel
    if (supabase) {
      const sbChannel = supabase.channel(channelName, {
        config: { broadcast: { self: false } }
      });

      sbChannel
        .on('broadcast', { event: 'raid_event' }, ({ payload }) => {
          handleNetworkMessage(payload);
        })
        .subscribe();

      channelRef.current = sbChannel;
    }

    return () => {
      if (broadcastRef.current) {
        broadcastRef.current.close();
      }
      if (channelRef.current && supabase) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [gameMode, roomCode]);

  // ส่งข้อความ Realtime ไปยังทุกคนในห้อง
  const sendNetworkMessage = (msg) => {
    if (broadcastRef.current) {
      try { broadcastRef.current.postMessage(msg); } catch {}
    }
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'raid_event',
        payload: msg
      }).catch(() => {});
    }
  };

  // จัดการข้อความที่ได้รับจากเครือข่าย
  const handleNetworkMessage = (msg) => {
    if (!msg || !msg.type) return;

    // A. นักเรียนขอเข้าห้อง (Host ได้รับ)
    if (msg.type === 'PLAYER_JOIN' && gameMode === 'host') {
      setPlayers(prev => {
        if (prev.some(p => p.id === msg.player.id)) return prev;
        const updated = [...prev, msg.player];
        // Host ส่งรายชื่อผู้เล่นกลับไปซิงก์
        sendNetworkMessage({ type: 'SYNC_PLAYERS', players: updated });
        return updated;
      });
      addLog(`👋 ${msg.player.name} เข้าสู่ห้องแล้ว!`);
    }

    // B. อัปเดตรายชื่อผู้เล่น (Client ได้รับ)
    if (msg.type === 'SYNC_PLAYERS' && gameMode === 'client') {
      setPlayers(msg.players);
    }

    // C. เริ่มการต่อสู้ (Client ได้รับคำสั่งจาก Host)
    if (msg.type === 'START_BATTLE') {
      setMaxHp(msg.maxHp || 10000);
      setBossHp(msg.maxHp || 10000);
      setPhase('countdown');
      setTimeout(() => setPhase('battle'), 3000);
    }

    // D. มีคนทำดาเมจใส่บอส (Host & Client ได้รับ)
    if (msg.type === 'DEAL_DAMAGE') {
      const dmg = msg.damage || 500;
      setBossHp(hp => {
        const nextHp = Math.max(0, hp - dmg);
        if (nextHp <= 0) {
          triggerVictory();
        }
        return nextHp;
      });

      setPlayers(prev => prev.map(p => 
        p.id === msg.playerId ? { ...p, damage: (p.damage || 0) + dmg } : p
      ));

      addLog(`💥 ${msg.playerName} โจมตีมังกร ${dmg} DMG!`);
      triggerBossHitAnimation(dmg);
    }

    // E. บอสพ่ายแพ้
    if (msg.type === 'VICTORY') {
      triggerVictory();
    }
  };

  const addLog = (text) => {
    setLiveLog(prev => [{ id: Date.now() + Math.random(), text }, ...prev].slice(0, 5));
  };

  const triggerBossHitAnimation = (dmg) => {
    setBossShake(true);
    setFloatingDamage(`-${dmg}`);
    setTimeout(() => setBossShake(false), 400);
    setTimeout(() => setFloatingDamage(null), 1200);
  };

  const triggerVictory = () => {
    setPhase('victory');
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    if (addXP) addXP(100);
  };

  // ─────────────────────────────────────────────────────────────
  // 2. GAME LOGIC: SOLO & MULTIPLAYER
  // ─────────────────────────────────────────────────────────────
  const startSoloGame = () => {
    setGameMode('solo');
    setMaxHp(3000);
    setBossHp(3000);
    setCombo(0);
    setMyTotalDamage(0);
    setQIndex(0);
    setPhase('battle');
  };

  const createHostRoom = () => {
    const code = String(Math.floor(1000 + Math.random() * 9000));
    setRoomCode(code);
    setGameMode('host');
    setPlayers([]);
    setPhase('lobby');
  };

  const startHostBattle = () => {
    // ปรับ HP มังกรตามจำนวนนักเรียนจริง (คนละ 1,200 HP, ขั้นต่ำ 5,000 HP)
    const calculatedHp = Math.max(5000, players.length * 1500);
    setMaxHp(calculatedHp);
    setBossHp(calculatedHp);
    sendNetworkMessage({ type: 'START_BATTLE', maxHp: calculatedHp });
    setPhase('countdown');
    setTimeout(() => setPhase('battle'), 3000);
  };

  const joinClientRoom = () => {
    if (!pinInput.trim()) return alert('กรุณากรอกรหัสห้อง (PIN)');
    setRoomCode(pinInput.trim());
    setGameMode('client');
    setPhase('lobby');

    const myId = 'p_' + Date.now();
    const myPlayer = { id: myId, name: playerName.trim() || 'Hero', damage: 0 };
    setPlayers([myPlayer]);

    // ส่งสัญญาณว่าเข้าร่วมห้อง
    setTimeout(() => {
      sendNetworkMessage({ type: 'PLAYER_JOIN', player: myPlayer });
    }, 500);
  };

  // เมื่อผู้เล่นกดตอบคำถาม
  const handleAnswer = (choiceIdx) => {
    if (answeredCooldown || phase !== 'battle') return;

    const isCorrect = choiceIdx === currentQ.answer;

    if (isCorrect) {
      playCorrectSound();
      const currentCombo = combo + 1;
      setCombo(currentCombo);

      // คำนวณดาเมจ: พื้นฐาน 500 + โบนัสคอมโบ 100
      const dmg = 500 + (currentCombo - 1) * 100;
      setMyTotalDamage(prev => prev + dmg);

      if (gameMode === 'solo') {
        // โหมดเดี่ยว: หักเลือดมังกรโดยตรง
        setBossHp(hp => {
          const next = Math.max(0, hp - dmg);
          if (next <= 0) triggerVictory();
          return next;
        });
        triggerBossHitAnimation(dmg);
      } else {
        // โหมด Co-op: ยิง Broadcast ส่งให้ทุกคนในห้อง
        sendNetworkMessage({
          type: 'DEAL_DAMAGE',
          playerId: student?.id || 'me',
          playerName: playerName || student?.name || 'Hero',
          damage: dmg
        });
        triggerBossHitAnimation(dmg);
      }

      // ไปข้อต่อไปทันที
      setFeedback(null);
      setQIndex(prev => prev + 1);
    } else {
      playWrongSound();
      setCombo(0); // ล้างคอมโบ

      const thaiTrans = getQuestionTranslation(currentQ);
      const explain = currentQ.correctFeedback || currentQ.wrongFeedback || 'คำตอบที่ถูกต้องคือ ' + currentQ.options[currentQ.answer];

      setFeedback({
        isCorrect: false,
        explanation: explain,
        translation: thaiTrans
      });

      // อ่านเสียงภาษาไทยอัตโนมัติ
      speak(thaiTrans ? `แปลโจทย์: ${thaiTrans}. ${explain}` : explain);

      // คูลดาวน์ 2.5 วินาทีเพื่อให้หยุดอ่านเฉลย
      setAnsweredCooldown(true);
      setTimeout(() => {
        setAnsweredCooldown(false);
        setFeedback(null);
        setQIndex(prev => prev + 1);
      }, 2800);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 3. RENDER: MAIN SELECTION MENU
  // ─────────────────────────────────────────────────────────────
  if (gameMode === 'menu') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col p-4 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <button onClick={() => navigate('map')} className="text-slate-400 hover:text-white text-xl"><UIIcon value={"←"} /> กลับ</button>
          <div className="flex-1">
            <h2 className="text-amber-400 font-black text-xl"><UIIcon value={"⚔️"} /> World Boss Raid</h2>
            <p className="text-slate-400 text-xs">โหมดท้าทายบอสมังกรภาษาอังกฤษ O-NET</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full relative z-10 space-y-5">
          <div className="text-center mb-2">
            <div className="text-7xl mb-3 animate-bounce"><UIIcon value={"🐉"} /></div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-red-500">
              The Logic Dragon
            </h1>
            <p className="text-slate-400 text-sm mt-1">เลือกรูปแบบการต่อสู้ที่ต้องการ</p>
          </div>

          {/* ปุ่ม 1: เล่นคนเดียว (Solo Boss Challenge) */}
          <button
            onClick={startSoloGame}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 p-5 rounded-2xl border-2 border-amber-300 text-slate-950 font-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-left flex items-center gap-4"
          >
            <span className="text-4xl bg-amber-400/40 p-2.5 rounded-xl shrink-0"><UIIcon value={"🛡️"} /></span>
            <div>
              <div className="text-lg text-white font-extrabold">1. ลุยเดี่ยว (Solo Challenge)</div>
              <div className="text-amber-100 text-xs font-normal">สู้บอสด้วยตัวเอง เลือดมังกรลดเฉพาะตอนตอบถูกจริงเท่านั้น</div>
            </div>
          </button>

          {/* ปุ่ม 2: ครูสร้างห้อง (Host / Projector) */}
          <button
            onClick={createHostRoom}
            className="w-full bg-slate-900 hover:bg-slate-800/90 p-5 rounded-2xl border-2 border-indigo-500/50 hover:border-indigo-400 font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-left flex items-center gap-4"
          >
            <span className="text-4xl bg-indigo-500/20 p-2.5 rounded-xl shrink-0"><UIIcon value={"👑"} /></span>
            <div>
              <div className="text-lg text-indigo-300 font-extrabold">2. คุณครูเปิดห้อง (Projector View)</div>
              <div className="text-slate-400 text-xs font-normal">ฉายจอใหญ่หน้าห้อง เพื่อให้นักเรียนทั้งห้องช่วยกันตีบอสพร้อมกัน</div>
            </div>
          </button>

          {/* ปุ่ม 3: นักเรียนเข้าร่วมด้วย PIN */}
          <div className="w-full bg-slate-900 p-5 rounded-2xl border-2 border-sky-500/40 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl bg-sky-500/20 p-2 rounded-xl"><UIIcon value={"📱"} /></span>
              <div>
                <div className="text-base text-sky-300 font-extrabold">3. นักเรียนเข้าร่วมห้อง (Join PIN)</div>
                <div className="text-slate-400 text-xs">กรอกรหัสห้องจากจอคุณครูเพื่อเข้าต่อสู้</div>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="กรอกรหัส PIN (เช่น 8899)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.toUpperCase())}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-center font-mono font-bold tracking-widest text-amber-300 focus:outline-none focus:border-sky-400"
              />
              <button
                onClick={joinClientRoom}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-6 py-2.5 rounded-xl transition-all active:scale-95 shadow-md"
              >
                เข้าห้อง <UIIcon value={"🚀"} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 4. RENDER: HOST LOBBY (จอโปรเจกเตอร์รอเด็ก)
  // ─────────────────────────────────────────────────────────────
  if (gameMode === 'host' && phase === 'lobby') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col p-6 items-center justify-between">
        <div className="w-full flex justify-between items-center max-w-4xl">
          <button onClick={() => setGameMode('menu')} className="text-slate-400 hover:text-white"><UIIcon value={"←"} /> ยกเลิกห้อง</button>
          <span className="text-indigo-400 font-bold text-sm bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/30">
            <UIIcon value={"👑"} /> คุณครูกำลังสร้างห้อง (Host View)
          </span>
        </div>

        <div className="text-center space-y-3 my-auto">
          <p className="text-slate-400 uppercase tracking-widest text-sm font-bold">ให้นักเรียนกรอกรหัสเข้าร่วมที่อุปกรณ์ของตนเอง</p>
          <div className="inline-block bg-slate-900 border-4 border-amber-400 rounded-3xl px-12 py-6 shadow-2xl animate-pulse">
            <span className="text-slate-400 text-lg block mb-1">รหัสห้อง (ROOM PIN)</span>
            <span className="text-6xl font-black font-mono tracking-widest text-amber-400">{roomCode}</span>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-bold text-slate-300 mb-3">
              ผู้เล่นที่เข้าร่วมแล้ว: <span className="text-emerald-400 font-extrabold">{players.length} คน</span>
            </h3>
            <div className="flex flex-wrap justify-center gap-2 max-w-2xl min-h-[60px] p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
              {players.length === 0 ? (
                <span className="text-slate-500 text-sm italic my-auto">รออุปกรณ์ของนักเรียนเชื่อมต่อเข้ามา...</span>
              ) : (
                players.map((p, i) => (
                  <span key={i} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-full font-bold text-emerald-300 text-sm animate-scale-in">
                    <UIIcon value={"⚔️"} /> {p.name}
                  </span>
                ))
              )}
            </div>
          </div>

          <button
            onClick={startHostBattle}
            disabled={players.length === 0}
            className={`mt-8 px-12 py-4 rounded-2xl font-black text-xl shadow-xl transition-all ${
              players.length > 0
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:brightness-110 active:scale-95 animate-bounce'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <UIIconText value={players.length > 0 ? '🚀 เริ่มการต่อสู้ทั้งห้อง!' : '⏳ รอนักเรียนเข้าห้องอย่างน้อย 1 คน'} />
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 5. RENDER: CLIENT LOBBY (จอนักเรียนรอครูกดเริ่ม)
  // ─────────────────────────────────────────────────────────────
  if (gameMode === 'client' && phase === 'lobby') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col p-6 items-center justify-center space-y-6">
        <div className="text-6xl animate-pulse"><UIIcon value={"📱"} /></div>
        <h2 className="text-2xl font-black text-amber-400">เชื่อมต่อกับห้อง {roomCode} สำเร็จ!</h2>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center max-w-sm w-full">
          <p className="text-slate-400 text-sm">ชื่อของคุณในห้องนี้:</p>
          <p className="text-xl font-bold text-emerald-400 mt-1">{playerName}</p>
          <div className="my-4 border-t border-slate-800"></div>
          <p className="text-amber-300/80 text-xs animate-pulse"><UIIcon value={"⏳"} /> กำลังรอคุณครูกดเริ่มเกมที่จอโปรเจกเตอร์...</p>
        </div>
        <button onClick={() => setGameMode('menu')} className="text-xs text-slate-500 hover:text-slate-400">
          <UIIcon value={"←"} /> ออกจากห้อง
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 6. RENDER: COUNTDOWN
  // ─────────────────────────────────────────────────────────────
  if (phase === 'countdown') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <p className="text-amber-400 font-black text-xl mb-4 tracking-widest uppercase">เตรียมพร้อมสู้!</p>
        <div className="text-9xl font-black text-rose-500 animate-ping"><UIIcon value={"⚔️"} /></div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 7. RENDER: VICTORY SCREEN
  // ─────────────────────────────────────────────────────────────
  if (phase === 'victory') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative">
        <div className="text-7xl mb-2"><UIIcon value={"🎉"} /></div>
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">
          VICTORY! ชนะแล้ว!
        </h1>
        <p className="text-slate-300 mt-1">
          {gameMode === 'solo' ? 'คุณปราบ The Logic Dragon สำเร็จ!' : 'ชั้นเรียนของคุณรวมพลังปราบมังกรสำเร็จ!'}
        </p>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full mt-6 shadow-2xl text-center space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
            <span className="text-xs text-amber-300 block font-bold">ดาเมจรวมที่คุณทำได้:</span>
            <span className="text-3xl font-black text-amber-400">{myTotalDamage} DMG</span>
            <span className="text-xs text-emerald-400 block mt-1">+100 EXP ได้รับแล้ว! <UIIcon value={"🌟"} /></span>
          </div>

          {gameMode !== 'solo' && players.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider"><UIIcon value={"🏆"} /> MVP Leaderboard</p>
              <div className="space-y-2">
                {[...players].sort((a,b) => b.damage - a.damage).slice(0, 3).map((p, i) => (
                  <div key={i} className="flex justify-between items-center px-3 py-2 bg-slate-800 rounded-lg text-sm">
                    <span className="font-bold"><UIIconText value={i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} /> {p.name}</span>
                    <span className="text-amber-400 font-mono font-bold">{p.damage} dmg</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => { setGameMode('menu'); setPhase('lobby'); }}
            className="w-full btn-primary py-3.5 rounded-xl font-black text-base shadow-lg"
          >
            กลับสู่เมนูหลัก <UIIcon value={"🏰"} />
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 8. RENDER: BATTLE PHASE (ทั้ง SOLO, HOST และ CLIENT)
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col p-4 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <button
          onClick={() => { setGameMode('menu'); setPhase('lobby'); }}
          className="text-slate-400 hover:text-white text-xs bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800"
        >
          <UIIcon value={"←"} /> ยอมแพ้ / ออก
        </button>

        <div className="flex items-center gap-2">
          {combo > 1 && (
            <span className="bg-rose-500/20 text-rose-400 border border-rose-500/40 px-3 py-1 rounded-full text-xs font-black animate-bounce">
              <UIIcon value={"🔥"} /> Combo x{combo} (+{(combo - 1) * 100} dmg)
            </span>
          )}
          <span className="text-xs font-bold bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
            <UIIconText value={gameMode === 'solo' ? '🛡️ Solo Mode' : `👥 Room: ${roomCode}`} />
          </span>
        </div>
      </div>

      {/* Dragon Boss Area */}
      <div className="flex flex-col items-center mb-4 relative z-10">
        <div className={`text-7xl md:text-8xl select-none transition-transform ${bossShake ? 'animate-wiggle scale-110' : 'animate-float'}`}>
          <UIIcon value={"🐉"} />
        </div>

        {/* Floating damage effect */}
        {floatingDamage && (
          <div className="absolute top-4 text-3xl md:text-4xl font-black text-red-500 animate-fade-in-up drop-shadow-[0_2px_10px_rgba(255,0,0,0.8)]">
            {floatingDamage}
          </div>
        )}

        <h3 className="text-lg md:text-xl font-black text-rose-400 mt-1">The Logic Dragon</h3>

        {/* HP Bar */}
        <div className="w-full max-w-md mt-2 relative">
          <div className="h-6 bg-slate-900 rounded-full border-2 border-slate-700 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 transition-all duration-300"
              style={{ width: `${Math.max(0, (bossHp / maxHp) * 100)}%` }}
            ></div>
          </div>
          <p className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-white text-shadow">
            {bossHp.toLocaleString()} / {maxHp.toLocaleString()} HP ({Math.round((bossHp / maxHp) * 100)}%)
          </p>
        </div>
      </div>

      {/* ถ้าเป็นจอ Host อย่างเดียว (ครูฉายโปรเจกเตอร์) ไม่ต้องตอบคำถาม แต่แสดง Live Board ยักษ์ */}
      {gameMode === 'host' ? (
        <div className="flex-1 max-w-2xl w-full mx-auto flex flex-col justify-between py-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h4 className="text-amber-400 font-bold text-sm mb-3 uppercase tracking-wider"><UIIcon value={"💥"} /> Live Combat Feed:</h4>
            <div className="space-y-2 min-h-[120px]">
              {liveLog.length === 0 ? (
                <p className="text-slate-500 text-xs italic">กำลังรอนักเรียนเริ่มตอบคำถาม...</p>
              ) : (
                liveLog.map(log => (
                  <div key={log.id} className="text-xs font-bold text-slate-200 animate-fade-in flex items-center gap-2">
                    <span className="text-emerald-400"><UIIcon value={"⚡"} /></span> {log.text}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs text-slate-400 font-bold mb-2 uppercase"><UIIcon value={"🏆"} /> อันดับนักเรียนที่ทำดาเมจสูงสุดในห้อง:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[...players].sort((a,b) => b.damage - a.damage).slice(0, 8).map((p, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
                  <div className="text-xs font-bold text-white truncate">{i + 1}. {p.name}</div>
                  <div className="text-[11px] text-amber-400 font-mono font-black">{p.damage} dmg</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* โหมด Solo หรือ เครื่องนักเรียน (Client): มีข้อสอบ O-NET จริงให้ทำ */
        <div className="flex-1 max-w-lg w-full mx-auto flex flex-col justify-end">
          {/* Question Card */}
          <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-5 mb-3 shadow-2xl relative">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-bold text-amber-400/90 bg-amber-400/10 px-2.5 py-0.5 rounded-lg border border-amber-400/20">
                ข้อที่ {qIndex + 1}
              </span>
              <span className="text-[11px] text-slate-400">ตอบถูก = โจมตี <UIIcon value={"💥"} /></span>
            </div>

            <p className="text-base md:text-lg font-bold text-white leading-relaxed mb-4">
              {currentQ.question}
            </p>

            {/* Answer Choices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {currentQ.options.map((opt, i) => (
                <button
                  key={i}
                  disabled={answeredCooldown}
                  onClick={() => handleAnswer(i)}
                  className={`py-3.5 px-4 rounded-xl font-bold text-sm text-left transition-all border ${
                    answeredCooldown
                      ? i === currentQ.answer
                        ? 'bg-emerald-600/60 border-emerald-400 text-white'
                        : 'bg-slate-800/40 border-slate-800 text-slate-500'
                      : 'bg-slate-800 hover:bg-indigo-600 active:scale-95 border-slate-700 hover:border-indigo-400 text-slate-200 shadow-md'
                  }`}
                >
                  <span className="text-slate-400 font-mono mr-2">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Card เมื่อตอบผิด (มีแปลโจทย์ภาษาไทย + คำอธิบาย) */}
          {feedback && !feedback.isCorrect && (
            <div className="bg-rose-950/80 border-2 border-rose-500/60 rounded-2xl p-4 mb-2 animate-shake shadow-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-rose-400 font-black text-xs"><UIIcon value={"❌"} /> โดนมังกรโจมตีสวน! (คอมโบล้าง)</span>
                <span className="text-[10px] text-rose-300"><UIIcon value={"⏳"} /> รอข้อถัดไป...</span>
              </div>
              {feedback.translation && (
                <div className="text-xs text-sky-200 bg-sky-950/50 p-2 rounded-lg border border-sky-400/30">
                  <span className="font-bold text-sky-300">🇹🇭 แปลโจทย์: </span>
                  {feedback.translation}
                </div>
              )}
              <div className="text-xs text-amber-200">
                <span className="font-bold text-amber-300"><UIIcon value={"🎯"} /> เฉลย: </span>
                {feedback.explanation}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
