/**
 * CEE Medico Nepal - Quiz Integration
 * Drop-in script to integrate Firebase auth + tracking into any quiz/MCQ page.
 * Include this script at the bottom of any HTML page that has MCQs.
 *
 * Usage: Add <script type="module" src="/auth/quiz-integration.js"></script> to any quiz page.
 *
 * It will:
 * 1. Check if user is logged in (show login prompt if not)
 * 2. Track each question attempt
 * 3. Record session results when quiz is submitted
 */

import {
  auth, db, onAuthStateChanged,
  ref, get, update, serverTimestamp
} from "./firebase-init.js";
import { recordAttempt, recordSession } from "./tracking-service.js";

let currentUser = null;
let sessionData = {
  attempts: [],
  startTime: Date.now()
};

function injectAuthBanner() {
  if (document.getElementById("cee-auth-banner")) return;

  const banner = document.createElement("div");
  banner.id = "cee-auth-banner";
  banner.innerHTML = `
    <div style="background:linear-gradient(135deg,#0062ff,#0047cc);color:#fff;padding:10px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;font-family:'Segoe UI',sans-serif;font-size:14px;position:sticky;top:0;z-index:9999;">
      <span id="cee-auth-text">Login to track your progress and see performance insights</span>
      <div style="display:flex;gap:8px;align-items:center;">
        <a href="/auth/login.html" id="cee-login-btn" style="background:#fff;color:#0062ff;padding:6px 16px;border-radius:6px;text-decoration:none;font-weight:700;font-size:13px;">Login</a>
        <a href="/user-dashboard/index.html" id="cee-dashboard-btn" style="display:none;background:rgba(255,255,255,0.2);color:#fff;padding:6px 16px;border-radius:6px;text-decoration:none;font-weight:600;font-size:13px;">Dashboard</a>
      </div>
    </div>
  `;
  document.body.prepend(banner);
}

function updateBanner(user) {
  const text = document.getElementById("cee-auth-text");
  const loginBtn = document.getElementById("cee-login-btn");
  const dashBtn = document.getElementById("cee-dashboard-btn");

  if (user) {
    const name = user.displayName || user.email.split("@")[0];
    text.textContent = `Welcome, ${name}! Your progress is being tracked.`;
    loginBtn.textContent = "Logout";
    loginBtn.href = "#";
    loginBtn.onclick = async (e) => {
      e.preventDefault();
      const { signOut } = await import("./firebase-init.js");
      await signOut(auth);
      window.location.reload();
    };
    dashBtn.style.display = "inline-block";
  }
}

function detectSubject() {
  const path = window.location.pathname.toLowerCase();
  const title = document.title.toLowerCase();
  const combined = path + " " + title;

  if (combined.includes("physics") || combined.includes("mechani") || combined.includes("optic") || combined.includes("circuit") || combined.includes("wave") || combined.includes("motion") || combined.includes("thermodynamic") || combined.includes("electric") || combined.includes("magnetic") || combined.includes("gravitation") || combined.includes("kinematics") || combined.includes("elasticity") || combined.includes("capacitor") || combined.includes("semiconductor") || combined.includes("nuclear") || combined.includes("photon") || combined.includes("doppler") || combined.includes("diffraction") || combined.includes("polarization") || combined.includes("interference") || combined.includes("rotational") || combined.includes("surface-tension") || combined.includes("fluid")) return "Physics";
  if (combined.includes("chemistry") || combined.includes("organic") || combined.includes("reaction") || combined.includes("ionic") || combined.includes("kinetic") || combined.includes("electrochemist") || combined.includes("alcohol") || combined.includes("aldehyde") || combined.includes("amine") || combined.includes("carboxylic") || combined.includes("polymer") || combined.includes("ether") || combined.includes("phenol") || combined.includes("aromatic") || combined.includes("coordination") || combined.includes("transition-metal") || combined.includes("nitrogen") || combined.includes("nitro-compound")) return "Chemistry";
  if (combined.includes("botany") || combined.includes("plant") || combined.includes("leaf") || combined.includes("root") || combined.includes("stem") || combined.includes("bryo") || combined.includes("pterido") || combined.includes("gymno") || combined.includes("angio") || combined.includes("algae") || combined.includes("fungi") || combined.includes("lichen") || combined.includes("photosynthesis") || combined.includes("transpiration") || combined.includes("mineral-nutrition") || combined.includes("economic-botany") || combined.includes("secondary-growth") || combined.includes("plant-breeding") || combined.includes("plant-biotechnology") || combined.includes("medicinal-plant")) return "Botany";
  if (combined.includes("zoology") || combined.includes("animal") || combined.includes("frog") || combined.includes("earthworm") || combined.includes("chordata") || combined.includes("arthropod") || combined.includes("mollusc") || combined.includes("annelid") || combined.includes("nematod") || combined.includes("platyhelm") || combined.includes("coelenter") || combined.includes("porifer") || combined.includes("protoz") || combined.includes("echinoderm") || combined.includes("plasmodium") || combined.includes("digestive") || combined.includes("circulat") || combined.includes("respirat") || combined.includes("nervous") || combined.includes("excret") || combined.includes("reproductive") || combined.includes("endocrine") || combined.includes("sense-organ") || combined.includes("evolution") || combined.includes("genetics") || combined.includes("mendel") || combined.includes("molecular-basis") || combined.includes("origin-of-life") || combined.includes("biodiversity") || combined.includes("ecosystem") || combined.includes("endangered")) return "Zoology";
  if (combined.includes("mat") || combined.includes("mental") || combined.includes("agility") || combined.includes("aptitude") || combined.includes("logical") || combined.includes("reasoning")) return "MAT";

  return "General";
}

