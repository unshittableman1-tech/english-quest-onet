import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import useVocabularyCreditAccount from '../../hooks/useVocabularyCreditAccount';
import { segmentSelectableCreditText } from '../../utils/vocabularyCreditText';
import '../../styles/vocabularyCredits.css';

const GlossContext = createContext(null);
export function CreditGlossWallet() {
  const context = useContext(GlossContext);
  if (!context?.enabled) return null;
  return <aside className="credit-inline-wallet" aria-label="แต้มช่วยแปล"><strong data-testid="credit-balance">{context.state ? context.state.balance + ' แต้ม' : 'กำลังโหลดแต้ม…'}</strong><span>{context.state?.balance === 0 ? 'ยังไม่มีแต้ม ไปฝึกคำศัพท์ให้ครบชุดเพื่อสะสมแต้มช่วยแปล' : 'แตะคำที่ต้องการแปล · แสดงราคาก่อนยืนยัน'}</span></aside>;
}
export function CreditGlossText({ text }) {
  const glossary = useContext(GlossContext);
  const parts = useMemo(() => segmentSelectableCreditText(text, glossary?.activity?.terms || []), [text, glossary?.activity]);
  if (!glossary?.enabled || !glossary.activity) return <>{text}</>;
  return <span className="credit-gloss-text">{parts.map((part, index) => part.term
    ? <button type="button" className={`credit-gloss-word${part.term.missing ? ' credit-gloss-missing' : ''}`} key={index}
      aria-label={`แปลคำว่า ${part.text}`} onClick={event => { event.preventDefault(); event.stopPropagation(); glossary.open(part.term, part.text, event.currentTarget, part.phrases); }}>{part.text}</button>
    : <span key={index}>{part.text}</span>)}</span>;
}
export default function CreditGlossary({ children, enabled = true, activityId = 'travel-reading-v2', fixture, showWallet = true, onOpenVocabulary }) {
  const account = useVocabularyCreditAccount({ enabled, fixture });
  const [activity, setActivity] = useState(null);
  const [popup, setPopup] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const dialog = useRef(null), trigger = useRef(null), lock = useRef(false);
  useEffect(() => {
    if (!enabled) return;
    let active = true; setActivity(null); setPopup(null); setError('');
    (async () => { await account.client.connect(); return account.client.call('activity', { activityId }); })()
      .then(data => { if (active) setActivity(data); }).catch(err => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [enabled, activityId, account.client]);
  useEffect(() => {
    if (popup && !dialog.current?.open) dialog.current?.showModal();
    if (!popup && dialog.current?.open) { dialog.current.close(); trigger.current?.focus(); }
  }, [popup]);
  const close = () => { if (!busy) setPopup(null); };
  async function open(term, label, button, phrases = []) {
    if (lock.current) return;
    trigger.current = button;
    if (phrases.length) { setPopup({ label, choices: [term, ...phrases] }); return; }
    await quoteTerm(term, label);
  }
  async function quoteTerm(term, label) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setPopup({ label, loading: true });
    try { const quote = await account.client.call('quote', { glossId: term.id, activityId }); setPopup({ label, quote }); }
    catch (err) { setPopup({ label, error: err.message }); }
    finally { lock.current = false; setBusy(false); }
  }
  async function confirm() {
    if (lock.current || !popup?.quote) return;
    lock.current = true; setBusy(true);
    try {
      const quote = popup.quote;
      const help = await account.client.call('reveal', { glossId: quote.glossId, activityId, expectedCost: quote.cost, policyRevision: quote.policyRevision });
      account.setState(help.state); setPopup(previous => ({ label: previous.label, help }));
    } catch (err) { setPopup(previous => ({ ...previous, error: err.message })); }
    finally { lock.current = false; setBusy(false); }
  }
  if (!enabled) return children;
  return <GlossContext.Provider value={{ enabled, activity: activity?.id === activityId ? activity : null, open, state: account.state }}>
    {showWallet && <CreditGlossWallet />}
    {(error || account.error) && <p role="alert" className="credit-error">{error || account.error}</p>}
    {children || (activity && <section className="credit-panel credit-reading"><h2>{activity.title}</h2>{activity.texts.map((text, index) => <p className="credit-sentence" lang="en" key={index}><CreditGlossText text={text} /></p>)}</section>)}
    <dialog ref={dialog} className="credit-dialog" aria-labelledby="credit-gloss-title" onCancel={event => { event.preventDefault(); close(); }}>
      <h2 id="credit-gloss-title">{popup?.label}</h2>
      {popup?.choices && <><p>เลือกคำหรือวลีที่ต้องการแปล</p>{popup.choices.map(term => <button type="button" key={term.id} onClick={() => quoteTerm(term, term.form)}>{term.form}</button>)}</>}
      {popup?.loading && <p role="status">กำลังตรวจสิทธิ์และราคา…</p>}
      {popup?.help ? <><p className="credit-meaning">{popup.help.meaningTh}</p><p>{popup.help.charged ? 'ใช้ 1 แต้มแล้ว' : 'เปิดคำแปลฟรี'}</p><p>บันทึกการใช้ตัวช่วยแล้ว ยังกลับไปฝึกคำนี้ได้ทันที</p></> : popup?.quote && <>
        <p>{popup.quote.known ? 'คุณฝึกคำนี้ครบชุดแล้ว ขอทบทวนฟรีได้' : popup.quote.cost ? 'เปิดคำแปลนี้ใช้ 1 แต้ม · มีอยู่ ' + popup.quote.balance + ' แต้ม' : 'เปิดคำแปลนี้ได้ฟรี'}</p>
        {popup.quote.affordable ? <button type="button" disabled={busy} onClick={confirm}>{popup.quote.cost ? 'ยืนยันใช้ 1 แต้ม' : 'เปิดคำแปลฟรี'}</button> : <><p>แต้มไม่พอ ไปฝึกคำศัพท์ให้ครบชุดเพื่อรับแต้มช่วยแปลได้</p>{onOpenVocabulary && <button type="button" disabled={busy} onClick={() => { if (window.confirm('ออกจากรอบฝึกนี้เพื่อไปคลังคำศัพท์? ความคืบหน้าในรอบนี้จะไม่ถูกบันทึก')) onOpenVocabulary(); }}>ไปคลังคำศัพท์</button>}</>}
      </>}
      {popup?.error && <p role="alert" className="credit-error">{popup.error}</p>}
      <button type="button" className="credit-secondary" disabled={busy} onClick={close}>{popup?.help ? 'ปิดคำแปล' : 'ยกเลิก'}</button>
    </dialog>
  </GlossContext.Provider>;
}
