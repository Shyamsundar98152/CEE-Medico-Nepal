import { db, ref, set, get, child } from './firebase-config.js';

const quizEl = document.getElementById('quiz');
const submitBtn = document.getElementById('submitBtn');
const resultEl = document.getElementById('result');

let questions = [];
let score = 0;

// Generate unique ID per device (simulate)
const deviceId = localStorage.getItem('quiz_device') || crypto.randomUUID();
localStorage.setItem('quiz_device', deviceId);

// Load questions
fetch('./data/quiz.json')
  .then(res => res.json())
  .then(data => {
    questions = data;
    renderQuiz();
  });

function renderQuiz() {
  quizEl.innerHTML = '';
  questions.forEach((q, i) => {
    const qBox = document.createElement('div');
    qBox.innerHTML = `<p>${i + 1}. ${q.question}</p>` +
      q.options.map((opt, j) =>
        `<label><input type="radio" name="q${i}" value="${j}">${opt}</label><br>`
      ).join('');
    quizEl.appendChild(qBox);
  });
}

submitBtn.addEventListener('click', async () => {
  const snapshot = await get(child(ref(db), `responses/${deviceId}`));
  if (snapshot.exists()) {
    alert("You have already participated.");
    return;
  }

  const answers = [...document.querySelectorAll('input[type=radio]:checked')];
  if (answers.length !== questions.length) {
    alert("Please answer all questions.");
    return;
  }

  let correct = 0;
  let total = questions.length;
  answers.forEach((ans, i) => {
    if (parseInt(ans.value) === questions[i].correct) correct++;
  });

  const wrong = total - correct;
  const score = (correct * 1) - (wrong * 0.25);
  const percentage = (score / total) * 100;

  await set(ref(db, `responses/${deviceId}`), {
    correct,
    wrong,
    score,
    percentage,
    timestamp: Date.now()
  });

  resultEl.innerHTML = `
    <h3>Result</h3>
    <p>Correct: ${correct}</p>
    <p>Wrong: ${wrong}</p>
    <p>Score: ${score}</p>
    <p>Percentage: ${percentage.toFixed(2)}%</p>
  `;

  // Fetch and show ranking
  fetchRankings(score);
});

async function fetchRankings(myScore) {
  const snapshot = await get(child(ref(db), 'responses'));
  if (!snapshot.exists()) return;

  const results = Object.values(snapshot.val());
  results.sort((a, b) => b.score - a.score);
  const rank = results.findIndex(r => r.score === myScore) + 1;

  resultEl.innerHTML += `<p>Your Rank: ${rank} / ${results.length}</p>`;
}
