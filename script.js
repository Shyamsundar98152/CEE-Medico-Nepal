<script type="module">
/* =========================
   Firebase Imports & Setup
   ========================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Global Firebase instances
let app;
let db;
let auth;
let userId; // Will store the authenticated user's ID

// Firebase configuration (provided by Canvas environment or hardcoded if not available)
const firebaseConfig = {
  apiKey: "AIzaSyBjm8uaVMdylGg3-YKdEKKV6DDbRkaxjiE", // This is the specific API key you provided
  authDomain: "daily-quiz-a29e8.firebaseapp.com",
  databaseURL: "https://daily-quiz-a29e8-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "daily-quiz-a29e8",
  storageBucket: "daily-quiz-a29e8.firebasestorage.app",
  messagingSenderId: "886784418732",
  appId: "1:886784418732:web:0ad368df36f7187d2b1009"
};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'; // Use default if not available

/* =========================
   EMBEDDED CHAPTERS.TXT CONTENT
   ========================= */
const EMBEDDED_CHAPTERS_TXT = `
2025-08-17 10:00 | Chemistry - Phenol
2025-08-18 10:00 | Chemistry - Chemical Bonding
2025-08-18 13:00 | Zoology - Human Reproduction
2025-08-18 15:00 | Botany - Plant Kingdom
2025-08-18 18:00 | Physics - Electrostatics
2025-08-19 10:00 | Zoology - Human Physiology - Circulatory System
2025-08-19 13:00 | Physics - Electrostatics
2025-08-19 15:00 | Botany - Plant Physiology
2025-08-19 18:00 | Chemistry - Atomic Structure
2025-08-20 10:00 | Physics - Kinematics
2025-08-20 13:00 | Zoology - Cell Structure & Function
2025-08-20 15:00 | Chemistry - Chemical Bonding
2025-08-20 18:00 | Botany - Biotechnology
2025-08-21 10:00 | Chemistry - States of Matter
2025-08-21 13:00 | Botany - Ecology
2025-08-21 15:00 | Zoology - Human Reproduction
2025-08-21 18:00 | Physics - Kinematics
2025-08-22 10:00 | Botany - Genetics
2025-08-22 13:00 | Zoology - Human Reproduction
2025-08-22 15:00 | Physics - Thermodynamics
2025-08-22 18:00 | Chemistry - Thermodynamics
2025-08-23 10:00 | Botany - Ecology
2025-08-23 13:00 | Zoology - Human Physiology - Circulatory System
2025-08-23 15:00 | Chemistry - Thermodynamics
2025-08-23 18:00 | Physics - Electrostatics
2025-08-24 10:00 | Chemistry - States of Matter
2025-08-24 13:00 | Zoology - Biomolecules
2025-08-24 15:00 | Botany - Genetics
2025-08-24 18:00 | Physics - Oscillations & Waves
2025-08-25 10:00 | Botany - Biotechnology
2025-08-25 13:00 | Physics - Electrostatics
2025-08-25 15:00 | Chemistry - States of Matter
2025-08-25 18:00 | Zoology - Human Physiology - Circulatory System
2025-08-26 10:00 | Physics - Kinematics
2025-08-26 13:00 | Botany - Ecology
2025-08-26 15:00 | Zoology - Human Reproduction
2025-08-26 18:00 | Chemistry - Chemical Bonding
2025-08-27 10:00 | Physics - Kinematics
2025-08-27 13:00 | Botany - Plant Physiology
2025-08-27 15:00 | Chemistry - States of Matter
2025-08-27 18:00 | Zoology - Human Physiology - Circulatory System
2025-08-28 10:00 | Zoology - Cell Structure & Function
2025-08-28 13:00 | Botany - Plant Physiology
2025-08-28 15:00 | Physics - Laws of Motion
2025-08-28 18:00 | Chemistry - States of Matter
2025-08-29 10:00 | Chemistry - Thermodynamics
2025-08-29 13:00 | Zoology - Cell Structure & Function
2025-08-29 15:00 | Botany - Plant Kingdom
2025-08-29 18:00 | Physics - Thermodynamics
2025-08-30 10:00 | Physics - Oscillations & Waves
2025-08-30 13:00 | Botany - Plant Physiology
2025-08-30 15:00 | Chemistry - Chemical Kinetics
2025-08-30 18:00 | Zoology - Human Physiology - Nervous System
2025-08-31 10:00 | Botany - Plant Physiology
2025-08-31 13:00 | Zoology - Human Reproduction
2025-08-31 15:00 | Physics - Work, Energy & Power
2025-08-31 18:00 | Chemistry - Chemical Kinetics
2025-09-01 10:00 | Chemistry - Atomic Structure
2025-09-01 13:00 | Physics - Electrostatics
2025-09-01 15:00 | Botany - Cell Structure & Function
2025-09-01 18:00 | Zoology - Cell Structure & Function
2025-09-02 10:00 | Physics - Thermodynamics
2025-09-02 13:00 | Zoology - Biomolecules
2025-09-02 15:00 | Chemistry - Chemical Kinetics
2025-09-02 18:00 | Botany - Ecology
2025-09-03 10:00 | Physics - Oscillations & Waves
2025-09-03 13:00 | Zoology - Human Physiology - Digestion
2025-09-03 15:00 | Botany - Biotechnology
2025-09-03 18:00 | Chemistry - States of Matter
2025-09-04 10:00 | Chemistry - Thermodynamics
2025-09-04 13:00 | Zoology - Human Reproduction
2025-09-04 15:00 | Botany - Biotechnology
2025-09-04 18:00 | Physics - Work, Energy & Power
2025-09-05 10:00 | Zoology - Cell Structure & Function
2025-09-05 13:00 | Botany - Cell Structure & Function
2025-09-05 15:00 | Chemistry - Chemical Kinetics
2025-09-05 18:00 | Physics - Oscillations & Waves
2025-09-06 10:00 | Chemistry - Electrochemistry
2025-09-06 13:00 | Botany - Biotechnology
2025-09-06 15:00 | Zoology - Biomolecules
2025-09-06 18:00 | Physics - Electrostatics
2025-09-07 10:00 | Chemistry - Electrochemistry
2025-09-07 13:00 | Physics - Thermodynamics
2025-09-07 15:00 | Zoology - Biomolecules
2025-09-07 18:00 | Botany - Genetics
2025-09-08 10:00 | Physics - Electrostatics
2025-09-08 13:00 | Zoology - Human Reproduction
2025-09-08 15:00 | Chemistry - Electrochemistry
2025-09-08 18:00 | Botany - Ecology
2025-09-09 10:00 | Botany - Cell Structure & Function
2025-09-09 13:00 | Zoology - Human Physiology - Circulatory System
2025-09-09 15:00 | Physics - Laws of Motion
2025-09-09 18:00 | Chemistry - Chemical Kinetics
2025-09-10 10:00 | Chemistry - Thermodynamics
2025-09-10 13:00 | Zoology - Biomolecules
2025-09-10 15:00 | Physics - Laws of Motion
2025-09-10 18:00 | Botany - Plant Kingdom
2025-09-11 10:00 | Physics - Electrostatics
2025-09-11 13:00 | Chemistry - Atomic Structure
2025-09-11 15:00 | Botany - Biotechnology
2025-09-11 18:00 | Zoology - Human Physiology - Circulatory System
2025-09-12 10:00 | Zoology - Human Reproduction
2025-09-12 13:00 | Chemistry - States of Matter
2025-09-12 15:00 | Physics - Work, Energy & Power
2025-09-12 18:00 | Botany - Plant Kingdom
2025-09-13 10:00 | Botany - Plant Physiology
2025-09-13 13:00 | Chemistry - Chemical Bonding
2025-09-13 15:00 | Zoology - Human Physiology - Digestion
2025-09-13 18:00 | Physics - Thermodynamics
2025-09-14 10:00 | Physics - Oscillations & Waves
2025-09-14 13:00 | Botany - Ecology
2025-09-14 15:00 | Chemistry - Atomic Structure
2025-09-14 18:00 | Zoology - Cell Structure & Function
2025-09-15 10:00 | Zoology - Biomolecules
2025-09-15 13:00 | Physics - Kinematics
2025-09-15 15:00 | Botany - Biotechnology
2025-09-15 18:00 | Chemistry - Electrochemistry
2025-09-16 10:00 | Physics - Work, Energy & Power
2025-09-16 13:00 | Chemistry - Thermodynamics
2025-09-16 15:00 | Zoology - Human Reproduction
2025-09-16 18:00 | Botany - Plant Kingdom
2025-09-17 10:00 | Botany - Genetics
2025-09-17 13:00 | Physics - Laws of Motion
2025-09-17 15:00 | Zoology - Human Physiology - Nervous System
2025-09-17 18:00 | Chemistry - Chemical Bonding
2025-09-18 10:00 | Zoology - Human Physiology - Digestion
2025-09-18 13:00 | Botany - Plant Physiology
2025-09-18 15:00 | Chemistry - States of Matter
2025-09-18 18:00 | Physics - Thermodynamics
2025-09-19 10:00 | Physics - Electrostatics
2025-09-19 13:00 | Botany - Cell Structure & Function
2025-09-19 15:00 | Chemistry - Chemical Kinetics
2025-09-19 18:00 | Zoology - Biomolecules
2025-09-20 10:00 | Chemistry - Electrochemistry
2025-09-20 13:00 | Physics - Work, Energy & Power
2025-09-20 15:00 | Botany - Ecology
2025-09-20 18:00 | Zoology - Human Reproduction
2025-09-21 10:00 | Zoology - Human Physiology - Circulatory System
2025-09-21 13:00 | Chemistry - Chemical Kinetics
2025-09-21 15:00 | Physics - Kinematics
2025-09-21 18:00 | Botany - Genetics
2025-09-22 10:00 | Physics - Oscillations & Waves
2025-09-22 13:00 | Botany - Biotechnology
2025-09-22 15:00 | Chemistry - Thermodynamics
2025-09-22 18:00 | Zoology - Cell Structure & Function
2025-09-23 10:00 | Zoology - Biomolecules
2025-09-23 13:00 | Zoology - Human Physiology - Nervous System
2025-09-23 15:00 | Chemistry - Chemical Kinetics
2025-09-23 18:00 | Botany - Genetics
2025-09-24 10:00 | Physics - Oscillations & Waves
2025-09-24 13:00 | Chemistry - Chemical Kinetics
2025-09-24 15:00 | Zoology - Human Physiology - Digestion
2025-09-24 18:00 | Botany - Plant Physiology
2025-09-25 10:00 | Chemistry - Thermodynamics
2025-09-25 13:00 | Zoology - Biomolecules
2025-09-25 15:00 | Physics - Kinematics
2025-09-25 18:00 | Botany - Cell Structure & Function
2025-09-26 10:00 | Botany - Cell Structure & Function
2025-09-26 13:00 | Physics - Work, Energy & Power
2025-09-26 15:00 | Chemistry - States of Matter
2025-09-26 18:00 | Zoology - Human Physiology - Digestion
2025-09-27 10:00 | Physics - Work, Energy & Power
2025-09-27 13:00 | Zoology - Human Physiology - Nervous System
2025-09-27 15:00 | Botany - Genetics
2025-09-27 18:00 | Chemistry - Chemical Kinetics

`;


