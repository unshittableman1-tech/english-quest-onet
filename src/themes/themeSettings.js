import {themeRegistry} from './themeRegistry.js';
export const THEME_STORAGE_KEY='onex_local_theme_v1';
export const defaultThemeSettings=()=>({version:1,activeTheme:'classic',defaultTheme:'classic',enabled:['classic','onex_fantasy'],history:[]});
export function normalizeThemeSettings(raw){
 const base=defaultThemeSettings();if(!raw || raw.version!==1)return base;
 const enabled=['classic',...(Array.isArray(raw.enabled)&&raw.enabled.includes('onex_fantasy')?['onex_fantasy']:[])];
 const known=key=>Object.hasOwn(themeRegistry,key)&&enabled.includes(key);
 return {version:1,enabled,activeTheme:known(raw.activeTheme)?raw.activeTheme:known(raw.defaultTheme)?raw.defaultTheme:'classic',defaultTheme:known(raw.defaultTheme)?raw.defaultTheme:'classic',history:Array.isArray(raw.history)?raw.history.filter(row=>row&&typeof row.actorId==='string'&&typeof row.action==='string'&&Number.isFinite(Date.parse(row.at))).slice(0,50):[]};
}
// UI/local-preview authorization only. No backend or production permission is inferred from this.
export function canManageThemes(actor){return actor?.authVerified===true && !actor.isDemo && !actor.isGuestDemo && typeof actor.user_id==='string' && !!actor.user_id && ['super_admin','platform_admin'].includes(actor.role);}
export function changeThemeSettings(raw,action,actor,local){
 if(!local)throw Error('theme_local_only');if(!canManageThemes(actor))throw Error('theme_forbidden');
 const state=normalizeThemeSettings(raw),key=action.key;
 if(!Object.hasOwn(themeRegistry,key))throw Error('theme_unknown');
 if(!['activate','default','enable','disable'].includes(action.type))throw Error('theme_action_invalid');
 if(action.type==='disable'&&key==='classic')throw Error('classic_always_available');
 if(['activate','default'].includes(action.type)&&!state.enabled.includes(key))throw Error('theme_disabled');
 const next={...state,enabled:[...state.enabled]};
 if(action.type==='activate')next.activeTheme=key;
 if(action.type==='default')next.defaultTheme=key;
 if(action.type==='enable')next.enabled=[...new Set([...state.enabled,key])];
 if(action.type==='disable'){next.enabled=state.enabled.filter(value=>value!==key);if(state.activeTheme===key)next.activeTheme='classic';if(state.defaultTheme===key)next.defaultTheme='classic';}
 const entry={id:globalThis.crypto?.randomUUID?.() || String(Date.now()),at:new Date().toISOString(),actorId:actor.user_id,action:action.type,key,from:state.activeTheme,to:next.activeTheme};
 next.history=[entry,...state.history].slice(0,50);return next;
}
