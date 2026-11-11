import { useEffect, useReducer, useRef, useState } from 'react';
import { createOrderingState, getOrderingActivities, isOrderingActivityValid, orderingReducer } from '../../utils/orderingGame';
import { orderingPreviewScene } from '../../utils/demoVehicleChoice.mjs';
import { useSpeech } from '../../utils/useSpeech';
import { playCorrectSound } from '../../utils/audio';
import { chooseTokenWithSound, checkOrderingWithSound } from '../../utils/orderingSound';

const controlClass = 'min-h-11 min-w-11 rounded-xl border-2 px-3 py-2 text-base font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:cursor-default';

export default function RearrangeGame(props) {
  return <OrderingMission key={props.mission.id} {...props} />;
}

function OrderingMission({ mission, onComplete, onBack }) {
  const activities = getOrderingActivities(mission);
  const [selectedMode, setSelectedMode] = useState(activities.length === 1 ? activities[0].id : null);
  const activity = activities.find(item => item.id === selectedMode);
  if (!activities.length || (activity && !isOrderingActivityValid(activity))) {
    return <div className="max-w-lg mx-auto p-4"><p role="alert">ข้อมูลกิจกรรมเรียงลำดับไม่ครบ กรุณากลับไปเลือกภารกิจ</p><button type="button" className={controlClass} onClick={onBack}>กลับไปเลือกภารกิจ</button></div>;
  }
  if (!activity) return <section className="max-w-lg mx-auto p-4 space-y-4 bg-white/95 rounded-2xl" aria-label="เลือกกิจกรรมเรียงลำดับ">
    <button type="button" className={controlClass} onClick={onBack}>กลับไปเลือกภารกิจ</button>
    <h1 className="text-xl font-black text-slate-800">{mission.title}</h1>
    <p className="text-base text-slate-600">เลือกกิจกรรมที่อยากฝึก ทั้งสองแบบใช้สิทธิ์รับ XP ของภารกิจเดียวกัน</p>
    {activities.map(item => <button key={item.id} type="button" className={`${controlClass} w-full border-amber-300 bg-amber-50 text-amber-900`} onClick={() => setSelectedMode(item.id)}>{item.label} · {item.rounds.length} ข้อ</button>)}
  </section>;
  return <OrderingSession key={activity.id} mission={mission} activity={activity} onComplete={onComplete} onBack={onBack} />;
}

