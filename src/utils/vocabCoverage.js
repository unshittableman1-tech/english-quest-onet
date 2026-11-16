// Coverage counts completed interactions, never proficiency or correct answers.
const keyFor=(owner,category)=>`onet_vocab_coverage_v1:${JSON.stringify([owner,category])}`;
const identity=card=>JSON.stringify([card.id,card.backThai || card.leftThai || '',card.frontLabel || card.back || '']);
const count=(history,mode,card)=>history[mode]?.[identity(card)] || 0;
const sharedCount=(history,card)=>Object.keys(history).reduce((total,mode)=>total+count(history,mode,card),0);
export function readVocabularyCoverage(owner,category,storage=globalThis.localStorage){
 if(!owner)return {};
 try{const data=JSON.parse(storage.getItem(keyFor(owner,category)));return data?.version===1&&data.modes&&typeof data.modes==='object'?data.modes:{};}catch{return {};}
}
export function saveVocabularyCoverage(owner,category,modes,storage=globalThis.localStorage){
 if(!owner)return true;
 try{storage.setItem(keyFor(owner,category),JSON.stringify({version:1,modes}));return true;}catch{return false;}
}
export function recordVocabularyPractice(history,mode,card){
 const value=count(history,mode,card);
 return {...history,[mode]:{...history[mode],[identity(card)]:Number.isSafeInteger(value)&&value>=0?value+1:1}};
}
export function vocabularyCoverage(cards,history,mode){
 const counts=cards.map(card=>mode ? count(history,mode,card) : sharedCount(history,card));
 return {total:cards.length,practiced:counts.filter(n=>n>0).length,cycles:counts.length?Math.min(...counts):0};
}
export function planVocabularyRound(cards,history,mode,random=Math.random){
 const shuffled=[...cards];
 for(let i=mode==='flashcard'?0:shuffled.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
 shuffled.sort((a,b)=>sharedCount(history,a)-sharedCount(history,b));
 const limit=({memory:6,duel:10,audio:10})[mode] || cards.length;
 // Finish the current pass before starting another; do not fill a short tail with repeats.
 return shuffled.filter(card=>sharedCount(history,card)===sharedCount(history,shuffled[0])).slice(0,limit);
}
