import { assertGraphQuestion, graphExpectedResult, graphExpectedSentence, graphExpressionChoices } from '../utils/graphComparison.js';

export const labelingFixtures = [{
  id: 'labeling_classroom_preview_v1', type: 'image_labeling', title: 'Labeling Lab — School & Classroom',
  objective: 'ฝึกจับคู่คำศัพท์สิ่งของในห้องเรียนกับตำแหน่งบนภาพ',
  image: '/assessment/quest-scenes/clean-classroom-v1.webp', imageAlt: 'ห้องเรียนที่มีกระดาน ชั้นหนังสือ โต๊ะ เก้าอี้ หน้าต่าง และถังขยะ',
  imageWidth: 768, imageHeight: 576,
  labels: [
    { id: 'window', text: 'Window', meaning: 'หน้าต่าง' },
    { id: 'chair', text: 'Chair', meaning: 'เก้าอี้' },
    { id: 'blackboard', text: 'Blackboard', meaning: 'กระดานดำ' },
    { id: 'bin', text: 'Bin', meaning: 'ถังขยะ' },
    { id: 'desk', text: 'Desk', meaning: 'โต๊ะเรียน' },
    { id: 'bookshelf', text: 'Bookshelf', meaning: 'ชั้นหนังสือ' },
  ],
  hotspots: [
    { id: 'spot_1', x: .17, y: .20 }, { id: 'spot_2', x: .48, y: .20 },
    { id: 'spot_3', x: .91, y: .20 }, { id: 'spot_4', x: .21, y: .46 },
    { id: 'spot_5', x: .14, y: .70 }, { id: 'spot_6', x: .82, y: .72 },
  ],
  answerKey: { spot_1: 'blackboard', spot_2: 'bookshelf', spot_3: 'window', spot_4: 'desk', spot_5: 'chair', spot_6: 'bin' },
}, {
  id: 'labeling_duplicate_preview_v1', type: 'image_labeling', title: 'Labeling Lab — คำซ้ำ (ชุดทดสอบ)',
  objective: 'ตรวจการแยกป้ายคำที่มีข้อความเหมือนกันด้วยรหัสชิ้นที่ต่างกัน',
  image: '/assessment/quest-scenes/clean-classroom-v1.webp', imageAlt: 'เก้าอี้สองตัวในห้องเรียน', imageWidth: 768, imageHeight: 576,
  labels: [{ id: 'chair_front', text: 'Chair', description: 'เก้าอี้ด้านหน้า', meaning: 'เก้าอี้ด้านหน้า' }, { id: 'chair_back', text: 'Chair', description: 'เก้าอี้ด้านหลัง', meaning: 'เก้าอี้ด้านหลัง' }],
  hotspots: [{ id: 'spot_front', x: .12, y: .90 }, { id: 'spot_back', x: .20, y: .59 }],
  answerKey: { spot_front: 'chair_front', spot_back: 'chair_back' },
}];

const shuffle = (items, seed) => {
  let value = [...seed].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 17);
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    value = (value * 1664525 + 1013904223) >>> 0;
    const target = value % (index + 1);
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
};

const datasets = [
  { id: 'fruit', title: 'Favorite Fruits — Classroom Survey', chartType: 'bar', xLabel: 'Fruit', unit: 'students', unitKind: 'count', noun: 'students', itemNoun: 'fruit', precision: 0,
    categories: [{ id: 'apple', label: 'Apple', sentenceLabel: 'apples', value: 8 }, { id: 'banana', label: 'Banana', sentenceLabel: 'bananas', value: 12 }, { id: 'orange', label: 'Orange', sentenceLabel: 'oranges', value: 5 }, { id: 'mango', label: 'Mango', sentenceLabel: 'mangoes', value: 10 }] },
  { id: 'weather', title: 'Afternoon Temperature', chartType: 'line', ordered: true, xLabel: 'Day', unit: '°C', unitKind: 'temperature', noun: 'temperature', precision: 0,
    categories: [{ id: 'mon', label: 'Monday', value: 28 }, { id: 'wed', label: 'Wednesday', value: 32 }, { id: 'fri', label: 'Friday', value: 30 }] },
  { id: 'rice', title: 'Rice in Two Bags', chartType: 'bar', xLabel: 'Bag', unit: 'kg of rice', unitKind: 'mass', noun: 'rice', itemNoun: 'bag', precision: 1,
    categories: [{ id: 'bag_a', label: 'Bag A', value: 2.5 }, { id: 'bag_b', label: 'Bag B', value: 5 }] },
  { id: 'plants', title: 'Plant Heights', chartType: 'bar', xLabel: 'Plant', unit: 'cm', unitKind: 'height', noun: 'height', itemNoun: 'plant', precision: 0,
    categories: [{ id: 'plant_a', label: 'Plant A', value: 15 }, { id: 'plant_b', label: 'Plant B', value: 25 }] },
  { id: 'posters', title: 'Poster Areas', chartType: 'bar', xLabel: 'Poster', unit: 'cm²', unitKind: 'size', noun: 'area', itemNoun: 'poster', precision: 0,
    categories: [{ id: 'poster_a', label: 'Poster A', value: 400 }, { id: 'poster_b', label: 'Poster B', value: 800 }] },
];

