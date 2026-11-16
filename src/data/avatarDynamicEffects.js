// New visuals are previews until the reward and avatar backends support them.
const rows=[
  ['starlight','ประกายดาวฟ้า','ดาวสีน้ำเงินลอยรอบตัว'],['sunrise','แสงอรุณทอง','ประกายอุ่นลอยขึ้น'],
  ['firefly','หิ่งห้อยพงไพร','จุดแสงสีเขียวลอยอย่างนุ่มนวล'],['bubbles','ฟองสมุทร','ฟองน้ำสีฟ้าลอยขึ้น'],
  ['petals','กลีบดอกไม้','กลีบสีชมพูเคลื่อนไหวรอบตัว'],['leaves','ใบไม้สายลม','ใบไม้สีเขียวหมุนช้า ๆ'],
  ['snow','เกล็ดหิมะ','เกล็ดสีฟ้าขาวร่วงเบา ๆ'],['rainbow','สายรุ้งประกาย','ประกายหลากสีเคลื่อนไหว'],
  ['moon','แสงจันทร์','วงแสงสีม่วงนุ่มรอบตัว'],['comet','ฝนดาวตก','แสงดาวเล็กเคลื่อนผ่าน'],
  ['crystals','ผลึกคริสตัล','ผลึกสีฟ้าลอยขึ้น'],['magic','วงเวทนักสำรวจ','วงแสงหมุนรอบตัว'],
  ['lanterns','แสงโคมลอย','แสงสีทองลอยขึ้นช้า ๆ'],['music','จังหวะสนุก','จุดแสงเคลื่อนไหวเป็นจังหวะ'],
  ['aurora','แสงออโรรา','แสงสีฟ้าเขียวไหลนุ่มนวล'],
];
export const AVATAR_DYNAMIC_EFFECTS=Object.freeze(rows.map(([id,nameTh,descriptionTh])=>Object.freeze({id:`dynamic-${id}`,nameTh,descriptionTh,pattern:id})));
export const getDynamicAvatarEffect=id=>AVATAR_DYNAMIC_EFFECTS.find(effect=>effect.id===id);
