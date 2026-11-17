import { supabase } from './supabase.js';

export const PRACTICE_SKILLS = [
  { id: 'present_simple', name: 'ไวยากรณ์ Present Simple & กริยาช่วย', standard: 'ต 1.2 ป.6/1, ต 1.3 ป.6/1', icon: '📝' },
  { id: 'daily_life_vocabulary', name: 'คำศัพท์ในชีวิตประจำวัน & กิจวัตร', standard: 'ต 1.1 ป.6/2, ต 1.2 ป.6/3', icon: '🏃' },
  { id: 'reading_main_idea', name: 'การอ่านจับใจความ & บริบทสั้น', standard: 'ต 1.1 ป.6/4', icon: '📖' },
  { id: 'signs_and_notices', name: 'ป้ายสัญลักษณ์ & คำเตือนในที่สาธารณะ', standard: 'ต 1.1 ป.6/1', icon: '🛑' },
  { id: 'conversation_courtesy', name: 'บทสนทนา & มารยาทการขอร้อง', standard: 'ต 1.2 ป.6/1, ต 2.1 ป.6/1', icon: '💬' },
];

export const DEFAULT_PRACTICE_DRAFTS = [
  {
    id: 'draft-bns-01',
    skill: 'present_simple',
    skillLabel: 'ไวยากรณ์ Present Simple & กริยาช่วย',
    standard: 'ต 1.2 ป.6/1, ต 1.3 ป.6/1',
    targetClass: 'ป.6/1',
    status: 'pending_review',
    awardsXP: false,
    createdAt: '2026-11-17T03:30:00.000Z',
    reviewedBy: null,
    reviewedAt: null,
    reviewReason: null,
    questions: [
      {
        id: 'q-ps-01',
        prompt: 'Suda usually _____ to school by bicycle every morning.',
        options: ['goes', 'go', 'going', 'went'],
        answerIndex: 0,
        explanation: 'ประธาน Suda เป็นเอกพจน์บุรุษที่ 3 (กริยาลงท้ายด้วย -o ต้องเติม -es ใน Present Simple จึงใช้ goes)',
        difficulty: 'ง่าย (Easy)',
      },
      {
        id: 'q-ps-02',
        prompt: 'Tom and Jerry _____ like spicy food.',
        options: ["doesn't", "don't", "isn't", "aren't"],
        answerIndex: 1,
        explanation: 'ประธาน Tom and Jerry เป็นพหูพจน์ 2 คน เมื่อสร้างประโยคปฏิเสธใน Present Simple กริยาแท้ like ต้องใช้ do not (don\'t)',
        difficulty: 'ปานกลาง (Medium)',
      },
      {
        id: 'q-ps-03',
        prompt: 'What time _____ your mother wake up on weekdays?',
        options: ['do', 'does', 'is', 'did'],
        answerIndex: 1,
        explanation: 'ประธาน your mother เป็นเอกพจน์ ประโยคคำถาม Present Simple ใช้กริยาช่วย does นำหน้าประธาน',
        difficulty: 'ปานกลาง (Medium)',
      },
      {
        id: 'q-ps-04',
        prompt: 'Look at the schedule. The English club _____ at 3:30 p.m. every Tuesday.',
        options: ['start', 'starts', 'started', 'is starting'],
        answerIndex: 1,
        explanation: 'กำหนดการหรือตารางเวลาที่แน่นอน (Scheduled timetable) ใช้ Present Simple ประธาน The English club เป็นเอกพจน์ กริยาเติม -s เป็น starts',
        difficulty: 'ท้าทาย (Challenging)',
      },
    ],
  },
  {
    id: 'draft-bns-02',
    skill: 'signs_and_notices',
    skillLabel: 'ป้ายสัญลักษณ์ & คำเตือนในที่สาธารณะ',
    standard: 'ต 1.1 ป.6/1',
    targetClass: 'ป.6/2',
    status: 'pending_review',
    awardsXP: false,
    createdAt: '2026-11-17T04:15:00.000Z',
    reviewedBy: null,
    reviewedAt: null,
    reviewReason: null,
    questions: [
      {
        id: 'q-sn-01',
        prompt: 'You see a notice: "PLEASE DO NOT FEED THE ANIMALS". Where do you usually see this notice?',
        options: ['At the zoo', 'In the school library', 'At the cinema', 'Inside the pharmacy'],
        answerIndex: 0,
        explanation: 'ป้ายห้ามให้อาหารสัตว์ (Do not feed the animals) มักพบเห็นที่สวนสัตว์ (zoo)',
        difficulty: 'ง่าย (Easy)',
      },
      {
        id: 'q-sn-02',
        prompt: 'A yellow warning sign reads: "CAUTION: WET FLOOR". What should visitors do?',
        options: ['Run quickly across the room', 'Walk carefully to avoid slipping', 'Wash their shoes with water', 'Leave the building immediately'],
        answerIndex: 1,
        explanation: 'ป้ายเตือนพื้นเปียกลื่น (Wet Floor) แนะนำให้เดินอย่างระมัดระวังเพื่อไม่ให้ลื่นล้ม (Walk carefully)',
        difficulty: 'ง่าย (Easy)',
      },
      {
        id: 'q-sn-03',
        prompt: 'A sign at the swimming pool says: "CHILDREN UNDER 10 MUST BE WITH AN ADULT". What does it mean?',
        options: [
          'Adults cannot swim in this pool.',
          'Children under 10 cannot swim without grown-ups.',
          'Children over 10 are not allowed.',
          'Only swimming instructors can enter.',
        ],
        answerIndex: 1,
        explanation: 'เด็กอายุต่ำกว่า 10 ปีต้องมีผู้ใหญ่ดูแลอยู่ด้วยเสมอ (Children under 10 cannot swim without grown-ups)',
        difficulty: 'ปานกลาง (Medium)',
      },
    ],
  },
  {
    id: 'draft-bns-03',
    skill: 'conversation_courtesy',
    skillLabel: 'บทสนทนา & มารยาทการขอร้อง',
    standard: 'ต 1.2 ป.6/1, ต 2.1 ป.6/1',
    targetClass: 'ทุกห้อง',
    status: 'approved',
    awardsXP: false,
    createdAt: '2026-11-16T10:00:00.000Z',
    reviewedBy: 'คุณครูผู้สอนภาษาอังกฤษ',
    reviewedAt: '2026-11-16T14:20:00.000Z',
    reviewReason: 'เนื้อหาและสำนวนสุภาพตรงตามเกณฑ์ สทศ. สามารถใช้ฝึกทักษะการสื่อสารได้',
    questions: [
      {
        id: 'q-cv-01',
        prompt: 'You did not hear the homework instructions. What is the most polite thing to say to your teacher?',
        options: [
          'You must repeat that now.',
          'Excuse me, could you repeat the homework instructions, please?',
          'Say that again right now.',
          'I am going to ignore the homework.',
        ],
        answerIndex: 1,
        explanation: 'การขอให้ครูพูดซ้ำอย่างสุภาพใช้ "Excuse me, could you repeat..., please?"',
        difficulty: 'ง่าย (Easy)',
      },
      {
        id: 'q-cv-02',
        prompt: 'A classmate says: "Thank you so much for lending me your pencil!" What is the most appropriate response?',
        options: ["You're welcome.", 'Never tell me.', 'Of course not.', 'I want it back now.'],
        answerIndex: 0,
        explanation: 'เมื่อมีผู้กล่าวขอบคุณ การตอบรับด้วยความยินดีอย่างเป็นทางการและสุภาพใช้ "You\'re welcome."',
        difficulty: 'ง่าย (Easy)',
      },
      {
        id: 'q-cv-03',
        prompt: 'Jane: "Would you like to come to my birthday party this Saturday?"\nPeter: "_____ I have to take care of my sick sister."',
        options: [
          "I'd love to, but I'm afraid I can't.",
          'Yes, of course, absolutely!',
          "I don't like your party.",
          'You should not invite me.',
        ],
        answerIndex: 0,
        explanation: 'การปฏิเสธคำเชิญอย่างสุภาพต้องแสดงความเสียดายและบอกเหตุผลอย่างนุ่มนวล โดยใช้ "I\'d love to, but I\'m afraid I can\'t."',
        difficulty: 'ปานกลาง (Medium)',
      },
    ],
  },
];

