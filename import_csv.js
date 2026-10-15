import fs from 'fs';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, updateDoc, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDP2YPiWJSFZUXNnfvGp7B5SAT31jbHuZ0",
  authDomain: "o-net69.firebaseapp.com",
  projectId: "o-net69",
  storageBucket: "o-net69.firebasestorage.app",
  messagingSenderId: "833231180737",
  appId: "1:833231180737:web:fbbf7dc8f8600c963e9540",
  measurementId: "G-7WVK3VF1G5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function calcLevel(xp) {
    if (xp < 100) return 1;
    if (xp < 300) return 2;
    if (xp < 600) return 3;
    if (xp < 1000) return 4;
    if (xp < 1500) return 5;
    if (xp < 2100) return 6;
    if (xp < 2800) return 7;
    if (xp < 3600) return 8;
    if (xp < 4500) return 9;
    return 10;
}

function initRankingStats(student) {
  const defaultRanking = {
    totalAnswered: 0,
    totalCorrect: 0,
    fastGuessCount: 0,
    averageTimePerQuestion: 0,
  };
  return { ...student, rankingStats: { ...defaultRanking, ...(student.rankingStats || {}) } };
}

function initBadgeStats(student) {
  const defaultStats = {
    correctBySkill: { vocabulary: 0, signs: 0, directions: 0, conversation: 0, reading: 0, grammar: 0, illness: 0, jobs: 0, food: 0, numbers: 0 },
    mistakesFixed: 0,
    streakDays: 0,
    lastLoginDate: null,
    maxCombo: 0,
    retryCorrectCount: 0,
    failedThenPassed: 0,
    pretestScore: 0,
    posttestScore: 0,
    readingDetailCorrect: 0,
    readingPassagesCompleted: 0,
    grammarBoss: 0,
    bossPassed: 0,
    perfectLevels: 0,
  };
  let updatedStats = { ...defaultStats, ...(student.badgeStats || {}) };
  return { ...student, badgeStats: updatedStats };
}

async function saveStudent(studentData) {
  let current = { ...studentData };
  current = initBadgeStats(current);
  current = initRankingStats(current);
  current.createdAt = new Date().toISOString();
  current.updatedAt = new Date().toISOString();

  const studentsRef = collection(db, 'students');
  const q = query(studentsRef, 
    where("class", "==", studentData.class),
    where("number", "==", studentData.number)
  );
  
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const docSnap = querySnapshot.docs[0];
    const existingData = docSnap.data();
    const correctedLevel = calcLevel(existingData.xp || 0);
    current = { 
      ...existingData, 
      ...studentData, 
      name: existingData.name, // Keep existing name or overwrite? Overwrite is probably better if fixing typos, but we keep existing logic
      level: correctedLevel,
      updatedAt: new Date().toISOString() 
    };
    current = initBadgeStats(current);
    current = initRankingStats(current);
    await updateDoc(docSnap.ref, current);
    console.log("Updated", studentData.name);
  } else {
    const newDocRef = doc(collection(db, 'students'));
    current.id = newDocRef.id;
    await setDoc(newDocRef, current);
    console.log("Created", studentData.name);
  }
}

async function run() {
  const content = fs.readFileSync('รายชื่อ ป.6-2.csv', 'utf8');
  const lines = content.split('\n');
  let count = 0;
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(',');
    if (parts.length >= 4) {
      const number = parts[0];
      const name = parts[1];
      const cls = parts[3];
      await saveStudent({
        name: name,
        class: cls,
        number: number,
        role: 'student'
      });
      count++;
    }
  }
  console.log("Imported", count, "students");
  process.exit(0);
}

run().catch(console.error);
