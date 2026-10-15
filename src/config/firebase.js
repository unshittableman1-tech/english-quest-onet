import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDP2YPiWJSFZUXNnfvGp7B5SAT31jbHuZ0",
  authDomain: "o-net69.firebaseapp.com",
  projectId: "o-net69",
  storageBucket: "o-net69.firebasestorage.app",
  messagingSenderId: "833231180737",
  appId: "1:833231180737:web:fbbf7dc8f8600c963e9540",
  measurementId: "G-7WVK3VF1G5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Enable offline persistence (new API — replaces deprecated enableIndexedDbPersistence)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