function getStorageKey(schoolId) {
  return `eq_personalized_practice_${schoolId || 'default'}`;
}

function loadLocalDrafts(schoolId) {
  try {
    const raw = localStorage.getItem(getStorageKey(schoolId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Failed to parse local practice drafts:', err);
  }
  // Initialize with seed drafts tailored to this school
  const initial = DEFAULT_PRACTICE_DRAFTS.map(d => ({
    ...d,
    schoolId: schoolId || 'BNS69',
  }));
  saveLocalDrafts(schoolId, initial);
  return initial;
}

function saveLocalDrafts(schoolId, drafts) {
  try {
    localStorage.setItem(getStorageKey(schoolId), JSON.stringify(drafts));
  } catch (err) {
    console.error('Failed to save practice drafts locally:', err);
  }
}

async function invokeEdgeFunction(action, body = {}) {
  try {
    const { data, error } = await supabase.functions.invoke('review-personalized-practice', {
      body: { action, ...body },
    });
    if (error) throw error;
    return data;
  } catch (err) {
    // Return null so callers gracefully fallback to school-scoped local storage
    return null;
  }
}

/**
 * List all practice drafts for a given school.
 */
export async function listPracticeDrafts(schoolId) {
  const remote = await invokeEdgeFunction('list', { schoolId });
  if (remote && Array.isArray(remote.drafts) && remote.drafts.length > 0) {
    return { drafts: remote.drafts, isLocalStaging: false };
  }
  const local = loadLocalDrafts(schoolId);
  return { drafts: local, isLocalStaging: true };
}

/**
 * Review a draft (approve or reject with reason).
 */
export async function reviewPracticeDraft(schoolId, draftId, decision, reason = '', reviewerName = 'คุณครูผู้ตรวจ') {
  if (decision === 'rejected' && !reason?.trim()) {
    throw new Error('กรุณาระบุเหตุผลในการไม่อนุมัติ เพื่อบันทึกเป็นหลักฐานทางวิชาการ');
  }

  // Try edge function first
  const remote = await invokeEdgeFunction('review', { schoolId, draftId, decision, reason });
  if (remote && remote.ok) {
    return { ok: true, status: decision };
  }

  // Fallback to local storage update
  const drafts = loadLocalDrafts(schoolId);
  const targetIndex = drafts.findIndex(d => d.id === draftId);
  if (targetIndex === -1) {
    throw new Error('ไม่พบชุดฝึกที่ระบุ');
  }

  drafts[targetIndex] = {
    ...drafts[targetIndex],
    status: decision,
    reviewedBy: reviewerName,
    reviewedAt: new Date().toISOString(),
    reviewReason: reason?.trim() || null,
  };

  saveLocalDrafts(schoolId, drafts);
  return { ok: true, status: decision, draft: drafts[targetIndex] };
}

/**
 * Create or generate a new practice draft.
 */
export async function createPracticeDraft({ schoolId, skill, targetClass = 'ทุกห้อง', difficulty = 'ปานกลาง (Medium)', count = 4, topic = '', customQuestions = null, createdBy = 'คุณครูผู้สอน' }) {
  const skillMeta = PRACTICE_SKILLS.find(s => s.id === skill) || PRACTICE_SKILLS[0];
  
  let questions = customQuestions;
  if (!Array.isArray(questions) || questions.length === 0) {
    // Generate pedagogical questions tailored to the skill and topic
    questions = generateTemplateQuestions(skill, difficulty, count, topic);
  }

  const newDraft = {
    id: `draft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    schoolId: schoolId || 'BNS69',
    skill: skillMeta.id,
    skillLabel: topic ? `${skillMeta.name}: ${topic}` : skillMeta.name,
    standard: skillMeta.standard,
    targetClass: targetClass || 'ทุกห้อง',
    status: 'pending_review',
    awardsXP: false,
    createdBy,
    createdAt: new Date().toISOString(),
    reviewedBy: null,
    reviewedAt: null,
    reviewReason: null,
    questions,
  };

  const drafts = loadLocalDrafts(schoolId);
  drafts.unshift(newDraft);
  saveLocalDrafts(schoolId, drafts);

  return { ok: true, draft: newDraft };
}

/**
 * Delete a draft.
 */
export async function deletePracticeDraft(schoolId, draftId) {
  const drafts = loadLocalDrafts(schoolId);
  const filtered = drafts.filter(d => d.id !== draftId);
  saveLocalDrafts(schoolId, filtered);
  return { ok: true };
}

/**
 * Update a specific question within a draft.
 */
export async function updateDraftQuestion(schoolId, draftId, questionIndex, updatedQuestion) {
  const drafts = loadLocalDrafts(schoolId);
  const target = drafts.find(d => d.id === draftId);
  if (!target || !target.questions[questionIndex]) throw new Error('ไม่พบข้อคำถามที่ต้องการแก้ไข');

  target.questions[questionIndex] = {
    ...target.questions[questionIndex],
    ...updatedQuestion,
  };

  saveLocalDrafts(schoolId, drafts);
  return { ok: true, draft: target };
}

/**
 * Helper to generate template questions by skill
 */
function generateTemplateQuestions(skill, difficulty, count, topic) {
  const templates = {
    present_simple: [
      {
        prompt: 'My brother _____ football in the school playground every Saturday.',
        options: ['plays', 'play', 'playing', 'played'],
        answerIndex: 0,
        explanation: 'ประธาน My brother เป็นเอกพจน์ กริยาใน Present Simple เติม -s จึงใช้ plays',
      },
      {
        prompt: 'Birds _____ in the sky when the sun rises.',
        options: ['fly', 'flies', 'flying', 'flew'],
        answerIndex: 0,
        explanation: 'ประธาน Birds เป็นพหูพจน์ กริยาแท้ไม่ต้องเติม -s จึงใช้ fly',
      },
      {
        prompt: '_____ you drink warm milk before going to bed?',
        options: ['Do', 'Does', 'Is', 'Are'],
        answerIndex: 0,
        explanation: 'ประธาน you ในประโยคคำถาม Present Simple ใช้กริยาช่วย Do',
      },
      {
        prompt: 'The library _____ open on national holidays.',
        options: ["isn't", "aren't", "doesn't", "don't"],
        answerIndex: 0,
        explanation: 'คำว่า open ในที่นี้เป็นคุณศัพท์ (Adjective) บอกสถานะ จึงต้องใช้ Verb to be (The library isn\'t open)',
      },
      {
        prompt: 'Water _____ at 100 degrees Celsius.',
        options: ['boils', 'boil', 'boiled', 'boiling'],
        answerIndex: 0,
        explanation: 'ข้อเท็จจริงทางธรรมชาติ (Scientific fact) ใช้ Present Simple กับประธานนับไม่ได้ (Water) กริยาเติม -s เป็น boils',
      },
    ],
    daily_life_vocabulary: [
      {
        prompt: 'Before going to school, we must _____ our teeth to keep them clean.',
        options: ['brush', 'comb', 'cook', 'draw'],
        answerIndex: 0,
        explanation: 'การทำความสะอาดฟันใช้กริยา brush one\'s teeth (แปรงฟัน)',
      },
      {
        prompt: 'In the morning, I always help my mother _____ breakfast in the kitchen.',
        options: ['prepare', 'sleep', 'throw', 'forget'],
        answerIndex: 0,
        explanation: 'การจัดเตรียมอาหารเช้าในครัวใช้กริยา prepare หรือ cook breakfast',
      },
      {
        prompt: 'My father drives a car to _____ every morning at 7:30 a.m.',
        options: ['work', 'bed', 'bath', 'game'],
        answerIndex: 0,
        explanation: 'การขับรถไปทำงานใช้สำนวน drive to work',
      },
      {
        prompt: 'Students should wear their clean _____ on school days.',
        options: ['uniforms', 'pajamas', 'blankets', 'swimsuits'],
        answerIndex: 0,
        explanation: 'ชุดเครื่องแบบนักเรียนเรียกว่า school uniforms',
      },
    ],
    reading_main_idea: [
      {
        passage: 'Honeybees are very important insects. They fly from flower to flower collecting nectar. While doing this, they help plants grow by spreading pollen. Without bees, many fruits and vegetables would not grow.',
        prompt: 'What is the main idea of this passage?',
        options: [
          'Honeybees are important insects that help plants grow.',
          'Bees only like sweet nectar from yellow flowers.',
          'Vegetables are better than fruits.',
          'Insects only fly during sunny weather.',
        ],
        answerIndex: 0,
        explanation: 'ใจความสำคัญอยู่ที่ประโยคแรกและสรุปความสำคัญของผึ้งต่อพืช (Honeybees are important insects that help plants grow)',
      },
      {
        passage: 'Plastic bottles take hundreds of years to break down. When people throw them into rivers, they harm fish and ocean animals. Recycling plastic bottles helps keep our environment clean.',
        prompt: 'Why should we recycle plastic bottles according to the text?',
        options: [
          'To protect animals and keep the environment clean.',
          'To make rivers flow faster.',
          'Because plastic bottles break down in one week.',
          'To stop catching fish in the sea.',
        ],
        answerIndex: 0,
        explanation: 'ตามเนื้อเรื่อง การรีไซเคิลขวดพลาสติกช่วยปกป้องสัตว์และรักษาสิ่งแวดล้อมให้สะอาด (protect animals and keep environment clean)',
      },
      {
        passage: 'Regular exercise makes the heart strong and improves your mood. Children should exercise for at least 60 minutes every day by walking, running, or playing sports.',
        prompt: 'How long should children exercise each day?',
        options: ['At least 60 minutes', 'Only 10 minutes', '2 hours before bedtime', 'Once a month'],
        answerIndex: 0,
        explanation: 'ในข้อความระบุชัดเจนว่า: "at least 60 minutes every day"',
      },
    ],
    signs_and_notices: [
      {
        prompt: 'A sign at the park says: "DO NOT PICK THE FLOWERS". What should you do?',
        options: ['Look at the flowers without picking them', 'Pick some flowers to take home', 'Water the flowers with juice', 'Sell the flowers to tourists'],
        answerIndex: 0,
        explanation: 'ป้ายห้ามเด็ดดอกไม้ (Do not pick the flowers) หมายถึง ให้ชมดอกไม้โดยไม่เด็ดหรือทำลาย',
      },
      {
        prompt: 'A sign inside an elevator reads: "MAXIMUM CAPACITY: 8 PERSONS". What happens if 10 people enter?',
        options: ['The elevator is overloaded and unsafe.', 'The elevator moves twice as fast.', 'Everyone gets a free ride.', 'The elevator stops permanently.'],
        answerIndex: 0,
        explanation: 'น้ำหนักเกินหรือจำนวนคนเกินความจุที่ปลอดภัย (Overloaded)',
      },
      {
        prompt: 'A sign on a gate reads: "BEWARE OF DOG". What does this warning mean?',
        options: ['Be careful because there is a dog inside.', 'Please bring your dog inside.', 'Feed the dog some food.', 'Buy a dog from this house.'],
        answerIndex: 0,
        explanation: 'ป้ายเตือนระวังสุนัข (Beware of dog) เตือนให้ระมัดระวังอันตรายจากสุนัข',
      },
    ],
    conversation_courtesy: [
      {
        prompt: 'You accidentally stepped on someone\'s foot. What should you say immediately?',
        options: ["I'm so sorry! Are you alright?", "It's your fault.", "Look where you walk.", "Don't mention it."],
        answerIndex: 0,
        explanation: 'เมื่อเผลอเหยียบเท้าผู้อื่น ต้องกล่าวขอโทษทันที: "I\'m so sorry! Are you alright?"',
      },
      {
        prompt: 'Your teacher is carrying a heavy stack of books. What is the most polite offer?',
        options: ['May I help you carry those books, Teacher?', 'Give them all to me right now.', 'Why are those books so heavy?', 'You should put them down.'],
        answerIndex: 0,
        explanation: 'การเสนอตัวช่วยครูอย่างสุภาพใช้ "May I help you carry those..., Teacher?"',
      },
      {
        prompt: 'A friend asks: "Could you please lend me an eraser?"\nYou want to lend it. What do you say?',
        options: ['Sure, here you are.', 'No, never ask me.', 'I lost it yesterday.', 'Why do you ask?'],
        answerIndex: 0,
        explanation: 'การยินดีให้ยืมสิ่งของใช้ "Sure, here you are." (ได้สิ นี่จ้ะ)',
      },
    ],
  };

  const pool = templates[skill] || templates.present_simple;
  const picked = pool.slice(0, Math.min(count, pool.length));
  return picked.map((q, idx) => ({
    id: `q-${skill.slice(0, 3)}-${Date.now().toString(36)}-${idx + 1}`,
    prompt: q.prompt,
    passage: q.passage || null,
    options: q.options,
    answerIndex: q.answerIndex,
    explanation: q.explanation,
    difficulty: difficulty || 'ปานกลาง (Medium)',
  }));
}
