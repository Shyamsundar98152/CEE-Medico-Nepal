import { database, ref, get, push, serverTimestamp, auth, signInAnonymously } from './firebase.js';

// DOM Elements
const quizIntro = document.getElementById('quiz-intro');
const quizQuestions = document.getElementById('quiz-questions');
const authForm = document.getElementById('auth-form');
const questionsContainer = document.getElementById('questions-container');
const timerElement = document.getElementById('timer');
const startQuizBtn = document.getElementById('start-quiz');
const quizForm = document.getElementById('quiz-form');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const progressBar = document.getElementById('progress-bar');
const questionCountElement = document.getElementById('question-count');
const userNameInput = document.getElementById('user-name');
const userEmailInput = document.getElementById('user-email');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const headerNav = document.querySelector('.header-nav');

// Quiz variables
let questions = [];
let userAnswers = {};
let currentQuestionIndex = 0;
let timer;
let timeLeft = 5 * 60; // 5 minutes in seconds
let userId = null;
let userName = null;

// Initialize quiz
document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    mobileMenuBtn.addEventListener('click', () => {
        headerNav.classList.toggle('active');
    });

    // Start quiz button
    startQuizBtn.addEventListener('click', startQuiz);
    
    // Navigation buttons
    prevBtn.addEventListener('click', showPreviousQuestion);
    nextBtn.addEventListener('click', showNextQuestion);
    
    // Form submission
    quizForm.addEventListener('submit', submitQuiz);
});

// Start quiz function
async function startQuiz() {
    userName = userNameInput.value.trim();
    const userEmail = userEmailInput.value.trim();
    
    if (!userName) {
        showError("Please enter your name to continue");
        return;
    }
    
    try {
        // Authenticate user
        if (userEmail) {
            if (!validateEmail(userEmail)) {
                showError("Please enter a valid email address");
                return;
            }
            userId = userEmail;
        } else {
            const userCredential = await signInAnonymously(auth);
            userId = userCredential.user.uid;
        }
        
        // Load questions
        await loadQuestions();
        
        // Show quiz questions
        quizIntro.style.display = 'none';
        quizQuestions.style.display = 'block';
        
        // Start timer
        startTimer();
        
        // Show first question
        showQuestion(currentQuestionIndex);
    } catch (error) {
        console.error("Error starting quiz:", error);
        showError("Error starting quiz. Please try again.");
    }
}

// Load questions from Firebase
async function loadQuestions() {
    try {
        const questionsRef = ref(database, 'medicalQuestions');
        const snapshot = await get(questionsRef);
        
        if (snapshot.exists()) {
            questions = snapshot.val();
            questionCountElement.textContent = questions.length;
        } else {
            throw new Error("No questions found in database");
        }
    } catch (error) {
        console.error("Error loading questions:", error);
        throw error;
    }
}

// Display question
function showQuestion(index) {
    if (index < 0 || index >= questions.length) return;
    
    currentQuestionIndex = index;
    questionsContainer.innerHTML = '';
    
    const question = questions[index];
    const questionElement = document.createElement('div');
    questionElement.className = 'question-card';
    questionElement.innerHTML = `
        <div class="question-text">${index + 1}. ${question.text}</div>
        <div class="options">
            ${question.options.map((option, i) => `
                <label class="option">
                    <input type="radio" name="q${index}" value="${i}" 
                        ${userAnswers[index] === i ? 'checked' : ''}>
                    <span class="option-text">${option}</span>
                </label>
            `).join('')}
        </div>
    `;
    questionsContainer.appendChild(questionElement);
    
    // Update progress bar
    updateProgressBar();
    
    // Update navigation buttons
    prevBtn.disabled = index === 0;
    nextBtn.style.display = index === questions.length - 1 ? 'none' : 'block';
    submitBtn.style.display = index === questions.length - 1 ? 'block' : 'none';
}

// Update progress bar
function updateProgressBar() {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressBar.style.setProperty('--progress', `${progress}%`);
}

// Navigation functions
function showNextQuestion() {
    saveCurrentAnswer();
    showQuestion(currentQuestionIndex + 1);
}

function showPreviousQuestion() {
    saveCurrentAnswer();
    showQuestion(currentQuestionIndex - 1);
}

// Save current answer
function saveCurrentAnswer() {
    const selectedOption = document.querySelector(`input[name="q${currentQuestionIndex}"]:checked`);
    if (selectedOption) {
        userAnswers[currentQuestionIndex] = parseInt(selectedOption.value);
    }
}

// Timer function
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
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerElement.querySelector('span').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Change color when time is running low
    if (timeLeft <= 60) {
        timerElement.style.color = 'var(--accent)';
    }
}

// Submit quiz
async function submitQuiz(e) {
    if (e) e.preventDefault();
    
    clearInterval(timer);
    saveCurrentAnswer();
    
    // Calculate score
    const score = calculateScore();
    
    // Save results to Firebase
    await saveResults(score);
    
    // Redirect to results page
    window.location.href = `result.html?score=${score}&total=${questions.length}&name=${encodeURIComponent(userName)}`;
}

function calculateScore() {
    let correct = 0;
    questions.forEach((question, index) => {
        if (userAnswers[index] === question.correctAnswer) {
            correct++;
        }
    });
    return correct;
}

async function saveResults(score) {
    const resultData = {
        userName: userName,
        userEmail: userEmailInput.value.trim() || null,
        userId: userId,
        score: score,
        totalQuestions: questions.length,
        answers: userAnswers,
        timestamp: serverTimestamp()
    };
    
    try {
        const resultsRef = ref(database, 'quizResults');
        await push(resultsRef, resultData);
    } catch (error) {
        console.error("Error saving results:", error);
    }
}

// Helper functions
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    authForm.insertBefore(errorElement, authForm.firstChild);
    
    setTimeout(() => {
        errorElement.style.opacity = '1';
    }, 10);
}

// CSS variable for progress bar
document.documentElement.style.setProperty('--progress', '0%');
