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
    email: '',
    hasSubmitted: false,
    correctCount: 0,
    wrongCount: 0,
    unansweredCount: 0
};

// Questions data
const questions = [
    {
        "question": "31. The critical angle for a medium is the angle of incidence for which the angle of refraction is:",
        "options": ["A) 0°", "B) 45°", "C) 90°", "D) 180°"],
        "correct": 2,
        "explanation": "Critical angle is defined where the angle of refraction is 90°."
    },
    {
        "question": "32. The primary function of a capacitor is to:",
        "options": ["A) Store current", "B) Store charge", "C) Store magnetic field", "D) Increase resistance"],
        "correct": 1,
        "explanation": "Capacitors store electric charge and energy in the electric field."
    },
    {
        "question": "33. Which of the following is NOT a property of sound waves?",
        "options": ["A) Diffraction", "B) Polarization", "C) Reflection", "D) Refraction"],
        "correct": 1,
        "explanation": "Sound waves cannot be polarized because they are longitudinal waves."
    },
    // Add 17 more questions following the same format
    {
        "question": "34. The SI unit of radioactivity is:",
        "options": ["A) Gray", "B) Sievert", "C) Becquerel", "D) Curie"],
        "correct": 2,
        "explanation": "The becquerel (Bq) is the SI unit of radioactivity."
    },
    // ... (add more questions to reach 20 total)
    {
        "question": "50. The SI unit of absorbed dose is:",
        "options": ["A) Gray", "B) Sievert", "C) Becquerel", "D) Curie"],
        "correct": 0,
        "explanation": "The gray (Gy) is the SI unit of absorbed dose."
    }
];

