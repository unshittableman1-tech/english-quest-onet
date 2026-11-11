import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppContext } from '../src/App';
import ExamMode from '../src/components/ExamMode';
import FinalBoss from '../src/components/FinalBoss';
import { FINAL_EXAM_CONFIG } from '../src/data/chapter4_config';
import { finalBossQuestions } from '../src/data/finalBossQuestions';
import QuizPage from '../src/components/QuizPage';
import BadgeModal from '../src/components/BadgeModal';
import MissionSelect from '../src/components/MissionSelect';
import GameMissionRouter from '../src/components/games/GameMissionRouter';
import StudentReport from '../src/components/StudentReport';
import RealOnetSimulator from '../src/components/RealOnetSimulator';
import ReviewMistakePage from '../src/components/ReviewMistakePage';
import { QUESTS } from '../src/data/questions';
import QuestMap from '../src/components/QuestMap';
import VocabDrillHub from '../src/components/VocabDrillHub';
import BadgePage from '../src/components/BadgePage';
import TierInfoModal from '../src/components/ranking/TierInfoModal';
import { VOCAB_CATEGORIES, getDrillCards } from '../src/data/vocabDrill';
import { CH1_MISSIONS } from '../src/data/missions/ch1_missions';
import { getUnlockedQuests } from '../src/utils/scoring';
import { getQuestMissions } from '../src/utils/missionAccess';
import { buildGameMissionRewardProgress } from '../src/utils/gameMissionRewards';
import { selectBossAssessmentQuestions } from '../src/utils/bossAssessment';

const pendingFixtureOriginals = new Map();

export function getVocabImageAudit() {
  return VOCAB_CATEGORIES.map(category => {
    const cards = getDrillCards(category);
    return {
      id: category.id,
      name: category.name,
      total: cards.length,
      illustrated: cards.filter(card => Boolean(card.image)).length,
      missing: cards.filter(card => !card.image).map(card => ({
        id: card.id,
        word: card.frontLabel || card.back || card.front,
        thai: card.backThai || '',
      })),
    };
  });
}

export function mountBadgePage() {
  const student = {
    id: 'local_badge_review', badges: ['vocab_rookie', 'streak_3'],
    badgeStats: { correctBySkill: { vocabulary: 70, signs: 150 }, perfectLevels: 0, streakDays: 3 },
  };
  localStorage.setItem(`eng_quest_arena_${student.id}`, JSON.stringify({
    arenaBadges: ['arena_challenger'], bestMiniMock: { percent: 85 }, bestFullMock: { percent: 75 },
  }));
  isolatedRoot().render(<AppContext.Provider value={{ student, navigate: () => {}, checkBadges: () => {} }}><BadgePage /></AppContext.Provider>);
}

export function mountTierInfoModal() {
  document.getElementById('root').style.display = 'none';
  window.__smokeRoot?.unmount();
  document.getElementById('smoke-root')?.remove();
  const element = document.createElement('div');
  element.id = 'smoke-root';
  document.body.append(element);
  window.__smokeRoot = createRoot(element);
  window.__smokeRoot.render(
    <TierInfoModal
      student={{ name: 'Synthetic Student', xp: 900, totalStars: 12 }}
      selectedTierName="Bronze Adventurer"
      onClose={() => {}}
    />,
  );
}

export function mountVocabHub(id = 'local_vocab_fixture') {
  window.__vocabXP = [];
  isolatedRoot().render(<AppContext.Provider value={{ student: { id }, navigate: () => {} }}><VocabDrillHub onBack={() => {}} onAddXP={(...args) => window.__vocabXP.push(args)} /></AppContext.Provider>);
}

