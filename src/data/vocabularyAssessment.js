const CONCEPTS = [
  {
    keyword: 'bicycle = รถจักรยาน',
    variants: [
      ['Mina wants to exercise and travel without using fuel. She should ride a ___.', ['bicycle', 'van', 'taxi', 'ship'], 0],
      ['Which vehicle has two wheels and is moved by pedals?', ['train', 'bicycle', 'bus', 'plane'], 1],
      ['Tom wears a helmet and pedals to school. How does he travel?', ['By bicycle', 'By boat', 'By van', 'By train'], 0],
    ],
  },
  {
    keyword: 'motorcycle = รถจักรยานยนต์',
    variants: [
      ['A ___ has two wheels and an engine, but it has no pedals.', ['bicycle', 'motorcycle', 'van', 'train'], 1],
      ['Niran puts on a helmet, starts the engine, and rides away. What is he riding?', ['A motorcycle', 'A ship', 'A bus', 'A bicycle'], 0],
      ['Which vehicle is most different from a bicycle because it uses an engine?', ['boat', 'motorcycle', 'taxi', 'train'], 1],
    ],
  },
  {
    keyword: 'train = รถไฟ',
    variants: [
      ['Passengers wait on a platform before travelling on railway tracks. They are taking a ___.', ['bus', 'train', 'ship', 'van'], 1],
      ['Which vehicle cannot leave its rails to avoid traffic?', ['taxi', 'train', 'motorcycle', 'bus'], 1],
      ['The journey is by land, and the passengers board at a railway station. Choose the vehicle.', ['plane', 'boat', 'train', 'van'], 2],
    ],
  },
  {
    keyword: 'plane = เครื่องบิน',
    variants: [
      ['The family needs to fly from Bangkok to Tokyo. They should travel by ___.', ['ship', 'plane', 'train', 'van'], 1],
      ['Which vehicle takes off from a runway?', ['boat', 'bus', 'plane', 'taxi'], 2],
      ['Our flight leaves at 9 a.m. Which vehicle are we going to board?', ['A plane', 'A train', 'A ship', 'A motorcycle'], 0],
    ],
  },
  {
    keyword: 'hospital = โรงพยาบาล',
    variants: [
      ['Ploy has a high fever and needs to see a doctor. Where should she go?', ['bank', 'hospital', 'market', 'post office'], 1],
      ['Which place usually has doctors, nurses, and emergency rooms?', ['school', 'airport', 'hospital', 'restaurant'], 2],
      ['An ambulance is taking an injured person to the nearest ___.', ['hospital', 'cinema', 'bank', 'market'], 0],
    ],
  },
  {
    keyword: 'airport = สนามบิน',
    variants: [
      ['You must check in, show your passport, and board a flight. Where are you?', ['station', 'airport', 'market', 'hospital'], 1],
      ['Planes take off and land at an ___.', ['airport', 'post office', 'restaurant', 'school'], 0],
      ['The departure board says “Flight TG102”. Which place should you look for?', ['bank', 'airport', 'library', 'market'], 1],
    ],
  },
  {
    keyword: 'restaurant = ร้านอาหาร',
    variants: [
      ['A waiter brings the menu and takes our order. We are in a ___.', ['hotel', 'restaurant', 'coffee shop', 'supermarket'], 1],
      ['Which place is best for ordering a full meal from a menu?', ['restaurant', 'bank', 'library', 'post office'], 0],
      ['“A table for four, please.” Where would you most likely say this?', ['At a restaurant', 'At an airport', 'At a hospital', 'At a school'], 0],
    ],
  },
  {
    keyword: 'ship = เรือใหญ่ | boat = เรือเล็ก',
    variants: [
      ['Which sentence best compares a ship and a boat?', ['A ship is generally larger than a boat.', 'A boat travels only on land.', 'A ship has no engine.', 'They always have the same size.'], 0],
      ['Hundreds of passengers cross the ocean on a large vessel. It is most likely a ___.', ['boat', 'ship', 'van', 'train'], 1],
      ['For a short trip across a small lake, which is usually more suitable?', ['A plane', 'A train', 'A boat', 'A bus'], 2],
    ],
  },
  {
    keyword: 'bank = ธนาคาร',
    variants: [
      ['Korn wants to deposit money into his account. Where should he go?', ['market', 'bank', 'school', 'hospital'], 1],
      ['Which service would you expect to find at a bank?', ['Borrowing books', 'Opening an account', 'Buying medicine', 'Ordering lunch'], 1],
      ['The sign says “Cashier, ATM, Loans”. What kind of place is this?', ['bank', 'cinema', 'airport', 'restaurant'], 0],
    ],
  },
  {
    keyword: 'van = รถตู้',
    variants: [
      ['Eight students travel together in a vehicle smaller than a bus but larger than a car. It is a ___.', ['bicycle', 'truck', 'van', 'car'], 2],
      ['Which vehicle is suitable for a small group with several bags?', ['van', 'bicycle', 'motorcycle', 'boat'], 0],
      ['The hotel sends a twelve-seat vehicle to collect guests. What is it?', ['A taxi', 'A van', 'A train', 'A ship'], 1],
    ],
  },
  {
    keyword: 'taxi = รถแท็กซี่',
    variants: [
      ['You tell the driver your destination and pay a fare when you arrive. You are in a ___.', ['bus', 'taxi', 'train', 'boat'], 1],
      ['Which vehicle normally carries one passenger or a small group directly to their destination for a fare?', ['taxi', 'ship', 'school bus', 'train'], 0],
      ['Nok hails a car on the street and asks the driver to use the meter. What did she take?', ['A van', 'A taxi', 'A bus', 'A train'], 1],
    ],
  },
  {
    keyword: 'post office = ไปรษณีย์',
    variants: [
      ['Mali wants to send a parcel to Chiang Mai. Where should she go?', ['post office', 'hospital', 'bank', 'school'], 0],
      ['Which place sells stamps and accepts letters for delivery?', ['airport', 'post office', 'restaurant', 'market'], 1],
      ['You need to weigh a package before mailing it. Which counter do you need?', ['Bank counter', 'Post office counter', 'Cinema counter', 'Hospital counter'], 1],
    ],
  },
  {
    keyword: 'coffee shop = ร้านกาแฟ',
    variants: [
      ['Ben orders a latte and a small cake. Where is he most likely?', ['coffee shop', 'hospital', 'bank', 'school'], 0],
      ['Which place mainly serves drinks such as coffee, tea, and cocoa?', ['post office', 'coffee shop', 'airport', 'library'], 1],
      ['“Would you like your cappuccino hot or iced?” Where might you hear this?', ['At a coffee shop', 'At a bank', 'At a hospital', 'At a station'], 0],
    ],
  },
  {
    keyword: 'bus = รถเมล์',
    variants: [
      ['Many passengers get on at fixed stops and pay a low fare. They are travelling by ___.', ['taxi', 'bus', 'van', 'bicycle'], 1],
      ['Which vehicle usually follows a route and stops to pick up many passengers?', ['bus', 'motorcycle', 'car', 'boat'], 0],
      ['The sign at the stop shows route number 15. What should arrive there?', ['A plane', 'A ship', 'A bus', 'A train'], 2],
    ],
  },
  {
    keyword: 'market = ตลาด',
    variants: [
      ['Som wants to buy fresh fruit and vegetables from several sellers. Where should she go?', ['market', 'hospital', 'school', 'bank'], 0],
      ['Which place has many stalls selling food and household goods?', ['airport', 'market', 'post office', 'library'], 1],
      ['“How much are these mangoes?” is most likely heard at a ___.', ['hospital', 'market', 'bank', 'cinema'], 1],
    ],
  },
  {
    keyword: 'library = ห้องสมุด',
    variants: [
      ['A student wants to borrow a book and study quietly. Where should she go?', ['library', 'market', 'restaurant', 'airport'], 0],
      ['Which place usually requires visitors to return borrowed books on time?', ['hospital', 'library', 'bank', 'post office'], 1],
      ['The notice says “Please be quiet. Books may be borrowed for seven days.” Where is it?', ['At a library', 'At a market', 'At a cinema', 'At a restaurant'], 0],
    ],
  },
  {
    keyword: 'police station = สถานีตำรวจ',
    variants: [
      ['Jane has lost her bag and wants to report it. Where should she go?', ['police station', 'coffee shop', 'restaurant', 'school'], 0],
      ['Which place should you contact to report a crime?', ['hospital', 'police station', 'bank', 'market'], 1],
      ['An officer asks the witness to give a statement. Where are they most likely?', ['At a post office', 'At a police station', 'At an airport', 'At a library'], 1],
    ],
  },
  {
    keyword: 'strawberry = สตรอเบอร์รี่',
    variants: [
      ['Which fruit is small, red, and has tiny seeds on its outside?', ['banana', 'orange', 'strawberry', 'apple'], 2],
      ['The recipe needs a red berry often served with cream. Choose the ingredient.', ['strawberry', 'mango', 'watermelon', 'pineapple'], 0],
      ['Which word completes the phrase “___ jam” if the jam is made from red berries?', ['Banana', 'Strawberry', 'Lemon', 'Coconut'], 1],
    ],
  },
  {
    keyword: 'window = หน้าต่าง',
    variants: [
      ['Please open the ___ so that fresh air can enter the room.', ['floor', 'window', 'roof', 'wall'], 1],
      ['Which part of a house is usually made of glass and lets you see outside?', ['door', 'window', 'ceiling', 'stairs'], 1],
      ['The room is dark. Pull back the curtains and look through the ___.', ['roof', 'window', 'floor', 'gate'], 1],
    ],
  },
  {
    keyword: 'breakfast = อาหารเช้า',
    variants: [
      ['Nina eats eggs and toast before she goes to school at 7 a.m. This meal is ___.', ['lunch', 'dinner', 'breakfast', 'supper'], 2],
      ['Which meal do people normally eat after waking up?', ['breakfast', 'lunch', 'dinner', 'dessert'], 0],
      ['“I never leave home in the morning without eating.” Which meal is the speaker talking about?', ['Dinner', 'Breakfast', 'Lunch', 'A midnight snack'], 1],
    ],
  },
];

export function buildVocabularyAssessment() {
  return Array.from({ length: 50 }, (_, index) => {
    const concept = CONCEPTS[index % CONCEPTS.length];
    const variant = concept.variants[Math.floor(index / CONCEPTS.length) % concept.variants.length];
    const [question, options, answer] = variant;
    const correct = options[answer];
    return {
      id: `v${String(index + 1).padStart(2, '0')}`,
      quest: 'vocabulary',
      question,
      options,
      answer,
      correctFeedback: `ถูกต้อง! ${correct} เหมาะกับบริบทนี้`,
      wrongFeedback: `สังเกตคำบอกสถานการณ์ในโจทย์ แล้วเลือกคำที่ใช้ได้เหมาะสมที่สุด`,
      keyword: concept.keyword,
      difficulty: index < 20 ? 'application' : index < 40 ? 'context' : 'inference',
    };
  });
}

