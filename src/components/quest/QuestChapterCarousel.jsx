import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, LockKeyhole } from 'lucide-react';
import { getChapterWorldTheme } from '../../data/chapterWorldThemes';

const artwork = id => `/assets/lesson-world/chapter-${id}.webp`;

export default function QuestChapterCarousel({ chapters, activeId, visible, onSelect }) {
  const trackRef = useRef(null);
  const [edges, setEdges] = useState(0);
  const active = chapters.find(chapter => chapter.id === activeId);

  useLayoutEffect(() => {
    if (!visible) return;
    const track = trackRef.current;
    const tab = track.querySelector('[aria-selected="true"]');
    if (!tab) return;
    const viewport = track.getBoundingClientRect();
    const card = tab.getBoundingClientRect();
    if (card.left < viewport.left || card.right > viewport.right) {
      track.scrollTo({ left: tab.offsetLeft - 4, behavior: 'instant' });
    }
  }, [activeId, visible]);

  useEffect(() => {
    if (!visible) return;
    const track = trackRef.current;
    const updateEdges = () => {
      const left = track.scrollLeft;
      setEdges((left > 1 ? 1 : 0) | (left < track.scrollWidth - track.clientWidth - 1 ? 2 : 0));
    };
    updateEdges();
    track.addEventListener('scroll', updateEdges, { passive: true });
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(updateEdges) : null;
    observer?.observe(track);
    return () => {
      observer?.disconnect();
      track.removeEventListener('scroll', updateEdges);
    };
  }, [visible]);

  function browse(direction) {
    const track = trackRef.current;
    const [first, second] = track.children;
    const step = second.offsetLeft - first.offsetLeft;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollBy({ left: direction * step, behavior: reducedMotion ? 'instant' : 'smooth' });
  }

  function handleKeys(event) {
    const tabs = Array.from(trackRef.current.children);
    const index = tabs.indexOf(event.target);
    const last = tabs.length - 1;
    const targets = { ArrowLeft: index === 0 ? last : index - 1, ArrowRight: index === last ? 0 : index + 1, Home: 0, End: last };
    const target = tabs[targets[event.key]];
    if (!target) return;
    event.preventDefault();
    target.focus({ preventScroll: true });
    target.click();
  }

  return (
    <div className="qm-chapter-picker">
      <div className="qm-featured-chapter">
        <img key={active.id} src={getChapterWorldTheme(active.id).background} alt="" decoding="async" />
        <div className="qm-featured-copy">
          <span className="qm-featured-kicker">บทที่เลือก <span>บท {active.id}</span>{active.locked && <><LockKeyhole size={14} aria-hidden="true" />ยังล็อก</>}</span>
          <strong>{active.label}</strong>
          <span className="qm-featured-world">{getChapterWorldTheme(active.id).name}</span>
          <div className="qm-featured-progress">
            <span>ผ่าน {active.done}/{active.total} ด่าน</span>
            <progress value={active.done} max={active.total} aria-label={`ผ่าน ${active.done} จาก ${active.total} ด่าน`} />
          </div>
        </div>
      </div>
      <div className="qm-chapter-carousel">
        <div className="qm-carousel-toolbar">
          <h2 id="qm-carousel-title">เลือกบทเรียน</h2>
          <div className="qm-carousel-arrows">
            <button type="button" aria-label="เลื่อนดูบทก่อนหน้า" aria-controls="qm-chapter-carousel" aria-disabled={!(edges & 1)} onClick={() => { if (edges & 1) browse(-1); }}><ChevronLeft size={20} aria-hidden="true" /></button>
            <button type="button" aria-label="เลื่อนดูบทถัดไป" aria-controls="qm-chapter-carousel" aria-disabled={!(edges & 2)} onClick={() => { if (edges & 2) browse(1); }}><ChevronRight size={20} aria-hidden="true" /></button>
          </div>
        </div>
        <div id="qm-chapter-carousel" className="qm-carousel-track" ref={trackRef} role="tablist" aria-labelledby="qm-carousel-title" onKeyDown={handleKeys}>
          {chapters.map(chapter => (
            <button key={chapter.id} id={`qm-chapter-${chapter.id}`} type="button" role="tab" aria-selected={activeId === chapter.id} aria-controls="qm-chapter-panel" data-locked={chapter.locked} tabIndex={activeId === chapter.id ? 0 : -1} onClick={() => onSelect(chapter.id)}>
              <img src={artwork(chapter.id)} alt="" width="320" height="160" decoding="async" />
              <span className="qm-carousel-chapter-meta">
                บท {chapter.id}{activeId === chapter.id && <Check size={14} aria-hidden="true" />}
              </span>
              <strong>{chapter.label}</strong>
              <small>{chapter.locked ? <><LockKeyhole size={13} aria-hidden="true" />ยังล็อก</> : `ผ่าน ${chapter.done}/${chapter.total} ด่าน`}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