export function mountReviewMap(allPassed = true) {
  const questProgress = Object.fromEntries(QUESTS.map(q => [q.id, { passed: allPassed || q.chapter === 1, pct: allPassed || q.chapter === 1 ? 80 : 0, roundsPlayed: 2, stars: [2, 3] }]));
  const student = { id: 'local_map_review', name: 'Map Review', level: 10, xp: 27000, badges: [], questProgress,
    mistakeBank: { first: { quest: 'family', mastered: false }, second: { quest: 'conversation', mastered: false } } };
  const unlockedQuests = Object.fromEntries(QUESTS.map(q => [q.id, true]));
  window.__reviewMapNavigation = [];
  isolatedRoot().render(<AppContext.Provider value={{ student, questProgress, unlockedQuests, navigate: (...args) => window.__reviewMapNavigation.push(args), handleLogout: () => {} }}><QuestMap /></AppContext.Provider>);
}

function isolatedRoot() {
  document.getElementById('root').style.display = 'none';
  window.__smokeRoot?.unmount();
  document.getElementById('smoke-root')?.remove();
  const element = document.createElement('div'); element.id = 'smoke-root'; document.body.append(element);
  window.__smokeRoot = createRoot(element);
  return window.__smokeRoot;
}

export function mountStudentReport(student) {
  isolatedRoot().render(<AppContext.Provider value={{ student, questProgress: student.questProgress || {}, navigate: () => {} }}><StudentReport /></AppContext.Provider>);
}

export function mountSimulator() {
  window.__simulatorXP = [];
  isolatedRoot().render(<React.StrictMode><RealOnetSimulator student={{ id: 'local_simulator_fixture' }} onBack={() => {}} onAddXP={(...args) => window.__simulatorXP.push(args)} /></React.StrictMode>);
}

export async function mountTwoStepReview() {
  const { strategyBossQuestions } = await import('../src/data/chapter3_questions');
  const { getCurrentStudent, processReviewAnswer } = await import('../src/utils/storage');
  const question = structuredClone(strategyBossQuestions[0]);
  window.__twoStepReviewItem = question;
  localStorage.setItem('eq_onet_current', JSON.stringify({ id: 'local_two_step_review', questProgress: {}, mistakeBank: {
    [question.id]: { ...question, mastered: false, correctInReview: 0, timesWrong: 1 },
  } }));
  function ReviewFixture() {
    const [student, setStudent] = React.useState(getCurrentStudent);
    const app = { student, addXP: async () => {}, checkBadges: async () => {}, navigate: () => {},
      processReviewAnswer: async (...args) => { await processReviewAnswer(...args); setStudent(getCurrentStudent()); },
    };
    return <AppContext.Provider value={app}><ReviewMistakePage /></AppContext.Provider>;
  }
  isolatedRoot().render(<ReviewFixture />);
}

export async function mountUnsupportedMcqExam() {
  const { miniMockPool } = await import('../src/data/chapter4_questions');
  for (const question of miniMockPool) Object.assign(question, { type: 'two_step', reasonChoices: ['a', 'b'], reasonAnswer: 0 });
  await mountExam('ExamMode', 'mini_mock_arena');
}

export function setPendingAssessmentFixture(questId, pending) {
  const quest = QUESTS.find(q => q.id === questId);
  if (pending) {
    if (!pendingFixtureOriginals.has(questId)) pendingFixtureOriginals.set(questId, quest.questions);
    quest.questions = pendingFixtureOriginals.get(questId).map(q => ({ ...q, reviewStatus: 'pending_teacher', approvedModes: [] }));
  } else if (pendingFixtureOriginals.has(questId)) {
    quest.questions = pendingFixtureOriginals.get(questId);
    pendingFixtureOriginals.delete(questId);
  }
}