const raw = [
  ['fruit_max', 'graph', 'fruit', 'max_value', []],
  ['fruit_min', 'graph', 'fruit', 'min_value', []],
  ['fruit_exact', 'graph', 'fruit', 'exact_value', ['banana']],
  ['fruit_difference', 'graph', 'fruit', 'difference', ['banana', 'apple']],
  ['weather_exact', 'graph', 'weather', 'exact_value', ['fri']],
  ['plant_max', 'graph', 'plants', 'max_value', []],
  ['poster_exact', 'graph', 'posters', 'exact_value', ['poster_a']],
  ['rice_exact', 'graph', 'rice', 'exact_value', ['bag_a']],
  ['fruit_more', 'comparison', 'fruit', 'greater_than', ['banana', 'apple'], 'cards'],
  ['fruit_fewer', 'comparison', 'fruit', 'less_than', ['orange', 'banana']],
  ['fruit_most', 'comparison', 'fruit', 'max_value', []],
  ['fruit_least', 'comparison', 'fruit', 'min_value', []],
  ['weather_higher', 'comparison', 'weather', 'greater_than', ['wed', 'mon']],
  ['weather_lower', 'comparison', 'weather', 'less_than', ['mon', 'fri']],
  ['rice_less', 'comparison', 'rice', 'less_than', ['bag_a', 'bag_b'], 'cards'],
  ['rice_more', 'comparison', 'rice', 'greater_than', ['bag_b', 'bag_a']],
  ['plant_taller', 'comparison', 'plants', 'greater_than', ['plant_b', 'plant_a'], 'cards'],
  ['plant_shorter', 'comparison', 'plants', 'less_than', ['plant_a', 'plant_b']],
  ['poster_bigger', 'comparison', 'posters', 'greater_than', ['poster_b', 'poster_a']],
  ['poster_smaller', 'comparison', 'posters', 'less_than', ['poster_a', 'poster_b'], 'cards'],
];

const questions = raw.map(([id, activity, datasetId, kind, targets, interaction = 'choice']) => {
  const dataset = datasets.find(item => item.id === datasetId);
  const question = { id: `gc_${id}`, activity, datasetId, kind, targets, interaction, difficulty: activity === 'graph' ? 'easy' : 'medium', learningObjective: activity === 'graph' ? 'อ่านค่าและเปรียบเทียบข้อมูลจากกราฟ' : 'ใช้ภาษาเปรียบเทียบให้ตรงกับข้อมูลและชนิดของคำนาม' };
  const expected = graphExpectedResult(question, dataset);
  if (interaction === 'cards') question.bankWords = shuffle(graphExpectedSentence(question, dataset).split(' '), id);
  else {
    let options;
    if (expected.type === 'categories') options = dataset.categories.map(category => ({ categoryId: category.id }));
    else if (expected.type === 'number') options = [...new Set([expected.value, expected.value + 1, expected.value + 2, Math.max(0, expected.value - 1)])].map(value => ({ value }));
    else {
      options = graphExpressionChoices(question, dataset).map(expression => ({ expression }));
    }
    question.options = shuffle(options, id).map((option, index) => ({ id: `choice_${index}`, ...option }));
  }
  return assertGraphQuestion(question, dataset);
});

export const graphComparisonMission = {
  id: 'graph_comparison_preview_v1',
  type: 'graph_comparison',
  title: 'Graph & Comparison Challenge',
  datasets,
  questions,
};
