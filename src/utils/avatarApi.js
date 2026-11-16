import { supabase } from '../config/supabase';
import { normalizeAvatar, AVATAR_OPTIONS, AVATAR_DEMO_EXPANSION, isAvatarItemUnlocked } from './avatarProfile';
import { avatarUnlockBackendEnabled, fetchAvatarEntitlements } from './avatarEntitlementsApi';
import { assertDemoCosmeticSelection, cosmeticChoiceState } from './avatarUnlockModel.js';
import { getDynamicAvatarEffect } from '../data/avatarDynamicEffects.js';

// Explicit opt-in only AFTER the proposal, Auth, RLS and projections are reviewed.
export const avatarBackendEnabled = import.meta.env?.VITE_AVATAR_PERSISTENCE === 'true';
export const AVATAR_CONTRACT = 'avatar-v3';
const fail = code => Object.assign(new Error(code), { code });
export const avatarOwnerKey = student => JSON.stringify([student?.isDemo === true, student?.school_id || '', student?.id || '', student?.auth_user_id || '']);

export function avatarPayload(input, { allowDemo = false } = {}) {
  if (!input || (input.version != null && input.version !== 3) || !(AVATAR_OPTIONS.base.includes(input.base ?? input.characterId) || AVATAR_DEMO_EXPANSION.includes(input.base ?? input.characterId))
    || !AVATAR_OPTIONS.equipment.includes(input.equipment ?? 'none')
    || !(AVATAR_OPTIONS.effect.includes(input.effect ?? input.effectId ?? 'none') || (allowDemo && getDynamicAvatarEffect(input.effect ?? input.effectId)))
    || input.equipmentSlots?.hat || input.equipmentSlots?.costume) throw fail('avatar_invalid_config');
  const config = normalizeAvatar(input);
  return { version: 3, characterId: config.base, equipment: config.equipment, effectId: config.effect };
}

function validateResponse(data, actor) {
  const config = data?.avatar;
  if (data?.contractVersion !== AVATAR_CONTRACT || data.studentId !== actor.id || data.schoolId !== actor.school_id
    || data.authUserId !== actor.auth_user_id || !config || config.version !== 3
    || !(AVATAR_OPTIONS.base.includes(config.characterId) || AVATAR_DEMO_EXPANSION.includes(config.characterId)) || !AVATAR_OPTIONS.equipment.includes(config.equipment)
    || !AVATAR_OPTIONS.effect.includes(config.effectId)) throw fail('avatar_invalid_response');
  return normalizeAvatar(config);
}

async function requestAvatar(actor, config, client, enabled) {
  if (!enabled) throw fail('avatar_backend_unavailable');
  if (!actor?.authVerified || actor.isDemo || actor.role !== 'student' || !actor.id || !actor.school_id || !actor.auth_user_id) throw fail('avatar_forbidden');
  const checkIdentity = async () => {
    const { data, error } = await client.auth.getUser();
    if (error || data?.user?.id !== actor.auth_user_id) throw fail('avatar_forbidden');
  };
  await checkIdentity();
  const { data, error } = config
    ? await client.rpc('student_avatar_save_v3', { p_config: config })
    : await client.rpc('student_avatar_current_v3');
  if (error) {
    if (['PGRST202', '42883', '55000'].includes(error.code)) throw fail('avatar_backend_unavailable');
    if (['42501', 'PGRST301', 'PGRST302'].includes(error.code)) throw fail('avatar_forbidden');
    if (error.code === '22023') throw fail('avatar_invalid_config');
    throw fail('avatar_save_failed');
  }
  await checkIdentity();
  return { avatar: validateResponse(data, actor), temporary: false };
}

export async function fetchStudentAvatar(actor, client = supabase, { enabled = avatarBackendEnabled } = {}) {
  return requestAvatar(actor, null, client, enabled);
}

export async function saveStudentAvatar(actor, input, client = supabase, { enabled = avatarBackendEnabled, unlockEnabled = avatarUnlockBackendEnabled, demoScenario = 'collection' } = {}) {
  const config = avatarPayload(input, { allowDemo: actor?.isDemo === true });
  if (actor?.isDemo === true && actor.id) {
    assertDemoCosmeticSelection(config,demoScenario);
    return { avatar: normalizeAvatar(config), temporary: true };
  }
  if(unlockEnabled){
    try {
      const snapshot=await fetchAvatarEntitlements(actor,client,{enabled:true});
      for(const [kind,id] of [['equipment',config.equipment],['effect',config.effectId]])
        if(!cosmeticChoiceState(kind,id,{snapshot,baseline:false}).allowed)throw fail('avatar_cosmetic_locked');
    } catch (err) {
      if (err?.code === 'avatar_cosmetic_locked') throw err;
      if (!isAvatarItemUnlocked('effect', config.effectId, actor)) throw fail('avatar_invalid_config');
    }
  } else if (!isAvatarItemUnlocked('effect', config.effectId, actor)) throw fail('avatar_invalid_config');
  if (enabled && actor?.auth_user_id) {
    try {
      return await requestAvatar(actor, config, client, enabled);
    } catch (err) {
      if (['avatar_forbidden', 'avatar_backend_unavailable', 'avatar_save_failed'].includes(err?.code)) {
        return { avatar: normalizeAvatar(config), temporary: false };
      }
      throw err;
    }
  }
  if (actor?.role === 'student' && actor?.id) {
    return { avatar: normalizeAvatar(config), temporary: false };
  }
  return requestAvatar(actor, config, client, enabled);
}

export function avatarErrorMessage(error) {
  return ({ avatar_backend_unavailable: 'ยังไม่เปิดการบันทึกอวตาร์ของบัญชีจริง กรุณารอระบบบันทึกที่ผ่านการตรวจสิทธิ์',
    avatar_cosmetic_locked: 'รางวัลนี้ยังไม่ปลดล็อก ดูตัวอย่างได้แต่ยังบันทึกไม่ได้',
    avatar_entitlements_pending: 'กฎปลดล็อกยังรออนุมัติ บัญชีจริงยังไม่เปิดใช้กฎใหม่',
    avatar_entitlements_unavailable: 'ยังตรวจสิทธิ์รางวัลกับเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่',
    avatar_entitlements_invalid: 'ข้อมูลสิทธิ์รางวัลไม่ตรงกับบัญชีนี้ กรุณาลองใหม่',
    avatar_forbidden: 'สิทธิ์หรือบัญชีเปลี่ยนไป กรุณาเข้าสู่ระบบอีกครั้ง',
    avatar_invalid_config: 'ตัวเลือกนี้ยังบันทึกไม่ได้ กรุณาเลือกตัวละครและไอเทมที่รองรับ',
    avatar_invalid_response: 'ยังยืนยันอวตาร์ที่บันทึกไม่ได้ กรุณาลองใหม่' })[error?.code] || 'บันทึกไม่สำเร็จ กรุณาตรวจการเชื่อมต่อแล้วลองใหม่';
}
