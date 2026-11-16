// Questions transcribed from the section labelled as past O-NET P.6 exams in
// the user-supplied tutoring compilation. Page numbers refer to PDF pages.
const SOURCE_FILE = 'ชุดติวพิชิตข้อสอบวิชาภาษาอังกฤษ O-NET ปี 2568.pdf';

function officialItem({ id, year, number, page, question, options, answer, explanation, stimuli, visualAdaptation, assessmentFocus }) {
  return {
    id: `onet_${year}_${String(number).padStart(2, '0')}_${id}`,
    question,
    options,
    answer,
    explanation,
    correctFeedback: explanation,
    wrongFeedback: explanation,
    ...(stimuli ? { stimuli } : {}),
    ...(visualAdaptation ? { visualAdaptation } : {}),
    ...(assessmentFocus ? { assessmentFocus } : {}),
    reviewStatus: 'approved',
    approvedModes: ['practice_assessment'],
    itemVersion: 'official-file-v1',
    scoringPolicy: 'first_response_v1',
    source: {
      type: 'past_onet_exam_transcription',
      file: SOURCE_FILE,
      exam: `O-NET ป.6 ปีการศึกษา ${year}`,
      questionNumber: number,
      pdfPage: page,
      provenance: 'transcribed_from_user_supplied_compilation',
    },
    contentReview: {
      status: 'transcribed_and_answer_checked',
      reviewer: 'Codex',
      version: 'official-file-v1',
    },
    mediaReview: {
      status: stimuli ? 'verified' : 'not_required',
      reviewer: 'Codex',
      version: 'official-file-v1',
    },
  };
}

const q = officialItem;

const sugarChart = [{
  type: 'chart',
  chartType: 'bar',
  title: 'Sugar in Drinks',
  xLabel: 'Drink',
  yLabel: 'Sugar (grams)',
  maximum: 50,
  step: 5,
  points: [
    { label: 'UHT milk', value: 5 },
    { label: 'Soy milk', value: 15 },
    { label: 'Yoghurt', value: 10 },
    { label: 'Soft drinks', value: 45 },
    { label: 'Fruit juice', value: 15 },
  ],
}];

const grammarBoss = [
  q({ id: 'clock_riddle', year: 2567, number: 6, page: 98, question: 'I have hands and a face, but I cannot hold anything or smile. What am I?', options: ['A table', 'A clock', 'A house', 'A mountain'], answer: 1, explanation: 'A clock has hands and a face.' }),
  q({ id: 'easter', year: 2567, number: 17, page: 101, question: 'According to Susan, Easter is a holiday mainly about ___.', options: ['Food', 'Friends', 'History', 'Religion'], answer: 3, explanation: 'Susan describes Easter as a Christian celebration, so it is mainly about religion.' }),
  q({ id: 'vowel_sound', year: 2567, number: 19, page: 102, question: 'Which word has a different vowel sound from “book”?', options: ['Foot', 'Door', 'Took', 'Good'], answer: 1, explanation: 'Door has a different vowel sound; foot, took, and good share the /ʊ/ sound.' }),
  q({ id: 'intonation', year: 2567, number: 20, page: 102, question: 'Which sentence has a different intonation?', options: ['How do you go to school?', 'What time is the meeting?', 'Can I borrow your pencil?', 'When will Jackson leave?'], answer: 2, explanation: 'A yes/no question normally has rising intonation; the other choices are Wh-questions.' }),
  q({ id: 'punctuation', year: 2567, number: 21, page: 102, question: 'Which sentence uses correct punctuation?', options: ["You are going to Singapore next week, aren't you.", 'I was late this morning: so my teacher was not very happy.', 'I have two comic books at home, Doraemon and the Little Mermaid.', 'My friends enjoy different sports such as; football, tennis and basketball.'], answer: 2, explanation: 'Choice C correctly uses a comma to introduce the two book titles.' }),
  q({ id: 'tablet_are', year: 2555, number: 7, page: 124, question: 'People think tablets are expensive toys, but they ___ useful.', options: ['is', 'are', 'do', 'does'], answer: 1, explanation: 'The plural subject “they” takes “are”.' }),
  q({ id: 'tablet_listen', year: 2555, number: 8, page: 124, question: 'Students can ___ to music with just one touch on the screen.', options: ['play', 'make', 'listen', 'watch'], answer: 2, explanation: 'The correct collocation is “listen to music”.' }),
  q({ id: 'tablet_they', year: 2555, number: 9, page: 124, question: 'When students know how to use tablets well, ___ can learn more.', options: ['it', 'he', 'we', 'they'], answer: 3, explanation: '“They” refers to the plural noun “students”.' }),
  q({ id: 'tablet_have', year: 2555, number: 10, page: 124, question: 'Tablets can work better if schools ___ a good Wi-Fi system.', options: ['is', 'are', 'has', 'have'], answer: 3, explanation: 'The plural subject “schools” takes “have”.' }),
  q({ id: 'family_visitors', year: 2565, number: 29, page: 130, question: 'My brothers and sister are visiting me tomorrow. Charlotte is my sister. George and Louis are my brothers. Which sentence is correct?', options: ['Six people are visiting me.', 'Three people are coming to my house.', 'Charlotte, George, Louis and their brothers are visiting me.', 'Charlotte, George and their sisters are coming to my house.'], answer: 1, explanation: 'Charlotte, George, and Louis make three visitors.' }),
];

