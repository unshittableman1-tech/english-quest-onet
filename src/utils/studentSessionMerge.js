export function mergeRestoredStudentProfile(localStudent, serverProfile) {
  const merged = { ...localStudent, ...serverProfile };
  const sameOwner = localStudent?.id && localStudent.id === serverProfile?.id
    && localStudent.school_id && localStudent.school_id === serverProfile.school_id
    && (!localStudent.auth_user_id || !serverProfile.auth_user_id || localStudent.auth_user_id === serverProfile.auth_user_id);
  if (sameOwner) {
    // The avatar adapter has a separate authenticated read/write contract. Legacy
    // progress DTOs without that projection must not erase the confirmed avatar.
    const avatarOwner = JSON.stringify([false, localStudent.school_id, localStudent.id, localStudent.auth_user_id || '']);
    if (localStudent.authVerified && localStudent.avatarReceipt === avatarOwner && localStudent.avatar) {
      merged.avatar = localStudent.avatar;
      merged.avatarReceipt = localStudent.avatarReceipt;
    }
    const deviceReviews = Object.fromEntries(Object.entries(localStudent.mistakeBank || {}).filter(([, item]) => item?.devicePracticeReview === true));
    if (Object.keys(deviceReviews).length) merged.mistakeBank = { ...(serverProfile.mistakeBank || {}), ...deviceReviews };
  } else if (Object.values(localStudent?.mistakeBank || {}).some(item => item?.devicePracticeReview === true)) {
    merged.mistakeBank = serverProfile?.mistakeBank || {};
  }
  if (serverProfile?.preTest == null && localStudent?.preTest != null) {
    merged.preTest = localStudent.preTest;
  }
  return merged;
}