/* =========================
   CONFIG
   ========================= */
const GEMINI_API_KEY = "AIzaSyAFeOdXUkyiUC_U59h5jiYoTd0A8zUtLEE"; // Canvas environment will provide it at runtime.
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
const LOCAL_STORAGE_KEY_RESULTS = "ceeMedicoQuizResults";
const LOCAL_STORAGE_KEY_NAME = "ceeMedicoParticipantName";

// Firestore collection paths for public data
const QUIZZES_COLLECTION_PATH = `artifacts/${appId}/public/data/quizzes`;

/* =========================
   GLOBAL STATE
   ========================= */
let schedule = [];             // array of {time:Date, chapter:string}
let currentChapter = null;     // {time, chapter}
let quizData = [];             // array of questions from Gemini or Firestore
let currentQuestionIndex = 0;
let countdownTimer = null;
let questionTimer = null;
let participantName = "";

/* =========================
   Helpers
   ========================= */
function el(id){ return document.getElementById(id); }
function show(q){ q.classList.remove('hidden'); q.style.display = ''; }
function hide(q){ q.classList.add('hidden'); q.style.display = 'none'; }

function showMessage(msg, callback = null) {
    el('modal-message-text').innerText = msg;
    show(el('modal-message-overlay'));
    el('modal-message-ok').onclick = () => {
        hide(el('modal-message-overlay'));
        if (callback) callback();
    };
    el('modal-message-close').onclick = () => {
        hide(el('modal-message-overlay'));
        if (callback) callback();
    };
}

