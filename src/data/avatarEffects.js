// Ten choices INCLUDING none; retain every previously saved effect ID.
export const AVATAR_EFFECTS = Object.freeze([
  ['none','ไม่มีเอฟเฟกต์','ภาพตัวละครตามปกติ','none'],
  ['soft_glow','แสงนุ่มนวล','แสงอุ่นนุ่มรอบตัวฮีโร่','glow'],
  ['ocean_breeze','สายลมสมุทร','สายลมและคลื่นสีฟ้ารอบเท้า','waves'],
  ['golden_sparkles','ประกายทอง','ประกายดาวเล็ก ๆ รอบตัว','sparkles'],
  ['forest_aura','ออร่าพงไพร','ใบไม้ลอยอยู่ข้างตัวฮีโร่','leaves'],
  ['star_halo','วงแหวนดารา','วงโคจรดวงดาวรอบฐานตัวละคร','orbit'],
  ['legendary_glow','แสงตำนาน','ลำแสงทองแผ่ออกจากด้านหลัง','rays'],
  ['explorer_spark','ประกายนักสำรวจ','ประกายสีอำพันตามเส้นทางผจญภัย','comets'],
  ['wisdom_aura','ออร่าปัญญา','ชั้นแสงสีน้ำเงินอ่อนซ้อนรอบตัว','aura'],
  ['constellation_trail','กลุ่มดาวนำทาง','ดาวที่เชื่อมกันเป็นเส้นทาง','constellation'],
].map(([id,nameTh,descriptionTh,pattern])=>Object.freeze({id,nameTh,descriptionTh,pattern})));
export const AVATAR_EFFECT_IDS = Object.freeze(AVATAR_EFFECTS.map(item=>item.id));
const byId=new Map(AVATAR_EFFECTS.map(item=>[item.id,item]));
export const getAvatarEffect=id=>byId.get(id);
