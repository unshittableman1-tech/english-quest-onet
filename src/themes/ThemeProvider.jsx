import {createContext,useContext,useEffect,useState} from 'react';
import {resolveTheme,resolveThemeAsset} from './themeRegistry';
import {defaultThemeSettings,normalizeThemeSettings,changeThemeSettings,THEME_STORAGE_KEY} from './themeSettings';
const Context=createContext(null);
const localEnvironment=()=>import.meta.env.DEV&&['localhost','127.0.0.1','[::1]'].includes(window.location.hostname);
const readSettings=()=>{if(!localEnvironment())return defaultThemeSettings();try{return normalizeThemeSettings(JSON.parse(localStorage.getItem(THEME_STORAGE_KEY)));}catch{return defaultThemeSettings();}};
export function ThemeProvider({children}){
 const [settings,setSettings]=useState(readSettings);const theme=resolveTheme(settings.activeTheme);const localOnly=localEnvironment();
 useEffect(()=>{
  const root=document.documentElement;root.dataset.onexTheme=theme.key;
  for(const [name,value] of Object.entries(theme.tokens))root.style.setProperty(`--onex-${name}`,value);
  root.style.setProperty('--onex-background',`url("${resolveThemeAsset(theme.key,'background')}")`);
  return()=>{delete root.dataset.onexTheme;for(const name of Object.keys(theme.tokens))root.style.removeProperty(`--onex-${name}`);root.style.removeProperty('--onex-background');};
 },[theme.key]);
 useEffect(()=>{if(!localOnly)return;const listener=event=>{if(event.key===THEME_STORAGE_KEY)setSettings(readSettings());};window.addEventListener('storage',listener);return()=>window.removeEventListener('storage',listener);},[localOnly]);
 const change=(action,actor)=>{
  const next=changeThemeSettings(settings,action,actor,localOnly);
  // Write first: a storage error must not be shown as a successful persistent activation.
  localStorage.setItem(THEME_STORAGE_KEY,JSON.stringify(next));setSettings(next);
 };
 return <Context.Provider value={{theme,settings,change,localOnly,asset:name=>resolveThemeAsset(theme.key,name)}}>{children}</Context.Provider>;
}
export function useTheme(){return useContext(Context)||{theme:resolveTheme(),settings:defaultThemeSettings(),localOnly:false,change:()=>{throw Error('theme_provider_missing');},asset:name=>resolveThemeAsset('classic',name)};}
