const groups = ['conversation', 'conversation_rescue', 'emotions_feelings', 'jobs', 'market'];
const items = [
  ['At the school exhibition.\nStudent: Good morning. Welcome to our exhibition.\nGuest: Thank you. Where should I sign my name?\nStudent: ____', ['Please sign in this book.', 'Please write about your family.', 'Please take your book home.', 'Please tell us your favourite subject.'], 0, 'แนะนำให้ผู้มาเยือนลงชื่อในสมุด', 'ต 4.1 ป.6/1'],
  ['After a school play.\nTeacher: You spoke clearly on stage today, Ken.\nKen: ____ I practised with my friends.', ['Sorry, I can’t find the stage.', 'Thank you. I’m glad you enjoyed it.', 'Never mind. You can practise tomorrow.', 'Excuse me. Is this your seat?'], 1, 'รับคำชมอย่างสุภาพด้วยการขอบคุณ', 'ต 1.2 ป.6/1'],
  ['Lina borrowed her friend’s pencil case and accidentally broke the zip.\nLina: ____\nFriend: Thanks for telling me. Let’s ask an adult to help us fix it.', ['Your pencil case looks very nice.', 'Could you lend it to me tomorrow?', 'I’m sorry I broke the zip. Can I help get it repaired?', 'I’m glad you bought a new pencil case.'], 2, 'ขอโทษและเสนอช่วยซ่อมสิ่งที่ทำเสียหาย', 'ต 1.2 ป.6/1'],
  ['On the telephone.\nNok: Thanks. Now I know which pages to read. I’ll let you get back to your dinner.\nJune: ____', ['What would you like to eat?', 'Please read every page to me now.', 'I haven’t had breakfast yet.', 'Okay. Talk to you tomorrow.'], 3, 'จบบทสนทนาให้เหมาะกับเวลาของเพื่อน', 'ต 1.2 ป.6/1'],
  ['A visitor is explaining a game very quickly.\nStudent: I’m sorry. ____\nVisitor: Of course. I’ll explain it more slowly.', ['Could you speak more slowly, please?', 'Could you start the game earlier?', 'Could you show me a different game?', 'Could you speak a little louder?'], 0, 'ขอให้พูดช้าลง สอดคล้องกับ more slowly', 'ต 1.2 ป.6/2'],
  ['During a lesson.\nStudent: I feel sick. ____\nTeacher: Yes. Please ask your friend to walk there with you.', ['May I finish my lunch?', 'May I go to the nurse’s room?', 'May I take your temperature?', 'May I play outside after class?'], 1, 'ขออนุญาตไปห้องพยาบาลเมื่อรู้สึกไม่สบาย', 'ต 1.2 ป.6/2'],
  ['A friend offers to carry a small bag.\nFriend: Shall I carry your bag for you?\nStudent: ____ It’s light enough for me to carry.', ['Yes, please. I can’t lift it.', 'I’m sorry I lost your bag.', 'No, thank you. I can manage.', 'Please put your books in it.'], 2, 'ปฏิเสธความช่วยเหลืออย่างสุภาพเพราะถือเองได้', 'ต 1.2 ป.6/3'],
  ['During a computer lesson.\nStudent: My screen has gone black, and I can’t see my work. ____\nTeacher: Certainly. Let me check the cable first.', ['Would you like to use my picture?', 'Where did you buy your computer?', 'Can I finish the lesson yesterday?', 'Could you help me find out what’s wrong?'], 3, 'ขอความช่วยเหลือแก้ปัญหาจอคอมพิวเตอร์', 'ต 1.2 ป.6/3'],
  ['Maya: Why are you smiling?\nBen: ____ Our team finally finished the project.', ['I’m proud because we worked hard together.', 'I’m bored because there is nothing to do.', 'I’m worried because we haven’t started.', 'I’m lonely because nobody joined our team.'], 0, 'ความสำเร็จของทีมสอดคล้องกับความภูมิใจ', 'ต 1.2 ป.6/5'],
  ['Ann: I practised running every day, but I didn’t win the race.\nPim: ____', ['Then you should never run again.', 'You worked hard. Let’s practise together for the next race.', 'You won first prize. Congratulations!', 'Why don’t you give your prize to me?'], 1, 'ให้กำลังใจและชวนฝึกต่อ', 'ต 1.2 ป.6/5'],
  ['Teacher: Would you rather work in the quiet room or beside the playground?\nStudent: ____ I need to concentrate on my reading.', ['Beside the playground, because I want to watch the match.', 'Either place, because I’m leaving now.', 'In the quiet room, because the playground is noisy.', 'In the playground, because I want to play football.'], 2, 'เลือกสถานที่เงียบพร้อมเหตุผลที่เหมาะกับการอ่าน', 'ต 1.2 ป.6/5'],
  ['A new student is sitting alone at lunchtime.\nNew student: I miss my old friends.\nClassmate: ____', ['You must finish my lunch first.', 'I don’t know where your old school is.', 'You look excited about winning the game.', 'Would you like to sit with us? We’d love to get to know you.'], 3, 'แสดงความเข้าใจและชวนเพื่อนใหม่เข้ากลุ่ม', 'ต 1.2 ป.6/5'],
  ['Student: What do you do?\nGuest: I’m a chef.\nStudent: ____\nGuest: At a restaurant near the station.', ['Where do you work?', 'What time do you eat breakfast?', 'How do you travel to school?', 'Who cooks dinner at your home?'], 0, 'คำตอบระบุสถานที่ทำงาน จึงถาม Where', 'ต 1.2 ป.6/4'],
  ['Student: What do you do at work?\nGuest: I fly planes and take passengers to different cities.\nStudent: So, you’re ____.', ['a bus driver', 'a pilot', 'a firefighter', 'a postman'], 1, 'หน้าที่ขับเครื่องบินตรงกับนักบิน', 'ต 1.2 ป.6/4'],
  ['Child: My rabbit hasn’t eaten since yesterday. Who should we take it to?\nParent: ____', ['A chef who prepares food at a restaurant.', 'A librarian who helps people find books.', 'A vet who treats sick animals.', 'A pilot who takes people to other cities.'], 2, 'สัตวแพทย์รักษาสัตว์ป่วย', 'ต 1.2 ป.6/4'],
  ['Teacher: What would you like to be when you grow up?\nStudent: ____\nTeacher: Teaching sounds like a good choice for you.', ['A firefighter, because I want to put out fires.', 'A postman, because I enjoy delivering letters.', 'A chef, because I enjoy preparing meals.', 'A teacher, because I like helping children learn.'], 3, 'ชอบช่วยเด็กเรียนรู้สอดคล้องกับอาชีพครู', 'ต 1.2 ป.6/4'],
  ['Seller: How many oranges would you like?\nCustomer: ____\nSeller: Certainly. I’ll put six in a bag.', ['Six, please.', 'Six baht, please.', 'At six o’clock, please.', 'I bought them six days ago.'], 0, 'How many ถามจำนวนสินค้า', 'ต 1.2 ป.6/3'],
  ['Customer: ____\nSeller: They’re thirty baht a pair.\nCustomer: I’ll take one pair, please.', ['How many socks do you have?', 'How much are these socks?', 'Where do you keep your socks?', 'Which socks belong to you?'], 1, 'How much ถามราคา สอดคล้องกับ baht a pair', 'ต 1.2 ป.6/4'],
  ['At a school shop, a notebook costs 28 baht.\nStudent: Here is fifty baht.\nSeller: Thank you. ____', ['Your change is twelve baht.', 'Your change is eighteen baht.', 'Your change is twenty-two baht.', 'Your change is twenty-eight baht.'], 2, 'เงินทอนเท่ากับ 50 − 28 = 22 บาท', 'ต 1.2 ป.6/4'],
  ['Customer: I’d like a small blue T-shirt.\nSeller: Sorry, the small blue ones are sold out. We have small green ones and large blue ones.\nCustomer: The size is more important to me than the colour. ____', ['I’ll take a large blue one.', 'I’ll take a small blue one from you now.', 'I only want a large green one.', 'I’ll take a small green one.'], 3, 'เลือกขนาดเล็กที่มีขายตามความสำคัญด้านขนาด', 'ต 1.2 ป.6/3'],
];

const answerPositions = [2, 0, 3, 1, 1, 3, 0, 2, 3, 2, 1, 0, 0, 1, 2, 3, 2, 3, 0, 1];

export const socialChallengeV2 = items.map(([question, originalOptions, correct, explanation, indicator], index) => {
  const answer = answerPositions[index];
  const options = originalOptions.filter((option, position) => position !== correct);
  options.splice(answer, 0, originalOptions[correct]);
  return {
    id: `social_challenge_v2_${String(index + 1).padStart(2, '0')}`,
    quest: 'chapter2_boss', sourceQuest: groups[Math.floor(index / 4)],
    question, options, answer, explanation, indicator,
    itemVersion: 'social-quest-coverage-v2',
    source: { type: 'original_blueprint_aligned_practice', file: 'TB_63EngP6 O_NET69.pdf', pages: indicator.startsWith('ต 4.1') ? [6] : [2, 3] },
    contentReview: { status: 'owner_approved', approvalSource: 'explicit_user_chat_20_item_social_challenge' },
  };
});