const socialBoss = [
  q({ id: 'and_you', year: 2552, number: 1, page: 133, question: 'Jane: How are you, Don? Don: Fine, thanks. ___.', options: ['What do you do?', 'What are you doing?', 'And you?', 'Are you?'], answer: 2, explanation: '“And you?” politely returns the same question.' }),
  q({ id: 'very_well', year: 2552, number: 2, page: 133, question: 'Don: Fine, thanks. And you? Jane: ___.', options: ['Very well, thank you.', "That's good.", 'It is very nice.', "I'm sorry to hear that."], answer: 0, explanation: '“Very well, thank you” appropriately answers “How are you?”' }),
  q({ id: 'when_tennis', year: 2554, number: 3, page: 133, question: 'A: ___ B: I always play tennis on the weekend.', options: ['Why do you like tennis?', 'What sport do you play?', 'Where do you play tennis?', 'When do you play tennis?'], answer: 3, explanation: '“On the weekend” answers a When-question.' }),
  q({ id: 'excuse_me_zoo', year: 2554, number: 8, page: 134, question: '___, can you tell me how to get to the zoo?', options: ['All right', 'Excuse me', 'By the way', 'Never mind'], answer: 1, explanation: 'Use “Excuse me” before politely asking a stranger for directions.' }),
  q({ id: 'dog_accident', year: 2555, number: 9, page: 135, question: 'A: What happened? B: ___. A: I am sorry to hear that.', options: ['My dog had an accident.', 'My mother gave me a nice gift.', 'My brother received a gold medal.', 'My friends helped me plan a trip.'], answer: 0, explanation: 'An accident appropriately prompts “I am sorry to hear that.”' }),
  q({ id: 'introduce_friend', year: 2556, number: 10, page: 135, question: 'Somsak: Naree, ___, Champei. Champei: Hi, Naree. It is nice to meet you.', options: ['this is my friend', 'here is my sister', 'do you know her', 'may I introduce myself'], answer: 0, explanation: '“This is my friend” is used to introduce one person to another.' }),
  q({ id: 'you_are_welcome', year: 2557, number: 11, page: 135, question: 'Pam: Thank you very much. Ali: ___.', options: ["I'm good.", "That's right.", 'Never mind.', "You're welcome."], answer: 3, explanation: '“You’re welcome” is the standard response to thanks.' }),
  q({ id: 'bank_directions', year: 2557, number: 12, page: 136, question: 'Tom: Excuse me. ___ A man: Walk down this street. It is on the right corner.', options: ['When is the bank open?', 'Which bank do you like?', 'How can I get to the bank?', 'Why do you work at the bank?'], answer: 2, explanation: 'The answer gives directions, so Tom must ask how to get to the bank.' }),
  q({ id: 'stepping_foot', year: 2557, number: 13, page: 136, question: "You are stepping on someone's foot. What should you say?", options: ["It's okay!", "I'm sorry!", "Don't worry!", 'Just a moment!'], answer: 1, explanation: 'You should apologize by saying “I’m sorry.”' }),
  q({ id: 'once_week', year: 2558, number: 14, page: 137, question: 'Irene: How often do you wash your clothes? Alice: ___. I usually do it every Saturday.', options: ['Every day.', 'Once a week.', 'Twice a month.', 'Six times a year.'], answer: 1, explanation: 'Every Saturday means once a week.' }),
];