/* =========================
   Local Storage Management
   ========================= */
function saveParticipantNameLocally(name) {
    localStorage.setItem(LOCAL_STORAGE_KEY_NAME, name);
}

function getParticipantNameLocally() {
    return localStorage.getItem(LOCAL_STORAGE_KEY_NAME) || "";
}

function saveQuizResultLocally(result) {
    const results = getQuizResultsLocally();
    results.push(result);
    localStorage.setItem(LOCAL_STORAGE_KEY_RESULTS, JSON.stringify(results));
    renderLocalHistory(); // Re-render history after saving
}

function getQuizResultsLocally() {
    try {
        return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_RESULTS) || "[]");
    } catch (e) {
        console.error("Error parsing local results:", e);
        return [];
    }
}

function renderLocalHistory() {
    const historyDisplayEl = el('local-history-display');
    const results = getQuizResultsLocally();

    if (results.length === 0) {
        historyDisplayEl.innerHTML = '<div class="small center">No previous results saved locally.</div>';
        return;
    }

    // Sort by date descending
    results.sort((a, b) => new Date(b.date) - new Date(a.date));

    historyDisplayEl.innerHTML = results.map(r => {
        const dateStr = new Date(r.date).toLocaleString('en-NP', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        });
        return `
            <div class="participant">
                <div><strong>${escapeHtml(r.name || 'Anonymous')}</strong> on ${dateStr}</div>
                <div>${r.correct} / ${r.total} Correct (${r.skipped} skipped)</div>
            </div>
        `;
    }).join('');
}


