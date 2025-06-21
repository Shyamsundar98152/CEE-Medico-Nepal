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
let currentQuestion = 0;
let userAnswers = [];

// Generate unique ID per device
const deviceId = localStorage.getItem('quiz_device') || crypto.randomUUID();
localStorage.setItem('quiz_device', deviceId);

// Check if user already participated
checkParticipation();

// Load questions
fetch('data/quiz.json')
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

  renderQuestion();
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

function renderQuestion() {
  quizEl.innerHTML = '';
  const q = questions[currentQuestion];
  
  const qBox = document.createElement('div');
  qBox.className = 'quiz-question';
  qBox.innerHTML = `
    <h3>Q${currentQuestion + 1}. ${q.question}</h3>
    ${q.options.map((opt, i) => `
      <div class="quiz-option" onclick="selectOption(${i})">
        <input type="radio" name="q${currentQuestion}" id="opt${i}" value="${i}" style="display:none">
        <label for="opt${i}">${opt}</label>
      </div>
    `).join('')}
    ${q.explanation ? `<div class="quiz-explanation" id="explanation">${q.explanation}</div>` : ''}
  `;
  
  quizEl.appendChild(qBox);
  
  // Navigation buttons
  const navDiv = document.createElement('div');
  navDiv.className = 'quiz-navigation';
  navDiv.innerHTML = `
    <button onclick="prevQuestion()" ${currentQuestion === 0 ? 'disabled' : ''}>Previous</button>
    <button onclick="nextQuestion()" ${currentQuestion === questions.length - 1 ? 'disabled' : ''}>Next</button>
    <button onclick="submitQuiz()">Submit</button>
  `;
  quizEl.appendChild(navDiv);
  
  // Highlight previously selected answer if exists
  if (userAnswers[currentQuestion] !== undefined) {
    selectOption(userAnswers[currentQuestion], true);
  }
}

function selectOption(index, noScoreUpdate = false) {
  const options = document.querySelectorAll('.quiz-option');
  const correctIndex = questions[currentQuestion].correct;
  
  options.forEach((el, i) => {
    el.classList.remove('correct', 'incorrect');
    if (i === index) {
      if (i === correctIndex) {
        el.classList.add('correct');
        if (!noScoreUpdate && userAnswers[currentQuestion] === undefined) {
          score++;
        }
      } else {
        el.classList.add('incorrect');
        options[correctIndex].classList.add('correct');
      }
    }
  });
  
  const explanationEl = document.getElementById('explanation');
  if (explanationEl) {
    explanationEl.style.display = 'block';
  }
  
  userAnswers[currentQuestion] = index;
}

function nextQuestion() {
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    renderQuestion();
  }
}

function prevQuestion() {
  if (currentQuestion > 0) {
    currentQuestion--;
    renderQuestion();
  }
}

async function submitQuiz() {
  if (!quizStarted) return;
  
  clearInterval(timerInterval);
  
  const unanswered = questions.length - Object.keys(userAnswers).length;
  if (unanswered > 0) {
    if (!confirm(`You have ${unanswered} unanswered questions. Submit anyway?`)) {
      startTimer();
      return;
    }
  }

  const userName = userNameInput.value.trim();
  const userEmail = userEmailInput.value.trim();
  
  let correct = 0;
  questions.forEach((q, i) => {
    if (userAnswers[i] === q.correct) correct++;
  });

  const wrong = questions.length - correct;
  score = (correct * 1) - (wrong * 0.25);
  const percentage = (score / questions.length) * 100;

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
  quizEl.style.display = 'none';
  document.querySelector('.quiz-navigation').style.display = 'none';
  
  resultEl.innerHTML = `
    <div class="quiz-results">
      <h2>Quiz Completed!</h2>
      <p><strong>Name:</strong> ${userNameInput.value.trim()}</p>
      <p><strong>Correct Answers:</strong> ${correct}/${questions.length}</p>
      <p><strong>Wrong Answers:</strong> ${wrong}</p>
      <p><strong>Score:</strong> ${score.toFixed(2)}</p>
      <p><strong>Percentage:</strong> ${percentage.toFixed(2)}%</p>
      <div id="ranking-info">Calculating your rank...</div>
      <button onclick="restartQuiz()">Retake Quiz</button>
    </div>
  `;
  resultEl.style.display = 'block';
  
  fetchRankings(score);
}

function restartQuiz() {
  currentQuestion = 0;
  score = 0;
  userAnswers = [];
  timeLeft = 600;
  quizEl.style.display = 'block';
  resultEl.style.display = 'none';
  renderQuestion();
  startTimer();
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
    
    results.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timestamp - b.timestamp;
    });

    const rank = results.findIndex(r => r.id === deviceId) + 1;
    const totalParticipants = results.length;

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
    <div class="quiz-results">
      <h2>Your Previous Results</h2>
      <p><strong>Name:</strong> ${previousData.userName || 'Not provided'}</p>
      <p><strong>Correct Answers:</strong> ${previousData.correct}/${questions.length}</p>
      <p><strong>Score:</strong> ${previousData.score.toFixed(2)}</p>
      <p><strong>Percentage:</strong> ${previousData.percentage.toFixed(2)}%</p>
      <div id="ranking-info">Loading current rank...</div>
    </div>
  `;
  resultEl.style.display = 'block';
  
  fetchRankings(previousData.score);
}

function disableQuiz() {
  const options = document.querySelectorAll('.quiz-option');
  options.forEach(option => {
    option.onclick = null;
  });
  submitBtn.disabled = true;
}

// Make functions available globally for HTML onclick attributes
window.prevQuestion = prevQuestion;
window.nextQuestion = nextQuestion;
window.selectOption = selectOption;
window.submitQuiz = submitQuiz;
window.restartQuiz = restartQuiz;
