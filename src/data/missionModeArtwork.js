// Presentation only: keep mission IDs, rewards and access rules in their existing sources.
const artwork = (id, label, desc, tone) => Object.freeze({
  id, label, desc, tone, src: `/images/mission-modes/v1/${id}.webp`,
});

export const MISSION_MODE_ARTWORK = Object.freeze({
  flashcard: artwork('flashcard', 'พลิกการ์ด', 'พลิกการ์ดเรียนรู้คำ', 'sky'),
  matching: artwork('matching', 'จับคู่', 'จับคู่คำกับความหมาย', 'mint'),
  fill_blank: artwork('fill_blank', 'เติมคำ', 'เติมคำในช่องว่าง', 'peach'),
  conversation: artwork('conversation', 'บทสนทนา', 'สนทนาเลือกคำตอบ', 'pink'),
  story_tap: artwork('story_tap', 'อ่านแล้วตอบ', 'อ่านบทความแล้วแตะคำตอบ', 'teal'),
  rearrange: artwork('rearrange', 'เรียงคำ / เรียงเรื่อง', 'เรียงคำหรือเรื่องตามกิจกรรม', 'violet'),
  spell: artwork('spell', 'สะกดคำ', 'เรียงตัวอักษรให้เป็นคำ', 'violet'),
  voice: artwork('voice', 'ฝึกพูด', 'ฝึกออกเสียงและพูดภาษาอังกฤษ', 'violet'),
  image_labeling: artwork('image_labeling', 'ติดป้ายในภาพ', 'เลือกป้ายให้ตรงกับส่วนต่าง ๆ ในภาพ', 'mint'),
  graph_comparison: artwork('graph_comparison', 'อ่านกราฟ', 'อ่านข้อมูลและเปรียบเทียบ', 'teal'),
  quiz: artwork('quiz', 'แบบทดสอบ', 'เลือกคำตอบจากโจทย์', 'amber'),
  boss: artwork('boss', 'ท้าทายท้ายบท', 'ทำแบบประเมินท้ายบท', 'violet'),
});

// Different instructions can share a game engine while needing different visual cues.
export const MISSION_MODE_VARIANTS = Object.freeze({
  spell_clues: artwork('spell_clues', 'อ่านคำใบ้แล้วสะกด', 'อ่านคำใบ้แล้วสืบหาคำศัพท์', 'aqua'),
});

const PICTURE_SPELL_ARTWORK = Object.freeze({ ...MISSION_MODE_ARTWORK.spell, label: 'ดูภาพแล้วสะกด' });

const FALLBACK = Object.freeze({ id: 'unknown', label: 'กิจกรรม', desc: '', tone: 'sky', src: null });

export function getMissionModeArtwork(type) {
  if (Object.hasOwn(MISSION_MODE_ARTWORK, type)) return MISSION_MODE_ARTWORK[type];
  return Object.hasOwn(MISSION_MODE_VARIANTS, type) ? MISSION_MODE_VARIANTS[type] : FALLBACK;
}

export function getMissionArtwork(mission) {
  const base = getMissionModeArtwork(mission?.type);
  const items = mission?.items;
  if (mission?.type !== 'spell' || !Array.isArray(items) || items.length === 0) return base;
  // SpellGame displays an image first when both image and hints are present.
  if (items.every(item => typeof item?.image === 'string' && item.image.trim())) return PICTURE_SPELL_ARTWORK;
  if (items.every(item => !item?.image && Array.isArray(item?.hints) && item.hints.some(hint => typeof hint === 'string' && hint.trim()))) {
    return MISSION_MODE_VARIANTS.spell_clues;
  }
  return base;
}