/* =========================
   Load schedule from embedded text
   ========================= */
async function loadSchedule(){
  try{
    const txt = EMBEDDED_CHAPTERS_TXT;
    if(!txt) throw new Error("Embedded schedule content is empty.");

    schedule = txt.trim().split('\n').map(l=>{
      const parts = l.split('|');
      const dt = parts[0].trim(); // "YYYY-MM-DD HH:MM"
      const ch = (parts[1]||"").trim();
      const m = dt.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/);
      if(!m) return null;
      const [_,y,mo,d,h,mi] = m;
      // Note: Month is 0-indexed in Date constructor
      const dateObj = new Date(Number(y), Number(mo)-1, Number(d), Number(h), Number(mi), 0, 0);
      return {time: dateObj, chapter: ch};
    }).filter(Boolean).sort((a,b)=>a.time - b.time);

    renderSchedule(); // Display schedule after loading

  }catch(e){
    console.error("Error loading schedule:", e);
    schedule = [];
    el('chapter-title').innerText = `Error loading schedule: ${e.message}.`;
    el('schedule-display').innerHTML = `<div class="small">Error loading schedule: ${e.message}</div>`;
  }
}

/* =========================
   Render Schedule on the page
   ========================= */
function renderSchedule() {
  const scheduleDisplayEl = el('schedule-display');
  if (schedule.length === 0) {
    scheduleDisplayEl.innerHTML = '<div class="small">No upcoming chapters scheduled.</div>';
    return;
  }
  const now = new Date();
  const upcomingSchedule = schedule.filter(entry => entry.time >= now);

  if (upcomingSchedule.length === 0) {
    scheduleDisplayEl.innerHTML = '<div class="small">All scheduled quizzes have passed.</div>';
    return;
  }

  scheduleDisplayEl.innerHTML = upcomingSchedule.map(entry => {
    const timeStr = entry.time.toLocaleString('en-NP', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
    return `<div class="participant"><div>${escapeHtml(entry.chapter)}</div><div>${timeStr}</div></div>`;
  }).join('');
}

/* =========================
   Get accurate Nepal time (local device time)
   ========================= */
async function getAccurateTime(){
  // Using local device time as per request
  return new Date();
}

/* =========================
   Find latest chapter <= now
   ========================= */
function pickCurrentChapter(now){
  let picked = null;
  for(const entry of schedule){
    if(now >= entry.time) picked = entry;
  }
  return picked;
}

/* =========================
   Exponential Backoff for API calls
   ========================= */
async function fetchWithExponentialBackoff(url, options, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.status === 429 || !response.ok) { // Too Many Requests or other non-OK status
                if (i < retries - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
                    continue;
                }
            }
            return response;
        } catch (error) {
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
                continue;
            }
            throw error; // Re-throw if all retries fail
        }
    }
}