export async function mountDraftAssessment(questId) {
  const quest = QUESTS.find(q => q.id === questId);
  Math.random = () => 0.5;
  document.getElementById('root').style.display = 'none';
  window.__smokeRoot?.unmount();
  document.getElementById('smoke-root')?.remove();
  const element = document.createElement('div'); element.id = 'smoke-root'; document.body.append(element);
  window.__smokeRoot = createRoot(element);
  window.__assessmentCalls = []; window.__quizXP = [];
  const assessmentPool = [...quest.questions, ...(quest.supplementalBossQuestions || [])];
  const assessmentQuestions = quest.requiredAssessmentFocus
    ? selectBossAssessmentQuestions(assessmentPool, quest.assessmentCount, quest.requiredAssessmentFocus)
    : quest.questions;
  window.__assessmentItems = assessmentQuestions.map(q => ({ id: q.id, answer: q.answer, text: q.options[q.answer], focus: q.assessmentFocus || null }));
  const { saveQuestResult } = await import('../src/utils/storage');
  const student = { id: 'local_browser_assessment', isDemo: true, xp: 0, questProgress: {} };
  localStorage.setItem('eq_onet_current', JSON.stringify(student));
  const app = { student, navigate: () => {}, addXP: async (...args) => window.__quizXP.push(args),
    completeQuest: async (...args) => { window.__assessmentCalls.push(args); return saveQuestResult(student.id, ...args); },
    showToast: () => {}, checkBadges: () => {}, saveMistake: () => {},
  };
  window.__smokeRoot.render(<AppContext.Provider value={app}><QuizPage questId={questId}/></AppContext.Provider>);
}

export function mountMissionSelect(questId, { locked = false, completed = false } = {}) {
  document.getElementById('root').style.display = 'none';
  window.__smokeRoot?.unmount();
  document.getElementById('smoke-root')?.remove();
  const element = document.createElement('div');
  element.id = 'smoke-root';
  document.body.append(element);
  window.__smokeRoot = createRoot(element);
  window.__missionNavigation = [];
  const questProgress = locked ? {} : Object.fromEntries(QUESTS.map(quest => [quest.id, { passed: true, pct: 100 }]));
  if (completed) questProgress[questId] = { ...questProgress[questId], gameMissions: Object.fromEntries(getQuestMissions(questId).map(mission => [mission.id, { rewardClaimed: true, xpAwarded: mission.xpReward }])) };
  const student = { id: 'ordering_access_synthetic', questProgress };
  window.__smokeRoot.render(<AppContext.Provider value={{ student, unlockedQuests: getUnlockedQuests(questProgress, student), currentQuest: questId, navigate: (...args) => window.__missionNavigation.push(args), addXP: async () => {} }}><MissionSelect /></AppContext.Provider>);
}

export function mountGameMission(questId, missionId) {
  document.getElementById('root').style.display = 'none';
  window.__smokeRoot?.unmount();
  document.getElementById('smoke-root')?.remove();
  const element = document.createElement('div');
  element.id = 'smoke-root';
  document.body.append(element);
  window.__smokeRoot = createRoot(element);
  const mission = CH1_MISSIONS[questId]?.find(item => item.id === missionId);
  window.__gameMissionComplete = [];
  window.__smokeRoot.render(
    <GameMissionRouter
      mission={mission}
      onComplete={(...args) => window.__gameMissionComplete.push(args)}
      onBack={() => {}}
    />,
  );
}

export function mountOrderingFixture(mission, { preserveRewards = false } = {}) {
  const root = isolatedRoot();
  window.__orderingComplete = [];
  window.__orderingBack = 0;
  if (!preserveRewards) window.__orderingStudent = { xp: 0, questProgress: {} };
  root.render(<GameMissionRouter mission={mission} onBack={() => { window.__orderingBack += 1; }} onComplete={async xp => {
    const reward = buildGameMissionRewardProgress(window.__orderingStudent, mission.questId || 'synthetic', mission, xp);
    window.__orderingStudent = { xp: window.__orderingStudent.xp + reward.awardedXP, questProgress: reward.questProgress };
    window.__orderingComplete.push({ requestedXP: xp, awardedXP: reward.awardedXP });
  }} />);
}

