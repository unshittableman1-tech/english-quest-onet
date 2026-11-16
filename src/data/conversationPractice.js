export const scenarios = [
  { id: 'thanks-friend', topic: 'ขอบคุณ', context: 'เพื่อนขอบคุณที่คุณช่วยหยิบดินสอให้', line: 'Thank you!', hint: 'ลองเลือกคำตอบที่ใช้รับคำขอบคุณ', options: [
    { id: 'welcome', text: "You're welcome.", correct: true, explanation: 'ใช้ตอบรับเมื่อมีคนขอบคุณได้' },
    { id: 'sorry', text: "I'm sorry.", explanation: 'ประโยคนี้ใช้กล่าวขอโทษ ลองเลือกคำตอบสำหรับรับคำขอบคุณ' },
    { id: 'bye', text: 'Goodbye.', explanation: 'ประโยคนี้ใช้กล่าวลา ลองอีกครั้งนะ' },
  ] },
  { id: 'thanks-teacher', topic: 'ขอบคุณ', context: 'ครูขอบคุณที่คุณช่วยเก็บหนังสือ', line: 'Thank you for helping me.', hint: 'นึกถึงคำตอบรับคำขอบคุณอีกแบบหนึ่ง', options: [
    { id: 'no-problem', text: 'No problem.', correct: true, explanation: 'ใช้ตอบรับคำขอบคุณได้ เช่นเดียวกับ “You’re welcome.”' },
    { id: 'fine', text: "I'm fine.", explanation: 'คำตอบนี้ใช้บอกความรู้สึก ไม่ใช่การตอบรับคำขอบคุณ' },
    { id: 'sorry', text: "I'm sorry.", explanation: 'คำนี้ใช้ขอโทษ ลองเลือกคำตอบรับคำขอบคุณ' },
  ] },
  { id: 'greeting', topic: 'ทักทาย', context: 'เพื่อนถามว่าคุณสบายดีไหม และวันนี้คุณสบายดี', line: 'How are you?', hint: 'ตอบว่าเรารู้สึกอย่างไร', options: [
    { id: 'fine', text: "I'm fine, thank you.", correct: true, explanation: 'ใช้บอกว่าเราสบายดีและขอบคุณที่ถาม' },
    { id: 'welcome', text: "You're welcome.", explanation: 'คำตอบนี้มักใช้รับคำขอบคุณ ลองตอบความรู้สึกของคุณ' },
    { id: 'bye', text: 'See you tomorrow.', explanation: 'ประโยคนี้ใช้กล่าวลา ลองตอบว่าคุณรู้สึกอย่างไร' },
  ] },
  { id: 'apology', topic: 'ขอโทษ', context: 'เพื่อนมาสายและกล่าวขอโทษ คุณต้องการบอกว่าไม่เป็นไร', line: "I'm sorry I'm late.", hint: 'เลือกคำตอบที่แสดงว่าให้อภัย', options: [
    { id: 'okay', text: "That's OK.", correct: true, explanation: 'ใช้ตอบรับคำขอโทษเพื่อบอกว่าไม่เป็นไร' },
    { id: 'help', text: 'Can I help you?', explanation: 'ประโยคนี้ใช้เสนอความช่วยเหลือ ลองตอบรับคำขอโทษ' },
    { id: 'thanks', text: 'Thank you.', explanation: 'ประโยคนี้ใช้กล่าวขอบคุณ ลองเลือกคำตอบที่บอกว่าไม่เป็นไร' },
  ] },
  { id: 'offer', topic: 'การเสนอ', context: 'เพื่อนเสนอเครื่องดื่มให้ และคุณต้องการรับ', line: 'Would you like some water?', hint: 'ตอบรับอย่างสุภาพ', options: [
    { id: 'no', text: 'No, thank you.', explanation: 'ประโยคนี้เป็นการปฏิเสธอย่างสุภาพ แต่สถานการณ์นี้คุณต้องการรับ' },
    { id: 'yes', text: 'Yes, please.', correct: true, explanation: 'ใช้ตอบรับข้อเสนออย่างสุภาพ' },
    { id: 'sorry', text: "I'm sorry.", explanation: 'ประโยคนี้ใช้ขอโทษ ลองเลือกคำตอบรับข้อเสนอ' },
  ] },
];

export function recordAnswer(answers, question, optionId) {
  const option = question.options.find(item => item.id === optionId);
  if (!option || answers[question.id]?.solved) return answers;
  const previous = answers[question.id];
  return { ...answers, [question.id]: { firstCorrect: previous?.firstCorrect ?? Boolean(option.correct), solved: Boolean(option.correct), selected: option.id } };
}

export function summarize(answers) {
  const values = Object.values(answers);
  return { completed: values.filter(value => value.solved).length, firstCorrect: values.filter(value => value.firstCorrect).length };
}
