import { db, ref, set, get, child } from './firebase-config.js';

const quizEl = document.getElementById('quiz');
const submitBtn = document.getElementById('submitBtn');
const resultEl = document.getElementById('result');
const startBtn = document.getElementById('startBtn');
const userInfoEl = document.getElementById('user-info');
const userNameInput = document.getElementById('userName');
const userEmailInput = document.getElementById('userEmail');
const timerEl = document.getElementById('timer');
const rulesEl = document.getElementById('rules');

let questions = [];
let score = 0;
let timeLeft = 600; // 10 minutes in seconds
let timerInterval;
let quizStarted = false;

// Generate unique ID per device
const deviceId = localStorage.getItem('quiz_device') || crypto.randomUUID();
localStorage.setItem('quiz_device', deviceId);

// Check if user already participated
checkParticipation();

// Load questions
fetch('./quiz.json')
  .then(res => res.json())
  .then(data => {
    questions = data;
  })
  .catch(err => {
    console.error('Error loading questions:', err);
    quizEl.innerHTML = '<p>Error loading questions. Please try again later.</p>';
  });

// Start quiz button click handler
startBtn.addEventListener('click', startQuiz);

// Submit button click handler
submitBtn.addEventListener('click', submitQuiz);

async function checkParticipation() {
  try {
    const snapshot = await get(child(ref(db), `responses/${deviceId}`));
    if (snapshot.exists()) {
      disableQuiz();
      showPreviousResults(snapshot.val());
    }
  } catch (error) {
    console.error('Error checking participation:', error);
  }
}

function startQuiz() {
  const userName = userNameInput.value.trim();
  if (!userName) {
    alert('Please enter your name to start the quiz.');
    return;
  }

  quizStarted = true;
  userInfoEl.style.display = 'none';
  rulesEl.style.display = 'none';
  quizEl.style.display = 'block';
  submitBtn.style.display = 'block';
  timerEl.style.display = 'block';

  renderQuiz();
  startTimer();
}

function startTimer() {
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      submitQuiz();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerEl.textContent = `Time left: ${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  if (timeLeft <= 60) {
    timerEl.style.color = 'red';
  }
}

function renderQuiz() {
  quizEl.innerHTML = '';
  questions.forEach((q, i) => {
    const qBox = document.createElement('div');
    qBox.className = 'question-box';
    qBox.innerHTML = `
      <p>${i + 1}. ${q.question}</p>
      ${q.options.map((opt, j) => `
        <label>
          <input type="radio" name="q${i}" value="${j}">
          ${opt}
        </label>
      `).join('')}
    `;
    quizEl.appendChild(qBox);
  });
}

async function submitQuiz() {
  if (!quizStarted) return;
  
  clearInterval(timerInterval);
  
  const answers = [...document.querySelectorAll('input[type=radio]:checked')];
  if (answers.length !== questions.length) {
    if (!confirm('You have not answered all questions. Submit anyway?')) {
      startTimer();
      return;
    }
  }

  const userName = userNameInput.value.trim();
  const userEmail = userEmailInput.value.trim();
  
  let correct = 0;
  const total = questions.length;
  answers.forEach((ans, i) => {
    if (parseInt(ans.value) === questions[i].correct) correct++;
  });

  const wrong = total - correct;
  score = (correct * 1) - (wrong * 0.25);
  const percentage = (score / total) * 100;

  try {
    await set(ref(db, `responses/${deviceId}`), {
      userName,
      userEmail,
      correct,
      wrong,
      score,
      percentage,
      timestamp: Date.now()
    });

    showResults(correct, wrong, score, percentage);
    disableQuiz();
  } catch (error) {
    console.error('Error submitting quiz:', error);
    resultEl.innerHTML = '<p>Error submitting your answers. Please try again.</p>';
    resultEl.style.display = 'block';
  }
}

function showResults(correct, wrong, score, percentage) {
  resultEl.innerHTML = `
    <h3>Quiz Results</h3>
    <p><strong>Name:</strong> ${userNameInput.value.trim()}</p>
    <p><strong>Correct Answers:</strong> ${correct}/${questions.length}</p>
    <p><strong>Wrong Answers:</strong> ${wrong}</p>
    <p><strong>Score:</strong> ${score.toFixed(2)}</p>
    <p><strong>Percentage:</strong> ${percentage.toFixed(2)}%</p>
    <div id="ranking-info">Calculating your rank...</div>
  `;
  resultEl.style.display = 'block';
  
  fetchRankings(score);
}

async function fetchRankings(myScore) {
  try {
    const snapshot = await get(child(ref(db), 'responses'));
    if (!snapshot.exists()) {
      document.getElementById('ranking-info').innerHTML = '<p>No other participants yet.</p>';
      return;
    }

    const results = Object.entries(snapshot.val()).map(([id, data]) => ({
      id,
      ...data
    }));
    
    // Sort by score descending, then by timestamp ascending (earlier submissions rank higher if scores are equal)
    results.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timestamp - b.timestamp;
    });

    const rank = results.findIndex(r => r.id === deviceId) + 1;
    const totalParticipants = results.length;

    // Show top 3 participants
    let leaderboard = '<div class="leaderboard"><h4>Top Participants</h4><ol>';
    const topCount = Math.min(3, totalParticipants);
    
    for (let i = 0; i < topCount; i++) {
      leaderboard += `<li>${results[i].userName} - ${results[i].score.toFixed(2)}</li>`;
    }
    
    leaderboard += '</ol></div>';

    document.getElementById('ranking-info').innerHTML = `
      <p><strong>Your Rank:</strong> ${rank} out of ${totalParticipants}</p>
      ${leaderboard}
    `;
  } catch (error) {
    console.error('Error fetching rankings:', error);
    document.getElementById('ranking-info').innerHTML = '<p>Error loading rankings.</p>';
  }
}

function showPreviousResults(previousData) {
  userInfoEl.style.display = 'none';
  startBtn.style.display = 'none';
  quizEl.style.display = 'none';
  submitBtn.style.display = 'none';
  rulesEl.style.display = 'none';
  
  resultEl.innerHTML = `
    <h3>Your Previous Results</h3>
    <p><strong>Name:</strong> ${previousData.userName || 'Not provided'}</p>
    <p><strong>Correct Answers:</strong> ${previousData.correct}/${questions.length}</p>
    <p><strong>Score:</strong> ${previousData.score.toFixed(2)}</p>
    <p><strong>Percentage:</strong> ${previousData.percentage.toFixed(2)}%</p>
    <div id="ranking-info">Loading current rank...</div>
  `;
  resultEl.style.display = 'block';
  
  fetchRankings(previousData.score);
}

function disableQuiz() {
  const radioInputs = document.querySelectorAll('input[type=radio]');
  radioInputs.forEach(input => {
    input.disabled = true;
  });
  submitBtn.disabled = true;
}