function hookIntoQuizSubmission() {
  const observer = new MutationObserver(() => {
    document.querySelectorAll('input[type="radio"]').forEach((radio) => {
      if (radio.dataset.ceeTracked) return;
      radio.dataset.ceeTracked = "true";

      radio.addEventListener("change", () => {
        if (!currentUser) return;

        const questionBox = radio.closest(".question-box, .question-card, .question, .mcq-item, [class*='question']");
        if (!questionBox) return;

        const qText = questionBox.querySelector("p, h3, .question-text, .q-text")?.textContent?.trim() || "";
        const name = radio.name;

        sessionData.attempts.push({
          questionText: qText.substring(0, 200),
          selectedOption: radio.value,
          name: name,
          timestamp: Date.now()
        });
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  document.querySelectorAll('input[type="radio"]').forEach((radio) => {
    if (radio.dataset.ceeTracked) return;
    radio.dataset.ceeTracked = "true";
    radio.addEventListener("change", () => {
      if (!currentUser) return;
      const questionBox = radio.closest(".question-box, .question-card, .question, .mcq-item, [class*='question']");
      if (!questionBox) return;
      const qText = questionBox.querySelector("p, h3, .question-text, .q-text")?.textContent?.trim() || "";
      sessionData.attempts.push({
        questionText: qText.substring(0, 200),
        selectedOption: radio.value,
        name: radio.name,
        timestamp: Date.now()
      });
    });
  });
}

function hookIntoResults() {
  const observer = new MutationObserver(() => {
    const resultEl = document.getElementById("result") || document.querySelector("[class*='result']");
    if (resultEl && resultEl.style.display !== "none" && !resultEl.dataset.ceeRecorded) {
      resultEl.dataset.ceeRecorded = "true";

      if (!currentUser) return;

      const text = resultEl.textContent;
      const scoreMatch = text.match(/score[:\s]*([0-9.]+)/i);
      const correctMatch = text.match(/correct[:\s]*(\d+)/i);
      const wrongMatch = text.match(/wrong[:\s]*(\d+)/i);
      const totalMatch = text.match(/total[:\s]*(\d+)/i) || text.match(/(\d+)\s*question/i);

      const subject = detectSubject();
      const title = document.title.replace(/ - .*$/, "").replace(/CEE Medico Nepal/i, "").trim() || subject + " Quiz";

      const correct = correctMatch ? parseInt(correctMatch[1]) : 0;
      const wrong = wrongMatch ? parseInt(wrongMatch[1]) : 0;
      const total = totalMatch ? parseInt(totalMatch[1]) : (correct + wrong);
      const score = scoreMatch ? parseFloat(scoreMatch[1]) : correct;

      recordSession(currentUser.uid, {
        title,
        subject,
        totalQuestions: total,
        correct,
        wrong,
        unattempted: Math.max(0, total - correct - wrong),
        score,
        maxScore: total,
        timeTaken: Math.round((Date.now() - sessionData.startTime) / 1000)
      });
    }
  });

  const resultEl = document.getElementById("result") || document.querySelector("[class*='result']");
  if (resultEl) {
    observer.observe(resultEl, { attributes: true, attributeFilter: ["style"] });
  }
  observer.observe(document.body, { childList: true, subtree: true });
}

injectAuthBanner();

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  updateBanner(user);

  if (user) {
    await update(ref(db, `users/${user.uid}`), { lastActivity: serverTimestamp() });
  }
});

hookIntoQuizSubmission();
hookIntoResults();
