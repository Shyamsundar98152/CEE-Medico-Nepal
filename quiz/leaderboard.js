import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDfCO-xxHPpgSfE-I6KTmsw35Lo9n2v56s",
    authDomain: "live-quiz-6e77b.firebaseapp.com",
    databaseURL: "https://live-quiz-6e77b-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "live-quiz-6e77b",
    storageBucket: "live-quiz-6e77b.appspot.com",
    messagingSenderId: "50057610341",
    appId: "1:50057610341:web:d4e88673a20757d4c9328c"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const scoresList = document.getElementById('scores');
const searchInput = document.getElementById('search');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const pageInfo = document.getElementById('page-info');

let scores = [];
let currentPage = 1;
const itemsPerPage = 10;

function renderPage(page = 1) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageScores = scores.slice(start, end);

    scoresList.innerHTML = pageScores.map((entry, index) => {
        const rank = start + index + 1;
        const percentile = (((scores.length - rank) / scores.length) * 100).toFixed(2);
        
        // Add special class for top 3 participants
        const topThreeClass = rank <= 3 ? 'top-three' : '';
        
        return `
            <li class="${topThreeClass}">
                <div class="rank">#${rank}</div>
                <div class="user-info">
                    <div class="user-name">${entry.name}</div>
                    <div class="user-email">${entry.email}</div>
                </div>
                <div class="score-info">
                    <div class="score">Score: ${entry.score}</div>
                    <div class="percentile">Top ${percentile}%</div>
                </div>
            </li>
        `;
    }).join('');

    pageInfo.innerText = `Page ${page} of ${Math.ceil(scores.length / itemsPerPage)}`;
    
    // Update pagination buttons
    prevBtn.disabled = page === 1;
    nextBtn.disabled = page === Math.ceil(scores.length / itemsPerPage);
}

function setupPagination() {
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderPage(currentPage);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentPage < Math.ceil(scores.length / itemsPerPage)) {
            currentPage++;
            renderPage(currentPage);
        }
    });
}

function setupSearch() {
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        const filteredScores = scores.filter(score => 
            score.name.toLowerCase().includes(query) || 
            score.email.toLowerCase().includes(query)
        );
        
        if (query) {
            displaySearchResults(filteredScores);
        } else {
            currentPage = 1;
            renderPage(currentPage);
        }
    });
}

function displaySearchResults(filteredScores) {
    scoresList.innerHTML = filteredScores.map((entry, index) => {
        const rank = scores.findIndex(s => s.name === entry.name && s.email === entry.email) + 1;
        const percentile = (((scores.length - rank) / scores.length) * 100).toFixed(2);
        
        return `
            <li>
                <div class="rank">#${rank}</div>
                <div class="user-info">
                    <div class="user-name">${entry.name}</div>
                    <div class="user-email">${entry.email}</div>
                </div>
                <div class="score-info">
                    <div class="score">Score: ${entry.score}</div>
                    <div class="percentile">Top ${percentile}%</div>
                </div>
            </li>
        `;
    }).join('');

    pageInfo.innerText = `Found ${filteredScores.length} participant(s)`;
    prevBtn.disabled = true;
    nextBtn.disabled = true;
}

function loadLeaderboard() {
    const usersRef = ref(db, 'users');

    onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        scores = [];

        if (data) {
            for (let userId in data) {
                scores.push({
                    name: data[userId].name || 'Anonymous',
                    email: data[userId].email || 'Not provided',
                    score: data[userId].score || 0
                });
            }

            scores.sort((a, b) => b.score - a.score);
        } else {
            scoresList.innerHTML = '<li class="loading">No participants found yet. Be the first to join!</li>';
            return;
        }

        renderPage(currentPage);
        setupPagination();
        setupSearch();
    }, (error) => {
        console.error("Error loading leaderboard:", error);
        scoresList.innerHTML = '<li class="loading">Error loading leaderboard. Please try again later.</li>';
    });
}

// Initialize the leaderboard
document.addEventListener('DOMContentLoaded', loadLeaderboard);
