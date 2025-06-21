import { database, ref, get, set, serverTimestamp, auth, signInAnonymously } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
  const authContainer = document.getElementById('auth-container');
  const quizForm = document.getElementById('quiz-form');
  const questionsContainer = document.getElementById('questions-container');
  const timerElement = document.getElementById('timer');
  const startQuizBtn = document.getElementById('start-quiz');
  const submitQuizBtn = document.getElementById('submit-quiz');
  const userNameInput = document.getElementById('user-name');
  const userEmailInput = document.getElementById('user-email');
  const questionCountElement = document.querySelector('.question-count');

  let questions = [];
  let userAnswers = {};
  let timer;
  let timeLeft = 5 * 60;
  let userId = null;
  let userName = null;
  let userEmail = null;

  startQuizBtn.addEventListener('click', async () => {
    userName = userNameInput.value.trim();
    userEmail = userEmailInput.value.trim();

    if (!userName || !userEmail) {
      alert("Please enter your name and email to continue.");
      return;
    }

    const userRef = ref(database, 'quizResults/' + encodeURIComponent(userEmail));
    const existing = await get(userRef);

    if (existing.exists()) {
      alert("You have already taken the quiz.");
      return;
    }

    try {
      const credential = await signInAnonymously(auth);
      userId = credential.user.uid;
      authContainer.style.display = 'none';
      quizForm.style.display = 'block';
      startTimer();
      await initQuiz();
    } catch (error) {
      console.error("Auth error:", error);
      alert("Could not start quiz. Please try again.");
    }
  });

  async function initQuiz() {
    try {
      const questionsRef = ref(database, 'medicalQuestions');
      const snapshot = await get(questionsRef);
      if (snapshot.exists()) {
        questions = Object.values(snapshot.val());
        questionCountElement.textContent = `${questions.length} Questions`;
        displayQuestions();
      } else {
        throw new Error("No questions found.");
      }
    } catch (err) {
      console.error("Question loading error:", err);
      alert("Could not load questions.");
    }
  }

  function displayQuestions() {
    questionsContainer.innerHTML = '';
    questions.forEach((q, i) => {
      const el = document.createElement('div');
      el.className = 'question-card';
      el.innerHTML = `
        <div class="question-header">
          <span class="question-number">Q${i + 1}</span>
        </div>
        <div class="question-text">${q.text}</div>
        <div class="options">
          ${q.options.map((opt, j) => `
            <label class="option">
              <input type="radio" name="q${i}" value="${j}"/>
              <span class="option-text">${opt}</span>
            </label>
          `).join('')}
        </div>
      `;
      questionsContainer.appendChild(el);
    });
  }

  quizForm.addEventListener('submit', (e) => {
    e.preventDefault();
    submitQuiz();
  });

  function startTimer() {
    updateTimerDisplay();
    timer = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      if (timeLeft <= 0) {
        clearInterval(timer);
        submitQuiz();
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');
    timerElement.textContent = `${minutes}:${seconds}`;
  }

  async function submitQuiz() {
    clearInterval(timer);
    const formData = new FormData(quizForm);
    questions.forEach((_, i) => {
      const answer = formData.get(`q${i}`);
      userAnswers[i] = answer !== null ? parseInt(answer) : null;
    });

    const score = calculateScore();
    const resultData = {
      userName,
      userEmail,
      userId,
      score,
      totalQuestions: questions.length,
      answers: userAnswers,
      timestamp: serverTimestamp()
    };

    const userResultRef = ref(database, 'quizResults/' + encodeURIComponent(userEmail));
    await set(userResultRef, resultData);

    window.location.href = `result.html?score=${score}&total=${questions.length}&name=${encodeURIComponent(userName)}&email=${encodeURIComponent(userEmail)}`;
  }

  function calculateScore() {
    let correct = 0;
    questions.forEach((q, i) => {
      if (userAnswers[i] === q.correctAnswer) {
        correct++;
      }
    });
    return correct;
  }
});
