const VERSION = 'boss-mixed-activities-v1';

const base = ({ id, focus, question, options, answer, explanation, stimuli }) => ({
  id: `boss_mix_${id}`,
  type: 'mcq',
  question,
  options,
  answer,
  explanation,
  correctFeedback: explanation,
  wrongFeedback: explanation,
  stimuli,
  assessmentFocus: focus,
  skill: focus === 'comparison' ? 'grammar' : 'reading',
  difficulty: 'application',
  reviewStatus: 'approved',
  approvedModes: ['practice_assessment'],
  itemVersion: VERSION,
  scoringPolicy: 'first_response_v1',
  source: { type: 'original_boss_activity', provenance: 'locally_authored_from_verified_lesson_objectives' },
  contentReview: { status: 'synthetic_answer_checked', reviewer: 'Codex', version: VERSION },
  mediaReview: { status: 'verified', reviewer: 'Codex', version: VERSION },
});

const ordering = (id, cards, options, answer, explanation) => base({
  id, focus: 'ordering',
  question: 'The cards are mixed up. Which option shows the best order?',
  options, answer, explanation,
  stimuli: [{ type: 'sequence', title: 'Mixed event cards', steps: cards }],
});

const labeling = (id, rows, question, options, answer, explanation) => base({
  id, focus: 'labeling', question, options, answer, explanation,
  stimuli: [{ type: 'table', title: 'Picture-label guide', columns: ['Marker', 'What the marker points to'], rows }],
});

const graph = (id, title, points, question, options, answer, explanation) => base({
  id, focus: 'graph', question, options, answer, explanation,
  stimuli: [{ type: 'chart', chartType: 'bar', title, xLabel: 'Category', yLabel: 'Number', maximum: 20, step: 5, points }],
});

const comparison = (id, title, points, question, options, answer, explanation) => base({
  id, focus: 'comparison', question, options, answer, explanation,
  stimuli: [{ type: 'chart', chartType: 'bar', title, xLabel: 'Category', yLabel: 'Number', maximum: 20, step: 5, points }],
});

export const BOSS_ACTIVITY_QUESTIONS = {
  chapter2_boss: [
    ordering('social_order', ['C. Pim thanks the librarian.', 'A. Pim asks where the history books are.', 'D. The librarian shows her the shelf.', 'B. Pim enters the library.'], ['B → A → D → C', 'A → B → C → D', 'B → D → A → C', 'D → B → C → A'], 0, 'Pim enters first, asks for help, follows the librarian, and then says thank you.'),
    labeling('social_label', [['1', 'a person who helps customers choose food'], ['2', 'a paper showing food and prices'], ['3', 'money given after paying too much']], 'Which set of labels is correct for a restaurant scene?', ['1 waiter, 2 menu, 3 change', '1 customer, 2 bill, 3 order', '1 chef, 2 tray, 3 tip', '1 cashier, 2 recipe, 3 price'], 0, 'A waiter helps customers, a menu lists food and prices, and change is returned money.'),
    graph('social_graph', 'Books borrowed by one class', [{ label: 'Mon', value: 8 }, { label: 'Tue', value: 12 }, { label: 'Wed', value: 15 }, { label: 'Thu', value: 10 }], 'How many books were borrowed on Tuesday and Thursday altogether?', ['20', '22', '25', '27'], 1, 'Tuesday has 12 books and Thursday has 10, so 12 + 10 = 22.'),
    comparison('social_compare', 'Club survey', [{ label: 'Art', value: 14 }, { label: 'Music', value: 9 }, { label: 'Sport', value: 17 }, { label: 'Science', value: 12 }], 'Which sentence is correct?', ['Music is more popular than Art.', 'Science is the most popular club.', 'Sport is more popular than Art.', 'Art is less popular than Music.'], 2, 'Sport has 17 votes while Art has 14, so Sport is more popular than Art.'),
  ],
  strategy_boss: [
    ordering('strategy_order', ['D. Finally, write the answer.', 'B. Read every choice.', 'A. Read the question first.', 'C. Find the keyword in the passage.'], ['A → C → B → D', 'B → A → D → C', 'C → B → A → D', 'A → B → D → C'], 0, 'A useful exam strategy is to read the question, find the keyword, check every choice, and then answer.'),
    labeling('strategy_label', [['1', 'the heading at the top of a notice'], ['2', 'the day and time of an event'], ['3', 'the place where the event happens']], 'Which labels best complete the parts of an event notice?', ['1 title, 2 schedule, 3 venue', '1 price, 2 direction, 3 speaker', '1 address, 2 audience, 3 subject', '1 greeting, 2 reason, 3 signature'], 0, 'A notice normally identifies its title, schedule, and venue.'),
    graph('strategy_graph', 'Minutes spent reading', [{ label: 'Ann', value: 15 }, { label: 'Ben', value: 10 }, { label: 'Chai', value: 20 }, { label: 'Dao', value: 15 }], 'What is the average reading time for the four students?', ['10 minutes', '12 minutes', '15 minutes', '20 minutes'], 2, 'The total is 60 minutes. 60 ÷ 4 = 15 minutes.'),
    comparison('strategy_compare', 'Water used by four teams', [{ label: 'A', value: 8 }, { label: 'B', value: 12 }, { label: 'C', value: 12 }, { label: 'D', value: 16 }], 'Which sentence is supported by the graph?', ['Team A used as much water as Team D.', 'Team B used less water than Team C.', 'Team C used as much water as Team B.', 'Team D used fewer water than Team A.'], 2, 'Teams B and C both used 12 units, so they used the same amount.'),
  ],
  finalboss: [
    ordering('logic_order', ['B. Nida put soil in a pot.', 'D. A small plant began to grow.', 'A. She planted a bean seed.', 'C. She watered the soil every day.'], ['B → A → C → D', 'A → B → D → C', 'C → B → A → D', 'B → C → D → A'], 0, 'The pot needs soil before planting; watering follows, and the plant grows last.'),
    labeling('logic_label', [['1', 'the part of a plant under the soil'], ['2', 'the flat green part that makes food'], ['3', 'the colourful part that can produce seeds']], 'Which labels correctly match the plant parts?', ['1 root, 2 leaf, 3 flower', '1 stem, 2 root, 3 leaf', '1 flower, 2 stem, 3 root', '1 seed, 2 flower, 3 stem'], 0, 'Roots are under the soil, leaves make food, and flowers can produce seeds.'),
    graph('logic_graph', 'Fruit sold at a school fair', [{ label: 'Apple', value: 12 }, { label: 'Banana', value: 15 }, { label: 'Orange', value: 8 }, { label: 'Mango', value: 5 }], 'Half of all the fruit sold were packed into equal bags of five. How many bags were filled?', ['2 bags', '4 bags', '5 bags', '8 bags'], 1, 'A total of 40 fruit were sold. Half is 20, and 20 ÷ 5 = 4 bags.'),
    comparison('logic_compare', 'Plant height after four weeks', [{ label: 'A', value: 6 }, { label: 'B', value: 14 }, { label: 'C', value: 10 }, { label: 'D', value: 18 }], 'Which comparison is correct?', ['Plant A is taller than Plant C.', 'Plant B is shorter than Plant C.', 'Plant D is the tallest plant.', 'Plant C is as tall as Plant B.'], 2, 'Plant D has the greatest height at 18 centimetres.'),
  ],
};

export const BOSS_ACTIVITY_FOCUS = ['ordering', 'labeling', 'graph', 'comparison'];
