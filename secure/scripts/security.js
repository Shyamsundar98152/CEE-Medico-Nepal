// security.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getDatabase, ref, update, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

// 1. Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB66MZa0WZk3WPydcjmCDu7P_CE0FD60ug",
  authDomain: "login-2f07b.firebaseapp.com",
  projectId: "login-2f07b",
  storageBucket: "login-2f07b.firebasestorage.app",
  messagingSenderId: "709252763741",
  appId: "1:709252763741:web:b3902697cc9c8b157a7db4",
  databaseURL: "https://login-2f07b-default-rtdb.asia-southeast1.firebasedatabase.app",
  measurementId: "G-G7ZY1MJ106"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// 2. Get or generate persistent device ID
function getDeviceId() {
  let deviceId = localStorage.getItem('uniqueDeviceId');
  if (!deviceId) {
    deviceId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    localStorage.setItem('uniqueDeviceId', deviceId);
  }
  return deviceId;
}

// 3. Auth check to protect page
onAuthStateChanged(auth, user => {
  if (user) {
    document.body.style.display = "block";
  } else {
    window.location.href = "/secure/login.html";
  }
});

// 4. Optional logout handler
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (user) {
      const deviceId = getDeviceId();
      const userAgent = navigator.userAgent;

      try {
        const deviceRef = ref(db, `userDevices/${user.uid}/${deviceId}`);
        await update(deviceRef, {
          userAgent: userAgent,
          lastLogout: serverTimestamp(),
          isOnline: false
        });

        await signOut(auth);
        alert("👋 Logged out successfully.");
        window.location.href = "/secure/login.html";
      } catch (error) {
        alert("❌ Logout failed: " + error.message);
      }
    }
  });
}
