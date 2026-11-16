import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Check, Castle, ChevronLeft, ChevronRight, Crosshair, LockKeyhole, MapPin, Play, Star, X } from 'lucide-react';
import { getQuestArtwork } from '../../data/questArtwork';
import { getQuestLearningState, getQuestPracticeStats, isChapterChallenge, isQuestPassed } from '../../utils/questMapModel';
import ResilientArtwork from '../ResilientArtwork';
import QuestMissionPanel from './QuestMissionPanel';
import ChapterWorldBackground from './ChapterWorldBackground';
import { getChapterWorldTheme } from '../../data/chapterWorldThemes';
import { getQuestReviewBlocker } from '../../utils/questReviewGate';

function centerQuest(scroller, target) {
  if (!scroller || !target) return;
  const left = scroller.scrollLeft + target.getBoundingClientRect().left
    - scroller.getBoundingClientRect().left + (target.clientWidth - scroller.clientWidth) / 2;
  scroller.scrollTo({ left, behavior: 'instant' });
}

function nodeState(quest, progress, unlocked) {
  if (!unlocked) return 'locked';
  if (isQuestPassed(progress)) return 'completed';
  return 'available';
}

export default function AdventureQuestMap({ chapter, chapterMeta, filterControl, progress, unlocked, recommendedId, selectedId, onSelect, onPlay, onVocab, avatar, bossGateMessage, onCheckBoss, bossCheckLoading, student, listExpanded, listCount, onToggleList, children }) {
  const scrollRef = useRef(null);
  const detailDialog = useRef(null);
  const openerRef = useRef(null);
  const actionRef = useRef(null);
  const pendingSelectionRef = useRef(null);
  const [selectionRequest, setSelectionRequest] = useState(0);
  const selectedMarkerRef = useRef(null);
  const bossRef = useRef(null);
  const [selectedInView, setSelectedInView] = useState(true);
  const nodes = chapter.quests.map((quest, index) => {
    const state = nodeState(quest, progress[quest.id], !!unlocked[quest.id]);
    const { stars } = getQuestPracticeStats(progress[quest.id]);
    return { quest, index, state, stars: Math.min(3, Math.max(0, Number(stars) || 0)), boss: isChapterChallenge(quest) };
  });

  const avatarQuestId = nodes.some(node => node.quest.id === recommendedId) ? recommendedId : nodes.find(node => node.state === 'available')?.quest.id || nodes.findLast(node => node.state === 'completed')?.quest.id || nodes[0]?.quest.id;
  const selectedNode = nodes.find(node => node.quest.id === selectedId) || nodes.find(node => node.quest.id === avatarQuestId) || nodes[0];
  const activeQuestId = selectedNode?.quest.id;
  const bossNode = nodes.find(node => node.boss);
  const bossLocked = bossNode?.state === 'locked';
  const reviewBlocker = chapter.id === 1 && bossLocked ? getQuestReviewBlocker(bossNode.quest.id, student) : null;
  const bossConditions = reviewBlocker ? `ทบทวนข้อที่ตอบผิดในด่าน ${reviewBlocker.name} ให้ครบก่อนเปิด Boss Gate` : null;

  const selectQuest = (quest, opener) => {
    if (quest.id === activeQuestId) centerQuest(scrollRef.current, selectedMarkerRef.current);
    openerRef.current = opener;
    pendingSelectionRef.current = quest.id;
    onSelect(quest);
    // A fresh request also handles clicking the currently selected node again.
    setSelectionRequest(value => value + 1);
  };
  useEffect(() => {
    if (!selectionRequest || pendingSelectionRef.current !== selectedNode?.quest.id) return;
    const frame = requestAnimationFrame(() => {
      const dialog = detailDialog.current;
      if (!dialog) return;
      pendingSelectionRef.current = null;
      if (!dialog.open) dialog.showModal();
      actionRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [selectionRequest, selectedNode?.quest.id]);

  useLayoutEffect(() => {
    if (!listExpanded) centerQuest(scrollRef.current, selectedMarkerRef.current);
  }, [chapter.id, activeQuestId, listExpanded]);

  useEffect(() => {
    if (listExpanded || !selectedMarkerRef.current || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => setSelectedInView(entry.intersectionRatio >= 0.95), {
      root: scrollRef.current,
      threshold: 0.95,
    });
    observer.observe(selectedMarkerRef.current);
    return () => observer.disconnect();
  }, [chapter.id, activeQuestId, listExpanded]);

  const moveMap = direction => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const nodeWidth = scroller.querySelector('.qm-map-node')?.getBoundingClientRect().width || 126;
    const visibleNodes = Math.max(1, Math.floor(scroller.clientWidth / nodeWidth) - 1);
    scroller.scrollBy({ left: direction * nodeWidth * visibleNodes, behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  const focusBoss = () => {
    centerQuest(scrollRef.current, bossRef.current);
    bossRef.current?.querySelector('button')?.focus({ preventScroll: true });
  };

  const learningState = selectedNode ? getQuestLearningState(progress[selectedNode.quest.id], !!unlocked[selectedNode.quest.id]) : 'locked';
  const selectedProgress = selectedNode ? progress[selectedNode.quest.id] : null;

  return (
    <section className="qm-adventure-map" data-chapter={chapter.id} aria-labelledby="qm-adventure-title">
      <header>
        <div>
          <p className="qm-eyebrow">{getChapterWorldTheme(chapter.id).name}</p>
          <h3 id="qm-adventure-title" tabIndex={-1}>Chapter {chapter.id} — {chapter.name}</h3>
          <p className="qm-chapter-objective">{chapterMeta}</p>
        </div>
        <div className="qm-map-header-actions">
          {filterControl}
          {onToggleList && <button type="button" aria-expanded={listExpanded} aria-controls="qm-quest-list" onClick={onToggleList}>{listExpanded ? 'กลับไปดูแผนที่' : `ดูภารกิจทั้งหมด (${listCount})`}</button>}
          {!listExpanded && !selectedInView && <button type="button" className="qm-return-current" onClick={() => {
            centerQuest(scrollRef.current, selectedMarkerRef.current);
            selectedMarkerRef.current?.querySelector('button')?.focus({ preventScroll: true });
          }}><Crosshair />กลับไปด่านที่เลือก</button>}
          {!listExpanded && bossNode && <button type="button" className={bossLocked ? 'qm-boss-shortcut is-locked' : 'qm-boss-shortcut'} onClick={focusBoss}>
            {bossLocked ? <LockKeyhole /> : <Castle />}
            {bossLocked ? 'ดู Boss Gate (ยังล็อก)' : 'ดู Boss Gate'}
          </button>}
        </div>
      </header>
      {children}
      <div className="qm-map-view" hidden={listExpanded}>
      <div className="qm-map-viewport">
      <ChapterWorldBackground chapterId={chapter.id} scrollRef={scrollRef} />
      <button type="button" className="qm-map-control is-back" onClick={() => moveMap(-1)} aria-label="เลื่อนแผนที่ไปทางซ้าย"><ChevronLeft /></button>
      <div className="qm-map-scroll" ref={scrollRef} tabIndex="0" aria-label="แผนที่ภารกิจ เลื่อนซ้ายขวาเพื่อสำรวจ">
        <ol className="qm-map-route" style={{ '--map-count': nodes.length }}>
          {nodes.map(({ quest, index, state, stars, boss }) => {
            const artwork = getQuestArtwork(quest.id);
            const recommended = avatarQuestId === quest.id && state === 'available';
            const started = getQuestLearningState(progress[quest.id], !!unlocked[quest.id]) === 'unfinished';
            const statusLabel = state === 'completed' ? 'ผ่านแล้ว' : state === 'locked' ? 'ยังล็อก' : started ? 'กำลังฝึก' : recommended ? 'แนะนำให้เริ่ม' : 'พร้อมเล่น';
            const StateIcon = state === 'completed' ? Check : state === 'locked' ? LockKeyhole : Play;
            return (
              <li key={quest.id} ref={element => {
                if (quest.id === activeQuestId) selectedMarkerRef.current = element;
                if (boss) bossRef.current = element;
              }} data-map-quest-id={quest.id} className={`qm-map-node is-${state} ${boss ? 'is-boss' : ''} ${recommended ? 'is-current' : ''} ${activeQuestId === quest.id ? 'is-selected' : ''}`}>
                <button type="button" onClick={event => selectQuest(quest, event.currentTarget)} aria-haspopup="dialog" aria-current={activeQuestId === quest.id ? 'true' : undefined} aria-label={`${quest.name} ${statusLabel}`}>
                  <span className="qm-map-step" aria-hidden="true">{index + 1}</span>
                  <span className="qm-map-marker" aria-hidden="true">
                    {boss ? <span className="qm-boss-gate"><Castle />{artwork && <ResilientArtwork src={artwork} alt="" eager />}</span> : artwork ? <ResilientArtwork src={artwork} alt="" eager fallback={<MapPin />} /> : <MapPin />}
                    <span className="qm-map-state"><StateIcon /></span>
                  </span>
                  {avatarQuestId === quest.id && <span className="qm-map-avatar" aria-label="ตำแหน่งปัจจุบันของผู้เล่น">{avatar || <MapPin />}<small>คุณอยู่ที่นี่</small></span>}
                  <strong>{quest.name}</strong>
                  <span className="qm-map-state-label">{statusLabel}</span>
                  <span className="qm-map-stars" aria-label={`${stars} จาก 3 ดาว`}>{[1, 2, 3].map(value => <Star key={value} className={value <= stars ? 'is-earned' : ''} aria-hidden="true" />)}</span>
                </button>
                {index < nodes.length - 1 && <span className={`qm-map-path ${state === 'completed' ? 'is-travelled' : ''}`} aria-hidden="true" />}
              </li>
            );
          })}
        </ol>
      </div>
      <button type="button" className="qm-map-control is-forward" onClick={() => moveMap(1)} aria-label="เลื่อนแผนที่ไปทางขวา"><ChevronRight /></button>
      </div>
      <div className="qm-map-legend" aria-label="คำอธิบายสถานะ">
        <span><Check />ผ่านแล้ว</span><span><Play />พร้อมเล่น</span><span><LockKeyhole />ยังล็อก</span><span><Castle />Boss Gate</span>
      </div>
      {selectedNode && <div className="qm-selected-stage">
        <span>ด่านที่เลือก <strong>{selectedNode.quest.name}</strong></span>
        <button type="button" aria-haspopup="dialog" onClick={event => selectQuest(selectedNode.quest, event.currentTarget)}>ดูรายละเอียดด่าน</button>
      </div>}
      {selectedNode && <dialog ref={detailDialog} className="qm-stage-dialog" aria-labelledby="qm-stage-title" onClose={() => openerRef.current?.focus({ preventScroll: true })}>
        <header className="qm-stage-dialog-bar">
          <span>รายละเอียดด่าน</span>
          <button type="button" aria-label="ปิดรายละเอียดด่าน" onClick={() => detailDialog.current.close()}><X size={22} aria-hidden="true" /></button>
        </header>
        <QuestMissionPanel key={activeQuestId} student={student} quest={selectedNode.quest} number={selectedNode.index + 1} progress={selectedProgress} learningState={learningState} onPlay={onPlay} onVocab={onVocab} actionRef={actionRef} unlockConditions={selectedNode.boss ? bossConditions : null} bossGateMessage={activeQuestId === 'strategy_boss' ? bossGateMessage : null} onCheckBoss={onCheckBoss} bossCheckLoading={bossCheckLoading} />
      </dialog>}
      </div>
    </section>
  );
}
