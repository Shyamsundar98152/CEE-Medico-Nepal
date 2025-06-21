// /quiz/leaderboard.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDfCO-xxHPpgSfE-I6KTmsw35Lo9n2v56s",
    authDomain: "live-quiz-6e77b.firebaseapp.com",
    databaseURL: "https://live-quiz-6e77b-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "live-quiz-6e77b",
    storageBucket: "live-quiz-6e77b.appspot.com",
    messagingSenderId: "50057610341",
    appId: "1:50057610341:web:d4e88673a20757d4c9328c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const scoresList = document.getElementById('scores');
const usersRef = ref(db, 'users');

onValue(usersRef, (snapshot) => {
    const data = snapshot.val();
    const scores = [];

    for (let userId in data) {
        scores.push({
            name: data[userId].name,
            email: data[userId].email || 'Not provided',
            score: data[userId].score
        });
    }

    scores.sort((a, b) => b.score - a.score);

    scoresList.innerHTML = scores.map((entry, index) => {
        const percentile = (((scores.length - (index + 1)) / scores.length) * 100).toFixed(2);
        return `<li>
            <strong>Rank ${index + 1}</strong>: ${entry.name} (${entry.email}) - 
            Score: ${entry.score} | Percentile: ${percentile}%
        </li>`;
    }).join('');
});
