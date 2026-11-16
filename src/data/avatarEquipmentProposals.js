// Artwork and XP values for preview only. These IDs do not grant entitlements.
const rows = [
  ['01-telescope','กล้องส่องดาวนักสำรวจ',100], ['02-field-journal','สมุดบันทึกการเดินทาง',200],
  ['03-feather-bookmark','ที่คั่นหนังสือขนนก',400], ['04-crystal-dictionary','พจนานุกรมคริสตัล',600],
  ['05-magnifier','แว่นขยายช่างสังเกต',900], ['06-message-bottle','ขวดข้อความเดินทาง',1200],
  ['07-inkwell','หมึกแห่งเรื่องราว',1500], ['08-travel-fan','พัดนักเดินทาง',1800],
  ['09-compass-pendant','จี้เข็มทิศเวลา',2200], ['10-golden-key','กุญแจห้องสมุด',2600],
  ['11-star-satchel','กระเป๋าดาวนำทาง',3000], ['12-wisdom-bell','ระฆังแห่งความรู้',3400],
  ['13-sextant','เครื่องวัดดาวนำทาง',3800], ['14-lens-charm','เลนส์นักค้นพบ',4200],
  ['15-treasure-chest','หีบสมบัติความรู้',4700], ['16-laurel-wreath','พวงใบไม้แห่งความพยายาม',5200],
  ['17-mini-globe','ลูกโลกนักสำรวจ',5800], ['18-paper-plane','เครื่องบินกระดาษนำทาง',6500],
  ['19-puzzle-piece','ชิ้นส่วนปริศนาทองคำ',7500], ['20-book-medal','เหรียญหนังสือแห่งการเรียนรู้',9000],
];
export const AVATAR_EQUIPMENT_PROPOSALS = Object.freeze(rows.map(([id, nameTh, xp]) => Object.freeze({
  id: `proposal-${id}`, nameTh, xp, asset: `/assets/avatar-proposals/${id}.png`,
})));
