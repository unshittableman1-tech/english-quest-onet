const REWARDS = [25, 30, 40, 50, 60, 75, 100];

export async function requestDailyCheckin(client, { claim = false, studentId } = {}) {
  const failure = () => new Error('ระบบรับรางวัลยังไม่พร้อม กรุณาลองอีกครั้ง คะแนนของคุณยังไม่ถูกเปลี่ยนแปลง');
  let result;
  try { result = await client.rpc('student_daily_checkin', { p_claim: claim }); }
  catch { throw failure(); }
  const data = result?.data;
  if (result?.error || !data || data.studentId !== studentId
    || typeof data.claimed !== 'boolean' || (claim && !data.claimed)
    || !Number.isInteger(data.streakDays) || data.streakDays < 1
    || !REWARDS.includes(data.rewardXP) || ![0, data.rewardXP].includes(data.earnedXP)
    || !Number.isSafeInteger(data.xp) || data.xp < 0
    || !Number.isInteger(data.level) || data.level < 1
    || !data.badgeStats || typeof data.badgeStats !== 'object') throw failure();
  return data;
}

export function celebrateCheckin(confetti) {
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  confetti({ particleCount: 110, spread: 105, angle: 270, startVelocity: 18, gravity: 0.8,
    origin: { x: 0.5, y: 0 }, colors: ['#fbbf24', '#38bdf8', '#34d399', '#fb7185'],
    disableForReducedMotion: true, zIndex: 120 });
}
