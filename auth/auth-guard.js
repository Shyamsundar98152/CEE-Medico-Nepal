/**
 * CEE Medico Nepal - Auth Guard
 * Protects pages requiring authentication.
 * Include this module on any page that needs auth.
 */

import { auth, db, ref, get, onAuthStateChanged } from "./firebase-init.js";

function requireAuth(options = {}) {
  const { requireAdmin = false, redirectTo = "/auth/login.html" } = options;

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = redirectTo;
      return;
    }

    if (requireAdmin) {
      const snap = await get(ref(db, `users/${user.uid}`));
      if (!snap.exists() || snap.val().role !== "admin") {
        alert("Access denied. Admin privileges required.");
        window.location.href = "/user-dashboard/index.html";
        return;
      }
    }

    if (typeof window.onUserReady === "function") {
      const snap = await get(ref(db, `users/${user.uid}`));
      const userData = snap.exists() ? snap.val() : {};
      window.onUserReady(user, userData);
    }
  });
}

function getCurrentUser() {
  return auth.currentUser;
}

async function getUserData(uid) {
  const snap = await get(ref(db, `users/${uid}`));
  return snap.exists() ? snap.val() : null;
}

export { requireAuth, getCurrentUser, getUserData };
