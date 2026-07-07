let questions = [];
let currentIndex = 0;
let score = 0;
let wrongAnswers = [];
let answered = false;

const $ = id => document.getElementById(id);

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startQuiz(sessionIds) {
  questions = [];
  SESSIONS.forEach(s => {
    if (sessionIds === "all" || sessionIds.includes(s.id)) {
      s.questions.forEach(q => questions.push({ ...q, sessionTitle: s.title }));
    }
  });
  questions = shuffle(questions);
  currentIndex = 0;
  score = 0;
  wrongAnswers = [];
  showScreen("quiz");
  renderQuestion();
}

function renderQuestion() {
  const q = questions[currentIndex];
  answered = false;

  $("q-num").textContent = `問 ${currentIndex + 1} / ${questions.length}`;
  $("q-text").textContent = q.text;
  $("feedback").classList.remove("show");
  $("next-btn").style.display = "none";

  const pct = (currentIndex / questions.length) * 100;
  $("progress-fill").style.width = pct + "%";
  $("progress-label").textContent = `${currentIndex + 1} / ${questions.length}`;
}

function answer(userChoice) {
  if (answered) return;
  answered = true;

  const q = questions[currentIndex];
  const isCorrect = (userChoice === q.correct);

  const badge = $("feedback-badge");
  const correctAns = $("correct-answer");

  if (isCorrect) {
    score++;
    badge.className = "feedback-badge correct";
    badge.textContent = "正解！";
    correctAns.innerHTML = q.correct
      ? "この文は<strong>正しい（○）</strong>です。"
      : "この文は<strong>間違い（✗）</strong>です。" + (q.explanation ? `<br>${q.explanation}` : "");
  } else {
    badge.className = "feedback-badge wrong";
    badge.textContent = "不正解";
    const correctStr = q.correct ? "○（正しい）" : "✗（間違い）";
    correctAns.innerHTML = `正解は<strong>${correctStr}</strong>` +
      (q.explanation ? `<br><br>${q.explanation}` : "");
    wrongAnswers.push(q);
  }

  $("feedback").classList.add("show");
  $("next-btn").style.display = "block";
  $("next-btn").textContent = currentIndex < questions.length - 1 ? "次の問題 →" : "結果を見る";
}

function nextQuestion() {
  currentIndex++;
  if (currentIndex >= questions.length) {
    showResult();
  } else {
    renderQuestion();
  }
}

function showResult() {
  showScreen("result");

  const pct = Math.round((score / questions.length) * 100);
  $("result-score").textContent = pct + "%";
  $("result-label").textContent = `${questions.length}問中 ${score}問正解`;
  $("stat-correct").textContent = score;
  $("stat-wrong").textContent = questions.length - score;

  const list = $("wrong-list-items");
  list.innerHTML = "";

  if (wrongAnswers.length === 0) {
    $("wrong-section").style.display = "none";
  } else {
    $("wrong-section").style.display = "block";
    wrongAnswers.forEach(q => {
      const div = document.createElement("div");
      div.className = "wrong-item";
      div.innerHTML = `<div class="wi-q">${q.text}</div>` +
        (q.explanation ? `<div class="wi-a">${q.explanation}</div>` : `<div class="wi-a">正解は${q.correct ? "○" : "✗"}</div>`);
      list.appendChild(div);
    });
  }
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  $(id).classList.add("active");
}

function buildHome() {
  const list = $("session-list");
  list.innerHTML = "";
  SESSIONS.forEach(s => {
    const btn = document.createElement("button");
    btn.className = "session-btn";
    btn.innerHTML = `<span class="session-name">${s.title}</span><span class="session-count">${s.questions.length}問</span>`;
    btn.onclick = () => startQuiz([s.id]);
    list.appendChild(btn);
  });
}

document.addEventListener("keydown", e => {
  const active = document.querySelector(".screen.active")?.id;

  if (active === "quiz") {
    if (!answered && (e.key === "o" || e.key === "O" || e.key === "1")) {
      answer(true);
    } else if (!answered && (e.key === "x" || e.key === "X" || e.key === "2")) {
      answer(false);
    } else if (answered && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      nextQuestion();
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  buildHome();
  showScreen("home");

  $("start-all").onclick = () => startQuiz("all");
  $("btn-circle").onclick = () => answer(true);
  $("btn-cross").onclick = () => answer(false);
  $("next-btn").onclick = nextQuestion;
  $("back-home").onclick = () => showScreen("home");
  $("retry-btn").onclick = () => {
    const ids = [...new Set(questions.map(q => {
      const s = SESSIONS.find(s => s.questions.some(sq => sq.text === q.text));
      return s ? s.id : null;
    }).filter(Boolean))];
    startQuiz(ids.length === SESSIONS.length ? "all" : ids);
  };
  $("retry-wrong-btn").onclick = () => {
    if (wrongAnswers.length === 0) return;
    questions = shuffle([...wrongAnswers]);
    currentIndex = 0;
    score = 0;
    wrongAnswers = [];
    showScreen("quiz");
    renderQuestion();
  };
  $("home-btn").onclick = () => showScreen("home");
});
