// one-device.js
import {
  getDatabase,
  ref,
  get,
  set
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";
import {
  getAuth,
  signOut
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

const db = getDatabase();
const auth = getAuth();

// Generate or retrieve a unique device ID
export function getDeviceId() {
  let id = localStorage.getItem("deviceId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("deviceId", id);
  }
  return id;
}

// Save device ID in Firebase and check for session mismatch
export async function enforceSingleDeviceLogin(user) {
  const thisDeviceId = getDeviceId();
  const sessionRef = ref(db, "sessions/" + user.uid);
  const snapshot = await get(sessionRef);

  if (snapshot.exists()) {
    const activeDeviceId = snapshot.val();
    if (activeDeviceId !== thisDeviceId) {
      alert("🚫 You were logged out because your account was used on another device.");
      await signOut(auth);
      location.reload();
      return false;
    }
  }

  // Save this device as active session
  await set(sessionRef, thisDeviceId);
  return true;
}

// Logout if the device ID doesn't match the current session
export async function validateSessionOrLogout(user) {
  const thisDeviceId = getDeviceId();
  const sessionRef = ref(db, "sessions/" + user.uid);
  const snapshot = await get(sessionRef);

  if (snapshot.exists() && snapshot.val() !== thisDeviceId) {
    alert("⚠️ Session expired: Logged in from another device.");
    await signOut(auth);
    window.location.href = "login.html";
    return false;
  }

  return true;
}
