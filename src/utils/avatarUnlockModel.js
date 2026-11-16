import { AVATAR_UNLOCK_RULES, COSMETIC_POLICY_VERSION, getAvatarUnlockRule } from '../data/avatarUnlockRules.js';
import { getDynamicAvatarEffect } from '../data/avatarDynamicEffects.js';

export const DEMO_COSMETIC_SCENARIOS=Object.freeze([
  {id:'collection',name:'จำลอง: ทดลองครบชุด'},
  {id:'starter',name:'จำลอง: เริ่มต้น 0 XP'},
  {id:'xp800',name:'จำลอง: มี 800 XP'},
  {id:'achievements',name:'จำลอง: ผ่านภารกิจ'},
]);
const level=xp=>[100,250,500,1000,2000,3500,5000,7000,10000].filter(value=>xp>=value).length+1;

// Pure display evaluator. Input is a contract from a server adapter or an explicitly
// synthetic fixture; this function never creates an authoritative entitlement.
export function evaluateCosmeticRule(rule,evidence={}) {
  if(!rule)return {state:'LOCKED',blocked:true};
  if(rule.type==='DEFAULT')return {state:'ELIGIBLE',blocked:false};
  const keys={XP_THRESHOLD:'xp',LEVEL_THRESHOLD:'xp',QUEST_COMPLETION:'quests',BOSS_COMPLETION:'bosses',CHAPTER_COMPLETION:'chapters',BADGE_COUNT:'badges',VOCAB_CATEGORY_COMPLETION:'vocabCategories',TEACHER_ASSIGNMENT_COMPLETION:'assignments'};
  const key=keys[rule.type];
  if(!key||evidence.available?.[key]!==true)return {state:'LOCKED',blocked:true};
  if(key==='xp') {
    if(!Number.isSafeInteger(evidence.xp)||evidence.xp<0)return {state:'LOCKED',blocked:true};
    const current=rule.type==='LEVEL_THRESHOLD'?level(evidence.xp):evidence.xp;
    return {state:current>=rule.target?'ELIGIBLE':'LOCKED',blocked:false,progress:{current,target:rule.target,unit:rule.type==='LEVEL_THRESHOLD'?'Level':'XP'}};
  }
  const values=evidence[key];
  if(!Array.isArray(values)||values.some(value=>typeof value!=='string'))return {state:'LOCKED',blocked:true};
  const matched=rule.type==='BADGE_COUNT'?new Set(values).size>=rule.target
    :rule.reference==='any'?values.length>0:values.includes(rule.reference);
  return {state:matched?'ELIGIBLE':'LOCKED',blocked:false};
}

export function demoCosmeticSnapshot(scenario='collection') {
  if(!DEMO_COSMETIC_SCENARIOS.some(item=>item.id===scenario))throw new Error('invalid_demo_scenario');
  const full=['collection','achievements'].includes(scenario);
  const evidence={xp:scenario==='collection'?10000:scenario==='xp800'?800:0,
    available:{xp:true,quests:true,bosses:true,chapters:true,badges:true,vocabCategories:true,assignments:true},
    quests:full?['pronouns_master','reading']:[],bosses:full?['strategy_boss']:[],chapters:full?['2']:[],
    badges:full?['synthetic-badge-1','synthetic-badge-2','synthetic-badge-3']:[],vocabCategories:full?['daily_routine','transport']:[],assignments:full?['synthetic-assignment']:[]};
  const states=AVATAR_UNLOCK_RULES.map(rule=>{const evaluated=evaluateCosmeticRule(rule,evidence);return {...rule,...evaluated,state:evaluated.state==='ELIGIBLE'?'UNLOCKED':'LOCKED'};});
  return {contractVersion:'avatar-entitlements-v13',policyVersion:COSMETIC_POLICY_VERSION,source:'synthetic',scenario,states};
}

export function cosmeticChoiceState(kind,id,{snapshot,saved,baseline=true}={}) {
  if(kind==='equipment'&&id==='none')return {state:'UNLOCKED',blocked:false,allowed:true,requirementTh:'ไม่ใช้ไอเทม'};
  const rule=getAvatarUnlockRule(kind,id);
  if(!rule)return {state:'LOCKED',blocked:true,allowed:false,requirementTh:'ไม่พบรางวัลที่รองรับ'};
  let entry=snapshot?.states?.find(row=>row.kind===kind&&row.id===id);
  if(!entry)entry={...rule,state:rule?.type==='DEFAULT'||baseline&&(kind==='equipment'||['none','soft_glow'].includes(id))?'UNLOCKED':'LOCKED',blocked:rule?.type!=='DEFAULT'&&(!baseline||kind==='effect'&&!['none','soft_glow'].includes(id))};
  const permitted=!entry.blocked&&['UNLOCKED','EQUIPPED'].includes(entry.state);
  const savedId=kind==='equipment'?saved?.equipment:saved?.effect;
  return {...entry,state:permitted&&savedId===id?'EQUIPPED':entry.state,allowed:permitted};
}

export function assertDemoCosmeticSelection(config,scenario='collection') {
  const snapshot=demoCosmeticSnapshot(scenario);
  for(const [kind,id] of [['equipment',config.equipment],['effect',config.effectId??config.effect]]) {
    if(kind==='equipment'&&id==='none')continue;
    if(kind==='effect'&&getDynamicAvatarEffect(id))continue;
    if(!cosmeticChoiceState(kind,id,{snapshot,baseline:false}).allowed)throw Object.assign(new Error('avatar_cosmetic_locked'),{code:'avatar_cosmetic_locked'});
  }
}
