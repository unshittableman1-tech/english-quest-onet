export function getAvatarUrl(name) {
  if (!name) return `https://api.dicebear.com/7.x/avataaars/svg?seed=fallback`;
  
  const seed = encodeURIComponent(name);
  let url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`;
  
  if (name.includes('ด.ญ.') || name.includes('หญิง')) {
    // ผู้หญิงใส่ฮิญาบ (Hijab)
    url += '&top=hijab';
  } else if (name.includes('ด.ช.') || name.includes('ชาย')) {
    // ผู้ชายผมสั้นเรียบร้อยและไม่มีหนวดเครา
    url += '&top=shortFlat,shortRound,shortWaved,sides,theCaesar&facialHairProbability=0';
  } else {
    // กรณีไม่มีคำนำหน้า
    url += '&facialHairProbability=0';
  }
  
  return url;
}
