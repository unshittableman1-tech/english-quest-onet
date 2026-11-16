import { useEffect, useRef, useState } from 'react';
import { getChapterWorldTheme } from '../../data/chapterWorldThemes';
import '../../styles/chapterWorldBackground.css';

export default function ChapterWorldBackground({ chapterId, scrollRef }) {
  const theme = getChapterWorldTheme(chapterId);
  const isValley = theme.tone === 'valley';
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const worldRef = useRef(null);
  const playMotion = visible && !paused;
  const followRoute = Boolean(scrollRef);

  useEffect(() => {
    if (!followRoute) return;
    const world = worldRef.current;
    const route = scrollRef.current;
    if (!world || !route) return;

    let frame;
    let scrollRange = 0;
    let travel = 0;
    const paint = () => {
      frame = undefined;
      const progress = scrollRange ? Math.min(1, Math.max(0, route.scrollLeft / scrollRange)) : 0;
      world.style.setProperty('--chapter-world-offset', `${-progress * travel}px`);
    };
    const onScroll = () => {
      if (frame === undefined) frame = requestAnimationFrame(paint);
    };
    const measure = () => {
      const { clientWidth, clientHeight } = world;
      scrollRange = Math.max(0, route.scrollWidth - route.clientWidth);
      // Scan the existing 2:1 panorama on narrow screens. On wider screens,
      // allow a modest crop so both ends of the panorama can still be revealed.
      const overscan = Math.min(360, Math.max(170, clientWidth * 0.3));
      travel = Math.min(scrollRange, Math.max(overscan, clientHeight * 2 - clientWidth));
      world.style.setProperty('--chapter-world-travel', `${travel}px`);
      if (frame !== undefined) cancelAnimationFrame(frame);
      paint();
    };

    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
    observer?.observe(world);
    if (route.firstElementChild) observer?.observe(route.firstElementChild);
    if (!observer) window.addEventListener('resize', measure);
    route.addEventListener('scroll', onScroll, { passive: true });
    measure();

    return () => {
      observer?.disconnect();
      if (!observer) window.removeEventListener('resize', measure);
      route.removeEventListener('scroll', onScroll);
      if (frame !== undefined) cancelAnimationFrame(frame);
      world.style.removeProperty('--chapter-world-travel');
      world.style.removeProperty('--chapter-world-offset');
    };
  }, [chapterId, followRoute, scrollRef]);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(worldRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
        ref={worldRef}
        className={`chapter-world is-${theme.tone} motion-${theme.motion}${followRoute ? ' follows-route' : ''}${playMotion ? '' : ' is-paused'}`}
        aria-hidden="true"
        style={{ '--chapter-world-image': `url("${theme.background}")` }}
      >
        <div className="chapter-world-art">
          {isValley && <div className="chapter-valley-water"><i /><i /></div>}
        </div>
        <div className="chapter-world-atmosphere" />
        {isValley ? <>
          <div className="chapter-valley-clouds"><i /><i /></div>
          <div className="chapter-valley-foliage">
            <img src="/assets/chapter-worlds/leaf.webp" alt="" decoding="async" draggable={false} />
          </div>
        </> : <>
        <div className="chapter-world-light" />
        <div className="chapter-world-mist" />
        <div className="chapter-world-particles">
          {Array.from({ length: 8 }, (_, index) => <i key={index} style={{ '--particle': index }} />)}
        </div>
        </>}
        <div className={`chapter-world-decorations effect-${theme.decoration.motion}`} key={theme.id}>
          {Array.from({ length: theme.decoration.count }, (_, index) => (
            <span className={`chapter-world-sprite sprite-${index}`} key={index}>
              <img src={theme.decoration.image} alt="" decoding="async" draggable={false} />
            </span>
          ))}
        </div>
      </div>
      <button type="button" className="chapter-world-motion-toggle" onClick={() => setPaused(value => !value)}>
        {paused ? 'เปิดภาพเคลื่อนไหว' : 'พักภาพเคลื่อนไหว'}
      </button>
    </>
  );
}
