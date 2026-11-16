import { supabase } from '../config/supabase';
import { AVATAR_UNLOCK_RULES, COSMETIC_POLICY_VERSION } from '../data/avatarUnlockRules.js';

export const avatarUnlockBackendEnabled=import.meta.env?.VITE_AVATAR_UNLOCKS==='true';
const fail=code=>Object.assign(new Error(code),{code});
export function validateCosmeticSnapshot(data,actor) {
  if(data?.contractVersion!=='avatar-entitlements-v13'||data.policyVersion!==COSMETIC_POLICY_VERSION
    ||data.studentId!==actor.id||data.schoolId!==actor.school_id||data.authUserId!==actor.auth_user_id
    ||!Array.isArray(data.states)||data.states.length!==AVATAR_UNLOCK_RULES.length)throw fail('avatar_entitlements_invalid');
  const keys=new Set();
  for(const entry of data.states){
    const rule=AVATAR_UNLOCK_RULES.find(rule=>rule.kind===entry.kind&&rule.id===entry.id);
    const key=entry.kind+':'+entry.id;
    if(!rule||keys.has(key)||!['LOCKED','ELIGIBLE','UNLOCKED','EQUIPPED'].includes(entry.state)||typeof entry.blocked!=='boolean'
      ||entry.blocked&&entry.state!=='LOCKED')throw fail('avatar_entitlements_invalid');
    if(entry.progress&&(!['XP_THRESHOLD','LEVEL_THRESHOLD'].includes(rule.type)||!Number.isSafeInteger(entry.progress.current)||entry.progress.current<0
      ||entry.progress.target!==rule.target||entry.progress.unit!==(rule.type==='LEVEL_THRESHOLD'?'Level':'XP')))throw fail('avatar_entitlements_invalid');
    keys.add(key);
  }
  if(data.policyStatus!=='ACTIVE')throw fail('avatar_entitlements_pending');
  return {...data,source:'verified-server',states:data.states.map(entry=>({...AVATAR_UNLOCK_RULES.find(rule=>rule.kind===entry.kind&&rule.id===entry.id),...entry}))};
}
export async function fetchAvatarEntitlements(actor,client=supabase,{enabled=avatarUnlockBackendEnabled}={}) {
  if(!enabled)throw fail('avatar_entitlements_pending');
  if(!actor?.authVerified||actor.isDemo||actor.role!=='student'||!actor.auth_user_id||!actor.id||!actor.school_id)throw fail('avatar_forbidden');
  const verify=async()=>{const {data,error}=await client.auth.getUser();if(error||data?.user?.id!==actor.auth_user_id)throw fail('avatar_forbidden');};
  await verify();
  const {data,error}=await client.rpc('student_avatar_entitlements_v13');
  if(error)throw fail(['42501','PGRST301'].includes(error.code)?'avatar_forbidden':'avatar_entitlements_unavailable');
  await verify();return validateCosmeticSnapshot(data,actor);
}