const questionBoss = [
  q({ id: 'dinner_place', year: 2552, number: 1, page: 123, question: 'John and Kathy are going to eat at a Chinese restaurant, and after that they will go to the cinema. Where will they have dinner?', options: ['At home', 'At a restaurant', 'At the cinema', 'In China'], answer: 1, explanation: 'The passage says they will eat at a Chinese restaurant.' }),
  q({ id: 'after_dinner', year: 2552, number: 2, page: 123, question: 'John and Kathy will eat at a Chinese restaurant and then go to the cinema. What will they do after dinner?', options: ['Go home', 'Watch a film', 'Eat Chinese food', 'Read at home'], answer: 1, explanation: 'They will go to the cinema to watch a film.' }),
  q({ id: 'fred_box', year: 2552, number: 3, page: 123, question: 'Fred found a wooden box after diving to the bottom of a canal. Where did he get the box?', options: ['He found it while swimming.', 'He got the box open.', 'Someone left it at his house.', 'It was floating on the canal.'], answer: 0, explanation: 'Fred found the box while he was swimming in the canal.' }),
  q({ id: 'fred_shirts', year: 2552, number: 4, page: 124, question: 'The box contained a jacket, two pairs of trousers, five shirts and three pairs of shoes. How many shirts did Fred find?', options: ['One', 'Two', 'Three', 'Five'], answer: 3, explanation: 'The passage explicitly states that there were five shirts.' }),
  q({ id: 'fred_home', year: 2552, number: 5, page: 124, question: 'What did Fred do with the things from the wooden box?', options: ['He threw them into the canal.', 'He put them back in the box.', 'He took them home.', 'He left them near the canal.'], answer: 2, explanation: 'The passage says he took all the things home.' }),
  q({ id: 'fred_knife', year: 2552, number: 6, page: 124, question: 'What was in the pocket of one pair of trousers?', options: ['A knife', 'A plastic bag', 'Coins', 'Reading glasses'], answer: 0, explanation: 'Fred found a pocket knife in one pair of trousers.' }),
  q({ id: 'catherine_father', year: 2557, number: 14, page: 126, question: "Catherine says, “My dad takes care of people's teeth.” What does her father do?", options: ['A doctor', 'A soldier', 'A dentist', 'A policeman'], answer: 2, explanation: 'A dentist takes care of teeth.' }),
  q({ id: 'catherine_food', year: 2557, number: 15, page: 126, question: "Catherine says, “I don't like vegetables.” Which food would she choose?", options: ['Pork', 'Carrot', 'Lettuce', 'Broccoli'], answer: 0, explanation: 'Pork is the only choice that is not a vegetable.' }),
  q({ id: 'catherine_pet', year: 2557, number: 16, page: 126, question: 'Catherine says her pet always barks at the postman. What is her pet?', options: ['A little bird', 'A box turtle', 'A white rabbit', 'A brown dog'], answer: 3, explanation: 'A dog barks.' }),
  q({ id: 'shell_animal', year: 2559, number: 22, page: 127, question: 'It has short legs and a hard shell. It lives on land and in water and pulls its head and legs inside its shell when afraid. What is it?', options: ['A crab', 'A snail', 'A turtle', 'A squid'], answer: 2, explanation: 'The description matches a turtle.' }),
];

