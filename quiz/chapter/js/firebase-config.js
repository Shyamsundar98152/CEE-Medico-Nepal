// =============================================
// CEE Medico Nepal — Firebase Configuration
// =============================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDD5xBrSkX_YXzSnsKxjW8-K6W4rBfV3rg",
  authDomain: "chapter-wise-backup.firebaseapp.com",
  projectId: "chapter-wise-backup",
  storageBucket: "chapter-wise-backup.firebasestorage.app",
  messagingSenderId: "864698641587",
  appId: "1:864698641587:web:d0b550579c6eb7709ed4c6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