export function mountQuiz(twoStep = false, hasTranslation = true, mediaFixture = null) {
  const quest = QUESTS.find(q => q.id === 'family');
  quest.questions = Array.from({ length: twoStep ? 1 : 10 }, (_, i) => ({
    id: `quiz-smoke-${i}`, question: "Who is your father's father?", options: ['Grandfather', 'Cousin', 'Brother', 'Uncle'], answer: 0,
    correctFeedback: 'Grandfather หมายถึงปู่หรือตา', wrongFeedback: 'ลองสังเกตความสัมพันธ์ในครอบครัว',
    ...(hasTranslation ? { translation: 'พ่อของพ่อเรียกว่าอะไร' } : {}), vocab: { your: 'ของคุณ' },
    ...(twoStep ? { type: 'two_step', reasonChoices: ['Father of a parent', 'A sibling'], correctReasonIndex: 0 } : {}),
    ...(mediaFixture || {}),
  }));
  Math.random = () => 0.5;
  document.getElementById('root').style.display = 'none';
  window.__smokeRoot?.unmount();
  document.getElementById('smoke-root')?.remove();
  const element = document.createElement('div');
  element.id = 'smoke-root';
  document.body.append(element);
  window.__smokeRoot = createRoot(element);
  window.__quizXP = [];
  window.__quizResults = [];
  window.__quizNavigation = [];
  const app = {
    student: { id: 'demo_student', isDemo: true, xp: 175, level: 2 },
    navigate: (...args) => window.__quizNavigation.push(args),
    addXP: async (...args) => window.__quizXP.push(args),
    completeQuest: async (...args) => { window.__quizResults.push(args); return { family: { roundsPlayed: 63, passed: args[1] / args[2] >= .7, pct: 85, stars: [3, 3] } }; },
    checkBadges: () => {}, showToast: () => {}, saveMistake: () => {},
  };
  window.__smokeRoot.render(<AppContext.Provider value={app}><QuizPage questId="family" /></AppContext.Provider>);
}

export function mountBadgeRewards() {
  window.__smokeRoot.render(<BadgeModal badges={[
    { id: 'a', name: 'Combo Master', icon: '⚡', description: 'ตอบถูกต่อเนื่อง', xpReward: 80 },
    { id: 'b', name: 'Explorer', icon: '⭐', description: 'เรียนรู้ครบภารกิจ', xpReward: 20 },
  ]} badge={{ icon: '⭐' }} onClose={() => { window.__badgeClosed = true; }} />);
}

export async function mountExam(component, missionId, mediaFixture = null, syntheticTimingBank = false) {
  if (syntheticTimingBank) {
    // Timer/submit tests must not certify or depend on unreviewed production stimuli.
    const arena = await import('../src/data/chapter4_questions');
    let serial = 0;
    for (const q of [...Object.values(arena).filter(Array.isArray).flat(), ...QUESTS.flatMap(quest => quest.questions), ...finalBossQuestions]) {
      Object.assign(q, { question: `Synthetic timing item ${serial++}`, stimuli: [], mediaRequired: false, type: 'mcq', reviewStatus: undefined });
    }
  }
  if (mediaFixture) {
    const { miniMockPool } = await import('../src/data/chapter4_questions');
    for (const q of miniMockPool) Object.assign(q, mediaFixture);
  }
  if (component === 'ExamMode') FINAL_EXAM_CONFIG.timeLimit = 3;
  if (component === 'FinalBoss') {
    Math.random = () => 0.5;
    window.__bossCorrectOptions = finalBossQuestions.map(q => q.answer);
  }
  document.getElementById('root').style.display = 'none';
  window.__smokeRoot?.unmount();
  document.getElementById('smoke-root')?.remove();
  const element = document.createElement('div');
  element.id = 'smoke-root';
  document.body.append(element);
  window.__smokeRoot = createRoot(element);
  window.__submissions = [];
  window.__smokeStudent = { id: 'demo_student', isDemo: true, xp: 0, questProgress: {} };
  const app = {
    student: window.__smokeStudent,
    navigate: () => {},
    addXP: async () => {},
    checkBadges: async () => {},
    setStudent: value => { window.__smokeStudent = typeof value === 'function' ? value(window.__smokeStudent) : value; },
  };
  const Component = component === 'FinalBoss' ? FinalBoss : ExamMode;
  window.__smokeRoot.render(
    <AppContext.Provider value={app}>
      <Component missionId={missionId} student={app.student}
        onFinish={value => window.__submissions.push(value)} onCancel={() => {}} />
    </AppContext.Provider>
  );
}
