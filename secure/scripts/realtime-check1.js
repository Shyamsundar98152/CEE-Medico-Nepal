import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyB66MZa0WZk3WPydcjmCDu7P_CE0FD60ug",
  authDomain: "login-2f07b.firebaseapp.com",
  databaseURL: "https://login-2f07b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "login-2f07b",
  storageBucket: "login-2f07b.appspot.com",
  messagingSenderId: "709252763741",
  appId: "1:709252763741:web:b3902697cc9c8b157a7db4"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const userRef = ref(db, "users/" + user.uid);
      const snapshot = await get(userRef);
      if (snapshot.exists() && snapshot.val().isApproved === true) {
        document.body.style.display = "block"; // ✅ Show content
      } else {
        alert("⛔ Not approved or no data.");
        await signOut(auth);
        window.location.href = "/login.html";
      }
    } catch (e) {
      console.error("Firebase error:", e);
      await signOut(auth);
      window.location.href = "/login.html";
    }
  } else {
    window.location.href = "/login.html";
  }
});
