import { labelingFixtures, graphComparisonMission } from '../data/chapter3Fixtures.js';
import { compileGraphItem, compileLabelingItem, compileOrderingActivity } from './chapter3ActivityAdapters.js';
import { publicGraphQuestion } from './graphComparison.js';
import { questionWordQuestions } from '../data/chapter3_questions.js';
import { EXPANDED_ONET_ASSESSMENTS } from '../data/expandedOnetAssessments.js';
import { tensesAssessment } from '../data/questAssessments.js';
import { getCurrentStudent, saveStudent } from './storage.js';

const activity = (id, items) => ({ id, passPercent: 70, items });
const choice = question => ({
  id: question.id,
  kind: 'choice',
  allowedIds: question.options.map((_, index) => `option_${index}`),
  accepted: [[`option_${question.answer}`]],
  view: {
    prompt: question.question,
    options: question.options.map((text, index) => ({ id: `option_${index}`, text })),
  },
});

const definition = labelingFixtures[0];
const labeling = compileLabelingItem(definition);
labeling.view = {
  prompt: definition.objective,
  image: definition.image,
  imageAlt: definition.imageAlt,
  hotspots: definition.hotspots,
  labels: definition.labels.map(({ id, text }) => ({ id, text })),
};

const wordRounds = [
  ['Where', 'is', 'the', 'school', '?'],
  ['She', 'is', 'reading', 'a', 'book', '.'],
  ['They', 'went', 'to', 'the', 'market', 'yesterday', '.'],
].map((words, index) => ({ id: `live_words_${index}`, words, correct: words.join(' ') }));

const eventRounds = [
  ['First, Nida wakes up.', 'Next, she brushes her teeth.', 'Then, she eats breakfast.', 'Finally, she goes to school.'],
  ['First, dig a small hole.', 'Next, put the seed in the hole.', 'Then, cover it with soil.', 'Finally, water the seed.'],
].map((texts, index) => ({
  id: `live_events_${index}`,
  steps: texts.map((text, position) => ({ id: `step_${position}`, text })),
  correctOrder: texts.map((_, position) => `step_${position}`),
}));

const ordering = (id, mode, rounds) =>
  activity(
    id,
    compileOrderingActivity({ id: mode, rounds }).map((item, index) => ({
      ...item,
      view: {
        prompt: mode === 'words' ? 'Arrange the words to make a sentence.' : 'Arrange the events in order.',
        tokens: (mode === 'words' ? rounds[index].words : rounds[index].steps.map(step => step.text)).map((text, position) => ({
          id: `${mode}:${index}:${position}`,
          text,
        })),
      },
    }))
  );

const graph = kind =>
  graphComparisonMission.questions
    .filter(question => question.activity === kind)
    .map(question => {
      const dataset = graphComparisonMission.datasets.find(entry => entry.id === question.datasetId);
      const item = compileGraphItem(question, dataset);
      item.view = publicGraphQuestion(question, dataset);
      return item;
    });

const MISSIONS = {
  question_words: [activity('c3_question_words_assessment_v1', questionWordQuestions.map(choice))],
  pronouns_master: [activity('c3_pronouns_assessment_v1', EXPANDED_ONET_ASSESSMENTS.pronouns_master.map(choice))],
  c3_labeling_lab: [activity('c3_labeling_classroom_v1', [labeling])],
  c3_ordering_quest: [ordering('c3_ordering_words_v1', 'words', wordRounds), ordering('c3_ordering_events_v1', 'steps', eventRounds)],
  tenses_arena: [activity('c3_tenses_assessment_v1', tensesAssessment.map(choice))],
  c3_graph_comparison: [activity('c3_graph_detective_v1', graph('graph')), activity('c3_comparison_v1', graph('comparison'))],
};

function getRunKey(runId) {
  return `eq_c3_client_run:${runId}`;
}

