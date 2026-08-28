// security.js (Production Ready - Dynamic Course & Session Protection)

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getDatabase, ref, get, update, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

// =======================
// 1. Firebase Configuration
// =======================
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

// Course Target URL Mapping
const COURSE_TARGET_MAP = {
  cee: "/secure/protected.html",
  ioe: "/ioe-premium.html",
  nmcle: "https://ceemediconepal.xyz/mbbs/nmcle/index.html"
};

// =======================
// 2. Toast UI System
// =======================
function showToast(message, isError = false) {
  let toast = document.getElementById("toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);

    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.right = "20px";
    toast.style.padding = "12px 18px";
    toast.style.borderRadius = "8px";
    toast.style.color = "#fff";
    toast.style.fontSize = "14px";
    toast.style.zIndex = "9999";
    toast.style.display = "none";
  }

  toast.style.background = isError ? "#e74c3c" : "#2ecc71";
  toast.innerText = message;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 2500);
}

// =======================
// 3. Device Identification
// =======================
function getDeviceId() {
  let deviceId = localStorage.getItem("uniqueDeviceId");

  if (!deviceId) {
    deviceId = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });

    localStorage.setItem("uniqueDeviceId", deviceId);
  }

  return deviceId;
}

// =======================
// 4. Auth Guard & Page Shield
// =======================
// Hide page content until authentication & approval are verified
document.body.style.display = "none";

onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      // Verify user approval and expiration from Realtime DB
      const userRef = ref(db, `users/${user.uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        
        // Check approval status
        if (userData.isApproved !== true) {
          await signOut(auth);
          window.location.href = "/secure/login.html?status=unapproved";
          return;
        }

        // Check expiration if set
        if (userData.expiryDate && userData.expiryDate < Date.now()) {
          await signOut(auth);
          window.location.href = "/secure/login.html?status=expired";
          return;
        }

        // Auth verified -> display page
        document.body.style.display = "block";
      } else {
        await signOut(auth);
        window.location.href = "/secure/login.html";
      }
    } catch (error) {
      console.error("Auth Guard error:", error);
      window.location.href = "/secure/login.html";
    }
  } else {
    window.location.href = "/secure/login.html";
  }
});

// =======================
// 5. Logout Handler
// =======================
async function handleLogout() {
  const user = auth.currentUser;

  if (!user) {
    window.location.href = "/secure/login.html";
    return;
  }

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
    showToast("Logged out successfully 👋");
    window.location.href = "/secure/login.html";

  } catch (error) {
    console.error("Logout Error:", error);
    showToast("Logout failed ❌", true);
  }
}

// Bind Logout buttons automatically if present
document.addEventListener("DOMContentLoaded", () => {
  const logoutButtons = ["logoutBtn", "logoutBtnDesktop", "logoutBtnMobile"];
  logoutButtons.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener("click", handleLogout);
  });
});
