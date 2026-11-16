import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Dices, RotateCcw, X } from 'lucide-react';
import AvatarRenderer from './AvatarRenderer';
import { AVATAR_OPTIONS, AVATAR_DEMO_EXPANSION, normalizeAvatar, randomAvatar } from '../utils/avatarProfile';
import { avatarBackendEnabled, avatarErrorMessage, avatarOwnerKey } from '../utils/avatarApi';
import { avatarUnlockBackendEnabled, fetchAvatarEntitlements } from '../utils/avatarEntitlementsApi';
import { cosmeticChoiceState, demoCosmeticSnapshot, DEMO_COSMETIC_SCENARIOS } from '../utils/avatarUnlockModel.js';
import { AVATAR_EQUIPMENT, AVATAR_SELECTABLE_EQUIPMENT_IDS, getAvatarEquipment } from '../data/avatarEquipment';
import { AVATAR_EFFECTS, getAvatarEffect } from '../data/avatarEffects';
import { AVATAR_EQUIPMENT_PROPOSALS } from '../data/avatarEquipmentProposals';
import { AVATAR_HERO_PROPOSALS } from '../data/avatarHeroProposals';
import { AVATAR_DYNAMIC_EFFECTS, getDynamicAvatarEffect } from '../data/avatarDynamicEffects';
import AvatarDynamicEffect from './AvatarDynamicEffect';
import '../styles/avatarStudio.css';

const ARCHETYPES = {
  'boy-explorer':['นักสำรวจน้อย','ผู้ตามหาคำศัพท์บนเกาะแห่งการเรียนรู้'],
  'girl-explorer':['นักสำรวจดาวเหนือ','เพื่อนร่วมทางแห่งการผจญภัย'],
  'ocean-navigator':['นักเดินเรือแห่งสมุทร','ผู้ตามหาคำศัพท์ข้ามเกาะ'],
  'boy-scholar':['นักปราชญ์เวท','นักสำรวจโลกภาษาอังกฤษ'],
  'sky-adventurer':['นักผจญภัยแห่งฟ้า','ผู้สำรวจเกาะลอยฟ้า'],
  'girl-scholar':['แม่มดนักเล่าเรื่อง','ผู้ค้นพบเรื่องราวจากการอ่าน'],
  'boy-sky-guardian':['ผู้พิทักษ์แห่งฟ้า','เพื่อนร่วมผจญภัยบนเกาะลอยฟ้า'],
  'boy-star-reader':['นักอ่านดวงดาว','นักอ่านผู้ค้นหาเรื่องราว'],
  'girl-forest-scout':['นักสำรวจพงไพร','เพื่อนร่วมทางผู้รักธรรมชาติ'],
  'girl-desert-navigator':['นักเดินทางแห่งทะเลทราย','นักเดินทางผู้พร้อมเรียนรู้'],
  ...Object.fromEntries(AVATAR_HERO_PROPOSALS.map(hero=>[hero.id,[hero.nameTh,'เพื่อนร่วมทางแห่งการผจญภัย']])) ,
};
const EQUIPMENT = Object.fromEntries(AVATAR_EQUIPMENT.map(item => [item.id, item.nameTh]));
const EFFECTS = Object.fromEntries(AVATAR_EFFECTS.map(item => [item.id,item.nameTh]));
const TABS = [['base','ตัวละคร'],['equipment','ไอเทม'],['effect','เอฟเฟกต์']];

function Requirement({ info, selected, synthetic, baseline }) {
  return <div className="cosmetic-rule" data-cosmetic-state={info.state}>
    <span className={'cosmetic-state state-' + info.state.toLowerCase()}>{info.state==='EQUIPPED'?'กำลังใช้':info.allowed?(selected?'เลือกแล้ว · ยังไม่บันทึก':baseline?'ใช้ได้ตามสิทธิ์เดิม':'ปลดล็อกแล้ว'):info.state==='ELIGIBLE'?'เข้าเกณฑ์ รอยืนยัน':'ยังไม่ปลดล็อก'}</span>
    <small>{info.requirementTh}</small>
    {info.progress && <div className="cosmetic-progress">
      <span>{synthetic?'ค่าจำลอง':'ข้อมูลที่ตรวจแล้ว'} {info.progress.current.toLocaleString()} / {info.progress.target.toLocaleString()} {info.progress.unit}</span>
      <progress value={Math.min(info.progress.current,info.progress.target)} max={info.progress.target} aria-label={'ความคืบหน้า ' + info.progress.unit}/>
    </div>}
    {info.blocked && <em>รอข้อมูลหรือกฎที่ตรวจยืนยันแล้ว</em>}
  </div>;
}