export async function runClientChapter3Command(body) {
  if (body.action === 'start') {
    const { missionId, requestId } = body;
    const missionActivities = MISSIONS[missionId] || [];
    const questions = missionActivities.flatMap(act =>
      act.items.map(it => ({
        id: it.id,
        activityId: act.id,
        kind: it.kind,
        answered: false,
        correct: false,
        view: it.view,
        _accepted: it.accepted,
      }))
    );

    const run = {
      runId: requestId,
      missionId,
      questions,
      createdAt: new Date().toISOString(),
    };

    try {
      sessionStorage.setItem(getRunKey(requestId), JSON.stringify(run));
    } catch {}

    return { ok: true, runId: requestId };
  }

  if (body.action === 'view') {
    const { runId } = body;
    let run = null;
    try {
      const raw = sessionStorage.getItem(getRunKey(runId));
      if (raw) run = JSON.parse(raw);
    } catch {}

    if (!run) throw new Error('run_not_found');

    return {
      ok: true,
      runId: run.runId,
      questions: run.questions.map(({ _accepted, ...publicQuestion }) => publicQuestion),
    };
  }

  if (body.action === 'submit') {
    const { runId, itemId, responseIds } = body;
    let run = null;
    try {
      const raw = sessionStorage.getItem(getRunKey(runId));
      if (raw) run = JSON.parse(raw);
    } catch {}

    if (!run) throw new Error('run_not_found');

    const question = run.questions.find(q => q.id === itemId);
    if (!question) throw new Error('item_not_found');

    // Check if responseIds matches any accepted solution
    const normalizedResponse = (responseIds || []).slice().sort();
    const isCorrect = (question._accepted || []).some(accepted => {
      const normalizedAccepted = accepted.slice().sort();
      return JSON.stringify(normalizedResponse) === JSON.stringify(normalizedAccepted);
    });

    question.answered = true;
    question.correct = isCorrect;

    try {
      sessionStorage.setItem(getRunKey(runId), JSON.stringify(run));
    } catch {}

    return { ok: true };
  }

  if (body.action === 'finalize') {
    const { runId } = body;
    let run = null;
    try {
      const raw = sessionStorage.getItem(getRunKey(runId));
      if (raw) run = JSON.parse(raw);
    } catch {}

    if (!run) throw new Error('run_not_found');

    const total = run.questions.length || 1;
    const score = run.questions.filter(q => q.correct).length;
    const pct = Math.round((score / total) * 100);
    const passed = pct >= 70;
    const earnedXP = passed ? 50 : 0;
    const earnedStars = passed ? (pct >= 90 ? 3 : 2) : 1;

    const currentStudent = getCurrentStudent();
    let updatedStudent = currentStudent;

    if (currentStudent) {
      const existingProgress = currentStudent.questProgress || {};
      const missionProgress = existingProgress[run.missionId] || {};
      const previousEarned = missionProgress.passed === true;

      const finalEarnedXP = previousEarned ? 0 : earnedXP;

      updatedStudent = {
        ...currentStudent,
        xp: (currentStudent.xp || 0) + finalEarnedXP,
        questProgress: {
          ...existingProgress,
          [run.missionId]: {
            ...missionProgress,
            passed: previousEarned || passed,
            verifiedLearningPassed: previousEarned || passed,
            score: Math.max(score, missionProgress.score || 0),
            total,
            pct: Math.max(pct, missionProgress.pct || 0),
            attempts: (missionProgress.attempts || 0) + 1,
            roundsPlayed: (missionProgress.roundsPlayed || 0) + 1,
            stars: [earnedStars],
          },
        },
      };

      try {
        await saveStudent(updatedStudent);
      } catch {}
    }

    try {
      sessionStorage.removeItem(getRunKey(runId));
    } catch {}

    return {
      ok: true,
      passed,
      score,
      total,
      earnedXP,
      earnedStars,
      student: updatedStudent,
    };
  }

  throw new Error('unknown_action');
}
