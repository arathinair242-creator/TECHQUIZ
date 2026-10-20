
const questions = [
    {
        category: "COMPUTER BASICS",
        question: "Which component is known as the brain of a computer?",
        options: ["RAM", "CPU", "Hard Disk", "Monitor"],
        answer: 1
    },
    {
        category: "INTERNET",
        question: "What does URL stand for?",
        options: [
            "Universal Reference Link",
            "Uniform Resource Locator",
            "Unified Routing Language",
            "Universal Retrieval Location"
        ],
        answer: 1
    },
    {
        category: "PROGRAMMING",
        question: "Which of the following is a programming language?",
        options: ["HTML", "HTTP", "Python", "Wi-Fi"],
        answer: 2
    },
    {
        category: "COMPUTER BASICS",
        question: "Which type of memory loses its data when the power is turned off?",
        options: ["ROM", "SSD", "Hard Disk", "RAM"],
        answer: 3
    },
    {
        category: "INTERNET",
        question: "What is the primary purpose of a web browser?",
        options: [
            "To create computer hardware",
            "To access and display websites",
            "To increase RAM capacity",
            "To compile Java programs"
        ],
        answer: 1
    },
    {
        category: "PROGRAMMING",
        question: "Which symbol is commonly used to end a statement in Java?",
        options: [".", ":", ";", ","],
        answer: 2
    },
    {
        category: "CYBERSECURITY",
        question: "Which of these is the strongest password?",
        options: [
            "password123",
            "12345678",
            "yourname2026",
            "R7!qP2#vL9@x"
        ],
        answer: 3
    },
    {
        category: "DATABASE",
        question: "Which language is commonly used to query relational databases?",
        options: ["SQL", "CSS", "XML", "PHP only"],
        answer: 0
    },
    {
        category: "WEB DEVELOPMENT",
        question: "Which technology is primarily used to style web pages?",
        options: ["HTML", "CSS", "SQL", "Python"],
        answer: 1
    },
    {
        category: "COMPUTER NETWORKS",
        question: "What does Wi-Fi allow devices to do?",
        options: [
            "Connect to a network wirelessly",
            "Print without any software",
            "Increase processor speed",
            "Store unlimited files"
        ],
        answer: 0
    }
];

const TOTAL_TIME = 10 * 60;
const POINTS_PER_QUESTION = 10;

let userName = "";
let userEmail = "";
let currentQuestion = 0;
let userAnswers = Array(questions.length).fill(null);
let timeLeft = TOTAL_TIME;
let timerInterval = null;
let quizFinished = false;

const $ = (id) => document.getElementById(id);

const loginScreen = $("loginScreen");
const quizScreen = $("quizScreen");
const resultScreen = $("resultScreen");
const confirmModal = $("confirmModal");

// LOGIN
$("loginForm").addEventListener("submit", (event) => {
    event.preventDefault();

    userName = $("userName").value.trim();
    userEmail = $("userEmail").value.trim();

    if (!userName || !$("userEmail").checkValidity()) {
        return;
    }

    currentQuestion = 0;
    userAnswers = Array(questions.length).fill(null);
    timeLeft = TOTAL_TIME;
    quizFinished = false;

    $("greetingName").textContent = userName.split(/\s+/)[0];
    showScreen("quiz");
    renderQuestion();
    startTimer();
});

