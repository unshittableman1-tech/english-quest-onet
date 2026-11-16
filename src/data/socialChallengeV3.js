const rows = [
  ['conversation', 'meeting', 'On her first day at a new school.\nMay: Hello. I am May.\nBen: ____', ['Nice to meet you, May.', 'Have a safe trip, May.', 'Get well soon, May.', 'Good night, May.'], 'พบกันครั้งแรก ใช้คำทักทาย Nice to meet you'],
  ['conversation', 'thanks', 'Your friend brings the notebook you left in class.\nYou: ____', ['Thank you for bringing my notebook.', 'Please write your answers in my notebook.', 'Would you like to buy my notebook?', 'Where can I buy a notebook?'], 'เพื่อนนำสมุดมาให้ จึงกล่าวขอบคุณ'],
  ['conversation', 'welcome', 'Dan: Thanks for helping me carry these boxes.\nBee: ____', ["You are welcome.", 'I am sorry to hear that.', 'Have a wonderful holiday.', 'May I leave the room?'], 'ตอบรับคำขอบคุณด้วย You are welcome'],
  ['conversation', 'apology', 'You accidentally bump into a classmate. Her pencils fall on the floor.\nYou: ____', ["I am sorry. Let me pick them up.", 'Congratulations! You did very well.', 'Thank you for lending me your pencils.', 'Excuse me. How much are these pencils?'], 'ขอโทษพร้อมเสนอเก็บดินสอที่ทำตก'],
  ['conversation_rescue', 'borrow', 'Your pencil breaks during a lesson. Your friend has a spare pencil.\nYou: ____', ['Could I borrow your pencil, please?', 'Could you do my homework, please?', 'Could you sharpen your pencil later?', 'Could I buy a pencil case here?'], 'ต้องการยืมดินสอ ใช้ Could I borrow'],
  ['conversation_rescue', 'permission', 'During a lesson, you need to use the toilet.\nYou: ____\nTeacher: Yes, you may.', ['May I go to the toilet, please?', 'Where did you buy that toilet sign?', 'Would you like to clean the toilet?', 'How many toilets are there?'], 'ขออนุญาตครูด้วย May I'],
  ['conversation_rescue', 'request', 'Rain is coming through the open window. Your friend is sitting beside it.\nYou: ____', ['Could you close the window, please?', 'Could you open the window wider?', 'Could you move my chair outside?', 'Could you water the plants now?'], 'ฝนสาดเข้าหน้าต่าง จึงขอให้ปิด'],
  ['conversation_rescue', 'accept', 'Nina: Would you like to join our art club on Friday?\nYou are free and want to join.\nYou: ____', ['Yes, I would love to join you.', 'Sorry, I cannot come on Friday.', 'No, thank you. I dislike drawing.', 'I am afraid I have another class then.'], 'ว่างและอยากเข้าร่วม จึงตอบรับคำชวน'],
  ['conversation_rescue', 'decline', 'Pat: Shall we play after school?\nYou must go to the dentist after school.\nYou: ____', ['Sorry, I cannot. I have to see the dentist.', 'Yes, I can stay and play all afternoon.', 'Great! I have nothing to do after school.', 'Of course. Let us meet at the playground.'], 'มีนัดจึงปฏิเสธอย่างสุภาพพร้อมเหตุผล'],
  ['emotions_feelings', 'concern', 'Your friend looks sad after the school competition. You want to check how she feels.\nYou: ____', ['Are you OK?', 'Where is the shop?', 'How old is your sister?', 'What time is lunch?'], 'ถามความรู้สึกอย่างห่วงใยด้วย Are you OK'],
  ['emotions_feelings', 'congratulations', 'Lin: I won first prize in the painting competition!\nYou: ____', ['Congratulations! Your hard work paid off.', 'Get well soon. You need some rest.', 'I am sorry to hear about your loss.', 'Have a safe journey. See you next week.'], 'เพื่อนชนะการแข่งขัน จึงแสดงความยินดี'],
  ['emotions_feelings', 'sympathy', 'Tom: My cat is missing. I cannot find her anywhere.\nYou: ____', ['I am sorry to hear that. I hope you find her soon.', 'Congratulations! You must be very proud.', 'Thank you for looking after my cat.', 'Have a nice trip with your family.'], 'สัตว์เลี้ยงหาย ควรเห็นใจและหวังให้หาเจอ'],
  ['emotions_feelings', 'encouragement', 'Pam: I am nervous about speaking in front of the class.\nYou know she has practised all week.\nYou: ____', ['You have practised a lot. You can do it!', 'You should stop practising and give up.', 'Nobody wants to listen to your speech.', 'You should let someone else speak for you.'], 'ให้กำลังใจโดยอ้างถึงการฝึกซ้อม'],
  ['jobs', 'occupation', 'At a school careers day.\nStudent: ____\nGuest: I am a nurse.', ['What do you do?', 'What are you doing right now?', 'How do you get to work?', 'When do you start work?'], 'ถามอาชีพด้วย What do you do ไม่ใช่กิจกรรมขณะนี้'],
  ['jobs', 'workplace', 'Your mother is a teacher at Green School.\nFriend: Where does your mother work?\nYou: ____', ['She works at Green School.', 'She starts work at eight.', 'She goes to work by bus.', 'She likes teaching children.'], 'Where ถามสถานที่ทำงาน'],
  ['jobs', 'duties', 'Student: What do you do at work?\nChef: ____', ['I prepare and cook food.', 'I fly people to other countries.', 'I treat people who are ill.', 'I deliver letters to houses.'], 'พ่อครัวมีหน้าที่เตรียมและทำอาหาร'],
  ['market', 'price', 'You want to buy one umbrella, but there is no price label.\nYou: ____', ['How much is this umbrella?', 'How many umbrellas do you have?', 'Where was this umbrella made?', 'Which umbrella is yours?'], 'ถามราคาด้วย How much'],
  ['market', 'size', 'Shop assistant: What size would you like?\nYou want a medium shirt.\nYou: ____', ['Medium, please.', 'Blue, please.', 'Two shirts, please.', 'One hundred baht, please.'], 'ถามขนาดจึงตอบ Medium ไม่ใช่สี จำนวน หรือราคา'],
  ['market', 'food-order', 'At a restaurant.\nServer: What would you like to order?\nYou want some soup.\nYou: ____', ['I would like some soup, please.', 'I would like a table by the window.', 'I would like to know when you close.', 'I would like to pay the bill now.'], 'พนักงานถามรายการอาหาร จึงสั่งซุป'],
  ['market', 'colour', 'You like a shirt in the shop, but the one you are holding is red. You want the same shirt in blue.\nYou: ____', ['Do you have this shirt in blue?', 'Do you have this shirt in a larger size?', 'How much is this red shirt?', 'When does your shop close?'], 'ต้องการเปลี่ยนสีเสื้อ จึงถามว่ามีสีน้ำเงินหรือไม่'],
];
const positions = [2, 0, 3, 1, 1, 3, 0, 2, 3, 2, 1, 0, 0, 1, 2, 3, 2, 3, 0, 1];
const illustrated = new Set([4, 6, 7, 11, 18, 20]);
export const socialChallengeV3 = rows.map(([sourceQuest, skillTag, question, choices, explanation], index) => {
  const options = choices.slice(1);
  options.splice(positions[index], 0, choices[0]);
  const number = String(index + 1).padStart(2, '0');
  return {
    id: `social_challenge_v3_${number}`, quest: 'chapter2_boss', sourceQuest, skillTag,
    question, options, answer: positions[index], explanation,
    itemVersion: 'social-conversation-v3', indicator: 'ต 1.2 ป.6/1',
    source: { type: 'original_boss_activity' },
    contentReview: { status: 'owner_approved_blueprint', approvalSource: 'explicit_user_chat' },
    stimuli: illustrated.has(index + 1) ? [{ type: 'image', src: `/assessment/social-v3/scene-${number}-v1.png`, alt: 'ภาพสถานการณ์ประกอบบทสนทนา' }] : [],
  };
});
