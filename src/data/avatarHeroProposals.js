// Preview-only artwork; not included in the persisted-avatar allowlist.
const names = [
  'นักสำรวจทะเลเหนือ','นักปราชญ์แสงดาว','นักเดินทางสายลม','นักสำรวจฟ้าคราม','นักเล่าเรื่องแสงทอง',
  'นักสำรวจป่าดาว','นักวาดแผนที่น้อย','นักปราชญ์ฟ้าลึก','นักวิจัยใบไม้','กะลาสีฟ้าใส',
  'นักเดินทางพงไพร','นักดูดาวรุ่งอรุณ','นักอ่านดวงจันทร์','นักประดิษฐ์น้อย','นักดาราศาสตร์คราม',
  'นักทำแผนที่ตะวัน','นักพฤกษศาสตร์น้อย','บรรณารักษ์สีฟ้า','นักเล่าเรื่องสีน้ำเงิน','ผู้นำทางแห่งเกาะ',
];
export const AVATAR_HERO_PROPOSALS = Object.freeze(names.map((nameTh,index) => {
  const number=String(index+1).padStart(2,'0');
  return Object.freeze({id:`hero-new-${number}`,nameTh,asset:`/assets/avatar-heroes-preview/hero-new-${number}.png`,hijab:index<5});
}));
