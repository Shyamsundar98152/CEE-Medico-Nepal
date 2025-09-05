// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAvDLQZvlzJVeLaIAgntPiCit65DeeBgYQ",
  authDomain: "cee-medico-nepal-chat.firebaseapp.com",
  databaseURL: "https://cee-medico-nepal-chat-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "cee-medico-nepal-chat",
  storageBucket: "cee-medico-nepal-chat.appspot.com",
  messagingSenderId: "97605756433",
  appId: "1:97605756433:web:0fd8c595f66dfa18f00f3b0"
};

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, push, onChildAdded, set, onChildChanged, onChildRemoved, query, limitToLast, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getStorage, ref as sRef, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
const authContainer = document.getElementById("auth-container");
const chatContainer = document.getElementById("chat-container");
const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-button");
const fileInput = document.getElementById("file-input");
const typingIndicator = document.getElementById("typing-indicator");
const logoutBtn = document.getElementById("logout-button");

let currentUser = null;

// --- Authentication ---
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await set(ref(db, 'users/' + userCredential.user.uid), {
      name: name,
      email: email,
      uid: userCredential.user.uid
    });
    alert("Signup successful! Please log in below.");
    signupForm.reset();
  } catch (err) { alert("Signup failed: " + err.message); }
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  try { await signInWithEmailAndPassword(auth, email, password); }
  catch (err) { alert("Login failed: " + err.message); }
});

logoutBtn.addEventListener("click", async () => { await signOut(auth); });

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    authContainer.style.display = "none";
    chatContainer.style.display = "flex";
    loadChat();
  } else {
    currentUser = null;
    chatContainer.style.display = "none";
    authContainer.style.display = "flex";
    chatBox.innerHTML = "";
  }
});

// --- Chat realtime updates ---
function loadChat() {
  chatBox.innerHTML = "";
  const chatRef = ref(db, 'chat');
  const chatQuery = query(chatRef, limitToLast(50));

  // New messages
  onChildAdded(chatQuery, (snap) => { renderMessage(snap.val(), snap.key); });

  // Message edits
  onChildChanged(chatRef, (snap) => {
    const msgEl = document.getElementById("msg-" + snap.key);
    if (msgEl) msgEl.replaceWith(createMessageElement(snap.val(), snap.key));
  });

  // Message deletes
  onChildRemoved(chatRef, (snap) => {
    const msgEl = document.getElementById("msg-" + snap.key);
    if (msgEl) msgEl.remove();
  });
}

function createMessageElement(msg, msgId) {
  const div = document.createElement("div");
  div.id = "msg-" + msgId;
  div.classList.add("message");
  if (msg.uid === currentUser?.uid) div.classList.add("me"); else div.classList.add("other");

  let content = `<div class="msg-header"><b>${msg.sender || "Unknown"}</b></div><div class="msg-body">`;
  if (msg.text) content += msg.text;
  if (msg.image) content += `<br><img src="${msg.image}" class="chat-img">`;
  content += `</div><div class="msg-time">${new Date(msg.time).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</div>`;

  if (msg.uid === currentUser?.uid) {
    content += `<div class="msg-actions">
                  <button class="edit-btn">Edit</button>
                  <button class="delete-all-btn">Unsend All</button>
                </div>`;
  }

  div.innerHTML = content;
  setupMessageActions(div, msgId, msg);
  return div;
}

function renderMessage(msg, msgId) {
  chatBox.appendChild(createMessageElement(msg, msgId));
  chatBox.scrollTop = chatBox.scrollHeight;
}

function setupMessageActions(messageElement, msgId, msgData) {
  messageElement.querySelector(".edit-btn")?.addEventListener("click", () => {
    const newText = prompt("Edit your message:", msgData.text || "");
    if (newText !== null) {
      set(ref(db, 'chat/' + msgId), {
        ...msgData,
        text: newText.trim(),
        edited: true,
        time: msgData.time
      });
    }
  });

  messageElement.querySelector(".delete-all-btn")?.addEventListener("click", () => {
    if (confirm("Delete for everyone?")) set(ref(db, 'chat/' + msgId), null);
  });
}

// --- Sending messages ---
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => { if (e.key === "Enter") { e.preventDefault(); sendMessage(); } });

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text || !currentUser) return;
  const userProfileRef = ref(db, 'users/' + currentUser.uid);
  get(userProfileRef).then(snapshot => {
    const name = snapshot.val()?.name || currentUser.email;
    push(ref(db, 'chat'), { text, sender: name, uid: currentUser.uid, time: Date.now() });
  });
  messageInput.value = "";
}

// --- Image upload ---
fileInput.addEventListener("change", (e) => {
  if (!currentUser) return alert("Please log in first.");
  const file = e.target.files[0];
  if (!file) return;
  const storageRef = sRef(storage, `chatImages/${currentUser.uid}/${Date.now()}_${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);
  uploadTask.on('state_changed', null, (err) => alert("Upload failed: " + err.message),
    () => getDownloadURL(uploadTask.snapshot.ref).then(url => {
      get(ref(db, 'users/' + currentUser.uid)).then(snapshot => {
        const name = snapshot.val()?.name || currentUser.email;
        push(ref(db, 'chat'), { image: url, sender: name, uid: currentUser.uid, time: Date.now() });
      });
    })
  );
});