/* =========================
   Firestore Functions
   ========================= */

// Helper to get a clean chapter ID for Firestore document names
function getChapterDocId(chapterName) {
    // Replace non-alphanumeric characters with underscores, convert to lowercase
    return chapterName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
}

async function getQuizFromFirestore(chapterName) {
    el('chapter-title').innerText = `Checking for existing questions for "${chapterName}"...`;
    try {
        const chapterDocId = getChapterDocId(chapterName);
        const docRef = doc(db, QUIZZES_COLLECTION_PATH, chapterDocId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log("Quiz data found in Firestore:", docSnap.data());
            return docSnap.data().quizData; // Assuming quiz data is stored under 'quizData' field
        } else {
            console.log("No quiz data found in Firestore for:", chapterName);
            return null;
        }
    } catch (e) {
        console.error("Error fetching quiz from Firestore:", e);
        showMessage(`Error fetching quiz from database: ${e.message}`);
        return null;
    }
}

async function saveQuizToFirestore(chapterName, quizQuestions) {
    try {
        const chapterDocId = getChapterDocId(chapterName);
        const docRef = doc(db, QUIZZES_COLLECTION_PATH, chapterDocId);
        await setDoc(docRef, {
            chapter: chapterName,
            quizData: quizQuestions,
            generatedAt: new Date().toISOString() // Timestamp for when it was generated
        });
        console.log("Quiz data saved to Firestore for:", chapterName);
    } catch (e) {
        console.error("Error saving quiz to Firestore:", e);
        showMessage(`Error saving quiz to database: ${e.message}`);
    }
}

/* =========================
   Gemini generate (50 MCQs)
   ========================= */
async function generateMCQs(chapter){
  el('chapter-title').innerText = `Loading questions for "${chapter}" — please wait... (This may take a moment)`;
  const prompt = `
Generate 30 Hard Advance Long NEET / CEE-level multiple choice questions in JSON (array) on the chapter "${chapter}" based on NEB / MEC syllabus Nepal. Each question must have exactly 4 options. Ensure the correct option is clearly indicated by its index (0-3).

Use exactly this JSON schema:
[
  {
    "question": "text of the question",
    "options": ["Option A","Option B","Option C","Option D"],
    "correct": 0, // index of the correct option (0 for A, 1 for B, etc.)
    "explanation": "short explanation for the correct answer"
  }
]
Return JSON array only. Do not include any other text or markdown outside the JSON.
`.trim();

  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  };

  try{
    const r = await fetchWithExponentialBackoff(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(payload)
    });

    if(!r.ok){
      const errText = await r.text();
      throw new Error(`Gemini API failed: ${r.status} - ${errText}`);
    }
    const json = await r.json();
    const raw = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const parsed = JSON.parse(raw);

    // Basic validation of the parsed quiz data
    if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("Gemini returned an empty or invalid quiz data structure.");
    }
    parsed.forEach((q, idx) => {
        if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.correct !== 'number' || q.correct < 0 || q.correct > 3 || !q.explanation) {
            console.warn(`Question ${idx} failed schema validation:`, q);
            // Optionally, remove malformed questions or throw a harder error
        }
    });

    return parsed;
  }catch(e){
    console.error("Gemini error", e);
    throw e;
  }
}

