const asset = name => `/docs/assets/pretest-v2/${name}`;

const readingClub = 'Every Wednesday, the Grade 6 reading club meets after school. Students read for twenty minutes and then tell a friend one interesting thing they learned. A small shelf of spare books stands beside the door. Mali forgot to bring her book this week.';

export const pretestV2Questions = [
  {
    standard: 'ต 1.1',
    prompt: 'You see this sign near a classroom door. What should you do?',
    image: asset('wet-floor-2point5d.png'),
    imageAlt: 'A yellow wet-floor warning sign stands beside a puddle near a classroom door.',
    options: ['Sit on the wet floor.', 'Run across the floor quickly.', 'Remove the notice before anyone sees it.', 'Walk carefully and avoid the wet area.'],
    answer: 3,
  },
  {
    standard: 'ต 1.1',
    prompt: 'Read the library notice: Books borrowed on Friday must be returned by the following Friday. The library is closed on Sunday. When must a student who borrows a book this Friday return it?',
    image: asset('library-notice-2point5d.png'),
    imageAlt: 'Library notice: books borrowed on Friday must be returned by the following Friday. Closed on Sunday.',
    options: ['This Sunday.', 'Next Monday.', 'Next Friday.', 'Two Fridays later.'],
    answer: 2,
  },
  {
    standard: 'ต 1.1',
    passage: readingClub,
    prompt: 'What is the passage mainly about?',
    options: ['How to build a bookshelf.', 'A weekly reading club and what its members do.', "Mali's journey to school.", 'A competition to read the most books.'],
    answer: 1,
  },
  {
    standard: 'ต 1.1',
    passage: readingClub,
    prompt: 'What could Mali do so she can take part in the reading time?',
    options: ['Borrow a spare book from the shelf.', 'Ask the club to stop meeting.', 'Leave before the club begins.', 'Wait until next Wednesday without reading.'],
    answer: 0,
  },
  {
    standard: 'ต 1.2',
    prompt: 'A: “I\'m sorry I broke your pencil.” B: “_____”',
    options: ['It is under the desk.', 'Happy birthday to you.', 'Yes, I am twelve.', "That's all right, but please be careful."],
    answer: 3,
  },
  {
    standard: 'ต 1.2',
    prompt: 'The classroom is hot. You want to ask your teacher for permission to open the window. What should you say?',
    options: ['Open the window now!', 'Where is the window?', 'May I open the window, please?', 'I opened the window yesterday.'],
    answer: 2,
  },
  {
    standard: 'ต 1.2',
    prompt: 'A: “Could you help me carry these books?” B wants to help. What should B say?',
    options: ['Sure, I can help you.', 'No, they are not mine.', "I don't know where the books are.", 'I carried them last week.'],
    answer: 0,
  },
  {
    standard: 'ต 1.2',
    prompt: 'A: “What does your sister do?” B: “_____”',
    options: ['She likes mangoes.', 'She is at home.', 'She is eleven years old.', 'She is a nurse.'],
    answer: 3,
  },
  {
    standard: 'ต 1.2',
    prompt: 'A: “Why do you like the library?” B: “_____”',
    options: ['Because it is quiet and I can read there.', 'It is next to the canteen.', "At four o'clock.", 'My brother has two books.'],
    answer: 0,
  },
  {
    standard: 'ต 1.2',
    prompt: 'A: “Would you like some more soup?” B is full and wants to refuse politely. What should B say?',
    options: ['Give me more soup now.', "No, thank you. I'm full.", 'Where did you buy the soup?', 'I ate soup yesterday.'],
    answer: 1,
  },
  {
    standard: 'ต 1.3',
    prompt: 'When do students have Art?',
    image: asset('timetable.svg'),
    imageAlt: 'Class timetable: Monday English at 9 a.m.; Tuesday Science at 10 a.m.; Wednesday Art at 11 a.m.',
    options: ['Monday at 9:00 a.m.', 'Tuesday at 10:00 a.m.', 'Wednesday at 11:00 a.m.', 'Wednesday at 9:00 a.m.'],
    answer: 2,
  },
  {
    standard: 'ต 1.3',
    passage: 'The school gate is south of the playground. The library is east of the playground.',
    prompt: 'Which map shows the correct route from the gate to the library?',
    options: [
      { image: asset('map-option-a-realistic.png'), alt: 'Map A: the gate is south of the playground, the library is east; route goes north, then east.' },
      { image: asset('map-option-b-realistic.png'), alt: 'Map B: the gate is south of the playground, the library is west; route goes north, then west.' },
      { image: asset('map-option-c-realistic.png'), alt: 'Map C: the gate is north of the playground, the library is east; route goes south, then east.' },
      { image: asset('map-option-d-realistic.png'), alt: 'Map D: the gate is south of the playground, the library is north; route goes north twice.' },
    ],
    answer: 0,
  },
  {
    standard: 'ต 1.3',
    prompt: 'Which sentence agrees with the table?',
    image: asset('weather-table.svg'),
    imageAlt: 'Weather report: Monday sunny 30 degrees Celsius; Tuesday rainy 27 degrees; Wednesday cloudy 28 degrees.',
    options: ['Tuesday was hotter than Monday.', 'Monday was the coldest day.', 'Wednesday was sunny.', 'It rained on Tuesday.'],
    answer: 3,
  },
  {
    standard: 'ต 1.3',
    passage: 'Ben walks to school at seven o\'clock. After school, he helps his father in the garden. He reads a story before going to bed.',
    prompt: 'What does Ben do after helping his father?',
    options: ['He walks to school.', 'He reads a story.', 'He has breakfast.', 'He plays in the garden.'],
    answer: 1,
  },
  {
    standard: 'ต 2.1',
    prompt: 'Which activity is commonly associated with Christmas in many English-speaking communities?',
    options: ['Decorating a Christmas tree.', 'Floating a krathong on a river.', 'Splashing water during Songkran.', 'Giving candles at the start of Buddhist Lent.'],
    answer: 0,
  },
  {
    standard: 'ต 2.2',
    prompt: 'ภาษาไทยอาจพูดว่า “กระเป๋าใบเล็กสีฟ้า” Which English phrase has the natural word order?',
    options: ['a blue small bag', 'a small blue bag', 'a bag blue small', 'a small bag blue'],
    answer: 1,
  },
  {
    standard: 'ต 2.2',
    prompt: 'Which sentence uses the correct punctuation for an English question?',
    options: ['Where is the library.', 'Where is the library!', 'Where is the library?', 'Where is the library,'],
    answer: 2,
  },
  {
    standard: 'ต 2.2',
    prompt: 'Which sentence correctly compares Songkran and Christmas?',
    options: ['Both have exactly the same customs everywhere.', 'Songkran is on December 25; Christmas marks the Thai New Year.', 'Both are celebrated by splashing water in every country.', 'Songkran marks the Thai New Year; Christmas is celebrated on December 25 in many countries.'],
    answer: 3,
  },
  {
    standard: 'ต 4.1',
    prompt: 'The teacher says, “Read the paragraph. Then underline the main idea.” What should you do first?',
    options: ['Underline every word.', 'Read the paragraph.', 'Write a new paragraph.', 'Close your book.'],
    answer: 1,
  },
  {
    standard: 'ต 4.1',
    prompt: 'You did not hear the homework instructions. What is the most appropriate thing to say to your teacher?',
    options: ['You must tell me again.', "I don't need homework.", 'Excuse me, could you repeat the homework instructions, please?', 'My friend finished the homework yesterday.'],
    answer: 2,
  },
];

// Anti-Cheat: Sanitized student questions containing NO answer keys in client bundle
export const studentPretestQuestions = Object.freeze(
  pretestV2Questions.map(({ answer, ...rest }) => Object.freeze({ ...rest }))
);

