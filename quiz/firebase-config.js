import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDfCO-xxHPpgSfE-I6KTmsw35Lo9n2v56s",
  authDomain: "live-quiz-6e77b.firebaseapp.com",
  databaseURL: "https://live-quiz-6e77b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "live-quiz-6e77b",
  storageBucket: "live-quiz-6e77b.firebasestorage.app",
  messagingSenderId: "50057610341",
  appId: "1:50057610341:web:d4e88673a20757d4c9328c"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, set, get, child };
