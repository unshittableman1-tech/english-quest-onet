// Sidecar metadata only. No question, answer, reward or unlock changes.
// Approved by explicit user message; payload fingerprints guard subsequent changes.
export const ITEM_LEARNING_LINKS = [
  {
    "questionId": "pdf_1.3_โรงเรียน_5",
    "questId": "school",
    "version": "item-learning-pilot-v1",
    "questionSnapshot": {
      "id": "pdf_1.3_โรงเรียน_5",
      "questId": "school",
      "version": "onet-context-v1",
      "question": "A: Could I borrow your ruler, please?\nB: ______",
      "passage": null,
      "options": [
        "I like Mathematics.",
        "It is twenty centimetres.",
        "Sure. Here you are.",
        "The ruler is blue."
      ],
      "correctOption": "Sure. Here you are."
    },
    "skillId": "permission_in_context",
    "patternId": "borrowing_reply",
    "patternTh": "Could I borrow ...? เป็นการขอยืม คำตอบต้องรับหรือปฏิเสธคำขอนั้น",
    "questionMeaningTh": "ควรตอบรับคำขอยืมไม้บรรทัดอย่างไร",
    "vocabulary": [
      {
        "catalogId": "borrow:%E0%B8%A2%E0%B8%B7%E0%B8%A1",
        "word": "borrow",
        "meaningTh": "ยืม",
        "pdfVocabularyRefs": []
      },
      {
        "catalogId": "ruler:%E0%B9%84%E0%B8%A1%E0%B9%89%E0%B8%9A%E0%B8%A3%E0%B8%A3%E0%B8%97%E0%B8%B1%E0%B8%94",
        "word": "ruler",
        "meaningTh": "ไม้บรรทัด",
        "pdfVocabularyRefs": [
          {
            "source": "student-challenge-2569",
            "pdfPage": 8,
            "relationship": "word_occurrence_only"
          }
        ]
      }
    ],
    "evidence": [
      {
        "field": "question",
        "quote": "Could I borrow your ruler, please?",
        "explanationTh": "ผู้พูดขอยืมไม้บรรทัด ไม่ได้ถามขนาด สี หรือวิชาเรียน"
      }
    ],
    "explanationTh": "Sure. Here you are. เป็นการตอบรับพร้อมส่งของให้ จึงตรงกับคำขอยืมไม้บรรทัด",
    "optionExplanations": [
      {
        "option": "Sure. Here you are.",
        "correct": true,
        "explanationTh": "ตอบรับคำขอและสื่อว่าส่งไม้บรรทัดให้"
      },
      {
        "option": "It is twenty centimetres.",
        "correct": false,
        "explanationTh": "บอกความยาวของไม้บรรทัด ไม่ได้ตอบรับคำขอยืม"
      },
      {
        "option": "I like Mathematics.",
        "correct": false,
        "explanationTh": "บอกวิชาที่ชอบ ไม่ตรงกับคำขอ"
      },
      {
        "option": "The ruler is blue.",
        "correct": false,
        "explanationTh": "บอกสีของไม้บรรทัด ไม่ได้ตอบว่าขอยืมได้หรือไม่"
      }
    ],
    "remediation": {
      "questId": "school",
      "activityTh": "ฝึกแยกคำขอยืมออกจากคำถามสีและขนาด แล้วเลือกคำตอบให้ตรงเจตนาของผู้พูด",
      "freshItemStatus": "not_authored_or_validated"
    },
    "source": {
      "question": "src/data/questions.js (resolved QUESTS)",
      "learningContent": "new_project_authored_explanations",
      "officialExamClaim": false
    },
    "concerns": [],
    "technicalReview": {
      "status": "checked",
      "reviewer": "Codex",
      "date": "2026-11-12",
      "scope": "binding_evidence_options_vocabulary_identity_not_human_pedagogical_approval"
    },
    "review": {
      "status": "approved",
      "reviewerId": "conversation-user",
      "reviewedAt": "2026-11-12T06:44:08+07:00",
      "fingerprint": "89cf7dd020169b794ca7da2ac19b43712c52ed57dddc5e7bc00472de1ed2c432",
      "approvalBasis": "explicit_user_approval",
      "approvalText": "อนุมัติ",
      "approvalReference": "codex-chat:01a1ca61-22ad-7d82-9d78-ec8b85e1cd7b"
    }
  },
  {
    "questionId": "c04",
    "questId": "conversation",
    "version": "item-learning-pilot-v1",
    "questionSnapshot": {
      "id": "c04",
      "questId": "conversation",
      "version": "legacy-unversioned",
      "question": "A: \"May I go out, please?\" B: ครูตอบอย่างไรถ้าอนุญาต?",
      "passage": null,
      "options": [
        "No, you may not.",
        "Of course not.",
        "That's all right.",
        "Yes, you may."
      ],
      "correctOption": "Yes, you may."
    },
    "skillId": "permission_in_context",
    "patternId": "permission_reply",
    "patternTh": "May I ...? เป็นการขออนุญาต ต้องดูว่าผู้ตอบอนุญาตหรือปฏิเสธตามสถานการณ์",
    "questionMeaningTh": "ครูควรตอบอย่างไรเมื่ออนุญาตให้นักเรียนออกไป",
    "vocabulary": [
      {
        "catalogId": "please:%E0%B9%82%E0%B8%9B%E0%B8%A3%E0%B8%94%20%2F%20%E0%B8%81%E0%B8%A3%E0%B8%B8%E0%B8%93%E0%B8%B2",
        "word": "please",
        "meaningTh": "โปรด / กรุณา",
        "pdfVocabularyRefs": [
          {
            "source": "student-challenge-2569",
            "pdfPage": 8,
            "relationship": "word_occurrence_only"
          }
        ]
      }
    ],
    "evidence": [
      {
        "field": "question",
        "quote": "May I go out, please?",
        "explanationTh": "นักเรียนขออนุญาตออกไป"
      },
      {
        "field": "question",
        "quote": "ถ้าอนุญาต",
        "explanationTh": "เงื่อนไขของโจทย์ต้องการคำตอบรับการขออนุญาต"
      }
    ],
    "explanationTh": "โจทย์กำหนดว่าครูอนุญาต คำตอบ Yes, you may. จึงตอบรับอย่างชัดเจนและสอดคล้องกับ May I ...?",
    "optionExplanations": [
      {
        "option": "That's all right.",
        "correct": false,
        "explanationTh": "อาจสื่อว่าไม่เป็นไรได้ในบางบริบท แต่ไม่ระบุการอนุญาตชัดเท่า Yes, you may. ข้อนี้ควรให้ครูตรวจความกำกวมก่อนใช้เนื้อหาใหม่"
      },
      {
        "option": "Of course not.",
        "correct": false,
        "explanationTh": "เป็นการปฏิเสธอย่างชัดเจน ขัดกับเงื่อนไขว่าอนุญาต"
      },
      {
        "option": "No, you may not.",
        "correct": false,
        "explanationTh": "เป็นการไม่อนุญาต ขัดกับเงื่อนไขของโจทย์"
      },
      {
        "option": "Yes, you may.",
        "correct": true,
        "explanationTh": "เป็นคำตอบรับที่ระบุการอนุญาตตรงกับคำถาม"
      }
    ],
    "remediation": {
      "questId": "conversation",
      "activityTh": "แยกคำตอบรับและคำตอบปฏิเสธของ May I ...? แล้วทดลองสถานการณ์ขออนุญาตใหม่",
      "freshItemStatus": "not_authored_or_validated"
    },
    "source": {
      "question": "src/data/questions.js (resolved QUESTS)",
      "learningContent": "new_project_authored_explanations",
      "officialExamClaim": false
    },
    "concerns": [
      "ตัวเลือก That’s all right อาจมีการใช้ตอบอนุญาตในบางบริบท ต้องให้ครูยืนยันคำตอบที่ดีที่สุดหรือแก้ข้อสอบและตรวจใหม่ก่อนอนุมัติ"
    ],
    "technicalReview": {
      "status": "checked",
      "reviewer": "Codex",
      "date": "2026-11-12",
      "scope": "binding_evidence_options_vocabulary_identity_not_human_pedagogical_approval"
    },
    "review": {
      "status": "approved",
      "reviewerId": "conversation-user",
      "reviewedAt": "2026-11-12T06:44:08+07:00",
      "fingerprint": "af0b05a058fd0d3283dc73f365801ae739f41e64651c807ef04761a1dc9ad320",
      "approvalBasis": "explicit_user_approval",
      "approvalText": "อนุมัติ",
      "approvalReference": "codex-chat:01a1ca61-22ad-7d82-9d78-ec8b85e1cd7b"
    }
  },
  {
    "questionId": "m09",
    "questId": "market",
    "version": "item-learning-pilot-v1",
    "questionSnapshot": {
      "id": "m09",
      "questId": "market",
      "version": "onet-context-v1",
      "question": "Customer: May I try these shoes on?\nWhat does the customer want to do?",
      "passage": null,
      "options": [
        "Clean the shoes",
        "Pay for the shoes",
        "Return the shoes",
        "Wear the shoes to check the size"
      ],
      "correctOption": "Wear the shoes to check the size"
    },
    "skillId": "permission_in_context",
    "patternId": "request_intention",
    "patternTh": "What does ... want to do? ให้ตีความสิ่งที่ผู้พูดต้องการทำจากคำขอ",
    "questionMeaningTh": "ลูกค้าต้องการทำอะไรกับรองเท้า",
    "vocabulary": [
      {
        "catalogId": "try on:%E0%B8%A5%E0%B8%AD%E0%B8%87%E0%B8%AA%E0%B8%A7%E0%B8%A1",
        "word": "try on",
        "meaningTh": "ลองสวม",
        "pdfVocabularyRefs": []
      }
    ],
    "evidence": [
      {
        "field": "question",
        "quote": "May I try these shoes on?",
        "explanationTh": "ผู้พูดขอลองสวมรองเท้า โดย shoes แทรกระหว่าง try กับ on"
      }
    ],
    "explanationTh": "Try ... on เป็นวลีขอลองสวมเสื้อผ้าหรือรองเท้า จึงเป็นการสวมเพื่อตรวจว่าขนาดพอดี ไม่ใช่จ่ายเงินหรือคืนสินค้า",
    "optionExplanations": [
      {
        "option": "Pay for the shoes",
        "correct": false,
        "explanationTh": "เป็นการจ่ายเงิน ซึ่งไม่ได้ระบุในคำขอ"
      },
      {
        "option": "Wear the shoes to check the size",
        "correct": true,
        "explanationTh": "ตรงกับการลองสวมรองเท้าเพื่อตรวจขนาด"
      },
      {
        "option": "Return the shoes",
        "correct": false,
        "explanationTh": "เป็นการคืนรองเท้า ไม่ใช่ try on"
      },
      {
        "option": "Clean the shoes",
        "correct": false,
        "explanationTh": "เป็นการทำความสะอาดรองเท้า ซึ่งไม่ปรากฏในคำขอ"
      }
    ],
    "remediation": {
      "questId": "market",
      "activityTh": "ฝึกวลี try on, pay for และ return ในบทสนทนาร้านค้าใหม่ โดยดูความหมายทั้งวลี",
      "freshItemStatus": "not_authored_or_validated"
    },
    "source": {
      "question": "src/data/questions.js (resolved QUESTS)",
      "learningContent": "new_project_authored_explanations",
      "officialExamClaim": false
    },
    "concerns": [],
    "technicalReview": {
      "status": "checked",
      "reviewer": "Codex",
      "date": "2026-11-12",
      "scope": "binding_evidence_options_vocabulary_identity_not_human_pedagogical_approval"
    },
    "review": {
      "status": "approved",
      "reviewerId": "conversation-user",
      "reviewedAt": "2026-11-12T06:44:08+07:00",
      "fingerprint": "b3ce3057f6a6fbd01f8ce6fa00335a7f4dcd41e849c83b55a911995d13180d43",
      "approvalBasis": "explicit_user_approval",
      "approvalText": "อนุมัติ",
      "approvalReference": "codex-chat:01a1ca61-22ad-7d82-9d78-ec8b85e1cd7b"
    }
  },
  {
    "questionId": "d02",
    "questId": "directions",
    "version": "item-learning-pilot-v1",
    "questionSnapshot": {
      "id": "d02",
      "questId": "directions",
      "version": "onet-context-v1",
      "question": "A: Excuse me, how can I get to the bank?\nB: Go straight and turn left at the traffic lights. What should A do first?",
      "passage": null,
      "options": [
        "Cross the bridge",
        "Go straight",
        "Turn left",
        "Turn right"
      ],
      "correctOption": "Go straight"
    },
    "skillId": "directions_sequence",
    "patternId": "instruction_first",
    "patternTh": "What ... first? ให้หาการกระทำแรก อย่าเลือกคำสั่งที่เกิดภายหลัง",
    "questionMeaningTh": "ผู้ถามต้องทำอะไรก่อนเป็นอย่างแรก",
    "vocabulary": [
      {
        "catalogId": "bank:%E0%B8%98%E0%B8%99%E0%B8%B2%E0%B8%84%E0%B8%B2%E0%B8%A3",
        "word": "bank",
        "meaningTh": "ธนาคาร",
        "pdfVocabularyRefs": [
          {
            "source": "student-challenge-2569",
            "pdfPage": 3,
            "relationship": "word_occurrence_only"
          }
        ]
      },
      {
        "catalogId": "go straight:%E0%B8%95%E0%B8%A3%E0%B8%87%E0%B9%84%E0%B8%9B",
        "word": "go straight",
        "meaningTh": "ตรงไป",
        "pdfVocabularyRefs": []
      }
    ],
    "evidence": [
      {
        "field": "question",
        "quote": "Go straight and turn left",
        "explanationTh": "คำสั่งให้ตรงไปก่อน แล้วจึงเลี้ยวซ้าย"
      }
    ],
    "explanationTh": "คำเชื่อม and ในคำสั่งนี้เรียงให้ตรงไปก่อน แล้วค่อยเลี้ยวซ้ายเมื่อถึงสัญญาณไฟ จึงเลือก Go straight",
    "optionExplanations": [
      {
        "option": "Turn left",
        "correct": false,
        "explanationTh": "เป็นการกระทำถัดไปเมื่อถึงสัญญาณไฟ ไม่ใช่อย่างแรก"
      },
      {
        "option": "Go straight",
        "correct": true,
        "explanationTh": "ตรงกับคำสั่งแรกของผู้บอกทาง"
      },
      {
        "option": "Cross the bridge",
        "correct": false,
        "explanationTh": "บทสนทนาไม่ได้สั่งให้ข้ามสะพาน"
      },
      {
        "option": "Turn right",
        "correct": false,
        "explanationTh": "ผู้บอกทางให้เลี้ยวซ้าย ไม่ได้ให้เลี้ยวขวา"
      }
    ],
    "remediation": {
      "questId": "directions",
      "activityTh": "ฝึกเรียงคำสั่ง go straight → turn left แล้วลองคำสั่งเส้นทางใหม่โดยไม่ดูเฉลยเดิม",
      "freshItemStatus": "not_authored_or_validated"
    },
    "source": {
      "question": "src/data/questions.js (resolved QUESTS)",
      "learningContent": "new_project_authored_explanations",
      "officialExamClaim": false
    },
    "concerns": [],
    "technicalReview": {
      "status": "checked",
      "reviewer": "Codex",
      "date": "2026-11-12",
      "scope": "binding_evidence_options_vocabulary_identity_not_human_pedagogical_approval"
    },
    "review": {
      "status": "approved",
      "reviewerId": "conversation-user",
      "reviewedAt": "2026-11-12T06:44:08+07:00",
      "fingerprint": "6219466144e84d3ac392633b9e1c4e8005a8e8cb0fc25a67dc1a8a54876df7a4",
      "approvalBasis": "explicit_user_approval",
      "approvalText": "อนุมัติ",
      "approvalReference": "codex-chat:01a1ca61-22ad-7d82-9d78-ec8b85e1cd7b"
    }
  },
  {
    "questionId": "d04",
    "questId": "directions",
    "version": "item-learning-pilot-v1",
    "questionSnapshot": {
      "id": "d04",
      "questId": "directions",
      "version": "onet-context-v1",
      "question": "Tom is facing north. He turns right. Which direction is he facing now?",
      "passage": null,
      "options": [
        "East",
        "North",
        "South",
        "West"
      ],
      "correctOption": "East"
    },
    "skillId": "directions_sequence",
    "patternId": "direction_after_turn",
    "patternTh": "Which direction ... now? ให้ติดตามทิศตั้งต้นและการหมุนก่อนเลือกทิศสุดท้าย",
    "questionMeaningTh": "หลังจากหันขวา ทอมกำลังหันไปทิศใด",
    "vocabulary": [
      {
        "catalogId": "north:%E0%B8%97%E0%B8%B4%E0%B8%A8%E0%B9%80%E0%B8%AB%E0%B8%99%E0%B8%B7%E0%B8%AD",
        "word": "north",
        "meaningTh": "ทิศเหนือ",
        "pdfVocabularyRefs": [
          {
            "source": "student-challenge-2569",
            "pdfPage": 7,
            "relationship": "word_occurrence_only"
          }
        ]
      },
      {
        "catalogId": "turn right:%E0%B9%80%E0%B8%A5%E0%B8%B5%E0%B9%89%E0%B8%A2%E0%B8%A7%E0%B8%82%E0%B8%A7%E0%B8%B2",
        "word": "turn right",
        "meaningTh": "เลี้ยวขวา",
        "pdfVocabularyRefs": []
      }
    ],
    "evidence": [
      {
        "field": "question",
        "quote": "facing north",
        "explanationTh": "เริ่มจากหันหน้าไปทางทิศเหนือ"
      },
      {
        "field": "question",
        "quote": "turns right",
        "explanationTh": "หมุนไปทางขวาหนึ่งมุมฉากตามโจทย์"
      }
    ],
    "explanationTh": "กำหนดทิศเหนือไว้ด้านบน แล้วหมุนตามเข็มนาฬิกาไปทางขวา 90 องศา จะหันไปทางทิศตะวันออก",
    "optionExplanations": [
      {
        "option": "East",
        "correct": true,
        "explanationTh": "เป็นทิศที่ได้เมื่อหันจากเหนือไปทางขวา"
      },
      {
        "option": "West",
        "correct": false,
        "explanationTh": "จะได้ทิศนี้หากหันซ้ายจากเหนือ"
      },
      {
        "option": "South",
        "correct": false,
        "explanationTh": "เป็นทิศตรงข้ามเหนือ ต้องกลับหลังจึงได้ทิศนี้"
      },
      {
        "option": "North",
        "correct": false,
        "explanationTh": "เป็นทิศตั้งต้น ยังไม่ได้หันตามคำสั่ง"
      }
    ],
    "remediation": {
      "questId": "directions",
      "activityTh": "ใช้เข็มทิศจำลองฝึกหันซ้ายและขวาจากจุดเริ่มต่างกัน แยกทิศตั้งต้นกับทิศสุดท้าย",
      "freshItemStatus": "not_authored_or_validated"
    },
    "source": {
      "question": "src/data/questions.js (resolved QUESTS)",
      "learningContent": "new_project_authored_explanations",
      "officialExamClaim": false
    },
    "concerns": [],
    "technicalReview": {
      "status": "checked",
      "reviewer": "Codex",
      "date": "2026-11-12",
      "scope": "binding_evidence_options_vocabulary_identity_not_human_pedagogical_approval"
    },
    "review": {
      "status": "approved",
      "reviewerId": "conversation-user",
      "reviewedAt": "2026-11-12T06:44:08+07:00",
      "fingerprint": "758a8fc82aa2dcf4a67b3ee10cb6f2f14f572c5063233495ebab3d6fbf98632c",
      "approvalBasis": "explicit_user_approval",
      "approvalText": "อนุมัติ",
      "approvalReference": "codex-chat:01a1ca61-22ad-7d82-9d78-ec8b85e1cd7b"
    }
  },
  {
    "questionId": "d06",
    "questId": "directions",
    "version": "item-learning-pilot-v1",
    "questionSnapshot": {
      "id": "d06",
      "questId": "directions",
      "version": "onet-context-v1",
      "question": "The hospital is opposite the supermarket. Where is the supermarket?",
      "passage": null,
      "options": [
        "Across from the hospital",
        "Behind the hospital",
        "Inside the hospital",
        "Next to the bank"
      ],
      "correctOption": "Across from the hospital"
    },
    "skillId": "directions_sequence",
    "patternId": "where_relative_position",
    "patternTh": "Where ...? ในข้อนี้ถามตำแหน่งของสถานที่เทียบกับอีกแห่ง",
    "questionMeaningTh": "ซูเปอร์มาร์เก็ตอยู่ตำแหน่งใดเมื่อเทียบกับโรงพยาบาล",
    "vocabulary": [
      {
        "catalogId": "hospital:%E0%B9%82%E0%B8%A3%E0%B8%87%E0%B8%9E%E0%B8%A2%E0%B8%B2%E0%B8%9A%E0%B8%B2%E0%B8%A5",
        "word": "hospital",
        "meaningTh": "โรงพยาบาล",
        "pdfVocabularyRefs": [
          {
            "source": "student-challenge-2569",
            "pdfPage": 6,
            "relationship": "word_occurrence_only"
          }
        ]
      },
      {
        "catalogId": "opposite:%E0%B8%95%E0%B8%A3%E0%B8%87%E0%B8%82%E0%B9%89%E0%B8%B2%E0%B8%A1",
        "word": "opposite",
        "meaningTh": "ตรงข้าม",
        "pdfVocabularyRefs": [
          {
            "source": "student-challenge-2569",
            "pdfPage": 7,
            "relationship": "word_occurrence_only"
          }
        ]
      }
    ],
    "evidence": [
      {
        "field": "question",
        "quote": "hospital is opposite the supermarket",
        "explanationTh": "สถานที่สองแห่งอยู่ตรงข้ามกัน จึงบอกย้อนตำแหน่งได้"
      }
    ],
    "explanationTh": "Opposite และ across from บอกตำแหน่งตรงข้ามกัน เมื่อโรงพยาบาลอยู่ตรงข้ามซูเปอร์มาร์เก็ต ซูเปอร์มาร์เก็ตก็อยู่ตรงข้ามโรงพยาบาล",
    "optionExplanations": [
      {
        "option": "Behind the hospital",
        "correct": false,
        "explanationTh": "Behind แปลว่าด้านหลัง ไม่ตรงกับ opposite"
      },
      {
        "option": "Across from the hospital",
        "correct": true,
        "explanationTh": "Across from บอกตำแหน่งตรงข้าม ตรงกับความสัมพันธ์ในโจทย์"
      },
      {
        "option": "Inside the hospital",
        "correct": false,
        "explanationTh": "Inside แปลว่าข้างใน โจทย์ไม่ได้บอกว่าอยู่ภายในโรงพยาบาล"
      },
      {
        "option": "Next to the bank",
        "correct": false,
        "explanationTh": "โจทย์ไม่ได้ระบุธนาคาร จึงสรุปว่าอยู่ติดธนาคารไม่ได้"
      }
    ],
    "remediation": {
      "questId": "directions",
      "activityTh": "ฝึกจับคู่ opposite กับ across from แล้วเปรียบเทียบกับ behind และ next to ในแผนผังใหม่",
      "freshItemStatus": "not_authored_or_validated"
    },
    "source": {
      "question": "src/data/questions.js (resolved QUESTS)",
      "learningContent": "new_project_authored_explanations",
      "officialExamClaim": false
    },
    "concerns": [],
    "technicalReview": {
      "status": "checked",
      "reviewer": "Codex",
      "date": "2026-11-12",
      "scope": "binding_evidence_options_vocabulary_identity_not_human_pedagogical_approval"
    },
    "review": {
      "status": "approved",
      "reviewerId": "conversation-user",
      "reviewedAt": "2026-11-12T06:44:08+07:00",
      "fingerprint": "74050d46d9ef98a2b00a86956a4c37428cc186598264a9af8397a15eccae8976",
      "approvalBasis": "explicit_user_approval",
      "approvalText": "อนุมัติ",
      "approvalReference": "codex-chat:01a1ca61-22ad-7d82-9d78-ec8b85e1cd7b"
    }
  },
  {
    "questionId": "r01",
    "questId": "reading",
    "version": "item-learning-pilot-v1",
    "questionSnapshot": {
      "id": "r01",
      "questId": "reading",
      "version": "legacy-unversioned",
      "question": "Where did Lisa go?",
      "passage": "Lisa went to a fruit market on Saturday morning. She bought apples, oranges, and bananas to make a fruit salad. The fruit salad was delicious!",
      "options": [
        "To the fruit market",
        "To the hospital",
        "To the restaurant",
        "To the school"
      ],
      "correctOption": "To the fruit market"
    },
    "skillId": "reading_detail",
    "patternId": "where_place",
    "patternTh": "Where did ... go? ถามสถานที่ที่ไป ให้หาคำบอกปลายทางในบทอ่าน",
    "questionMeaningTh": "ลิซ่าไปที่ไหน",
    "vocabulary": [
      {
        "catalogId": "market:%E0%B8%95%E0%B8%A5%E0%B8%B2%E0%B8%94",
        "word": "market",
        "meaningTh": "ตลาด",
        "pdfVocabularyRefs": [
          {
            "source": "student-challenge-2569",
            "pdfPage": 7,
            "relationship": "word_occurrence_only"
          }
        ]
      },
      {
        "catalogId": "fruit:%E0%B8%9C%E0%B8%A5%E0%B9%84%E0%B8%A1%E0%B9%89",
        "word": "fruit",
        "meaningTh": "ผลไม้",
        "pdfVocabularyRefs": [
          {
            "source": "student-challenge-2569",
            "pdfPage": 5,
            "relationship": "word_occurrence_only"
          }
        ]
      }
    ],
    "evidence": [
      {
        "field": "passage",
        "quote": "Lisa went to a fruit market on Saturday morning.",
        "explanationTh": "ประโยคแรกระบุสถานที่ที่ลิซ่าไปอย่างชัดเจน"
      }
    ],
    "explanationTh": "ส่วน went to a fruit market บอกปลายทางคือ ตลาดผลไม้ ส่วน Saturday morning บอกเวลา ไม่ใช่คำตอบของ Where",
    "optionExplanations": [
      {
        "option": "To the school",
        "correct": false,
        "explanationTh": "บทอ่านไม่ได้บอกว่าไปโรงเรียน"
      },
      {
        "option": "To the fruit market",
        "correct": true,
        "explanationTh": "ตรงกับปลายทาง a fruit market ในบทอ่าน"
      },
      {
        "option": "To the hospital",
        "correct": false,
        "explanationTh": "บทอ่านไม่ได้บอกว่าไปโรงพยาบาล"
      },
      {
        "option": "To the restaurant",
        "correct": false,
        "explanationTh": "บทอ่านไม่ได้บอกว่าไปร้านอาหาร"
      }
    ],
    "remediation": {
      "questId": "reading",
      "activityTh": "ฝึกแยกสถานที่กับเวลาในประโยคเดียวกัน แล้วตอบ Where จากข้อความใหม่",
      "freshItemStatus": "not_authored_or_validated"
    },
    "source": {
      "question": "src/data/questions.js (resolved QUESTS)",
      "learningContent": "new_project_authored_explanations",
      "officialExamClaim": false
    },
    "concerns": [],
    "technicalReview": {
      "status": "checked",
      "reviewer": "Codex",
      "date": "2026-11-12",
      "scope": "binding_evidence_options_vocabulary_identity_not_human_pedagogical_approval"
    },
    "review": {
      "status": "approved",
      "reviewerId": "conversation-user",
      "reviewedAt": "2026-11-12T06:44:08+07:00",
      "fingerprint": "5e58d804c8fd50082138096e13191d826a58648fcfd8e5d6a22d95a910caf115",
      "approvalBasis": "explicit_user_approval",
      "approvalText": "อนุมัติ",
      "approvalReference": "codex-chat:01a1ca61-22ad-7d82-9d78-ec8b85e1cd7b"
    }
  },
  {
    "questionId": "r02",
    "questId": "reading",
    "version": "item-learning-pilot-v1",
    "questionSnapshot": {
      "id": "r02",
      "questId": "reading",
      "version": "legacy-unversioned",
      "question": "What did Lisa buy?",
      "passage": "Lisa went to a fruit market on Saturday morning. She bought apples, oranges, and bananas to make a fruit salad. The fruit salad was delicious!",
      "options": [
        "Apples and bananas",
        "Apples, oranges, and bananas",
        "Only apples",
        "Oranges and mangoes"
      ],
      "correctOption": "Apples, oranges, and bananas"
    },
    "skillId": "reading_detail",
    "patternId": "what_purchased_items",
    "patternTh": "What did ... buy? ถามสิ่งที่ซื้อ ต้องตรวจรายการให้ครบ ไม่เลือกเพียงบางส่วน",
    "questionMeaningTh": "ลิซ่าซื้ออะไรบ้าง",
    "vocabulary": [
      {
        "catalogId": "fruit:%E0%B8%9C%E0%B8%A5%E0%B9%84%E0%B8%A1%E0%B9%89",
        "word": "fruit",
        "meaningTh": "ผลไม้",
        "pdfVocabularyRefs": [
          {
            "source": "student-challenge-2569",
            "pdfPage": 5,
            "relationship": "word_occurrence_only"
          }
        ]
      },
      {
        "catalogId": "market:%E0%B8%95%E0%B8%A5%E0%B8%B2%E0%B8%94",
        "word": "market",
        "meaningTh": "ตลาด",
        "pdfVocabularyRefs": [
          {
            "source": "student-challenge-2569",
            "pdfPage": 7,
            "relationship": "word_occurrence_only"
          }
        ]
      }
    ],
    "evidence": [
      {
        "field": "passage",
        "quote": "She bought apples, oranges, and bananas",
        "explanationTh": "ประโยคนี้ระบุสิ่งที่ซื้อทั้งสามชนิด"
      }
    ],
    "explanationTh": "บทอ่านระบุแอปเปิล ส้ม และกล้วยครบสามชนิด คำตอบที่ตัดส้มหรือเพิ่มมะม่วงจึงไม่ตรงข้อมูล",
    "optionExplanations": [
      {
        "option": "Only apples",
        "correct": false,
        "explanationTh": "มีเพียงแอปเปิล จึงขาดส้มและกล้วย"
      },
      {
        "option": "Apples and bananas",
        "correct": false,
        "explanationTh": "ขาดส้มซึ่งมีอยู่ในรายการซื้อ"
      },
      {
        "option": "Apples, oranges, and bananas",
        "correct": true,
        "explanationTh": "ระบุผลไม้ครบทั้งสามชนิดตามบทอ่าน"
      },
      {
        "option": "Oranges and mangoes",
        "correct": false,
        "explanationTh": "มีมะม่วงซึ่งบทอ่านไม่ได้กล่าวถึง และขาดแอปเปิลกับกล้วย"
      }
    ],
    "remediation": {
      "questId": "reading",
      "activityTh": "ฝึกตรวจรายการสิ่งของทีละรายการและคำว่า only แล้วลองบทอ่านที่เปลี่ยนรายการซื้อ",
      "freshItemStatus": "not_authored_or_validated"
    },
    "source": {
      "question": "src/data/questions.js (resolved QUESTS)",
      "learningContent": "new_project_authored_explanations",
      "officialExamClaim": false
    },
    "concerns": [],
    "technicalReview": {
      "status": "checked",
      "reviewer": "Codex",
      "date": "2026-11-12",
      "scope": "binding_evidence_options_vocabulary_identity_not_human_pedagogical_approval"
    },
    "review": {
      "status": "approved",
      "reviewerId": "conversation-user",
      "reviewedAt": "2026-11-12T06:44:08+07:00",
      "fingerprint": "32d6c1d762a1b5cf75fae4efdf72d609da88f5f9a2c54410ff579093d91e09d3",
      "approvalBasis": "explicit_user_approval",
      "approvalText": "อนุมัติ",
      "approvalReference": "codex-chat:01a1ca61-22ad-7d82-9d78-ec8b85e1cd7b"
    }
  },
  {
    "questionId": "r04",
    "questId": "reading",
    "version": "item-learning-pilot-v1",
    "questionSnapshot": {
      "id": "r04",
      "questId": "reading",
      "version": "legacy-unversioned",
      "question": "How does Tom go to school?",
      "passage": "Tom is a good student. He goes to school by bicycle every day. He studies hard and always does his homework. His teacher is very proud of him.",
      "options": [
        "By bicycle",
        "By bus",
        "By car",
        "On foot"
      ],
      "correctOption": "By bicycle"
    },
    "skillId": "reading_detail",
    "patternId": "how_transport",
    "patternTh": "How ... go to school? ในบริบทนี้ถามวิธีเดินทาง ไม่ใช่อารมณ์หรือเวลา",
    "questionMeaningTh": "ทอมเดินทางไปโรงเรียนอย่างไร",
    "vocabulary": [
      {
        "catalogId": "bicycle:%E0%B8%A3%E0%B8%96%E0%B8%88%E0%B8%B1%E0%B8%81%E0%B8%A3%E0%B8%A2%E0%B8%B2%E0%B8%99",
        "word": "bicycle",
        "meaningTh": "รถจักรยาน",
        "pdfVocabularyRefs": [
          {
            "source": "student-challenge-2569",
            "pdfPage": 3,
            "relationship": "word_occurrence_only"
          }
        ]
      }
    ],
    "evidence": [
      {
        "field": "passage",
        "quote": "He goes to school by bicycle every day.",
        "explanationTh": "by bicycle ระบุวิธีเดินทาง ส่วน every day บอกความถี่"
      }
    ],
    "explanationTh": "คำถาม How does Tom go to school? ต้องการวิธีเดินทาง ซึ่งบทอ่านระบุ by bicycle ไม่ควรเหมาว่า How ทุกประโยคถามการเดินทาง",
    "optionExplanations": [
      {
        "option": "By bus",
        "correct": false,
        "explanationTh": "บทอ่านระบุจักรยาน ไม่ใช่รถโดยสาร"
      },
      {
        "option": "By car",
        "correct": false,
        "explanationTh": "บทอ่านระบุจักรยาน ไม่ใช่รถยนต์"
      },
      {
        "option": "By bicycle",
        "correct": true,
        "explanationTh": "ตรงกับ by bicycle ในประโยคที่สอง"
      },
      {
        "option": "On foot",
        "correct": false,
        "explanationTh": "On foot หมายถึงเดินเท้า ซึ่งไม่ตรงกับบทอ่าน"
      }
    ],
    "remediation": {
      "questId": "reading",
      "activityTh": "เทียบ How ... go? กับ How ... feel? แล้วตอบจากหลักฐานในบทอ่านใหม่",
      "freshItemStatus": "not_authored_or_validated"
    },
    "source": {
      "question": "src/data/questions.js (resolved QUESTS)",
      "learningContent": "new_project_authored_explanations",
      "officialExamClaim": false
    },
    "concerns": [],
    "technicalReview": {
      "status": "checked",
      "reviewer": "Codex",
      "date": "2026-11-12",
      "scope": "binding_evidence_options_vocabulary_identity_not_human_pedagogical_approval"
    },
    "review": {
      "status": "approved",
      "reviewerId": "conversation-user",
      "reviewedAt": "2026-11-12T06:44:08+07:00",
      "fingerprint": "d23fff4da710423e79d30c3f637b624dfa66536b2d90f39f9b4246eebd601ba8",
      "approvalBasis": "explicit_user_approval",
      "approvalText": "อนุมัติ",
      "approvalReference": "codex-chat:01a1ca61-22ad-7d82-9d78-ec8b85e1cd7b"
    }
  }
];