function showScreen(screen) {
    loginScreen.classList.toggle("hidden", screen !== "login");
    quizScreen.classList.toggle("hidden", screen !== "quiz");
    resultScreen.classList.toggle("hidden", screen !== "result");
    confirmModal.classList.add("hidden");

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// DISPLAY QUESTIONS
function renderQuestion() {
    const q = questions[currentQuestion];

    $("questionCounter").textContent =
        `QUESTION ${String(currentQuestion + 1).padStart(2, "0")} OF ${questions.length}`;

    $("categoryTag").textContent = q.category;
    $("questionPoints").textContent = `${POINTS_PER_QUESTION} POINTS`;
    $("questionText").textContent = q.question;

    const optionsContainer = $("optionsContainer");
    optionsContainer.replaceChildren();

    q.options.forEach((optionText, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "option";
        button.setAttribute("aria-pressed", "false");

        if (userAnswers[currentQuestion] === index) {
            button.classList.add("selected");
            button.setAttribute("aria-pressed", "true");
        }

        const letter = document.createElement("span");
        letter.className = "option-letter";
        letter.textContent = String.fromCharCode(65 + index);

        const text = document.createElement("span");
        text.className = "option-text";
        text.textContent = optionText;

        const check = document.createElement("span");
        check.className = "option-check";
        check.textContent = "✓";
        check.setAttribute("aria-hidden", "true");

        button.append(letter, text, check);

        button.addEventListener("click", () => {
            if (quizFinished) return;

            userAnswers[currentQuestion] = index;
            renderQuestion();
        });

        optionsContainer.appendChild(button);
    });

    $("prevBtn").disabled = currentQuestion === 0;

    $("nextBtn").textContent =
        currentQuestion === questions.length - 1
            ? "Review & Submit →"
            : "Next Question →";

    $("selectionHint").textContent =
        userAnswers[currentQuestion] === null
            ? "Select an answer to continue"
            : "Answer saved ✓";

    updateProgress();
    renderQuestionGrid();
}

function updateProgress() {
    const answered = userAnswers.filter(a => a !== null).length;
    const percentage = (answered / questions.length) * 100;

    $("answeredCounter").textContent =
        `${answered} of ${questions.length} answered`;

    $("progressBar").style.width = `${percentage}%`;

    const remaining = questions.length - answered;

    $("remainingText").textContent =
        remaining === 0
            ? "All questions answered. You're ready to submit!"
            : `You have ${remaining} unanswered question${remaining === 1 ? "" : "s"}.`;
}

function renderQuestionGrid() {
    const grid = $("questionGrid");
    grid.replaceChildren();

    questions.forEach((question, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "question-number";
        button.textContent = String(index + 1);
        button.setAttribute("aria-label", `Go to question ${index + 1}`);

        if (userAnswers[index] !== null) {
            button.classList.add("answered");
        }

        if (index === currentQuestion) {
            button.classList.add("current");
            button.setAttribute("aria-current", "step");
        }

        button.addEventListener("click", () => {
            currentQuestion = index;
            renderQuestion();
        });

        grid.appendChild(button);
    });
}

// NAVIGATION
$("prevBtn").addEventListener("click", () => {
    if (currentQuestion > 0) {
        currentQuestion--;
        renderQuestion();
    }
});

$("nextBtn").addEventListener("click", () => {
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        renderQuestion();
    } else {
        openSubmitConfirmation();
    }
});

// TIMER
function startTimer() {
    clearInterval(timerInterval);
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        if (quizFinished) {
            clearInterval(timerInterval);
            return;
        }

        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            finishQuiz(true);
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    $("timer").textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    $("timer").parentElement.parentElement.classList.toggle(
        "urgent", timeLeft <= 60
    );
}

// SUBMISSION
$("submitBtn").addEventListener("click", openSubmitConfirmation);

function openSubmitConfirmation() {
    if (quizFinished) return;

    const unanswered = userAnswers.filter(a => a === null).length;

    $("modalMessage").textContent = unanswered
        ? `You have ${unanswered} unanswered question${unanswered === 1 ? "" : "s"}. They will receive zero points. Submit your quiz now?`
        : "You have answered every question. Submit your quiz to see your results.";

    confirmModal.classList.remove("hidden");
    $("confirmSubmit").focus();
}

$("cancelSubmit").addEventListener("click", () => {
    confirmModal.classList.add("hidden");
});

$("confirmSubmit").addEventListener("click", () => {
    finishQuiz(false);
});