function OrderingSession({ mission, activity, onComplete, onBack }) {
  const [state, dispatch] = useReducer(orderingReducer, activity, createOrderingState);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { speak, stop } = useSpeech();
  const claimStarted = useRef(false);
  const remainingRef = useRef(null);
  const arrangedRef = useRef(null);
  const checkRef = useRef(null);
  const nextRef = useRef(null);
  const headingRef = useRef(null);
  const resultRef = useRef(null);
  const total = activity.rounds.length;
  const current = activity.rounds[state.index];
  const xpEarned = Math.round(mission.xpReward * Math.max(0.3, state.correct / Math.max(total, 1)));

  useEffect(() => {
    const targets = {
      remaining: remainingRef.current?.querySelector('button') || checkRef.current,
      arranged: arrangedRef.current?.querySelector('button') || remainingRef.current?.querySelector('button'),
      next: nextRef.current, heading: headingRef.current, result: resultRef.current,
    };
    targets[state.focusTarget]?.focus();
  }, [state]);

  async function complete() {
    if (claimStarted.current) return;
    claimStarted.current = true;
    setClaiming(true);
    setClaimError(false);
    try {
      await onComplete(xpEarned);
    } catch {
      claimStarted.current = false;
      setClaiming(false);
      setClaimError(true);
    }
  }

  if (state.phase === 'done') return <section className="min-h-screen flex flex-col items-center justify-center p-4">
    <div className="glass-card max-w-md w-full p-6 text-center space-y-4">
      <h2 ref={resultRef} tabIndex={-1} className="text-2xl font-black text-amber-800">{activity.label}เสร็จแล้ว!</h2>
      <p className="text-slate-600">{mission.title}</p>
      <div className="grid grid-cols-3 gap-2">
        <div><strong className="block text-xl text-emerald-700">{state.correct}/{total}</strong>ถูก</div>
        <div><strong className="block text-xl text-amber-700">{Math.round(state.correct / total * 100)}%</strong>คะแนน</div>
        <div><strong className="block text-xl text-yellow-700">{xpEarned}</strong>XP ตามผลกิจกรรม</div>
      </div>
      <button type="button" onClick={complete} disabled={claiming} className={`${controlClass} btn-success w-full`}>{claiming ? 'กำลังบันทึกผล' : 'บันทึกผลและไปต่อ'}</button>
      {claimError && <p role="alert">บันทึกผลไม่สำเร็จ กรุณาลองอีกครั้ง</p>}
    </div>
  </section>;

  function tokenButton(token, selected, index) {
    return <button key={token.id} type="button" data-token-id={token.id}
      aria-label={`${selected ? 'นำออก' : 'เพิ่ม'} ${token.text} ชิ้นที่ ${token.position}${selected ? ` ลำดับที่ ${index + 1}` : ''}`}
      disabled={state.submitted}
      onClick={() => chooseTokenWithSound(state, token, selected, soundEnabled, { dispatch, speak })}
      className={`${controlClass} ${activity.id === 'steps' ? 'w-full text-left' : ''} ${selected ? 'bg-sky-100 border-sky-400 text-sky-900' : 'bg-amber-100 border-amber-300 text-amber-900'}`}>
      {orderingPreviewScene({ missionId: mission.id, previewOnly: mission.previewOnly, roundId: current.id, stepId: token.sourceId }) && <img src={orderingPreviewScene({ missionId: mission.id, previewOnly: mission.previewOnly, roundId: current.id, stepId: token.sourceId })} alt="" loading="lazy" onError={event => { event.currentTarget.hidden = true; }} style={{ width: 64, height: 64, objectFit: 'contain', display: 'inline-block', verticalAlign: 'middle', marginRight: 12 }} />}
      {activity.id === 'steps' && selected && <span aria-hidden="true" className="mr-2">{index + 1}.</span>}{token.text}
    </button>;
  }

  return <section className="min-h-screen flex flex-col p-4 max-w-lg mx-auto text-slate-800 bg-white/95">
    <header className="flex items-center gap-3 mb-4">
      <button type="button" className={controlClass} onClick={onBack} aria-label="กลับไปเลือกภารกิจ">←</button>
      <div className="flex-1 min-w-0"><h2 ref={headingRef} tabIndex={-1} className="text-lg font-black">{mission.title}</h2><p>{activity.label} · ข้อ {state.index + 1}/{total}</p></div>
      <button type="button" className="min-h-11 rounded-xl border-2 border-sky-300 bg-white px-3 text-sm font-bold text-sky-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-600" aria-pressed={soundEnabled} onClick={() => { if (soundEnabled) stop(); setSoundEnabled(!soundEnabled); }}>{soundEnabled ? 'ปิดเสียงเกม' : 'เปิดเสียงเกม'}</button>
    </header>
    <progress className="w-full mb-4" aria-label="จำนวนข้อที่ทำเสร็จ" value={state.index} max={total} />
    {mission.techniqueHint && <p className="mb-4 p-3 rounded-xl bg-amber-100 text-amber-900">{mission.techniqueHint}</p>}
    {activity.id === 'steps' && current.title && <h3 className="font-bold mb-3">{current.title}</h3>}
    <p id="ordering-instructions" className="text-base mb-3 leading-relaxed">แตะหรือใช้ Tab แล้วกด Enter/Space เพื่อเลือกการ์ดตามลำดับ แตะการ์ดที่เลือกแล้วเพื่อนำออก</p>
    <section ref={arrangedRef} aria-label="คำตอบที่เรียงแล้ว" aria-describedby="ordering-instructions" className="border-2 border-dashed border-sky-300 rounded-xl p-3 mb-4 min-h-[100px]">
      <h3 className="font-bold mb-2">คำตอบของคุณ</h3>
      {!state.arranged.length && <p className="text-slate-600">เลือกการ์ดด้านล่างเพื่อเริ่มเรียง</p>}
      <div className={`flex gap-2 ${activity.id === 'steps' ? 'flex-col' : 'flex-wrap'}`}>{state.arranged.map((token, index) => tokenButton(token, true, index))}</div>
    </section>
    <section ref={remainingRef} aria-label="การ์ดที่ยังไม่ได้เลือก" className="mb-4">
      <h3 className="font-bold mb-2">การ์ดที่เหลือ</h3>
      <div className={`flex gap-2 ${activity.id === 'steps' ? 'flex-col' : 'flex-wrap'}`}>{state.remaining.map((token, index) => tokenButton(token, false, index))}</div>
    </section>
    <p className="text-slate-600 mb-3" aria-live="polite">เลือกแล้ว {state.arranged.length} จาก {state.arranged.length + state.remaining.length} การ์ด</p>
    {state.submitted && <div role="status" className={`p-4 rounded-2xl mb-4 ${state.isCorrect ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
      <p className="font-bold">{state.isCorrect ? 'ถูกต้อง! เรียงได้สมบูรณ์' : 'ยังไม่ถูก'}</p>
      {!state.isCorrect && <p className="mt-2 leading-relaxed">คำตอบที่ถูก: {activity.id === 'words' ? current.correct : current.correctOrder.map(id => current.steps.find(step => step.id === id).text).join(' → ')}</p>}
    </div>}
    {!state.submitted ? <button ref={checkRef} type="button" onClick={() => checkOrderingWithSound(state, soundEnabled, { dispatch, success: () => { stop(); playCorrectSound(); } })} disabled={state.remaining.length > 0} className={`${controlClass} btn-primary w-full mt-auto disabled:opacity-50`}>ตรวจคำตอบ</button>
      : <button ref={nextRef} type="button" onClick={() => dispatch({ type: 'next' })} className={`${controlClass} btn-primary w-full`}>{state.index + 1 >= total ? 'ดูผลลัพธ์' : 'ข้อต่อไป'}</button>}
  </section>;
}