const logicBoss = [
  q({ id: 'no_photography', year: 2555, number: 1, page: 110, question: 'When you see this sign, you ___.', options: ['Can take photos', 'Cannot take photos', 'Can borrow a camera', 'Cannot borrow a camera'], answer: 1, explanation: 'The red slash over the camera means photography is not allowed.', stimuli: [{ type: 'image', src: '/assessment/onet-recreated/no-photography.webp', alt: 'A camera crossed by a red prohibition symbol' }], visualAdaptation: { type: 'ai_recreated_equivalent', originalImageUnavailable: true, answerNeutral: true } }),
  q({ id: 'accessible_parking', year: 2556, number: 5, page: 111, question: 'Who can park here?', options: ['A metered taxi', 'A disabled driver', 'A taxi motorcycle', 'A traffic policeman'], answer: 1, explanation: 'The wheelchair symbol marks accessible parking for a disabled driver.', stimuli: [{ type: 'image', src: '/assessment/onet-recreated/accessible-parking.webp', alt: 'Blue accessible parking sign with a white wheelchair symbol' }], visualAdaptation: { type: 'ai_recreated_equivalent', originalImageUnavailable: true, answerNeutral: true } }),
  q({ id: 'keep_off_grass', year: 2558, number: 11, page: 113, question: 'Sue is going for a walk in a park. What should Sue do when she sees the sign?', options: ['Step into the grass', 'Jump onto the grass', 'Not walk on the grass', 'Not run out of the grass'], answer: 2, explanation: 'The crossed-out shoe and grass mean “Keep off the grass.”', stimuli: [{ type: 'image', src: '/assessment/onet-recreated/keep-off-grass.webp', alt: 'A shoe over grass crossed by a red prohibition symbol' }], visualAdaptation: { type: 'ai_recreated_equivalent', originalImageUnavailable: true, answerNeutral: true } }),
  q({ id: 'cafe_total', year: 2565, number: 27, page: 119, question: 'John wants iced cocoa. Leah wants cold milk. How much do they have to pay in total?', options: ['Thirty-five baht', 'Forty baht', 'Forty-five baht', 'Fifty baht'], answer: 2, explanation: 'Iced cocoa is 25 baht and cold milk is 20 baht, so the total is 45 baht.', stimuli: [{ type: 'image', src: '/assessment/onet-recreated/cafe-menu.webp', alt: 'Menu showing iced cocoa for 25 baht and cold milk for 20 baht' }], visualAdaptation: { type: 'ai_recreated_equivalent', originalImageUnavailable: true, answerNeutral: true } }),
  q({ id: 'pong_plants', year: 2564, number: 27, page: 129, question: 'What did Pong and his father plant?', options: ['Bamboo and flowers', 'Flowers and collard greens', 'Spring onions and bamboo', 'Collard greens and spring onions'], answer: 3, explanation: 'The diary names collard greens and spring onions.' }),
  q({ id: 'sugar_most', year: 2558, number: 11, page: 192, question: 'Which drink has the most sugar?', options: ['UHT milk', 'Soy milk', 'Yoghurt', 'Soft drinks'], answer: 3, explanation: 'Soft drinks have the tallest bar at 45 grams.', stimuli: sugarChart, visualAdaptation: { type: 'structured_reconstruction', originalImageUnavailable: false, valuesCheckedAgainstPdf: true }, assessmentFocus: 'graph' }),
  q({ id: 'sugar_ten', year: 2558, number: 12, page: 192, question: 'Which drink has ten grams of sugar?', options: ['UHT milk', 'Soy milk', 'Yoghurt', 'Fruit juice'], answer: 2, explanation: 'The yoghurt bar reaches 10 grams.', stimuli: sugarChart, visualAdaptation: { type: 'structured_reconstruction', originalImageUnavailable: false, valuesCheckedAgainstPdf: true }, assessmentFocus: 'graph' }),
  q({ id: 'sugar_compare', year: 2558, number: 13, page: 193, question: 'Which sentence is correct?', options: ['UHT milk has no sugar.', 'Soy milk has the least sugar.', 'Yoghurt has less sugar than soft drinks.', 'Fruit juice has more sugar than soy milk.'], answer: 2, explanation: 'Yoghurt has 10 grams, which is less than the 45 grams in soft drinks.', stimuli: sugarChart, visualAdaptation: { type: 'structured_reconstruction', originalImageUnavailable: false, valuesCheckedAgainstPdf: true }, assessmentFocus: 'graph_comparison' }),
  q({ id: 'shopping_table', year: 2555, number: 6, page: 190, question: 'Somsak has 50 baht. What can he buy?', options: ['A book and a pen', 'Scissors and a pen', 'A book and scissors', 'Scissors and a notebook'], answer: 0, explanation: 'A book and a pen cost 25 + 25 = 50 baht.', stimuli: [{ type: 'table', title: 'Things and Prices', columns: ['Thing', 'Price (baht)'], rows: [['Book', 25], ['Notebook', 15], ['Pen', 25], ['Scissors', 40]] }], visualAdaptation: { type: 'structured_reconstruction', originalImageUnavailable: false, valuesCheckedAgainstPdf: true }, assessmentFocus: 'table' }),
  q({ id: 'height_comparison', year: 2562, number: 14, page: 193, question: 'Amy is taller than Beth, but shorter than Carol. Which set of heights is correct?', options: ['Amy 150 cm, Beth 152 cm, Carol 154 cm', 'Amy 152 cm, Beth 150 cm, Carol 154 cm', 'Amy 154 cm, Beth 152 cm, Carol 150 cm', 'Amy 154 cm, Beth 150 cm, Carol 152 cm'], answer: 1, explanation: 'Beth must be shortest, Amy in the middle, and Carol tallest.', assessmentFocus: 'comparison' }),
];

