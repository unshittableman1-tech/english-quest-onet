import { useMemo, useState } from 'react';
import { AVATAR_DEFAULT, AVATAR_DEMO_EXPANSION, loadAvatar, normalizeAvatar } from '../utils/avatarProfile';
import { getAvatarEquipment } from '../data/avatarEquipment';
import AvatarEffect from './AvatarEffect';
import { AVATAR_HERO_PROPOSALS } from '../data/avatarHeroProposals';
import { getDynamicAvatarEffect } from '../data/avatarDynamicEffects';
import AvatarDynamicEffect from './AvatarDynamicEffect';

const assetRoot='/assets/avatar-v3';
const baseAssetRoot='/assets/avatar-3d-v1';

export default function AvatarRenderer({student,config,size='medium',className='',label,onAssetError,onAssetReady}) {
  const avatar=useMemo(()=>normalizeAvatar(config||loadAvatar(student)),[config,student]);
  const [failedBase,setFailedBase]=useState(null);
  const [failedDefault,setFailedDefault]=useState(false);
  const [failedEquipment,setFailedEquipment]=useState(null);
  const [loaded,setLoaded]=useState(null);
  const hero = AVATAR_HERO_PROPOSALS.find(item=>item.id===avatar.base);
  const baseUrl=hero?.asset || `${AVATAR_DEMO_EXPANSION.includes(avatar.base) ? '/assets/avatar-3d-expansion-v1' : baseAssetRoot}/base/${avatar.base}.png?v=1`;
  const source=failedBase===baseUrl?`${assetRoot}/base/${AVATAR_DEFAULT.base}.png?v=2`:baseUrl;
  const equipment=getAvatarEquipment(avatar.equipment);
  const equipmentUrl=equipment?.asset||null;
  const equipmentVisible=equipmentUrl&&failedEquipment!==equipmentUrl;
  if(failedDefault&&failedBase===baseUrl)return <span className={`pixel-avatar pixel-avatar-${size} pixel-avatar-fallback ${className}`} role="img" aria-label={label||'อวตาร์เริ่มต้น'}>★</span>;
  return <span className={`pixel-avatar avatar-v3 pixel-avatar-${size} ${avatar.effect!=='none'?`has-effect effect-${avatar.effect}`:''} ${className}`}
    data-avatar-character={failedBase===baseUrl?AVATAR_DEFAULT.base:avatar.base} data-avatar-equipment={equipmentVisible?avatar.equipment:'none'} data-avatar-effect={avatar.effect}
    role="img" aria-label={label||`อวตาร์ของ ${student?.name||'นักเรียน'}`}>
    {loaded!==source&&<span className="avatar-image-loading" aria-hidden="true"/>}
    <img className="avatar-v3-base" src={source} alt="" loading={size==='profile'?'eager':'lazy'} decoding="async" onLoad={()=>{setLoaded(source);if(source===baseUrl)onAssetReady?.({kind:'base',id:avatar.base});}} onError={()=>{
      if(source!==baseUrl||avatar.base===AVATAR_DEFAULT.base)setFailedDefault(true);
      setFailedBase(baseUrl);onAssetError?.({kind:'base',id:avatar.base});
    }}/>
    {equipmentVisible&&<span className="avatar-companion"><img className={`avatar-v3-equipment equipment-${avatar.equipment} ${equipment.legacy?'':'is-contained'}`} src={equipmentUrl} alt="" loading={size==='profile'?'eager':'lazy'} onLoad={()=>onAssetReady?.({kind:'equipment',id:avatar.equipment})} onError={()=>{
      setFailedEquipment(equipmentUrl);onAssetError?.({kind:'equipment',id:avatar.equipment});
    }}/></span>}
    {student?.isDemo && getDynamicAvatarEffect(avatar.effect) ? <AvatarDynamicEffect id={avatar.effect} animated={size==='profile'}/> : <AvatarEffect id={avatar.effect} animated={size==='profile'}/>}
  </span>;
}
