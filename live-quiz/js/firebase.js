import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, get, push, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDfCO-xxHPpgSfE-I6KTmsw35Lo9n2v56s",
  authDomain: "live-quiz-6e77b.firebaseapp.com",
  databaseURL: "https://live-quiz-6e77b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "live-quiz-6e77b",
  storageBucket: "live-quiz-6e77b.firebasestorage.app",
  messagingSenderId: "50057610341",
  appId: "1:50057610341:web:d4e88673a20757d4c9328c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// Export Firebase services
export { database, ref, get, push, serverTimestamp, auth, signInAnonymously };
