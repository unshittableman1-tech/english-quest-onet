import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, deleteDoc } from "firebase/firestore";

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

async function testWrite() {
  console.log("Testing write access to Firestore...");
  const testDocRef = doc(db, 'students', 'test_rule_write');
  
  try {
    await setDoc(testDocRef, { test: "success", timestamp: new Date().toISOString() });
    console.log("✅ WRITE SUCCESS: The rules have been successfully updated to 'allow write: if true;'.");
    
    // Clean up
    await deleteDoc(testDocRef);
    console.log("Cleanup: Test document deleted.");
  } catch (error) {
    console.error("❌ WRITE FAILED: Permission denied. The rules are not allowing writes yet.");
    console.error("Details:", error.message);
  }
  process.exit(0);
}

testWrite();