/* =========================
   Quiz UI functions
   ========================= */
function renderQuestion(){
  if(!quizData.length) return;
  const q = quizData[currentQuestionIndex];
  el('question-num').innerText = `Question ${currentQuestionIndex + 1} / ${quizData.length}`;
  el('question-text').innerText = q.question || '';
  el('explanation').innerText = ''; // Clear previous explanation
  const cont = el('options-container'); cont.innerHTML = ''; // Clear previous options

  // Get CSS variables for consistent styling
  const rootStyles = getComputedStyle(document.documentElement);
  const cssVarLightGreen = rootStyles.getPropertyValue('--light-green');
  const cssVarLightRed = rootStyles.getPropertyValue('--light-red');
  const cssVarGreen = rootStyles.getPropertyValue('--green');
  const cssVarRed = rootStyles.getPropertyValue('--red');
  const cssVarCard = rootStyles.getPropertyValue('--card');
  const cssVarBorderColor = rootStyles.getPropertyValue('--border-color');

  (q.options||[]).forEach((opt,i)=>{
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerText = opt;
    btn.dataset.index = i; // Store index for easy lookup
    btn.dataset.answered = q.answered ? 'true' : 'false'; // Mark if already answered

    if (q.answered) {
        // If question was answered, apply styles
        if (i === q.userAnswer) {
            btn.style.background = i === q.correct ? cssVarLightGreen : cssVarLightRed;
            btn.style.border = i === q.correct ? `1px solid ${cssVarGreen}` : `1px solid ${cssVarRed}`;
        } else if (i === q.correct) {
            // Highlight correct answer if user answered incorrectly
            btn.style.background = cssVarLightGreen;
            btn.style.border = `1px solid ${cssVarGreen}`;
        }
        el('explanation').innerText = (q.userAnswer === q.correct ? '✅ Correct. ' : '❌ Incorrect. Correct answer: ' + (q.options && q.options[q.correct] ? q.options[q.correct] : '')) + (q.explanation ? ' — ' + q.explanation : '');
    }

    btn.onclick = ()=>{
      if(q.answered) return; // Prevent re-answering
      q.answered = true;
      q.userAnswer = i;
      btn.dataset.answered = 'true'; // Mark as answered

      // Visually mark chosen option and correct answer
      Array.from(cont.children).forEach(optionBtn => {
        const optionIndex = parseInt(optionBtn.dataset.index);
        if (optionIndex === i) { // User's choice
          optionBtn.style.background = i === q.correct ? cssVarLightGreen : cssVarLightRed;
          optionBtn.style.border = i === q.correct ? `1px solid ${cssVarGreen}` : `1px solid ${cssVarRed}`;
        } else if (optionIndex === q.correct) { // The actual correct answer
          optionBtn.style.background = cssVarLightGreen;
          optionBtn.style.border = `1px solid ${cssVarGreen}`;
        } else { // Other options
          optionBtn.style.background = cssVarCard; /* Ensure background is white for non-selected */
          optionBtn.style.border = `1px solid ${cssVarBorderColor}`;
        }
      });

      el('explanation').innerText = (i === q.correct ? '✅ Correct. ' : '❌ Incorrect. Correct answer: ' + (q.options && q.options[q.correct] ? q.options[q.correct] : '')) + (q.explanation ? ' — ' + q.explanation : '');
      clearInterval(questionTimer); // Stop timer after answer
    };
    cont.appendChild(btn);
  });
  if (!q.answered) { // Only start timer if not already answered
      startQuestionTimer();
  } else {
      clearInterval(questionTimer); // Ensure timer is stopped if re-rendering an answered question
      el('countdown').innerText = 'Time: 0s'; // Show timer as finished
  }
}

