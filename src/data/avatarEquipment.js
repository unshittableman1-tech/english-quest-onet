// Ten illustrated companions. `none` is an empty selection, not a collectible.
const legacy = (id, nameTh, descriptionTh) => ({ id, nameTh, descriptionTh, asset: `/assets/avatar-v3/equipment/${id}.png?v=1`, artwork: 'ready', legacy: true });
const addition = (id, nameTh, descriptionTh) => ({ id, nameTh, descriptionTh, asset: `/assets/avatar-v12/equipment/${id}.png?v=1`, artwork: 'ready', legacy: false });
export const AVATAR_EQUIPMENT = Object.freeze([
  legacy('map', 'แผนที่คำศัพท์', 'แผนที่คู่ใจสำหรับการผจญภัยในโลกคำศัพท์'),
  legacy('compass', 'เข็มทิศภารกิจ', 'เข็มทิศสีน้ำเงินทองประจำตัวนักผจญภัย'),
  legacy('backpack', 'กระเป๋านักสำรวจ', 'กระเป๋าคู่ใจสำหรับการเดินทางแห่งการเรียนรู้'),
  legacy('story-book', 'หนังสือเรื่องราว', 'หนังสือประจำตัวของนักอ่านและนักเล่าเรื่อง'),
  legacy('lantern', 'ตะเกียงความรู้', 'ตะเกียงสีทองประดับข้างตัวฮีโร่'),
  legacy('vocabulary-scroll', 'ม้วนคำศัพท์', 'ม้วนบันทึกคำศัพท์ของนักสำรวจ'),
  addition('vocabulary-stone', 'ศิลาคำศัพท์', 'ศิลาสีน้ำเงินลายทอง สัญลักษณ์ของโลกคำศัพท์'),
  addition('grammar-shield', 'โล่ผู้พิทักษ์ภาษา', 'โล่ลายหนังสือสำหรับฮีโร่ผู้รักภาษา'),
  addition('time-hourglass', 'นาฬิกาทรายแห่งเวลา', 'นาฬิกาทรายสีทองประจำการเดินทางเรียนรู้'),
  addition('writing-quill', 'ปากกาขนนกเวทมนตร์', 'ขนนกสีน้ำเงินปลายทองสำหรับนักเล่าเรื่อง'),
].map(Object.freeze));
export const AVATAR_EQUIPMENT_IDS = Object.freeze(AVATAR_EQUIPMENT.map(item => item.id));
// Retain historical IDs for saved avatars; only the later four remain selectable.
export const AVATAR_SELECTABLE_EQUIPMENT_IDS = Object.freeze(AVATAR_EQUIPMENT.filter(item => !item.legacy).map(item => item.id));
const byId = new Map(AVATAR_EQUIPMENT.map(item => [item.id, item]));
export const getAvatarEquipment = id => byId.get(id);