// Ensure we have exactly 20 questions
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
const emailInput = document.getElementById('email');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const prevQuestionBtn = document.getElementById('prev-question');
const nextQuestionBtn = document.getElementById('next-question');
const currentQuestionDisplay = document.getElementById('current-question');
const quizProgress = document.getElementById('quiz-progress');
const timerDisplay = document.getElementById('timer-display');
const currentScoreDisplay = document.getElementById('current-score');
const rankBadge = document.getElementById('rank-badge');
const resultScore = document.getElementById('result-score');
const resultMessage = document.getElementById('result-message');
const leaderboardList = document.getElementById('leaderboard-list');
const viewAnswersBtn = document.getElementById('view-answers');
const backToResultsBtn = document.getElementById('back-to-results');
const answersContainer = document.getElementById('answers-container');
const statsContainer = document.getElementById('stats-container');
const explanationText = document.getElementById('explanation-text');

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
    quizState.email = emailInput.value.trim();
    
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
                alert('You have already taken this test. Only one attempt is allowed.');
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
    quizState.correctCount = 0;
    quizState.wrongCount = 0;
    quizState.unansweredCount = questions.length;
    
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
    timerDisplay.textContent = `Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function showQuestion(index) {
    if (index < 0 || index >= questions.length) return;
    
    quizState.currentQuestion = index;
    currentQuestionDisplay.textContent = index + 1;
    quizProgress.style.width = `${((index + 1) / questions.length) * 100}%`;
    
    const question = questions[index];
    questionText.textContent = question.question;
    
    // Clear previous options and explanation
    optionsContainer.innerHTML = '';
    explanationText.style.display = 'none';
    explanationText.textContent = '';
    
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
    
    // Update current score display
    updateScoreDisplay();
}

function selectOption(optionIndex) {
    const currentQuestion = quizState.currentQuestion;
    const previousAnswer = quizState.answers[currentQuestion];
    
    // Remove selected class from all options
    const options = optionsContainer.querySelectorAll('.option');
    options.forEach(option => option.classList.remove('selected'));
    
    // Add selected class to clicked option
    options[optionIndex].classList.add('selected');
    
    // Update counts
    if (previousAnswer === null) {
        quizState.unansweredCount--;
    }
    
    // Save answer
    quizState.answers[currentQuestion] = optionIndex;
    
    // Update score
    updateScoreDisplay();
}

function updateScoreDisplay() {
    // Calculate current score with negative marking
    let tempScore = 0;
    let tempCorrect = 0;
    let tempWrong = 0;
    let tempUnanswered = 0;
    
    questions.forEach((question, index) => {
        if (quizState.answers[index] === null) {
            tempUnanswered++;
        } else if (quizState.answers[index] === question.correct) {
            tempCorrect++;
            tempScore += 1;
        } else {
            tempWrong++;
            tempScore -= 0.25;
        }
    });
    
    // Ensure score doesn't go below zero
    tempScore = Math.max(0, tempScore);
    
    currentScoreDisplay.textContent = tempScore.toFixed(2);
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
    
    // Calculate final score with negative marking
    quizState.score = 0;
    quizState.correctCount = 0;
    quizState.wrongCount = 0;
    quizState.unansweredCount = 0;
    
    questions.forEach((question, index) => {
        if (quizState.answers[index] === null) {
            quizState.unansweredCount++;
        } else if (quizState.answers[index] === question.correct) {
            quizState.correctCount++;
            quizState.score += 1;
        } else {
            quizState.wrongCount++;
            quizState.score -= 0.25;
        }
    });
    
    // Ensure score doesn't go below zero
    quizState.score = Math.max(0, quizState.score);
    
    // Save results to Firebase
    saveResults();
}

function saveResults() {
    const userRef = database.ref('users/' + quizState.userId);
    const resultsRef = database.ref('results');
    
    const userData = {
        username: quizState.username,
        email: quizState.email,
        score: quizState.score,
        correct: quizState.correctCount,
        wrong: quizState.wrongCount,
        unanswered: quizState.unansweredCount,
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
                correct: quizState.correctCount,
                wrong: quizState.wrongCount,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });
        })
        .then(() => {
            // Show results
            showResults();
        })
        .catch((error) => {
            console.error("Error saving results:", error);
            // Show results anyway
            showResults();
        });
}

function showResults() {
    quizScreen.classList.add('d-none');
    resultScreen.classList.remove('d-none');
    
    // Display score
    resultScore.textContent = `Your Score: ${quizState.score.toFixed(2)}`;
    
    // Display statistics
    statsContainer.innerHTML = `
        <p><strong>Correct Answers:</strong> ${quizState.correctCount}</p>
        <p><strong>Wrong Answers:</strong> ${quizState.wrongCount}</p>
        <p><strong>Unanswered:</strong> ${quizState.unansweredCount}</p>
        <div class="progress mt-3">
            <div class="progress-bar bg-success" style="width: ${(quizState.correctCount/questions.length)*100}%">${quizState.correctCount}</div>
            <div class="progress-bar bg-danger" style="width: ${(quizState.wrongCount/questions.length)*100}%">${quizState.wrongCount}</div>
            <div class="progress-bar bg-secondary" style="width: ${(quizState.unansweredCount/questions.length)*100}%">${quizState.unansweredCount}</div>
        </div>
    `;
    
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
            
            // Calculate percentage
            const percentage = ((totalParticipants - rank) / totalParticipants * 100).toFixed(1);
            
            // Display message based on rank
            if (rank === 1) {
                resultMessage.innerHTML = `<strong>Performance:</strong> Congratulations! You're ranked #1!`;
            } else if (rank <= 3) {
                resultMessage.innerHTML = `<strong>Performance:</strong> Excellent! You're in the top 3!`;
            } else if (rank <= Math.ceil(totalParticipants * 0.1)) {
                resultMessage.innerHTML = `<strong>Performance:</strong> Great job! You scored better than ${percentage}% of participants!`;
            } else if (rank <= Math.ceil(totalParticipants * 0.25)) {
                resultMessage.innerHTML = `<strong>Performance:</strong> Good work! You scored better than ${percentage}% of participants!`;
            } else if (rank <= Math.ceil(totalParticipants * 0.5)) {
                resultMessage.innerHTML = `<strong>Performance:</strong> Nice! You scored better than ${percentage}% of participants!`;
            } else {
                resultMessage.innerHTML = `<strong>Performance:</strong> Keep practicing! You scored better than ${percentage}% of participants!`;
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
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <strong>${rank}.</strong> ${result.username}
                ${result.userId === quizState.userId ? '<span class="badge bg-primary ms-2">You</span>' : ''}
            </div>
            <div>
                <span class="text-success">${result.correct}</span> | 
                <span class="text-danger">${result.wrong}</span> | 
                <strong>${result.score.toFixed(2)}</strong>
            </div>
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
        
        const userAnswer = quizState.answers[index];
        const isCorrect = userAnswer === question.correct;
        const answerClass = isCorrect ? 'text-success' : 'text-danger';
        let answerStatus = '';
        
        if (userAnswer === null) {
            answerStatus = '<span class="text-secondary">Not answered</span>';
        } else if (isCorrect) {
            answerStatus = '<span class="text-success">Correct (+1)</span>';
        } else {
            answerStatus = '<span class="text-danger">Incorrect (-0.25)</span>';
        }
        
        answerItem.innerHTML = `
            <h5>Question ${index + 1}: ${question.question}</h5>
            <p>Your answer: ${userAnswer !== null ? question.options[userAnswer] : 'Not answered'} 
            <strong>${answerStatus}</strong></p>
            <p>Correct answer: <span class="text-success">${question.options[question.correct]}</span></p>
            <div class="explanation alert alert-light mt-2">
                <strong>Explanation:</strong> ${question.explanation}
            </div>
            <hr>
        `;
        
        answersContainer.appendChild(answerItem);
    });
}