function nextQuestion(){
  // If current question wasn't answered when moving next, mark as skipped
  if (!quizData[currentQuestionIndex].answered) {
    quizData[currentQuestionIndex].skipped = true;
    quizData[currentQuestionIndex].answered = true; // Mark as answered to prevent re-interaction
    quizData[currentQuestionIndex].userAnswer = null; // No answer
  }

  if(currentQuestionIndex < quizData.length -1){
    currentQuestionIndex++; renderQuestion();
  }
  else submitQuiz();
}

function prevQuestion(){
  if(currentQuestionIndex > 0){
    currentQuestionIndex--; renderQuestion();
  }
}

function skipQuestion(){
  if (!quizData[currentQuestionIndex].answered) { // Only mark as skipped if not already answered
    quizData[currentQuestionIndex].skipped = true;
    quizData[currentQuestionIndex].answered = true; // Mark as answered to prevent re-interaction
    quizData[currentQuestionIndex].userAnswer = null; // No answer
  }
  nextQuestion(); // Move to next question after skipping
}

function startQuestionTimer(){
  let timeLeft = 30; // 30 seconds per question
  el('countdown').innerText = `Time: ${timeLeft}s`;
  if(questionTimer) clearInterval(questionTimer);
  questionTimer = setInterval(()=> {
    timeLeft--;
    el('countdown').innerText = `Time: ${timeLeft}s`;
    if(timeLeft<=0){
      clearInterval(questionTimer);
      // auto-skip and move to next
      if (!quizData[currentQuestionIndex].answered) {
        quizData[currentQuestionIndex].skipped = true;
        quizData[currentQuestionIndex].answered = true;
        quizData[currentQuestionIndex].userAnswer = null;
      }
      if(currentQuestionIndex < quizData.length -1){ currentQuestionIndex++; renderQuestion(); }
      else submitQuiz(); // If last question, submit quiz
    }
  },1000);
}

function submitQuiz(){
  if(questionTimer) clearInterval(questionTimer);

  // Ensure the last question is marked as skipped if not answered
  if (!quizData[currentQuestionIndex].answered) {
    quizData[currentQuestionIndex].skipped = true;
    quizData[currentQuestionIndex].answered = true;
    quizData[currentQuestionIndex].userAnswer = null;
  }

  // Tally results
  let correct=0, wrong=0, skipped=0;
  quizData.forEach(q=>{
    if(q.answered && q.userAnswer !== null && q.userAnswer === q.correct) correct++;
    else if(q.answered && q.userAnswer !== null && q.userAnswer !== q.correct) wrong++;
    else if(q.skipped) skipped++;
  });

  el('res-total').innerText = quizData.length;
  el('res-correct').innerText = correct;
  el('res-wrong').innerText = wrong;
  el('res-skipped').innerText = skipped;

  // Show results area
  hide(el('quiz-area'));
  show(el('results-area'));
  el('save-result-btn').disabled = false;
  renderLocalHistory(); // Display updated local history
}

/* =========================
   Event wiring
   ========================= */
document.addEventListener('click', (e) => {
  if(e.target && e.target.id === 'join-button'){
    participantName = el('participant-name').value.trim();
    saveParticipantNameLocally(participantName); // Save name locally

    hide(el('results-area'));
    show(el('quiz-area')); // Explicitly show quiz area when join button is clicked
    if(quizData.length) { currentQuestionIndex=0; renderQuestion(); }
  }
});
el('prev-btn').onclick = prevQuestion;
el('next-btn').onclick = nextQuestion;
el('skip-btn').onclick = skipQuestion;
el('submit-btn').onclick = submitQuiz;
el('restart-btn').onclick = ()=>{
  location.reload(); // Simple reload to restart the quiz entirely
};
el('save-result-btn').onclick = async ()=>{
  const result = {
      name: participantName,
      date: new Date().toISOString(),
      total: quizData.length,
      correct: parseInt(el('res-correct').innerText),
      wrong: parseInt(el('res-wrong').innerText),
      skipped: parseInt(el('res-skipped').innerText)
  };
  saveQuizResultLocally(result);
  showMessage('Your quiz result has been saved locally!');
  el('save-result-btn').disabled = true; // Disable after saving
};
el('participant-name').value = getParticipantNameLocally(); // Load name on startup


// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
  const mobileMenuBtn = el('mobileMenuBtn');
  const mainNav = el('mainNav');

  if (mobileMenuBtn && mainNav) {
    mobileMenuBtn.addEventListener('click', () => {
      mainNav.classList.toggle('active');
    });
  }
});


/* =========================
   Main routine: load schedule, pick chapter, generate or load MCQs
   ========================= */
async function main(){
  // Initialize Firebase
  try {
      // Use the provided Firebase configuration directly
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);

      // Sign in user (even if rules allow unauthenticated, it's good practice for tracking user IDs)
      if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
      } else {
          await signInAnonymously(auth);
      }
      userId = auth.currentUser?.uid || crypto.randomUUID(); // Get user ID after sign-in
      console.log("Firebase initialized and user signed in. User ID:", userId);

  } catch (error) {
      console.error("Error initializing Firebase or signing in:", error);
      el('chapter-title').innerText = `Error initializing app: ${error.message}`;
      el('join-button').disabled = true;
      return; // Stop execution if Firebase setup fails
  }


  // Load schedule first
  await loadSchedule();

  // Get accurate time (local device time)
  const now = await getAccurateTime();
  el('schedule-info').innerText = `Current local time: ${now.toLocaleString('en-NP', {dateStyle: 'full', timeStyle: 'medium'})}`;

  // Pick appropriate chapter based on current time
  currentChapter = pickCurrentChapter(now);
  if(!currentChapter){
    el('chapter-title').innerText = 'No chapter scheduled yet (or schedule missing/future).';
    el('join-button').disabled = true;
    hide(el('quiz-area')); // Ensure quiz area is hidden if no chapter
    return;
  }
  el('chapter-title').innerText = `Scheduled: ${currentChapter.chapter} (starts ${currentChapter.time.toLocaleString('en-NP', {dateStyle: 'medium', timeStyle: 'short'})})`;

  // Try to load MCQs from Firestore first
  try{
    el('chapter-title').innerText = `Scheduled: ${currentChapter.chapter} (starts ${currentChapter.time.toLocaleString('en-NP', {dateStyle: 'medium', timeStyle: 'short'})}) - Loading questions...`;
    quizData = await getQuizFromFirestore(currentChapter.chapter);

    if (quizData) {
        el('chapter-title').innerText = `Scheduled: ${currentChapter.chapter} (starts ${currentChapter.time.toLocaleString('en-NP', {dateStyle: 'medium', timeStyle: 'short'})})`;
        // Ensure structure and add initial state for each question
        quizData = quizData.map(q => ({ ...q, answered:false, userAnswer:null, skipped:false }));
        el('join-button').innerText = 'Join Quiz (Loaded from Cache)';
        el('join-button').disabled = false;
    } else {
        // If not found in Firestore, generate using Gemini
        quizData = await generateMCQs(currentChapter.chapter);
        // Ensure structure and add initial state for each question
        quizData = quizData.map(q => ({ ...q, answered:false, userAnswer:null, skipped:false }));
        // Save the newly generated quiz data to Firestore
        await saveQuizToFirestore(currentChapter.chapter, quizData);
        el('join-button').innerText = 'Join Quiz (Generated & Cached)';
        el('join-button').disabled = false;
    }

    // Do NOT show quiz area here, it will be shown when 'Join Quiz' is clicked.
  }catch(e){
    el('chapter-title').innerText = `Error processing questions: ${e.message || e}`;
    el('join-button').innerText = 'Retry';
    el('join-button').disabled = false;
    el('join-button').onclick = ()=> location.reload();
    hide(el('quiz-area')); // Hide quiz area on error
  }
  renderLocalHistory(); // Display existing local history on load
}

// Start the main application logic when the page loads
document.addEventListener('DOMContentLoaded', main);

/* =========================
   small helper: escape html
   ========================= */
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}
</script>
