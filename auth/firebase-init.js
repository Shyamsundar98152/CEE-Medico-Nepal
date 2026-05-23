/**
 * CEE Medico Nepal - Shared Firebase Initialization
 * Centralizes Firebase config for auth, database, and analytics tracking.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  get,
  update,
  push,
  remove,
  onValue,
  query,
  orderByChild,
  equalTo,
  limitToLast,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB66MZa0WZk3WPydcjmCDu7P_CE0FD60ug",
  authDomain: "login-2f07b.firebaseapp.com",
  projectId: "login-2f07b",
  storageBucket: "login-2f07b.appspot.com",
  messagingSenderId: "709252763741",
  appId: "1:709252763741:web:b3902697cc9c8b157a7db4",
  databaseURL: "https://login-2f07b-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const googleProvider = new GoogleAuthProvider();

function getDeviceId() {
  let deviceId = localStorage.getItem("cee_deviceId");
  if (!deviceId) {
    deviceId = "dev_" + crypto.randomUUID();
    localStorage.setItem("cee_deviceId", deviceId);
  }
  return deviceId;
}

function getDeviceOS() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("windows")) return "Windows";
  if (ua.includes("android")) return "Android";
  if (ua.includes("iphone") || ua.includes("ipad")) return "iOS";
  if (ua.includes("mac")) return "Mac";
  if (ua.includes("linux")) return "Linux";
  return "Unknown";
}

export {
  app, auth, db, googleProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  ref, set, get, update, push, remove, onValue,
  query, orderByChild, equalTo, limitToLast,
  serverTimestamp,
  getDeviceId, getDeviceOS
};
