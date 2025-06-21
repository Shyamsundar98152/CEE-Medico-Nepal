const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Set your quiz open time (UTC)
const QUIZ_OPEN_TIME = new Date('2025-06-21T20:22:00Z').getTime();

// Update quiz settings
exports.setQuizTimes = functions.https.onRequest(async (req, res) => {
  await admin.database().ref('quiz_settings').set({
    open_time: QUIZ_OPEN_TIME,
    server_time: Date.now()
  });
  res.send('Quiz times updated!');
});

// Check quiz availability
exports.checkQuizAvailability = functions.https.onCall((data, context) => {
  const now = Date.now();
  return {
    is_available: now >= QUIZ_OPEN_TIME,
    server_time: now,
    open_time: QUIZ_OPEN_TIME
  };
});

// Update server time periodically
exports.updateServerTime = functions.pubsub.schedule('every 1 minutes').onRun(async (context) => {
  await admin.database().ref('quiz_settings/server_time').set(Date.now());
  return null;
});
