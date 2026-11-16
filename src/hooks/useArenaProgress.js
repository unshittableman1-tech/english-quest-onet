import { useEffect, useState } from 'react';
import { arenaOwner, readArenaQueue, flushArenaQueue, fetchStudentArenaProgress } from '../utils/arenaProgress';

// Retry while this signed-in learner's app is open. No background worker and
// no transfer of another learner's outbox when accounts change.
export function useArenaSync(student) {
  const key=arenaOwner(student);
  useEffect(()=>{
    if(!key)return;
    const retry=()=>{if(globalThis.navigator?.onLine!==false)flushArenaQueue(student).catch(()=>{});};
    retry();const timer=window.setInterval(retry,30000);
    window.addEventListener('online',retry);window.addEventListener('arena-progress-queued',retry);
    return()=>{window.clearInterval(timer);window.removeEventListener('online',retry);window.removeEventListener('arena-progress-queued',retry);};
  },[key]);
}

export default function useArenaProgress(student) {
  const key=arenaOwner(student);
  const [revision,setRevision]=useState(0),[loaded,setLoaded]=useState({key:null,status:'idle',snapshot:null});
  useEffect(()=>{
    const changed=()=>setRevision(v=>v+1);
    window.addEventListener('arena-progress-changed',changed);
    return()=>window.removeEventListener('arena-progress-changed',changed);
  },[]);
  useEffect(()=>{
    if(!key)return;
    let active=true;
    setLoaded({key,status:'loading',snapshot:null});
    fetchStudentArenaProgress(student).then(snapshot=>{if(active)setLoaded({key,status:'ready',snapshot});})
      .catch(error=>{if(active)setLoaded({key,status:error.code==='arena_sync_blocked'?'blocked':'error',snapshot:null});});
    return()=>{active=false;};
  },[key,revision]);
  let queue=[],storageError=false;
  try{queue=readArenaQueue(student);}catch{storageError=true;}
  const retry=async()=>{try{await flushArenaQueue(student);}catch{}setRevision(v=>v+1);};
  return {snapshot:loaded.key===key?loaded.snapshot:null,status:!key?'local':loaded.key===key?loaded.status:'loading',queue,storageError,retry};
}
