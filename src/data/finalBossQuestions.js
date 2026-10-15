// finalBossQuestions.js — 30 ข้อ สำหรับ O-NET Final Boss (ผสมทุกหมวด)
import {
  vocabularyQuestions,
  signsQuestions,
  directionsQuestions,
  marketQuestions,
  conversationQuestions,
  readingQuestions,
  grammarQuestions,
} from './questions';

export const finalBossQuestions = [
  // Vocabulary (5 ข้อ)
  { ...vocabularyQuestions[0],  id: 'fb01' },
  { ...vocabularyQuestions[5],  id: 'fb02' },
  { ...vocabularyQuestions[10], id: 'fb03' },
  { ...vocabularyQuestions[2],  id: 'fb04' },
  { ...vocabularyQuestions[11], id: 'fb05' },
  // Signs (5 ข้อ)
  { ...signsQuestions[0],  id: 'fb06' },
  { ...signsQuestions[1],  id: 'fb07' },
  { ...signsQuestions[4],  id: 'fb08' },
  { ...signsQuestions[6],  id: 'fb09' },
  { ...signsQuestions[7],  id: 'fb10' },
  // Directions (5 ข้อ)
  { ...directionsQuestions[0], id: 'fb11' },
  { ...directionsQuestions[2], id: 'fb12' },
  { ...directionsQuestions[4], id: 'fb13' },
  { ...directionsQuestions[6], id: 'fb14' },
  { ...directionsQuestions[8], id: 'fb15' },
  // Conversation (5 ข้อ)
  { ...conversationQuestions[0], id: 'fb16' },
  { ...conversationQuestions[1], id: 'fb17' },
  { ...conversationQuestions[3], id: 'fb18' },
  { ...conversationQuestions[5], id: 'fb19' },
  { ...conversationQuestions[7], id: 'fb20' },
  // Reading (5 ข้อ)
  { ...readingQuestions[0], id: 'fb21' },
  { ...readingQuestions[3], id: 'fb22' },
  { ...readingQuestions[5], id: 'fb23' },
  { ...readingQuestions[7], id: 'fb24' },
  { ...readingQuestions[9], id: 'fb25' },
  // Grammar (5 ข้อ)
  { ...grammarQuestions[0], id: 'fb26' },
  { ...grammarQuestions[2], id: 'fb27' },
  { ...grammarQuestions[4], id: 'fb28' },
  { ...grammarQuestions[6], id: 'fb29' },
  { ...grammarQuestions[8], id: 'fb30' },
];
