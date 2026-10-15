import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDP2YPiWJSFZUXNnfvGp7B5SAT31jbHuZ0",
  authDomain: "o-net69.firebaseapp.com",
  projectId: "o-net69",
  storageBucket: "o-net69.firebasestorage.app",
  messagingSenderId: "833231180737",
  appId: "1:833231180737:web:fbbf7dc8f8600c963e9540"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkClasses() {
  console.log("Fetching data from Firestore...");
  const studentsRef = collection(db, 'students');
  const snapshot = await getDocs(studentsRef);
  
  const classCounts = {};
  let total = 0;

  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.role !== 'teacher' && !data.isDemo) {
      const cls = data.class || 'NO_CLASS';
      classCounts[cls] = (classCounts[cls] || 0) + 1;
      total++;
    }
  });
  
  console.log("=== Class Summary ===");
  for (const [cls, count] of Object.entries(classCounts)) {
    console.log(`Class: "${cls}" -> ${count} students`);
  }
  console.log(`Total active students: ${total}`);
  process.exit(0);
}

checkClasses().catch(console.error);
