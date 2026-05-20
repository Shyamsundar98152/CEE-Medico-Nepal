// ==================== CeemedicoNepal - Firebase Script ====================

const firebaseConfig = {
  apiKey: "AIzaSyDI-O7KiPzKKAc94UBcy-EusldtOMD_ZbE",
  authDomain: "nepalquiz-7d444.firebaseapp.com",
  databaseURL: "https://nepalquiz-7d444-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "nepalquiz-7d444",
  storageBucket: "nepalquiz-7d444.firebasestorage.app",
  messagingSenderId: "547865008194",
  appId: "1:547865008194:web:2ced7d26f3c4c5ecc275db"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

// Generate Device ID
function getDeviceId() {
  let deviceId = localStorage.getItem('ceemedico_deviceId');
  if (!deviceId) {
    deviceId = 'dev_' + Math.random().toString(36).substring(2) + Date.now();
    localStorage.setItem('ceemedico_deviceId', deviceId);
  }
  return deviceId;
}

// Global Variables
let currentExamKey = null;
let currentQuestions = [];
let userAnswers = {};
let timerInterval = null;

// ====================== COMMON FUNCTIONS ======================

// Check Exam Status
async function checkExamStatus() {
  try {
    const snapshot = await db.ref('exams').once('value');
    const exams = snapshot.val();
    const now = Date.now();

    for (let key in exams) {
      const exam = exams[key];
      if (exam.active && now >= exam.startTime && now <= exam.endTime) {
        currentExamKey = key;
        document.getElementById('examStatus').innerHTML = `
          <h3 style="color:green">✅ Exam is LIVE!</h3>
          <button onclick="startExam('${key}')" class="btn-primary">Start Exam Now</button>`;
        return true;
      }
    }
    document.getElementById('examStatus').innerHTML = `<p style="color:orange">Exam Not Active</p>`;
    return false;
  } catch (e) {
    console.error(e);
    document.getElementById('examStatus').innerHTML = `<p>Error loading exam</p>`;
  }
}

// Load Questions
async function loadQuestions(setId) {
  try {
    const snapshot = await db.ref(`questionSets/${setId}/questions`).once('value');
    currentQuestions = snapshot.val() || [];
    return currentQuestions;
  } catch (e) {
    console.error(e);
    alert("Failed to load questions");
    return [];
  }
}

// Start Exam
async function startExam(examKey) {
  const examSnap = await db.ref(`exams/${examKey}`).once('value');
  const exam = examSnap.val();

  if (!exam) return alert("Exam not found");

  currentExamKey = examKey;
  const questions = await loadQuestions(exam.questionSet);

  if (questions.length === 0) return alert("No questions available");

  // Hide details, show exam screen
  document.querySelector('.exam-details').style.display = 'none';
  document.getElementById('exam-screen').style.display = 'block';

  renderQuestions(questions);
  startTimer(exam.duration || 7200); // default 2 hours
}

// Render Questions
function renderQuestions(questions) {
  const container = document.getElementById('questions-container');
  if (!container) return;

  container.innerHTML = questions.map((q, index) => `
    <div class="question-card">
      <h3>Q${index + 1}: ${q.question}</h3>
      <div class="options">
        ${q.options.map((opt, i) => `
          <label>
            <input type="radio" name="q${index}" value="${i}" 
                   onchange="saveAnswer(${index}, ${i})">
            ${opt}
          </label>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// Save Answer
function saveAnswer(questionIndex, optionIndex) {
  userAnswers[questionIndex] = optionIndex;
  updateAnsweredCount();
}

// Timer
function startTimer(duration) {
  let timeLeft = duration;
  const timerEl = document.getElementById('time-left');

  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    timerEl.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      submitExam(true); // auto submit
    }
    timeLeft--;
  }, 1000);
}

// Update Answered Count
function updateAnsweredCount() {
  const answered = Object.keys(userAnswers).length;
  document.getElementById('answered-count').textContent = `${answered}/${currentQuestions.length}`;
}

// Submit Exam
async function submitExam(isAuto = false) {
  if (!currentExamKey) return;

  if (!isAuto && !confirm("Are you sure you want to submit?")) return;

  clearInterval(timerInterval);

  let score = 0, correct = 0, wrong = 0;

  currentQuestions.forEach((q, index) => {
    const userAns = userAnswers[index];
    if (userAns !== undefined) {
      if (parseInt(userAns) === q.correct) {
        score += 1;
        correct++;
      } else {
        score -= 0.25;
        wrong++;
      }
    }
  });

  const userData = {
    name: document.getElementById('fullName') ? document.getElementById('fullName').value : "Anonymous",
    email: document.getElementById('email') ? document.getElementById('email').value : "guest@email.com"
  };

  const resultData = {
    name: userData.name,
    email: userData.email,
    score: Math.round(score * 100) / 100,
    correct: correct,
    wrong: wrong,
    unattempted: currentQuestions.length - (correct + wrong),
    timestamp: Date.now(),
    deviceId: getDeviceId()
  };

  try {
    await db.ref(`results/${currentExamKey}/${userData.email.replace(/\./g, ',')}`).set(resultData);
    alert("✅ Exam Submitted Successfully!");
    window.location.href = "dashboard.html";
  } catch (e) {
    console.error(e);
    alert("Error submitting exam");
  }
}

// Load Leaderboard
async function loadLeaderboard(examKey) {
  const container = document.getElementById('leaderboard-body');
  if (!container) return;

  const snapshot = await db.ref(`results/${examKey}`).once('value');
  const results = snapshot.val();

  if (!results) {
    container.innerHTML = "<tr><td colspan='4'>No results yet</td></tr>";
    return;
  }

  const sorted = Object.values(results).sort((a, b) => b.score - a.score);

  container.innerHTML = sorted.slice(0, 50).map((res, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${res.name}</td>
      <td>${res.score}</td>
      <td>${res.correct}/${res.correct + res.wrong}</td>
    </tr>
  `).join('');
}

// Admin Functions
async function adminLogin() {
  const username = document.getElementById('adminUsername').value;
  const password = document.getElementById('adminPassword').value;

  if (username === "ceemedicoadmin" && password.length > 5) {
    // You can improve this later with Firebase Auth
    localStorage.setItem('isAdmin', 'true');
    window.location.href = "admin.html";
  } else {
    alert("Invalid Admin Credentials");
  }
}

// Initialize based on page
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;

  if (path.includes('index.html') || path.endsWith('/')) {
    checkExamStatus();
  }

  if (path.includes('dashboard.html')) {
    // Load user's previous results
    loadUserResults();
  }
});

// Bonus: Load User Results (Dashboard)
async function loadUserResults() {
  const email = document.getElementById('lookupEmail') ? document.getElementById('lookupEmail').value : null;
  // Implementation similar to leaderboard
}
