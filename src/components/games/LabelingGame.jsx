import { useEffect, useReducer, useRef, useState } from 'react';
import { ArrowLeft, Check, FlaskConical, RotateCcw, Tag, X } from 'lucide-react';
import { createLabelingState, isLabelingComplete, isLabelingDefinitionValid, labelingReducer } from '../../utils/labelingGame';
import '../../styles/labelingLab.css';

const localPreview = () => import.meta.env.DEV && ['127.0.0.1', 'localhost', '[::1]'].includes(window.location.hostname);

export default function LabelingGame({ mission, onBack }) {
  if (!localPreview() || !mission?.previewOnly || !isLabelingDefinitionValid(mission, false)) return <section className="labeling-lab"><p role="alert">Labeling Lab ยังไม่เปิดใช้งานกับบัญชีนักเรียนจริง</p><button type="button" onClick={onBack}>กลับไปเลือกภารกิจ</button></section>;
  return <LabelingSession key={mission.id} mission={mission} onBack={onBack} />;
}

function LabelingSession({ mission, onBack }) {
  const [state, dispatch] = useReducer(labelingReducer, mission, createLabelingState);
  const [imageReady, setImageReady] = useState(false);
  const [imageError, setImageError] = useState(false);
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const sceneRef = useRef(null);
  const labelsRef = useRef(null);
  const resultRef = useRef(null);
  const headingRef = useRef(null);
  const count = Object.keys(state.placements).length;
  const disabled = state.phase !== 'play';
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { if (state.phase === 'review') resultRef.current?.focus(); }, [state.phase]);

  function selectLabel(id) {
    dispatch({ type: 'select', id });
    const firstEmpty = mission.hotspots.find(spot => !Object.hasOwn(state.placements, spot.id));
    const buttons = [...sceneRef.current.querySelectorAll('button')];
    (buttons.find(button => button.dataset.hotspotId === firstEmpty?.id) || buttons[0])?.focus({ preventScroll: true });
  }

  function placeLabel(id) {
    dispatch({ type: 'place', id });
    if (state.selected) labelsRef.current?.querySelector('button')?.focus({ preventScroll: true });
  }

  async function submit() {
    if (inFlight.current || disabled || !imageReady || !isLabelingComplete(state)) return;
    inFlight.current = true;
    const attemptId = state.attemptId || crypto.randomUUID();
    dispatch({ type: 'check', attemptId });
    try {
      const response = await fetch('/__local/labeling/check', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId, missionId: mission.id, placements: state.placements }),
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error('check_failed');
      const result = await response.json();
      if (!Array.isArray(result.results) || result.total !== mission.hotspots.length || result.rewardsAwarded !== false) throw new Error('invalid_result');
      if (mounted.current) dispatch({ type: 'checked', result });
    } catch { if (mounted.current) dispatch({ type: 'failed' }); }
    finally { inFlight.current = false; }
  }

  return <section className="labeling-lab" aria-label="เกมติดป้ายคำศัพท์">
    <header className="labeling-header"><button type="button" aria-label="กลับไปเลือกชุดทดสอบ" onClick={onBack}><ArrowLeft /></button><div><span><FlaskConical aria-hidden="true" /> LABELING LAB</span><h1 ref={headingRef} tabIndex={-1}>{mission.title}</h1><p>{mission.objective}</p></div></header>
    <p className="labeling-preview-note">ชุดทดสอบสังเคราะห์ในเครื่อง · ยังไม่ผ่านการรับรองเนื้อหา · ไม่บันทึก XP ดาว หรือความคืบหน้า</p>
    <div className="labeling-progress"><label htmlFor="labeling-progress">ติดป้ายแล้ว {count}/{mission.hotspots.length} ตำแหน่ง</label><progress id="labeling-progress" value={count} max={mission.hotspots.length} /></div>
    <p id="labeling-instructions">เลือกคำศัพท์ แล้วแตะตำแหน่งบนภาพ ใช้ Tab และ Enter/Space ได้ เลือกคำเดิมเพื่อย้าย หรือกดนำออกด้านล่าง</p>
    <div className="labeling-play-area">
      <div className="labeling-scene" ref={sceneRef} style={{ aspectRatio: `${mission.imageWidth}/${mission.imageHeight}` }} aria-label="ภาพสำหรับติดป้าย" aria-describedby="labeling-instructions">
        <img src={mission.image} alt={mission.imageAlt} width={mission.imageWidth} height={mission.imageHeight} onError={() => { setImageError(true); setImageReady(false); }} onLoad={event => {
          const valid = Math.abs(event.currentTarget.naturalWidth / event.currentTarget.naturalHeight - mission.imageWidth / mission.imageHeight) < .01;
          setImageReady(valid); setImageError(!valid);
        }} />
        {imageReady && mission.hotspots.map((spot, index) => {
          const placed = mission.labels.find(label => label.id === state.placements[spot.id]);
          const checked = state.result?.results.find(result => result.hotspotId === spot.id);
          return <button type="button" key={spot.id} data-hotspot-id={spot.id} data-edge={spot.x > .75 ? 'right' : spot.x < .25 ? 'left' : 'center'} className={`labeling-hotspot ${placed ? 'is-placed' : ''} ${checked ? checked.correct ? 'is-correct' : 'is-incorrect' : ''}`} style={{ left: `${spot.x * 100}%`, top: `${spot.y * 100}%` }} disabled={disabled} aria-label={`ตำแหน่ง ${index + 1}${placed ? `: ${placed.text}` : ' ยังไม่ได้ติดป้าย'}`} onClick={() => placeLabel(spot.id)}>
            <b>{index + 1}</b>{placed && <span>{placed.text}</span>}{checked && <em>{checked.correct ? <Check /> : <X />}</em>}
          </button>;
        })}
      </div>
      <section className="labeling-bank" aria-label="คำศัพท์ให้เลือก" ref={labelsRef}><h2><Tag />เลือกคำศัพท์</h2><div>{mission.labels.map((label, index) => <button type="button" key={label.id} data-label-id={label.id} aria-label={`เลือก ${label.text} ชิ้นที่ ${index + 1}`} aria-pressed={state.selected === label.id} disabled={disabled || !imageReady} onClick={() => selectLabel(label.id)}><strong>{label.text}</strong>{label.description && <small>{label.description}</small>}{Object.values(state.placements).includes(label.id) && <small>ติดแล้ว · เลือกเพื่อย้าย</small>}</button>)}</div></section>
    </div>
    {imageError && <p role="alert">โหลดภาพไม่สำเร็จหรือสัดส่วนภาพไม่ตรงกับชุดกิจกรรม กรุณากลับไปเลือกชุดทดสอบ</p>}
    <p className="labeling-announcement" role="status">{state.message || (state.selected ? 'เลือกตำแหน่งบนภาพ' : 'พร้อมติดป้ายคำศัพท์')}</p>
    {count > 0 && <section className="labeling-placements" aria-label="ป้ายที่ติดแล้ว">{mission.hotspots.filter(spot => state.placements[spot.id]).map(spot => <button type="button" key={spot.id} disabled={disabled} onClick={() => dispatch({ type: 'remove', id: spot.id })} aria-label={`นำป้ายตำแหน่ง ${mission.hotspots.indexOf(spot) + 1} ออก`}><X />{mission.hotspots.indexOf(spot) + 1}. {mission.labels.find(label => label.id === state.placements[spot.id])?.text}</button>)}</section>}
    {state.phase === 'review' ? <section className="labeling-result" ref={resultRef} tabIndex={-1} aria-label="ผลการติดป้าย"><h2>{state.result.correct === state.result.total ? 'ถูกต้องทั้งหมด!' : `ถูก ${state.result.correct} จาก ${state.result.total} ตำแหน่ง ลองเรียนรู้จากคำเฉลย`}</h2><ul>{state.result.results.map(result => <li key={result.hotspotId}>{result.correct ? <Check /> : <X />}{result.feedback}</li>)}</ul><p>ผลนี้ใช้ฝึกเท่านั้น ไม่ได้รับ XP หรือปลดล็อกด่าน</p><button type="button" className="labeling-primary" onClick={() => { dispatch({ type: 'retry' }); headingRef.current?.focus(); }}><RotateCcw />ลองใหม่</button></section>
      : <button type="button" className="labeling-primary" disabled={!isLabelingComplete(state) || !imageReady || disabled} onClick={submit}>{state.phase === 'checking' ? 'กำลังตรวจคำตอบ' : 'ตรวจคำตอบ'}</button>}
  </section>;
}
