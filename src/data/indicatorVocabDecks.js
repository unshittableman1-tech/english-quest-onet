/**
 * O-NET ADVENTURE — INDICATOR VOCABULARY DECKS (13 INDICATORS ALIGNED)
 * Extracted and curated from: 4-ฉบับนักเรียน.pdf & 5-ฉบับเฉลย.pdf
 * High-utility exam vocabulary with clear O-NET formulas and sample sentences.
 */

export const INDICATOR_VOCAB_DECKS = {
  signs_warnings: {
    id: 'deck_signs_warnings',
    name: 'ป้ายเตือนและสัญลักษณ์ (Signs & Warnings)',
    indicator: 'ต 1.1 ป.6/3',
    icon: '🚦',
    tone: 'peach',
    cards: [
      {
        id: 'sw_01',
        front: 'emergency exit',
        frontThai: 'ทางออกฉุกเฉิน',
        back: 'emergency exit',
        backThai: 'ทางออกฉุกเฉินในกรณีเกิดเหตุจำเป็น',
        example: 'Use the emergency exit during a fire.',
        exampleThai: 'ใช้ทางออกฉุกเฉินเมื่อเกิดเพลิงไหม้',
        note: 'มักพบในอาคาร โรงเรียน ห้างสรรพสินค้า'
      },
      {
        id: 'sw_02',
        front: 'slippery floor',
        frontThai: 'พื้นลื่น',
        back: 'slippery floor / wet floor',
        backThai: 'ระวังพื้นลื่น / กำลังทำความสะอาด',
        example: 'Watch out! The floor is slippery.',
        exampleThai: 'ระวัง! พื้นลื่น',
        note: 'สัญลักษณ์สามเหลี่ยมสีเหลืองพร้อมรูปคนลื่นล้ม'
      },
      {
        id: 'sw_03',
        front: 'pedestrian crossing',
        frontThai: 'ทางม้าลาย / ทางคนข้าม',
        back: 'pedestrian crossing',
        backThai: 'ทางคนข้ามถนน / ลดความเร็ว',
        example: 'Drivers must stop at the pedestrian crossing.',
        exampleThai: 'ผู้ขับขี่ต้องหยุดตรงทางคนข้าม',
        note: 'คำชี้ขาด: slow down, watch out for people'
      },
      {
        id: 'sw_04',
        front: 'do not touch',
        frontThai: 'ห้ามแตะ / ห้ามสัมผัส',
        back: 'do not touch / keep off',
        backThai: 'ห้ามจับ หรือห้ามสัมผัสสิ่งของนั้น',
        example: 'Do not touch the paintings in the gallery.',
        exampleThai: 'ห้ามแตะภาพวาดในหอศิลป์',
        note: 'ป้ายวงกลมแดงขีดทับมือ'
      },
      {
        id: 'sw_05',
        front: 'recycle bin',
        frontThai: 'ถังขยะรีไซเคิล',
        back: 'recycle bin',
        backThai: 'ถังสำหรับใส่ขยะที่นำกลับมาแปรรูปได้',
        example: 'Put plastic bottles into the recycle bin.',
        exampleThai: 'ใส่ขวดพลาสติกลงในถังรีไซเคิล',
        note: 'สัญลักษณ์ลูกศรสามเหลี่ยมวน 3 ด้าน'
      },
      {
        id: 'sw_06',
        front: 'queue here',
        frontThai: 'เข้าแถวตรงนี้',
        back: 'queue here / please wait in line',
        backThai: 'กรุณาต่อแถว / รอตามลำดับ',
        example: 'Passengers queue here to buy train tickets.',
        exampleThai: 'ผู้โดยสารเข้าแถวตรงนี้เพื่อซื้อตั๋วรถไฟ',
        note: 'มักออกในสถานการณ์ซื้อตั๋วหรือซื้ออาหาร'
      },
      {
        id: 'sw_07',
        front: 'no littering',
        frontThai: 'ห้ามทิ้งขยะ',
        back: 'no littering / do not drop litter',
        backThai: 'ห้ามทิ้งขยะเกลื่อนกลาดในบริเวณนี้',
        example: 'No littering in the national park.',
        exampleThai: 'ห้ามทิ้งขยะในอุทยานแห่งชาติ',
        note: 'รูปคนทิ้งขยะลงพื้นพร้อมแถบขีดทับสีแดง'
      },
      {
        id: 'sw_08',
        front: 'wear a mask',
        frontThai: 'สวมหน้ากากอนามัย',
        back: 'wear a mask / face covering required',
        backThai: 'ผู้ที่จะเข้าพื้นที่ต้องสวมหน้ากาก',
        example: 'Anyone entering the clinic must wear a mask.',
        exampleThai: 'ทุกคนที่เข้าคลินิกต้องสวมหน้ากาก',
        note: 'ข้อสอบถาม Who can go in? ตอบคนที่ wear a mask'
      }
    ]
  },

  spatial_navigation: {
    id: 'deck_spatial_navigation',
    name: 'แผนที่และทิศทาง (Spatial & Directions)',
    indicator: 'ต 1.3 ป.6/2',
    icon: '🧭',
    tone: 'mint',
    cards: [
      {
        id: 'sn_01',
        front: 'opposite',
        frontThai: 'อยู่ตรงข้าม',
        back: 'opposite',
        backThai: 'อยู่คนละฝั่งถนน หันหน้าชนกัน',
        example: 'The library is opposite the bank.',
        exampleThai: 'ห้องสมุดอยู่ตรงข้ามกับธนาคาร',
        note: 'คำตัดสิน: ข้ามถนนไปอีกฝั่ง = opposite'
      },
      {
        id: 'sn_02',
        front: 'next to',
        frontThai: 'อยู่ติดกัน / ถัดจาก',
        back: 'next to / beside',
        backThai: 'อยู่เคียงข้างในแนวถนนเดียวกัน',
        example: 'The bakery is next to the post office.',
        exampleThai: 'ร้านเบเกอรี่อยู่ติดกับที่ทำการไปรษณีย์',
        note: 'คำตัดสิน: อาคารติดกัน ไม่มีถนนกั้น = next to'
      },
      {
        id: 'sn_03',
        front: 'between',
        frontThai: 'อยู่ระหว่างกลาง',
        back: 'between A and B',
        backThai: 'อยู่ตรงกลางระหว่างสถานที่สองแห่ง',
        example: 'The clinic is between the shop and the school.',
        exampleThai: 'คลินิกอยู่ตรงกลางระหว่างร้านค้ากับโรงเรียน',
        note: 'สังเกตโครงสร้าง: between ... and ...'
      },
      {
        id: 'sn_04',
        front: 'crossroads / intersection',
        frontThai: 'สี่แยก / ทางแยก',
        back: 'intersection / crossroads',
        backThai: 'จุดตัดของถนนสองสายขึ้นไป',
        example: 'Turn left at the intersection.',
        exampleThai: 'เลี้ยวซ้ายที่สี่แยก',
        note: 'จุดบอกเลี้ยวที่สำคัญในข้อสอบแผนที่'
      },
      {
        id: 'sn_05',
        front: 'walk past',
        frontThai: 'เดินผ่านเลยไป',
        back: 'walk past / go past',
        backThai: 'เดินเลยสถานที่นั้นไปข้างหน้า',
        example: 'Walk past the pond, then turn left.',
        exampleThai: 'เดินผ่านสระน้ำไป แล้วจึงเลี้ยวซ้าย',
        note: 'คำลำดับกาล: past X -> then turn Y'
      },
      {
        id: 'sn_06',
        front: 'on the corner',
        frontThai: 'ตรงหัวมุมถนน',
        back: 'on the corner of',
        backThai: 'อยู่ตรงจุดเลี้ยวหรือมุมถนน',
        example: 'The coffee shop is on the corner of Main Street.',
        exampleThai: 'ร้านกาแฟอยู่ตรงหัวมุมถนนเมน',
        note: 'อาคารที่มีทางเข้าสองด้านตรงมุมถนน'
      }
    ]
  },

  emotions_reasons: {
    id: 'deck_emotions_reasons',
    name: 'อารมณ์และเหตุผล (Emotions & Reasons)',
    indicator: 'ต 1.2 ป.6/5',
    icon: '😊',
    tone: 'rose',
    cards: [
      {
        id: 'er_01',
        front: 'relaxed',
        frontThai: 'ผ่อนคลาย / สบายใจ',
        back: 'relaxed / calm',
        backThai: 'รู้สึกสบายใจ ไม่เครียด',
        example: 'She feels relaxed because the music is soothing.',
        exampleThai: 'เธอรู้สึกผ่อนคลายเพราะเสียงเพลงฟังสบาย',
        note: 'คู่คำถาม: How does she feel? Why? -> relaxed because...'
      },
      {
        id: 'er_02',
        front: 'disappointed',
        frontThai: 'ผิดหวัง',
        back: 'disappointed',
        backThai: 'รู้สึกเสียใจเมื่อสิ่งต่างๆ ไม่เป็นไปตามหวัง',
        example: 'Tom was disappointed because his team lost.',
        exampleThai: 'ทอมผิดหวังเพราะทีมของเขาแพ้',
        note: 'สาเหตุในโจทย์: lost the match / rained out'
      },
      {
        id: 'er_03',
        front: 'proud of',
        frontThai: 'ภาคภูมิใจใน',
        back: 'proud of',
        backThai: 'ภูมิใจในความสำเร็จของตนเองหรือผู้อื่น',
        example: 'Her parents are proud of her good marks.',
        exampleThai: 'พ่อแม่ภูมิใจในคะแนนสอบที่ดีของเธอ',
        note: 'บริบท: ได้รางวัลชนะเลิศ / สอบผ่าน'
      },
      {
        id: 'er_04',
        front: 'nervous',
        frontThai: 'ประหม่า / ตื่นเต้นกังวล',
        back: 'nervous',
        backThai: 'รู้สึกกังวลหรือไม่มั่นใจก่อนทำสิ่งสำคัญ',
        example: 'He is nervous before speaking on stage.',
        exampleThai: 'เขาประหม่าก่อนจะขึ้นพูดบนเวที',
        note: 'ต่างจาก excited ตรงที่มีความวิตกกังวลปนอยู่'
      },
      {
        id: 'er_05',
        front: 'exhausted',
        frontThai: 'เหน็ดเหนื่อยอย่างมาก',
        back: 'exhausted / very tired',
        backThai: 'หมดแรงหลังจากทำงานหนักหรือออกกำลังกาย',
        example: 'After running the marathon, Jane was exhausted.',
        exampleThai: 'หลังจากวิ่งมาราธอน เจนรู้สึกเหนื่อยล้าจนหมดแรง',
        note: 'ระดับความรู้สึก: tired < exhausted'
      }
    ]
  },

  culture_festivals: {
    id: 'deck_culture_festivals',
    name: 'เทศกาลและวัฒนธรรม (Culture & Festivals)',
    indicator: 'ต 2.1 ป.6/2',
    icon: '🎉',
    tone: 'lemon',
    cards: [
      {
        id: 'cf_01',
        front: 'pumpkin lantern',
        frontThai: 'โคมฟักทอง (Jack-o-lantern)',
        back: 'pumpkin lantern',
        backThai: 'โคมไฟแกะสลักจากฟักทองในเทศกาลฮาโลวีน',
        example: 'Children carve a pumpkin lantern on Halloween.',
        exampleThai: 'เด็กๆ แกะสลักโคมฟักทองในวันฮาโลวีน',
        note: 'วันสำคัญ: October 31st (Halloween)'
      },
      {
        id: 'cf_02',
        front: 'chimney and stocking',
        frontThai: 'ปล่องไฟและถุงเท้ายาว',
        back: 'chimney & stocking',
        backThai: 'สัญลักษณ์การรอรับของขวัญจากซานตาคลอส',
        example: 'Santa Claus comes down the chimney with gifts.',
        exampleThai: 'ซานตาคลอสลงมาตามปล่องไฟพร้อมของขวัญ',
        note: 'วันสำคัญ: December 25th (Christmas Day)'
      },
      {
        id: 'cf_03',
        front: 'egg hunt',
        frontThai: 'กิจกรรมตามหาไข่อีสเตอร์',
        back: 'Easter egg hunt',
        backThai: 'ประเพณีหาไข่หลากสีที่ซ่อนอยู่ในสวนช่วงฤดูใบไม้ผลิ',
        example: 'The children enjoyed the Easter egg hunt.',
        exampleThai: 'เด็กๆ สนุกกับกิจกรรมตามหาไข่อีสเตอร์',
        note: 'เทศกาล: Easter (ฤดูใบไม้ผลิ)'
      },
      {
        id: 'cf_04',
        front: 'poppy flower',
        frontThai: 'ดอกป๊อปปี้',
        back: 'poppy flower',
        backThai: 'ดอกไม้สัญลักษณ์วันทหารผ่านศึก (Veterans / Remembrance)',
        example: 'People wear red poppies to remember soldiers.',
        exampleThai: 'ผู้คนติดดอกป๊อปปี้สีแดงเพื่อรำลึกถึงทหารผ่านศึก',
        note: 'วันสำคัญ: Remembrance Day / Veterans Day'
      },
      {
        id: 'cf_05',
        front: 'Thanksgiving turkey',
        frontThai: 'ไก่งวงวันขอบคุณพระเจ้า',
        back: 'Thanksgiving roast turkey',
        backThai: 'อาหารหลักในมื้อค่ำวันขอบคุณพระเจ้า (พฤศจิกายน)',
        example: 'Families gather to eat roast turkey on Thanksgiving.',
        exampleThai: 'ครอบครัวมารวมตัวรับประทานไก่งวงในวันขอบคุณพระเจ้า',
        note: 'เทศกาล: 4th Thursday of November'
      }
    ]
  },

  school_communication: {
    id: 'deck_school_communication',
    name: 'ภาษาในโรงเรียน (School Communication)',
    indicator: 'ต 4.1 ป.6/1',
    icon: '🏫',
    tone: 'sky',
    cards: [
      {
        id: 'sc_01',
        front: 'timetable / schedule',
        frontThai: 'ตารางสอน / ตารางเวลา',
        back: 'timetable / class schedule',
        backThai: 'ตารางแสดงวิชาและเวลาเรียน',
        example: 'Check the timetable to see which class is next.',
        exampleThai: 'ตรวจดูตารางสอนว่าวิชาถัดไปคืออะไร',
        note: 'คำสำคัญในโจทย์: before, after, how long'
      },
      {
        id: 'sc_02',
        front: 'May I come in, please?',
        frontThai: 'ขออนุญาตเข้าห้องได้ไหมครับ/ค่ะ?',
        back: 'May I come in, please?',
        backThai: 'ประโยคขออนุญาตคุณครูเพื่อเข้าห้องเรียน',
        example: 'Teacher: Certainly, please sit down.',
        exampleThai: 'ครู: ได้สิ เข้ามานั่งที่ได้จ้ะ',
        note: 'คู่ตอบ: Yes, you may. / Certainly.'
      },
      {
        id: 'sc_03',
        front: 'borrow a pencil',
        frontThai: 'ขอยืมดินสอ',
        back: 'borrow a pencil',
        backThai: 'ขอยืมจากเพื่อนหรือครู (เราเป็นคนรับของมา)',
        example: 'May I borrow a pencil? I forgot my pencil case.',
        exampleThai: 'หนูขอยืมดินสอได้ไหมคะ หนูทำกล่องดินสอหายไว้ที่บ้าน',
        note: 'คู่สนทนาตอบ: Of course. Take your choice.'
      },
      {
        id: 'sc_04',
        front: 'postpone until Monday',
        frontThai: 'เลื่อนไปวันจันทร์',
        back: 'postpone / put off until',
        backThai: 'เลื่อนกิจกรรมออกไป แต่ยังมีจัดอยู่',
        example: 'The science exhibition was postponed until Monday.',
        exampleThai: 'งานนิทรรศการวิทยาศาสตร์ถูกเลื่อนไปเป็นวันจันทร์',
        note: 'ต่างจาก cancelled ที่หมายถึงยกเลิกเด็ดขาด'
      }
    ]
  }
};
