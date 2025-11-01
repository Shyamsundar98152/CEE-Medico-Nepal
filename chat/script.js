 
    let quizData = [];
    let currentIndex = 0;
    const API_KEY = "AIzaSyDHNggVXxqZWrQXuMjZ79Y1fplT-AUbSBs"; // Your API Key
    let countdownInterval; // Variable to store the countdown interval ID

    async function generateQuiz() {
      const chapter = document.getElementById("chapter").value.trim();
      if (!chapter) {
        alert("Please enter a chapter name.");
        return;
      }

      if (chapter.length > 100) {
        alert("Chapter name is too long. Please keep it concise.");
        return;
      }

      const generateButton = document.querySelector('button[onclick="generateQuiz()"]');
      generateButton.innerText = "Loading..."; // Change button text to Loading
      generateButton.disabled = true;

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

      const prompt = `
Generate 50 NEET and CEE-Hard and Long level multiple choice questions in JSON format on the chapter "${chapter}" based on NEB and MEC syllabus Nepal. Use this format:
[
  {
    "question": "1. Sample question?",
    "options": ["A) Option A", "B) Option B", "C) Option C", "D) Option D"],
    "correct": 1,
    "explanation": "Explanation here."
  },
  // ... (up to 50 questions)
]
Ensure questions are clear, options are distinct, and explanations are concise and accurate.
`;

      try {
        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            "question": { "type": "STRING" },
                            "options": {
                                "type": "ARRAY",
                                "items": { "type": "STRING" }
                            },
                            "correct": { "type": "NUMBER" },
                            "explanation": { "type": "STRING" }
                        },
                        "propertyOrdering": ["question", "options", "correct", "explanation"]
                    }
                }
            }
        };

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`API error: ${response.status} ${response.statusText} - ${errorBody.message || 'Unknown error'}`);
        }

        const result = await response.json();
        const rawJson = result.candidates[0].content.parts[0].text;

        // Parse the JSON and initialize question state
        quizData = JSON.parse(rawJson).map(q => ({
            ...q,
            userAnswerIndex: null, // Stores the index of the option selected by the user
            isAnswered: false,    // True if the user has selected an option
            isSkipped: false      // True if the user explicitly skipped this question
        }));

        if (quizData.length === 0) {
            alert("❌ No questions were generated. The chapter might be too obscure or the API response was empty/malformed.");
            return;
        }
        
        currentIndex = 0;
        document.getElementById("quiz-results").classList.add("hidden"); // Hide results if visible
        showQuestion();
        startCountdown(); // Start countdown after quiz is loaded
      } catch (err) {
        alert("❌ Error generating quiz: " + err.message + ". Please try again or wait few minutes.");
        console.error("Quiz generation error:", err);
      } finally {
        generateButton.innerText = "Generate Quiz";
        generateButton.disabled = false;
      }
    }

    function startCountdown() {
        let timeLeft = 30; // 30 seconds countdown
        const timerDisplay = document.getElementById("countdown-timer");
        timerDisplay.classList.remove("hidden"); // Make sure timer is visible

        // Clear any existing interval to prevent multiple timers running
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }

        countdownInterval = setInterval(() => {
            timerDisplay.innerText = `Time left: ${timeLeft}s`;
            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                timerDisplay.innerText = "Time's up!";
                // Optionally, automatically move to next question or submit quiz
                // For now, it just stops the timer.
            }
            timeLeft--;
        }, 1000);
    }

    function showQuestion() {
      // Hide quiz results if visible
      document.getElementById("quiz-results").classList.add("hidden");
      document.getElementById("quiz-container").classList.remove("hidden");

      // Update navigation button visibility
      document.getElementById("previous-button").disabled = currentIndex === 0;
      document.getElementById("next-button").classList.remove("hidden");
      document.getElementById("skip-button").classList.remove("hidden");
      document.getElementById("submit-button").classList.add("hidden");

      if (currentIndex >= quizData.length) {
        // If all questions are shown, show submit button
        document.getElementById("next-button").classList.add("hidden");
        document.getElementById("skip-button").classList.add("hidden");
        document.getElementById("submit-button").classList.remove("hidden");
        clearInterval(countdownInterval); // Stop timer when quiz is finished
        document.getElementById("countdown-timer").classList.add("hidden"); // Hide timer
        return;
      }

      const q = quizData[currentIndex];
      document.getElementById("question-num").innerText = `Question ${currentIndex + 1} of ${quizData.length}`;
      document.getElementById("question-text").innerText = q.question;

      const explanationElement = document.getElementById("explanation");
      explanationElement.innerText = "";
      explanationElement.className = ""; // Clear previous classes

      const optionsBox = document.getElementById("options-container");
      optionsBox.innerHTML = ""; // Clear previous options

      q.options.forEach((opt, i) => {
        const btn = document.createElement("button");
        btn.innerText = opt;
        btn.className = "option-btn";
        btn.onclick = () => { selectOption(i); }; // Use a dedicated function for option selection
        optionsBox.appendChild(btn);
      });

      // Restore previous state if question was answered or skipped
      if (q.isAnswered) {
        highlightAnswer(q.userAnswerIndex, q.correct);
        Array.from(optionsBox.children).forEach(optionBtn => {
          optionBtn.disabled = true; // Disable options if already answered
        });
        const isCorrect = q.userAnswerIndex === q.correct;
        explanationElement.innerText = (isCorrect ? "✅ Correct! " : "❌ Incorrect! The correct answer was " + q.options[q.correct] + ". ") + (q.explanation || "");
        explanationElement.classList.add(isCorrect ? "correct" : "incorrect");
      } else if (q.isSkipped) {
        explanationElement.innerText = "This question was skipped.";
        explanationElement.classList.remove("correct", "incorrect"); // Ensure no lingering colors
      }
      startCountdown(); // Restart countdown for each new question
    }

    function selectOption(selectedIndex) {
        const q = quizData[currentIndex];

        // If already answered, do nothing
        if (q.isAnswered) return;

        // Mark question as answered
        q.isAnswered = true;
        q.userAnswerIndex = selectedIndex;
        q.isSkipped = false; // If answered, it's no longer skipped

        highlightAnswer(selectedIndex, q.correct);

        const explanationElement = document.getElementById("explanation");
        const isCorrect = selectedIndex === q.correct;
        explanationElement.innerText = (isCorrect ? "✅ Correct! " : "❌ Incorrect! The correct answer was " + q.options[q.correct] + ". ") + (q.explanation || "");
        explanationElement.classList.add(isCorrect ? "correct" : "incorrect");

        // Disable all options after selection
        Array.from(document.getElementById("options-container").children).forEach(optionBtn => {
            optionBtn.disabled = true;
        });
        clearInterval(countdownInterval); // Stop timer when an option is selected
    }

    function highlightAnswer(selectedIndex, correctIndex) {
        const optionsBox = document.getElementById("options-container");
        if (selectedIndex !== correctIndex) {
            optionsBox.children[selectedIndex].style.backgroundColor = '#ffcdd2'; /* Lighter red for incorrect choice */
        }
        optionsBox.children[correctIndex].style.backgroundColor = '#c8e6c9'; /* Lighter green for correct choice */
    }

    function nextQuestion() {
      // If current question hasn't been answered or explicitly skipped, mark it as skipped
      if (!quizData[currentIndex].isAnswered && !quizData[currentIndex].isSkipped) {
          quizData[currentIndex].isSkipped = true;
      }

      currentIndex++;
      showQuestion();
    }

    function previousQuestion() {
      if (currentIndex > 0) {
        currentIndex--;
        showQuestion();
      }
    }

    function skipQuestion() {
      // Mark current question as skipped if it hasn't been answered
      if (!quizData[currentIndex].isAnswered) {
          quizData[currentIndex].isSkipped = true;
          quizData[currentIndex].userAnswerIndex = null; // Ensure no answer is recorded
      }
      currentIndex++;
      showQuestion();
    }

    function submitQuiz() {
        // Ensure the last question's state is recorded if it's the last one and not answered/skipped
        if (currentIndex === quizData.length -1 && !quizData[currentIndex].isAnswered && !quizData[currentIndex].isSkipped) {
             quizData[currentIndex].isSkipped = true;
        }

        document.getElementById("quiz-container").classList.add("hidden"); // Hide quiz
        document.getElementById("quiz-results").classList.remove("hidden"); // Show results
        clearInterval(countdownInterval); // Stop timer on submit
        document.getElementById("countdown-timer").classList.add("hidden"); // Hide timer

        let finalCorrect = 0;
        let finalWrong = 0;
        let finalSkipped = 0;

        quizData.forEach(q => {
            if (q.isAnswered) {
                if (q.userAnswerIndex === q.correct) {
                    finalCorrect++;
                } else {
                    finalWrong++;
                }
            } else if (q.isSkipped) {
                finalSkipped++;
            } else {
                // Questions not answered and not explicitly skipped (e.g., if user jumped to submit without interacting)
                finalSkipped++;
            }
        });

        document.getElementById("total-questions-result").innerText = quizData.length;
        document.getElementById("correct-answers-result").innerText = finalCorrect;
        document.getElementById("wrong-answers-result").innerText = finalWrong;
        document.getElementById("skipped-questions-result").innerText = finalSkipped;
        document.getElementById("final-score-result").innerText = finalCorrect;
        document.getElementById("max-score-result").innerText = quizData.length;
    }
 