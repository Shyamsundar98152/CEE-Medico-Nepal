/**
 * CEE Medico Nepal - Question Tracking & Performance Analytics Service
 * Records every question attempt, calculates analytics, and provides insights.
 */

import {
  db, ref, set, get, update, push, onValue,
  query, orderByChild, limitToLast,
  serverTimestamp
} from "./firebase-init.js";

/**
 * Record a question attempt.
 * @param {string} uid - User ID
 * @param {object} data - { subject, chapter, questionId, questionText, selectedOption, correctOption, isCorrect, timeTaken }
 */
async function recordAttempt(uid, data) {
  const attemptRef = push(ref(db, `attempts/${uid}`));
  await set(attemptRef, {
    ...data,
    timestamp: serverTimestamp()
  });

  await updateUserStats(uid, data);
}

/**
 * Record a full quiz/exam session.
 * @param {string} uid
 * @param {object} session - { examId, title, subject, totalQuestions, correct, wrong, unattempted, score, maxScore, timeTaken, questions[] }
 */
async function recordSession(uid, session) {
  const sessionRef = push(ref(db, `sessions/${uid}`));
  await set(sessionRef, {
    ...session,
    timestamp: serverTimestamp()
  });

  const userRef = ref(db, `users/${uid}/stats`);
  const snap = await get(userRef);
  const stats = snap.exists() ? snap.val() : {
    totalSessions: 0,
    totalQuestions: 0,
    totalCorrect: 0,
    totalWrong: 0,
    totalUnattempted: 0,
    totalScore: 0,
    subjectWise: {}
  };

  stats.totalSessions = (stats.totalSessions || 0) + 1;
  stats.totalQuestions = (stats.totalQuestions || 0) + (session.totalQuestions || 0);
  stats.totalCorrect = (stats.totalCorrect || 0) + (session.correct || 0);
  stats.totalWrong = (stats.totalWrong || 0) + (session.wrong || 0);
  stats.totalUnattempted = (stats.totalUnattempted || 0) + (session.unattempted || 0);
  stats.totalScore = (stats.totalScore || 0) + (session.score || 0);
  stats.lastActivity = serverTimestamp();

  if (session.subject) {
    const subj = session.subject;
    if (!stats.subjectWise) stats.subjectWise = {};
    if (!stats.subjectWise[subj]) {
      stats.subjectWise[subj] = { sessions: 0, correct: 0, wrong: 0, total: 0, score: 0 };
    }
    stats.subjectWise[subj].sessions += 1;
    stats.subjectWise[subj].correct += session.correct || 0;
    stats.subjectWise[subj].wrong += session.wrong || 0;
    stats.subjectWise[subj].total += session.totalQuestions || 0;
    stats.subjectWise[subj].score += session.score || 0;
  }

  await set(userRef, stats);
}

async function updateUserStats(uid, attemptData) {
  const statsRef = ref(db, `users/${uid}/stats`);
  const snap = await get(statsRef);
  const stats = snap.exists() ? snap.val() : {
    totalQuestions: 0,
    totalCorrect: 0,
    totalWrong: 0,
    subjectWise: {}
  };

  stats.totalQuestions = (stats.totalQuestions || 0) + 1;
  if (attemptData.isCorrect) {
    stats.totalCorrect = (stats.totalCorrect || 0) + 1;
  } else {
    stats.totalWrong = (stats.totalWrong || 0) + 1;
  }
  stats.lastActivity = serverTimestamp();

  if (attemptData.subject) {
    const subj = attemptData.subject;
    if (!stats.subjectWise) stats.subjectWise = {};
    if (!stats.subjectWise[subj]) {
      stats.subjectWise[subj] = { correct: 0, wrong: 0, total: 0 };
    }
    stats.subjectWise[subj].total += 1;
    if (attemptData.isCorrect) {
      stats.subjectWise[subj].correct += 1;
    } else {
      stats.subjectWise[subj].wrong += 1;
    }
  }

  await set(statsRef, stats);
}

async function getUserSessions(uid, limit = 50) {
  const sessionsRef = query(ref(db, `sessions/${uid}`), orderByChild("timestamp"), limitToLast(limit));
  const snap = await get(sessionsRef);
  if (!snap.exists()) return [];
  const sessions = [];
  snap.forEach((child) => {
    sessions.push({ id: child.key, ...child.val() });
  });
  return sessions.reverse();
}

async function getUserAttempts(uid, limit = 100) {
  const attemptsRef = query(ref(db, `attempts/${uid}`), orderByChild("timestamp"), limitToLast(limit));
  const snap = await get(attemptsRef);
  if (!snap.exists()) return [];
  const attempts = [];
  snap.forEach((child) => {
    attempts.push({ id: child.key, ...child.val() });
  });
  return attempts.reverse();
}

async function getUserStats(uid) {
  const snap = await get(ref(db, `users/${uid}/stats`));
  return snap.exists() ? snap.val() : null;
}

function getPerformanceInsights(stats) {
  if (!stats || stats.totalQuestions === 0) {
    return {
      accuracy: 0,
      grade: "N/A",
      message: "Start practicing to see your performance insights!",
      strengths: [],
      weaknesses: [],
      recommendation: "Begin with any subject to build your foundation."
    };
  }

  const accuracy = Math.round((stats.totalCorrect / stats.totalQuestions) * 100);

  let grade, message;
  if (accuracy >= 90) { grade = "A+"; message = "Outstanding! Keep up the excellent work!"; }
  else if (accuracy >= 80) { grade = "A"; message = "Great performance! You're well prepared."; }
  else if (accuracy >= 70) { grade = "B+"; message = "Good work! Focus on weaker areas to improve."; }
  else if (accuracy >= 60) { grade = "B"; message = "Decent performance. More practice will help."; }
  else if (accuracy >= 50) { grade = "C"; message = "Average performance. Review fundamentals."; }
  else { grade = "D"; message = "Needs improvement. Focus on building concepts."; }

  const strengths = [];
  const weaknesses = [];

  if (stats.subjectWise) {
    for (const [subject, data] of Object.entries(stats.subjectWise)) {
      if (data.total === 0) continue;
      const subjAcc = Math.round((data.correct / data.total) * 100);
      const entry = { subject, accuracy: subjAcc, total: data.total, correct: data.correct };
      if (subjAcc >= 70) strengths.push(entry);
      else weaknesses.push(entry);
    }
    strengths.sort((a, b) => b.accuracy - a.accuracy);
    weaknesses.sort((a, b) => a.accuracy - b.accuracy);
  }

  let recommendation = "";
  if (weaknesses.length > 0) {
    recommendation = `Focus on: ${weaknesses.map(w => w.subject).join(", ")}. `;
  }
  if (accuracy < 60) {
    recommendation += "Review chapter notes before attempting more MCQs.";
  } else if (accuracy < 80) {
    recommendation += "Practice timed mock tests to improve speed and accuracy.";
  } else {
    recommendation += "Challenge yourself with advanced-level questions.";
  }

  return { accuracy, grade, message, strengths, weaknesses, recommendation };
}

export {
  recordAttempt,
  recordSession,
  getUserSessions,
  getUserAttempts,
  getUserStats,
  getPerformanceInsights
};
