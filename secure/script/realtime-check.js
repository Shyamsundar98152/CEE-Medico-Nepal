import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  child
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB66MZa0WZk3WPydcjmCDu7P_CE0FD60ug",
  authDomain: "login-2f07b.firebaseapp.com",
  projectId: "login-2f07b",
  storageBucket: "login-2f07b.appspot.com",
  messagingSenderId: "709252763741",
  appId: "1:709252763741:web:b3902697cc9c8b157a7db4",
  databaseURL: "https://login-2f07b-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Check approval status
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userRef = ref(db, "users/" + user.uid);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      if (data.isApproved === true) {
        // ✅ Approved user
        window.location.href = "/secure/protected.html";
      } else {
        alert("⛔ Not approved yet by admin!");
        await signOut(auth);
        window.location.href = "/login.html";
      }
    } else {
      // 🆕 New user — add to DB
      await set(userRef, {
        email: user.email,
        isApproved: false
      });
      alert("📝 Signup success. Awaiting admin approval.");
      await signOut(auth);
      window.location.href = "/login.html";
    }
  }
});