export default function AvatarStudio({ student, initial, onSave, onClose, backendAvailable=avatarBackendEnabled, unlockEnabled=avatarUnlockBackendEnabled, entitlementClient }) {
  const saved = useRef(normalizeAvatar(initial));
  const initialKey = JSON.stringify(normalizeAvatar(initial));
  const lastInitial = useRef(initialKey); const dirty = useRef(false);
  const [draft, setDraft] = useState(saved.current);
  const [tab, setTab] = useState('base');
  const [previewChoice,setPreviewChoice]=useState(null);
  const [previewProposal,setPreviewProposal]=useState(null);
  const [previewHero,setPreviewHero]=useState(null);
  const [previewDynamic,setPreviewDynamic]=useState(null);
  const [scenario,setScenario]=useState('collection');
  const [verifiedSnapshot,setVerifiedSnapshot]=useState(null);
  const [entitlementError,setEntitlementError]=useState(null);
  const [checking,setChecking]=useState(false);const [checkVersion,setCheckVersion]=useState(0);
  const [status, setStatus] = useState({ kind: 'idle', message: '' });
  const [failedAssets, setFailedAssets] = useState({}); const [readyAssets, setReadyAssets] = useState({});
  const dialog=useRef(null);const busy=useRef(false);const title=useId();
  const owner=avatarOwnerKey(student);
  useEffect(()=>{
    if(student?.isDemo||!unlockEnabled)return;
    let active=true;setChecking(true);setEntitlementError(null);setVerifiedSnapshot(null);
    fetchAvatarEntitlements(student,entitlementClient,{enabled:unlockEnabled}).then(value=>{if(active)setVerifiedSnapshot(value);})
      .catch(error=>{if(active)setEntitlementError(error);}).finally(()=>{if(active)setChecking(false);});
    return()=>{active=false;};
  },[owner,student?.isDemo,unlockEnabled,entitlementClient,checkVersion]);
  const snapshot=useMemo(()=>student?.isDemo?demoCosmeticSnapshot(scenario):verifiedSnapshot,[student?.isDemo,scenario,verifiedSnapshot]);
  const baseline=!student?.isDemo&&!unlockEnabled;
  const choice=(kind,id)=>student?.isDemo&&kind==='effect'&&AVATAR_DYNAMIC_EFFECTS.some(effect=>effect.id===id)
    ? {state:saved.current.effect===id?'EQUIPPED':'UNLOCKED',allowed:true,blocked:false,requirementTh:'ใช้ชั่วคราวในเดโม'}
    : cosmeticChoiceState(kind,id,{snapshot,saved:saved.current,baseline});
  useEffect(()=>{
    if(lastInitial.current===initialKey)return;
    lastInitial.current=initialKey;saved.current=JSON.parse(initialKey);
    if(!dirty.current&&!busy.current)setDraft(saved.current);
  },[initialKey]);
  useEffect(()=>{
    const opener=document.activeElement;const previousOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';const node=dialog.current;node.showModal();
    return()=>{document.body.style.overflow=previousOverflow;node.close();if(opener?.isConnected)opener.focus();};
  },[]);
  const changeDraft=(next,touched=true)=>{if(!busy.current){dirty.current=touched;setDraft(normalizeAvatar(next));setPreviewChoice(null);setPreviewProposal(null);setPreviewHero(null);setPreviewDynamic(null);setStatus({kind:'idle',message:''});}};
  const select=(id)=>{
    setPreviewProposal(null);
    setPreviewHero(null);
    setPreviewDynamic(null);
    const kind=tab==='effect'?'effect':'equipment';
    if(tab!=='base'&&!choice(kind,id).allowed){setPreviewChoice({kind,id});setStatus({kind:'idle',message:''});return;}
    changeDraft({...draft,[tab]:id});
  };
  const randomize=()=>{
    const next=randomAvatar(student);
    const equipment=['none',...AVATAR_SELECTABLE_EQUIPMENT_IDS].filter(id=>choice('equipment',id).allowed);
    const effects=['none'];
    const availableBases=student?.isDemo?AVATAR_DEMO_EXPANSION:[];
    const base=availableBases.length?availableBases[Math.floor(Math.random()*availableBases.length)]:draft.base;
    changeDraft({...next,base,equipment:equipment[Math.floor(Math.random()*equipment.length)]||'none',effect:effects[Math.floor(Math.random()*effects.length)]||'none'});
  };
  const close=()=>{if(!busy.current)onClose();};
  const keepFocus=event=>{
    if(event.key!=='Tab')return;
    const controls=[...dialog.current.querySelectorAll('button:not(:disabled),select:not(:disabled),[tabindex="0"]')].filter(node=>node.getClientRects().length);
    const first=controls[0],last=controls.at(-1),current=document.activeElement;
    if(!first){event.preventDefault();return;}
    if(event.shiftKey&&(current===first||!controls.includes(current))){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&(current===last||!controls.includes(current))){event.preventDefault();first.focus();}
  };
  const display=previewChoice?normalizeAvatar({...draft,[previewChoice.kind==='effect'?'effect':'equipment']:previewChoice.id}):draft;
  const draftAllowed=choice('equipment',draft.equipment).allowed&&choice('effect',draft.effect).allowed;
  const previewOnly=!!previewDynamic||!!previewHero||!!previewProposal||!!previewChoice||!draftAllowed;
  const invalidAsset=failedAssets['base:'+display.base]||(display.equipment!=='none'&&failedAssets['equipment:'+display.equipment]);
  const imagesReady=readyAssets['base:'+display.base]&&(display.equipment==='none'||readyAssets['equipment:'+display.equipment]);
  async function confirm(){
    if(busy.current||invalidAsset||!imagesReady||previewOnly||checking)return;
    busy.current=true;setStatus({kind:'saving',message:'กำลังบันทึกอวตาร์…'});
    try{
      const result=await onSave(normalizeAvatar(draft),{demoScenario:student?.isDemo?scenario:undefined});
      if(!result?.avatar||typeof result.temporary!=='boolean')throw new Error('avatar_save_unconfirmed');
      saved.current=normalizeAvatar(result.avatar);dirty.current=false;setDraft(saved.current);
      setStatus({kind:'success',message:result.temporary?'ใช้อวตาร์นี้ในเดโมแล้ว · รีเฟรชหน้าแล้วจะกลับค่าเดิม':'บันทึกอวตาร์แล้ว'});
    }catch(error){setStatus({kind:'error',message:avatarErrorMessage(error)});}
    finally{busy.current=false;}
  }
  const assetFailed=({kind,id})=>setFailedAssets(current=>current[kind+':'+id]?current:({...current,[kind+':'+id]:true}));
  const assetReady=({kind,id})=>setReadyAssets(current=>current[kind+':'+id]?current:({...current,[kind+':'+id]:true}));
  const options=tab==='equipment'?AVATAR_SELECTABLE_EQUIPMENT_IDS:tab==='effect'?['none']:tab==='base'?[...AVATAR_OPTIONS.base,...AVATAR_DEMO_EXPANSION.filter(id=>!AVATAR_HERO_PROPOSALS.some(hero=>hero.id===id))]:AVATAR_OPTIONS[tab];
  const labels=tab==='base'?Object.fromEntries(Object.entries(ARCHETYPES).map(([id,value])=>[id,value[0]])):tab==='equipment'?EQUIPMENT:EFFECTS;
  const cosmetic=tab==='equipment'?getAvatarEquipment(display.equipment):tab==='effect'?(getAvatarEffect(display.effect)||getDynamicAvatarEffect(display.effect)):null;
  const cosmeticInfo=tab==='base'?null:choice(tab==='effect'?'effect':'equipment',tab==='effect'?display.effect:display.equipment);
  return createPortal(<dialog ref={dialog} className="avatar-dialog" aria-labelledby={title} onKeyDown={keepFocus}
    onCancel={event=>{event.preventDefault();close();}} onMouseDown={event=>{if(event.target===event.currentTarget)close();}}>
    <section className="avatar-studio hero-picker avatar-v3-workshop" data-avatar-tab={tab} aria-busy={status.kind==='saving'}>
      <header><div><p>ENGLISH QUEST • FANTASY ISLAND</p><h2 id={title}>สร้างฮีโร่นักผจญภัย</h2></div><div className="avatar-header-actions">
        <button type="button" onClick={randomize} disabled={status.kind==='saving'} aria-label="สุ่มฮีโร่" title="สุ่มฮีโร่"><Dices/></button>
        <button type="button" onClick={()=>changeDraft(saved.current,false)} disabled={status.kind==='saving'} aria-label="คืนค่าที่บันทึกไว้" title="คืนค่าที่บันทึกไว้"><RotateCcw/></button>
        <button type="button" onClick={close} disabled={status.kind==='saving'} aria-label="ปิด"><X/></button>
      </div></header>
      <nav className="avatar-tabs hero-collection-tabs" aria-label="ปรับแต่งฮีโร่">{TABS.map(([id,name])=><button type="button" key={id} aria-pressed={tab===id} className={tab===id?'active':''} onClick={()=>{setTab(id);setPreviewChoice(null);setPreviewProposal(null);setPreviewHero(null);setPreviewDynamic(null);}}>{name}</button>)}</nav>
      <div className="hero-picker-layout"><aside className="hero-picker-preview">
        <div className="hero-preview-stage">{previewHero ? <img className="hero-proposal-preview" src={previewHero.asset} alt=""/> : <AvatarRenderer student={student} config={previewProposal ? {...display,equipment:'none'} : previewDynamic ? {...display,effect:'none'} : display} size="profile" onAssetError={assetFailed} onAssetReady={assetReady}/>} {previewProposal&&<span className="proposal-preview-companion"><img src={previewProposal.asset} alt="" /></span>}{previewDynamic&&<AvatarDynamicEffect id={previewDynamic.id}/>}</div>
        <strong>{previewHero?.nameTh || ARCHETYPES[display.base]?.[0]}</strong><span>{student?.name}</span><small>{previewHero ? 'ตัวอย่างตัวละครใหม่' : ARCHETYPES[display.base]?.[1]}</small>
        {tab!=='base'&&<section className="equipment-selection-summary" aria-label={tab==='equipment'?'ไอเทมที่เลือก':'เอฟเฟกต์ที่เลือก'} aria-live="polite" data-equipment-selected={display.equipment}>
          {previewDynamic ? <><strong>{previewDynamic.nameTh}</strong><p>{previewDynamic.descriptionTh}</p><small>ตัวอย่างเคลื่อนไหว · ยังไม่เปิดบันทึก</small></> : previewProposal ? <><strong>{previewProposal.nameTh}</strong><p>ตัวอย่างไอเทมใหม่ · ข้อเสนอ {previewProposal.xp.toLocaleString()} XP</p><small>ยังไม่เปิดรับหรือบันทึกสิทธิ์</small></> : <><strong>{cosmetic?.nameTh||'ไม่ใช้ไอเทม'}</strong><p>{cosmetic?.descriptionTh||'เลือกไอเทมจากแกลเลอรีเพื่อดูตัวอย่าง'}</p><Requirement info={cosmeticInfo} selected={!previewOnly} synthetic={student?.isDemo} baseline={baseline}/></>}
        </section>}
        <p className="avatar-mode-note">{student?.isDemo?'เดโม: ใช้ชั่วคราว ไม่บันทึกบัญชีจริง':backendAvailable?'ยืนยันก่อนบันทึก และตรวจสิทธิ์กับเซิร์ฟเวอร์':'บัญชีจริง: ปรับตัวอย่างได้ แต่ยังไม่เปิดบันทึก'}</p>
      </aside><div className="hero-preset-scroll">
        {student?.isDemo&&<label className="cosmetic-demo-controls">เงื่อนไขจำลองการปลดล็อก
          <select aria-label="สถานการณ์จำลองการปลดล็อก" value={scenario} disabled={status.kind==='saving'} onChange={event=>{setScenario(event.target.value);setPreviewChoice(null);setStatus({kind:'idle',message:''});}}>
            {DEMO_COSMETIC_SCENARIOS.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}
          </select><small>ข้อมูลสังเคราะห์เท่านั้น ไม่เปลี่ยน XP หรือผลเรียนจริง</small>
        </label>}
        {!student?.isDemo&&<p className="cosmetic-policy-note">{baseline?'ใช้สิทธิ์เดิม · กฎ XP/ภารกิจใหม่ยังรออนุมัติ':checking?'กำลังตรวจสิทธิ์รางวัล…':entitlementError?avatarErrorMessage(entitlementError):'สิทธิ์รางวัลจากเซิร์ฟเวอร์'}</p>}
        {!student?.isDemo&&unlockEnabled&&<button type="button" className="cosmetic-recheck" onClick={()=>setCheckVersion(value=>value+1)} disabled={checking||status.kind==='saving'}>ตรวจสิทธิ์อีกครั้ง</button>}
        <p className="avatar-options-description">{tab==='base'?`ตัวละครผจญภัย ${AVATAR_OPTIONS.base.length + AVATAR_DEMO_EXPANSION.length} แบบ · เลือกตัวละครที่ต้องการใช้`:tab==='equipment'?'ไอเทมตกแต่งข้างตัว · แสดงเป็นภาพคู่กับฮีโร่ ไม่ใช่ชุดสวมใส่':'เอฟเฟกต์ใหม่ 15 แบบ · แตะเพื่อดูการเคลื่อนไหว ยังไม่เปิดบันทึก'}</p>
        {tab==='equipment'&&<div className="equipment-gallery-toolbar"><div><strong>ไอเทมทั้งหมด {AVATAR_SELECTABLE_EQUIPMENT_IDS.length + AVATAR_EQUIPMENT_PROPOSALS.length} ชิ้น</strong><small>ไอเทมใหม่เป็นตัวอย่าง เกณฑ์ XP ยังไม่เปิดใช้ ↓</small></div>
          <button type="button" onClick={()=>changeDraft({...draft,equipment:'none'})} disabled={draft.equipment==='none'||status.kind==='saving'}>ถอดไอเทม</button></div>}
        {previewOnly&&<div className="cosmetic-preview-notice" role="status">{previewDynamic?'ตัวอย่างเคลื่อนไหว · ยังไม่เปิดบันทึก':'ดูตัวอย่างเท่านั้น · ยังไม่ได้เลือกใช้'}
          <button type="button" onClick={()=>{setPreviewChoice(null);setPreviewProposal(null);setPreviewHero(null);setPreviewDynamic(null);}}>กลับไปตัวที่เลือก</button></div>}
        <div className={'hero-preset-grid avatar-v3-grid'+(tab==='equipment'?' avatar-equipment-grid':'')+(tab==='effect'?' avatar-effects-grid':'')} role="group" aria-label={TABS.find(([id])=>id===tab)[1]}>
          {options.map(id=>{
            const kind=tab==='effect'?'effect':'equipment';
            const info=tab==='base'?null:choice(kind,id);
            const allowed=tab==='base'||info.allowed;
            const selected=draft[tab]===id&&allowed;
            const unavailable=Boolean(failedAssets[tab+':'+id]);
            const item=tab==='equipment'?getAvatarEquipment(id):null;
            const peek=previewChoice?.id===id&&previewChoice.kind===kind;
            return <button type="button" key={id} disabled={unavailable||status.kind==='saving'} aria-pressed={selected}
              aria-label={labels[id]+(!allowed?' ดูตัวอย่าง (ยังไม่ปลดล็อก)':unavailable?' ภาพไม่พร้อม':'')}
              data-cosmetic-id={tab==='base'?undefined:id}
              className={(selected?'selected ':'')+(!allowed?'cosmetic-locked ':'')+(peek?'is-previewing ':'')+(unavailable?'locked':'')} onClick={()=>select(id)}>
              {item?<><img className={'equipment-gallery-thumb'+(item.legacy?' is-legacy':'')} src={item.asset} alt="" loading="lazy" onError={()=>assetFailed({kind:'equipment',id})}/><strong>{item.nameTh}</strong><small className="equipment-item-description">{item.descriptionTh}</small></>
                :<><AvatarRenderer student={student} config={tab==='effect'?{...draft,equipment:'none',effect:id}:{...draft,[tab]:id}} size="large" onAssetError={assetFailed}/><span>{labels[id]}</span></>}
              {info&&<Requirement info={info} selected={selected} synthetic={student?.isDemo} baseline={baseline}/>}
              {unavailable&&<small>ภาพไม่พร้อม</small>}{selected&&<Check size={18} aria-hidden="true"/>}
            </button>;
          })}
          {tab==='base'&&AVATAR_HERO_PROPOSALS.map(hero=><button type="button" key={hero.id} aria-pressed={draft.base===hero.id} aria-label={`${hero.nameTh} ${draft.base===hero.id?'เลือกแล้ว':'เลือกใช้'}`} className={draft.base===hero.id?'selected':''} disabled={status.kind==='saving'} onClick={()=>{setPreviewChoice(null);setPreviewProposal(null);setPreviewHero(null);changeDraft({...draft,base:hero.id});setStatus({kind:'idle',message:''});}}><img className="hero-proposal-thumbnail" src={hero.asset} alt="" loading="lazy"/><span>{hero.nameTh}</span><small>{draft.base===hero.id?'เลือกแล้ว':'เลือกใช้'}</small></button>)}
          {tab==='effect'&&AVATAR_DYNAMIC_EFFECTS.map(effect=><button type="button" key={effect.id} aria-pressed={student?.isDemo ? draft.effect===effect.id : previewDynamic?.id===effect.id} aria-label={`${effect.nameTh} ${student?.isDemo?'เลือกใช้ในเดโม':'ดูตัวอย่างเคลื่อนไหว'}`} className={student?.isDemo&&draft.effect===effect.id?'selected':previewDynamic?.id===effect.id?'is-previewing':''} disabled={status.kind==='saving'} onClick={()=>{if(student?.isDemo)changeDraft({...draft,effect:effect.id});else {setPreviewChoice(null);setPreviewProposal(null);setPreviewHero(null);setPreviewDynamic(effect);setStatus({kind:'idle',message:''});}}}><span className="dynamic-effect-thumbnail"><AvatarRenderer student={student} config={{...draft,equipment:'none',effect:'none'}} size="large" onAssetError={assetFailed}/><AvatarDynamicEffect id={effect.id} animated={false}/></span><strong>{effect.nameTh}</strong><small>{student?.isDemo?'ใช้ได้ในเดโม':'ตัวอย่าง · ยังไม่เปิดบันทึก'}</small></button>)}
          {tab==='equipment'&&AVATAR_EQUIPMENT_PROPOSALS.map(item=><button type="button" key={item.id} aria-pressed={previewProposal?.id===item.id} className={previewProposal?.id===item.id?'is-previewing':''} disabled={status.kind==='saving'} onClick={()=>{setPreviewChoice(null);setPreviewProposal(item);setStatus({kind:'idle',message:''});}}><img className="equipment-gallery-thumb" src={item.asset} alt="" loading="lazy"/><strong>{item.nameTh}</strong><span className="proposal-status">ตัวอย่าง · ยังไม่เปิดรับ</span><small className="equipment-item-description">ข้อเสนอ {item.xp.toLocaleString()} XP</small></button>)}
        </div>
      </div></div>
      <footer><div className={'avatar-save-status is-'+status.kind} role={status.kind==='error'?'alert':'status'}>
        {invalidAsset?'ภาพไอเทมหรือตัวละครยังไม่พร้อม กรุณาเลือกตัวเลือกอื่นก่อนยืนยัน':previewOnly?'กำลังดูตัวอย่างที่ยังไม่ปลดล็อก กรุณาเลือกตัวเลือกที่ใช้ได้ก่อนยืนยัน':!imagesReady?'กำลังโหลดภาพตัวละครและไอเทม…':status.message}
      </div><div className="avatar-footer-actions">
        {status.kind!=='success'&&<button type="button" className="avatar-cancel" onClick={close} disabled={status.kind==='saving'}>ยกเลิก</button>}
        {status.kind==='success' ? (
          <button type="button" className="avatar-save is-done" onClick={close}><Check size={18}/>เสร็จสิ้น (บันทึกเรียบร้อยแล้ว)</button>
        ) : (
          <button type="button" className="avatar-save" onClick={confirm} disabled={status.kind==='saving'||invalidAsset||!imagesReady||previewOnly||checking}><Check size={18}/>{status.kind==='saving'?'กำลังบันทึก…':'ใช้ฮีโร่นี้'}</button>
        )}
      </div></footer>
    </section>
  </dialog>,document.body);
}
