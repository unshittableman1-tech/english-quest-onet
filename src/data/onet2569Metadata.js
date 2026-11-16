// Public metadata only. Questions, draft keys and unpublished art live on the server.
export const ONET_2569=Object.freeze({id:'onet-p6-2569',name:'O-NET ภาษาอังกฤษ ป.6 · ชุดข้อสอบปี 2569',questionCount:32,maximumScore:100,durationMinutes:60,dateLabel:'31 มกราคม 2569',status:'DRAFT'});
export function onetReviewKey(){if(typeof window==='undefined'||!['127.0.0.1','localhost'].includes(window.location.hostname))return null;const key=new URLSearchParams(window.location.search).get('onetReview');return /^[a-f0-9]{48}$/.test(key||'')?key:null;}