// SCORE CALCULATION
function finishQuiz(timeExpired = false) {
    if (quizFinished) return;

    quizFinished = true;
    clearInterval(timerInterval);
    confirmModal.classList.add("hidden");

    const correct = userAnswers.reduce((count, answer, index) => {
        return count + (answer === questions[index].answer ? 1 : 0);
    }, 0);

    const incorrect = userAnswers.reduce((count, answer, index) => {
        return count + (
            answer !== null && answer !== questions[index].answer ? 1 : 0
        );
    }, 0);

    const unanswered = questions.length - correct - incorrect;
    const score = correct * POINTS_PER_QUESTION;
    const percentage = Math.round((correct / questions.length) * 100);

    $("resultUser").textContent = userName;
    $("scoreValue").textContent = score;
    $("scorePercentage").textContent = `${percentage}%`;
    $("correctCount").textContent = correct;
    $("incorrectCount").textContent = incorrect;
    $("unansweredCount").textContent = unanswered;

    $("scoreRing").style.setProperty("--score-angle", `${percentage * 3.6}deg`);

    if (percentage >= 90) {
        $("resultTitle").textContent = "Outstanding work!";
        $("scoreMessage").textContent = "Excellent! You've demonstrated impressive technology knowledge.";
    } else if (percentage >= 70) {
        $("resultTitle").textContent = "Great job!";
        $("scoreMessage").textContent = "You're building a strong technology foundation. Keep going!";
    } else if (percentage >= 50) {
        $("resultTitle").textContent = "Good effort!";
        $("scoreMessage").textContent = "You're on your way. Review the answers and strengthen your skills.";
    } else {
        $("resultTitle").textContent = "Keep learning!";
        $("scoreMessage").textContent = "Every quiz is a chance to improve. Review the explanations and try again.";
    }

    $("resultSubtitle").textContent = timeExpired
        ? "Time ran out. Here are your results."
        : "Your quiz has been evaluated successfully.";

    renderAnswerReview();
    showScreen("result");
}

function renderAnswerReview() {
    const container = $("reviewContainer");
    container.replaceChildren();

    questions.forEach((q, index) => {
        const selected = userAnswers[index];
        const isCorrect = selected === q.answer;
        const isUnanswered = selected === null;

        const item = document.createElement("article");
        item.className = "review-item";

        const top = document.createElement("div");
        top.className = "review-item-top";

        const heading = document.createElement("h3");
        heading.textContent = `${index + 1}. ${q.question}`;

        const status = document.createElement("span");
        status.className = "review-status " + (
            isUnanswered
                ? "status-unanswered"
                : isCorrect
                    ? "status-correct"
                    : "status-incorrect"
        );
        status.textContent = isUnanswered
            ? "UNANSWERED"
            : isCorrect
                ? "CORRECT"
                : "INCORRECT";

        top.append(heading, status);

        const answers = document.createElement("div");
        answers.className = "review-answer";

        const yourAnswer = document.createElement("p");
        yourAnswer.textContent = "Your answer: ";

        const yourAnswerText = document.createElement("strong");
        yourAnswerText.textContent = isUnanswered
            ? "Not answered"
            : q.options[selected];

        yourAnswer.appendChild(yourAnswerText);

        const correctAnswer = document.createElement("p");
        correctAnswer.textContent = "Correct answer: ";

        const correctAnswerText = document.createElement("strong");
        correctAnswerText.className = "right-answer";
        correctAnswerText.textContent = q.options[q.answer];

        correctAnswer.appendChild(correctAnswerText);

        answers.append(yourAnswer, correctAnswer);
        item.append(top, answers);
        container.appendChild(item);
    });
}

// RESTART
$("restartBtn").addEventListener("click", () => {
    clearInterval(timerInterval);

    currentQuestion = 0;
    userAnswers = Array(questions.length).fill(null);
    timeLeft = TOTAL_TIME;
    quizFinished = false;

    showScreen("quiz");
    renderQuestion();
    startTimer();
});