const knowledgeBoss = [
  q({ id: 'math_help', year: 2567, number: 1, page: 97, question: 'Teacher: Could you explain the math question again? Student: ___. I am in a hurry. Can you see me at 11?', options: ['Sure.', 'Sorry.', "That's right.", 'Please wait here.'], answer: 1, explanation: 'The student cannot help now and gives a reason, so “Sorry” is appropriate.' }),
  q({ id: 'carry_books', year: 2567, number: 2, page: 97, question: 'Teacher: Thank you for helping me carry these books. Student: ___.', options: ["That's all.", "It's my duty.", "I don't know.", "You're welcome."], answer: 3, explanation: '“You’re welcome” appropriately responds to thanks.' }),
  q({ id: 'flight_length', year: 2567, number: 3, page: 97, question: 'Jane: How long is the flight? Jack: ___.', options: ['Three hours.', 'Three times.', 'Three floors.', 'Three meters.'], answer: 0, explanation: '“How long” asks about duration, so “Three hours” is correct.' }),
  q({ id: 'see_you_later', year: 2567, number: 4, page: 97, question: 'Mint: I have to return these books and go to class. Beam: ___.', options: ['Thank you.', 'See you later!', 'How are you?', 'Good morning.'], answer: 1, explanation: '“See you later” is an appropriate farewell.' }),
  q({ id: 'turn_on_light', year: 2567, number: 5, page: 98, question: 'A: The room is so dark. ___. B: Okay, I’ll do it right away.', options: ["I can't see anything.", 'It is dark outside too.', 'Please turn on the light.', 'The light switch is broken.'], answer: 2, explanation: 'Turning on the light solves the problem of a dark room.' }),
  q({ id: 'meet_exchange', year: 2567, number: 7, page: 98, question: 'Jeff: Hello, my name is Jeff. I come from New Zealand. Joy: Hi, my name is Joy. ___.', options: ['Nice to meet you.', 'What about you?', 'Thanks for asking me.', 'Do you come to school?'], answer: 0, explanation: '“Nice to meet you” is appropriate when meeting someone for the first time.' }),
  q({ id: 'need_water', year: 2567, number: 8, page: 98, question: 'A: I am really thirsty. ___. B: Sure, here you go!', options: ['I need some water.', 'The water is so cold.', 'Thank you for the water.', 'Do you need a glass of water?'], answer: 0, explanation: 'The reply offers water, matching the speaker’s need.' }),
  q({ id: 'ice_cream', year: 2567, number: 9, page: 99, question: 'Sara: Ice cream! ___.', options: ['We should go ice skating.', "I heard there's a new movie playing.", "I think there's a swimming pool there.", "Let's go to that shop around the corner."], answer: 3, explanation: 'Going to the nearby shop is a relevant suggestion for buying ice cream.' }),
  q({ id: 'ask_brother', year: 2567, number: 10, page: 99, question: '__? B: He has grown a lot since last year. I used to be taller!', options: ['How is your brother doing?', 'What did your brother grow?', 'Does your brother play basketball often?', "Didn't your brother use to have short hair?"], answer: 0, explanation: 'This asks naturally about the brother’s well-being.' }),
  q({ id: 'hard_math', year: 2567, number: 11, page: 99, question: 'After math class, Student: ___. Teacher: I agree. I’ll give you more examples tomorrow.', options: ['That was hard!', "It's a terrible day!", 'Lunch was good today.', "You're such a good teacher."], answer: 0, explanation: '“That was hard” explains why the teacher offers more examples.' }),
];

export const OFFICIAL_ONET_BOSS_QUESTIONS = {
  grammar: grammarBoss,
  chapter2_boss: socialBoss,
  strategy_boss: questionBoss,
  finalboss: logicBoss,
  chapter5_boss: knowledgeBoss,
};

export const OFFICIAL_ONET_BOSS_SOURCE = {
  file: SOURCE_FILE,
  note: 'The supplied compilation labels these items as past O-NET P.6 questions. This app records that provenance but does not claim independent authentication by สทศ.',
};
