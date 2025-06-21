// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDfCO-xxHPpgSfE-I6KTmsw35Lo9n2v56s",
    authDomain: "live-quiz-6e77b.firebaseapp.com",
    databaseURL: "https://live-quiz-6e77b-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "live-quiz-6e77b",
    storageBucket: "live-quiz-6e77b.firebasestorage.app",
    messagingSenderId: "50057610341",
    appId: "1:50057610341:web:d4e88673a20757d4c9328c"
};

const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

// Quiz state
let quizState = {
    currentQuestion: 0,
    answers: [],
    score: 0,
    timeLeft: 30 * 60, // 30 minutes in seconds
    timerInterval: null,
    userId: null,
    username: '',
    hasSubmitted: false
};

// Questions data - you can modify this as needed
const questions = [
    {
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        answer: 2
    },
    {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        answer: 1
    },
    // Add 18 more questions following the same format
    // ...
    {
        question: "What is the largest mammal?",
        options: ["Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
        answer: 1
    }
];

// Make sure we have exactly 20 questions
if (questions.length !== 20) {
    console.error("Please ensure there are exactly 20 questions");
}

// DOM Elements
const introScreen = document.getElementById('intro-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const answersScreen = document.getElementById('answers-screen');
const startQuizBtn = document.getElementById('start-quiz');
const usernameInput = document.getElementById('username');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const prevQuestionBtn = document.getElementById('prev-question');
const nextQuestionBtn = document.getElementById('next-question');
const currentQuestionDisplay = document.getElementById('current-question');
const quizProgress = document.getElementById('quiz-progress');
const timerDisplay = document.getElementById('timer');
const rankBadge = document.getElementById('rank-badge');
const resultScore = document.getElementById('result-score');
const resultMessage = document.getElementById('result-message');
const leaderboardList = document.getElementById('leaderboard-list');
const viewAnswersBtn = document.getElementById('view-answers');
const backToResultsBtn = document.getElementById('back-to-results');
const answersContainer = document.getElementById('answers-container');

// Event Listeners
startQuizBtn.addEventListener('click', startQuiz);
prevQuestionBtn.addEventListener('click', showPreviousQuestion);
nextQuestionBtn.addEventListener('click', showNextQuestion);
viewAnswersBtn.addEventListener('click', showAnswers);
backToResultsBtn.addEventListener('click', () => {
    answersScreen.classList.add('d-none');
    resultScreen.classList.remove('d-none');
});

// Start the quiz
function startQuiz() {
    const username = usernameInput.value.trim();
    if (!username) {
        alert('Please enter your name');
        return;
    }

    quizState.username = username;
    
    // Authenticate anonymously
    auth.signInAnonymously()
        .then((userCredential) => {
            quizState.userId = userCredential.user.uid;
            checkPreviousAttempt();
        })
        .catch((error) => {
            console.error("Authentication error:", error);
            alert('Error starting quiz. Please try again.');
        });
}

function checkPreviousAttempt() {
    const userRef = database.ref('users/' + quizState.userId);
    
    userRef.once('value')
        .then((snapshot) => {
            if (snapshot.exists() && snapshot.val().hasCompleted) {
                // User has already taken the quiz
                alert('You have already taken this quiz. Only one attempt is allowed.');
            } else {
                // Start the quiz
                initializeQuiz();
            }
        })
        .catch((error) => {
            console.error("Database error:", error);
            alert('Error checking quiz status. Please try again.');
        });
}

function initializeQuiz() {
    // Hide intro screen, show quiz screen
    introScreen.classList.add('d-none');
    quizScreen.classList.remove('d-none');
    
    // Initialize answers array
    quizState.answers = new Array(questions.length).fill(null);
    
    // Start timer
    startTimer();
    
    // Load first question
    showQuestion(0);
}

function startTimer() {
    updateTimerDisplay();
    quizState.timerInterval = setInterval(() => {
        quizState.timeLeft--;
        updateTimerDisplay();
        
        if (quizState.timeLeft <= 0) {
            clearInterval(quizState.timerInterval);
            submitQuiz();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(quizState.timeLeft / 60);
    const seconds = quizState.timeLeft % 60;
    timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function showQuestion(index) {
    if (index < 0 || index >= questions.length) return;
    
    quizState.currentQuestion = index;
    currentQuestionDisplay.textContent = index + 1;
    quizProgress.style.width = `${((index + 1) / questions.length) * 100}%`;
    
    const question = questions[index];
    questionText.textContent = question.question;
    
    // Clear previous options
    optionsContainer.innerHTML = '';
    
    // Add new options
    question.options.forEach((option, i) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        if (quizState.answers[index] === i) {
            optionElement.classList.add('selected');
        }
        optionElement.textContent = option;
        optionElement.dataset.index = i;
        
        optionElement.addEventListener('click', () => selectOption(i));
        
        optionsContainer.appendChild(optionElement);
    });
    
    // Update navigation buttons
    prevQuestionBtn.disabled = index === 0;
    nextQuestionBtn.textContent = index === questions.length - 1 ? 'Submit' : 'Next';
}

function selectOption(optionIndex) {
    const currentQuestion = quizState.currentQuestion;
    
    // Remove selected class from all options
    const options = optionsContainer.querySelectorAll('.option');
    options.forEach(option => option.classList.remove('selected'));
    
    // Add selected class to clicked option
    options[optionIndex].classList.add('selected');
    
    // Save answer
    quizState.answers[currentQuestion] = optionIndex;
}

function showPreviousQuestion() {
    if (quizState.currentQuestion > 0) {
        showQuestion(quizState.currentQuestion - 1);
    }
}

function showNextQuestion() {
    if (quizState.currentQuestion < questions.length - 1) {
        showQuestion(quizState.currentQuestion + 1);
    } else {
        // Last question - submit quiz
        submitQuiz();
    }
}

function submitQuiz() {
    clearInterval(quizState.timerInterval);
    
    // Calculate score
    quizState.score = 0;
    questions.forEach((question, index) => {
        if (quizState.answers[index] === question.answer) {
            quizState.score++;
        }
    });
    
    // Save results to Firebase
    saveResults();
}

function saveResults() {
    const userRef = database.ref('users/' + quizState.userId);
    const resultsRef = database.ref('results');
    
    const userData = {
        username: quizState.username,
        score: quizState.score,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        hasCompleted: true
    };
    
    // Save user data
    userRef.set(userData)
        .then(() => {
            // Save to results list
            return resultsRef.push({
                userId: quizState.userId,
                username: quizState.username,
                score: quizState.score,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });
        })
        .then(() => {
            // Show results
            showResults();
        })
        .catch((error) => {
            console.error("Error saving results:", error);
            // Show results anyway (data might be saved but we didn't get confirmation)
            showResults();
        });
}

function showResults() {
    quizScreen.classList.add('d-none');
    resultScreen.classList.remove('d-none');
    
    // Display score
    resultScore.textContent = `You scored ${quizState.score}/20`;
    
    // Get leaderboard data
    database.ref('results').orderByChild('score').limitToLast(50).once('value')
        .then((snapshot) => {
            const results = [];
            snapshot.forEach((childSnapshot) => {
                results.push(childSnapshot.val());
            });
            
            // Sort by score (descending)
            results.sort((a, b) => b.score - a.score);
            
            // Find user's rank
            const userIndex = results.findIndex(result => result.userId === quizState.userId);
            const rank = userIndex + 1;
            const totalParticipants = results.length;
            
            // Display rank
            let rankText;
            if (rank === 1) rankText = "1st";
            else if (rank === 2) rankText = "2nd";
            else if (rank === 3) rankText = "3rd";
            else rankText = `${rank}th`;
            
            rankBadge.textContent = rankText;
            
            // Display message based on rank
            if (rank === 1) {
                resultMessage.textContent = "Congratulations! You're in first place!";
            } else if (rank <= 3) {
                resultMessage.textContent = `Amazing! You're in the top ${rank}!`;
            } else if (rank <= Math.ceil(totalParticipants * 0.1)) {
                resultMessage.textContent = `Great job! You're in the top 10%!`;
            } else if (rank <= Math.ceil(totalParticipants * 0.25)) {
                resultMessage.textContent = `Good work! You're in the top 25%!`;
            } else if (rank <= Math.ceil(totalParticipants * 0.5)) {
                resultMessage.textContent = `Nice! You scored better than half of participants!`;
            } else {
                resultMessage.textContent = `Keep practicing! You can do better next time!`;
            }
            
            // Display leaderboard (top 10 + user if not in top 10)
            leaderboardList.innerHTML = '';
            
            const displayCount = Math.min(10, results.length);
            let userAdded = false;
            
            for (let i = 0; i < displayCount; i++) {
                addLeaderboardItem(results[i], i + 1);
                if (results[i].userId === quizState.userId) userAdded = true;
            }
            
            // Add user if not in top 10
            if (!userAdded && userIndex >= 10) {
                // Add separator
                const separator = document.createElement('div');
                separator.className = 'leaderboard-item text-center';
                separator.textContent = '...';
                leaderboardList.appendChild(separator);
                
                // Add user
                addLeaderboardItem(results[userIndex], rank);
            }
        });
}

function addLeaderboardItem(result, rank) {
    const item = document.createElement('div');
    item.className = 'leaderboard-item';
    if (result.userId === quizState.userId) {
        item.classList.add('you');
    }
    
    item.innerHTML = `
        <div class="d-flex justify-content-between">
            <div>${rank}. ${result.username}</div>
            <div>${result.score}/20</div>
        </div>
    `;
    
    leaderboardList.appendChild(item);
}

function showAnswers() {
    resultScreen.classList.add('d-none');
    answersScreen.classList.remove('d-none');
    
    answersContainer.innerHTML = '';
    
    questions.forEach((question, index) => {
        const answerItem = document.createElement('div');
        answerItem.className = 'mb-4 p-3 border rounded';
        
        const isCorrect = quizState.answers[index] === question.answer;
        const answerClass = isCorrect ? 'text-success' : 'text-danger';
        
        answerItem.innerHTML = `
            <h5>Question ${index + 1}: ${question.question}</h5>
            <p>Your answer: <span class="${answerClass}">${question.options[quizState.answers[index]] || 'Not answered'}</span></p>
            <p>Correct answer: <span class="text-success">${question.options[question.answer]}</span></p>
        `;
        
        answersContainer.appendChild(answerItem);
    });
}
// Quiz Access Control
const QUIZ_OPEN_TIME = new Date("2025-6-21T20:14:00"); // Change to your desired open time

function checkQuizAvailability() {
    const now = new Date();
    
    if (now < QUIZ_OPEN_TIME) {
        // Quiz is not yet available
        introScreen.innerHTML = `
            <div class="text-center">
                <h2>Quiz Not Available Yet</h2>
                <p>The quiz will open on:</p>
                <h4>${QUIZ_OPEN_TIME.toLocaleString()}</h4>
                <p>Your local time: ${now.toLocaleString()}</p>
                <div id="countdown" class="mt-4"></div>
            </div>
        `;
        
        // Start countdown timer
        updateCountdown();
        setInterval(updateCountdown, 1000);
        
        return false;
    }
    return true;
}

function updateCountdown() {
    const now = new Date();
    const diff = QUIZ_OPEN_TIME - now;
    
    if (diff <= 0) {
        document.getElementById('countdown').innerHTML = `
            <div class="alert alert-success">
                The quiz is now available! <a href="#" onclick="location.reload()">Refresh page</a>
            </div>
        `;
        return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    document.getElementById('countdown').innerHTML = `
        <div class="countdown-timer">
            <div class="countdown-item">
                <span class="countdown-value">${days}</span>
                <span class="countdown-label">Days</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-value">${hours}</span>
                <span class="countdown-label">Hours</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-value">${minutes}</span>
                <span class="countdown-label">Minutes</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-value">${seconds}</span>
                <span class="countdown-label">Seconds</span>
            </div>
        </div>
    `;
}
