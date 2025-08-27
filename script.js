// GLOBALS
let currentUser = null;
let currentParagraph = "";
let startTime = null;
let timerInterval = null;
let tickSoundLoop = null;

const welcomeScreen = document.getElementById("welcomeScreen");
const registerEmailScreen = document.getElementById("registerEmailScreen");
const registerUsernameScreen = document.getElementById("registerUsernameScreen");
const loginScreen = document.getElementById("loginScreen");
const mainApp = document.getElementById("mainApp");

const regEmailInput = document.getElementById("regEmailInput");
const regUsernameInput = document.getElementById("regUsernameInput");
const loginUsernameInput = document.getElementById("loginUsernameInput");

const regNextBtn = document.getElementById("regNextBtn");
const completeRegisterBtn = document.getElementById("completeRegisterBtn");
const loginBtn = document.getElementById("loginBtn");

const takeTestBtn = document.getElementById("takeTestBtn");
const timerSetup = document.getElementById("timerSetup");
const startTestBtn = document.getElementById("startTestBtn");
const timerInput = document.getElementById("timerInput");

const testArea = document.getElementById("testArea");
const paragraphDisplay = document.getElementById("paragraphDisplay");
const textInput = document.getElementById("textInput");
const submitBtn = document.getElementById("submitBtn");
const liveTimer = document.getElementById("liveTimer");

const resultArea = document.getElementById("resultArea");
const resultTime = document.getElementById("resultTime");
const resultAccuracy = document.getElementById("resultAccuracy");
const resultMistakes = document.getElementById("resultMistakes");
const resultWPM = document.getElementById("resultWPM");
const backToHomeBtn = document.getElementById("backToHomeBtn");

const profileIcon = document.querySelector(".profile-icon");
const profileMenu = document.getElementById("profileMenu");
const logoutBtn = document.getElementById("logoutBtn");
const viewPastBtn = document.getElementById("viewPastBtn");
const profileUsername = document.getElementById("profileUsername");

const pastTestsArea = document.getElementById("pastTestsArea");
const pastTestsList = document.getElementById("pastTestsList");
const closePastTestsBtn = document.getElementById("closePastTestsBtn");

// SOUNDS
const typeSound = new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_4b8d9f503d.mp3");
const startSound = new Audio("https://cdn.pixabay.com/download/audio/2022/10/13/audio_3e2d418527.mp3");
const tickSound = new Audio("https://cdn.pixabay.com/download/audio/2022/01/28/audio_7c8d62d8b3.mp3");
const successSound = new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_2f2ae47806.mp3");
const errorSound = new Audio("https://cdn.pixabay.com/download/audio/2022/03/21/audio_b7a0e49970.mp3");

// === LOGIN & REGISTER FLOW ===
document.getElementById("registerOptionBtn").onclick = () => {
  welcomeScreen.classList.add("hidden");
  registerEmailScreen.classList.remove("hidden");
};

document.getElementById("loginOptionBtn").onclick = () => {
  welcomeScreen.classList.add("hidden");
  loginScreen.classList.remove("hidden");
};

regNextBtn.onclick = () => {
  if (!regEmailInput.value) return alert("Enter email");
  registerEmailScreen.classList.add("hidden");
  registerUsernameScreen.classList.remove("hidden");
};

completeRegisterBtn.onclick = () => {
  const email = regEmailInput.value.trim().toLowerCase();
  const username = regUsernameInput.value.trim();
  if (!email || !username) return alert("Enter both email and username");

  let users = JSON.parse(localStorage.getItem("users") || "{}");
  if (Object.values(users).some(u => u.username === username)) {
    return alert("Username already taken");
  }

  users[email] = { username, tests: [] };
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("typingUser", JSON.stringify({ email, username }));
  currentUser = { email, username };
  startDashboard();
};

loginBtn.onclick = () => {
  const username = loginUsernameInput.value.trim();
  if (!username) return alert("Enter username");

  let users = JSON.parse(localStorage.getItem("users") || "{}");
  const email = Object.keys(users).find(e => users[e].username === username);
  if (!email) return alert("Username not found");

  localStorage.setItem("typingUser", JSON.stringify({ email, username }));
  currentUser = { email, username };
  startDashboard();
};

function startDashboard() {
  loginScreen.classList.add("hidden");
  registerUsernameScreen.classList.add("hidden");
  welcomeScreen.classList.add("hidden");
  mainApp.classList.remove("hidden");
  profileUsername.textContent = currentUser.username;
}

window.onload = () => {
  const stored = JSON.parse(localStorage.getItem("typingUser"));
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  if (stored && users[stored.email] && users[stored.email].username === stored.username) {
    currentUser = stored;
    startDashboard();
  } else {
    localStorage.removeItem("typingUser");
    welcomeScreen.classList.remove("hidden");
  }
};

// === TEST FLOW ===
takeTestBtn.onclick = () => {
  document.getElementById("dashboard").classList.add("hidden");
  timerSetup.classList.remove("hidden");
};

startTestBtn.onclick = async () => {

const startBtn = document.getElementById("startTestBtn");
startBtn.classList.add("clicked");

setTimeout(() => {
  startBtn.classList.remove("clicked");
}, 400);

document.body.classList.add("test-started");

  const duration = parseInt(timerInput.value);
  if (!duration || duration < 10) return alert("Enter valid time");

  try {
    const res = await fetch("https://baconipsum.com/api/?type=meat-and-filler&paras=1&format=text");
    const text = await res.text();
    currentParagraph = text.trim();
  } catch {
    currentParagraph = "The quick brown fox jumps over the lazy dog.";


  }

  paragraphDisplay.textContent = currentParagraph;
  liveTimer.textContent = duration;
  textInput.value = "";
  textInput.disabled = false;
  textInput.focus();


  resultArea.classList.add("hidden");

  startSound.play();
  timerSetup.classList.add("hidden");
  testArea.classList.remove("hidden");

  startTime = new Date();
  tickSoundLoop = setInterval(() => tickSound.play(), 1000);

  let remaining = duration;
  timerInterval = setInterval(() => {
    remaining--;
    liveTimer.textContent = remaining;
    if (remaining <= 0) {
      clearInterval(timerInterval);
      clearInterval(tickSoundLoop);
      handleSubmit(true);
    }
  }, 1000);
};

// 🟣 CHARACTER-LEVEL LIVE COMPARISON
textInput.addEventListener("input", () => {
  typeSound.currentTime = 0;
  typeSound.play();

  const typed = textInput.value;
  const expected = currentParagraph;

  let displayHTML = "";
  for (let i = 0; i < expected.length; i++) {
    if (i < typed.length) {
      if (typed[i] === expected[i]) {
        displayHTML += `<span style="color:white;background:#6b21a8;padding:2px;">${expected[i]}</span>`;
      } else {
        displayHTML += `<span style="color:white;background:red;padding:2px;">${expected[i]}</span>`;
      }
    } else {
      displayHTML += `<span>${expected[i]}</span>`;
    }
  }
  paragraphDisplay.innerHTML = displayHTML;
});

// ⏱️ SUBMIT
submitBtn.onclick = () => {
document.body.classList.remove("test-started");

  clearInterval(timerInterval);
  clearInterval(tickSoundLoop);
  handleSubmit(false);
};

function handleSubmit(autoSubmit) {
  const typed = textInput.value.trim();
  const expected = currentParagraph.trim();
  const endTime = new Date();
  const seconds = Math.floor((endTime - startTime) / 1000);

  let correctChars = 0;
  let mistakes = 0;
  for (let i = 0; i < expected.length; i++) {
    if (typed[i] === expected[i]) {
      correctChars++;
    } else {
      mistakes++;
    }
  }
  mistakes += Math.max(typed.length - expected.length, 0);

  const accuracy = ((correctChars / expected.length) * 100).toFixed(2);
  const wpm = Math.round((correctChars / 5) / (seconds / 60));

  resultTime.textContent = seconds;
  resultAccuracy.textContent = accuracy;
  resultMistakes.textContent = mistakes;
  resultWPM.textContent = isNaN(wpm) ? 0 : wpm;

  resultArea.classList.remove("hidden");
  testArea.classList.add("hidden");

  const users = JSON.parse(localStorage.getItem("users"));
  const user = users[currentUser.email];
  user.tests.push({ paragraph: currentParagraph, typed, timeTaken: seconds, mistakes, accuracy, wpm });
  users[currentUser.email] = user;
  localStorage.setItem("users", JSON.stringify(users));

  (mistakes <= 5 ? successSound : errorSound).play();
}

// 📘 PAST TESTS
viewPastBtn.onclick = () => {
  const users = JSON.parse(localStorage.getItem("users"));
  const user = users[currentUser.email];
  const tests = user.tests || [];
  pastTestsList.innerHTML = "";

  if (tests.length === 0) {
    pastTestsList.innerHTML = `<li style="text-align:center; color:#9333ea; font-weight:bold;">No past tests yet. Take your first test!</li>`;
  } else {
    tests.slice().reverse().forEach((t, i) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>Test ${tests.length - i}</strong><br/>
        <em>Paragraph:</em> ${t.paragraph}<br/>
        <em>Typed:</em> ${t.typed}<br/>
        ⏱️ Time: ${t.timeTaken}s | ❌ Mistakes: ${t.mistakes}<br/>
        🎯 Accuracy: ${t.accuracy}% | ⌨️ WPM: ${t.wpm}
        <hr/>
      `;
      pastTestsList.appendChild(li);
    });
  }

  document.getElementById("dashboard").classList.add("hidden");
  pastTestsArea.classList.remove("hidden");
};

closePastTestsBtn.onclick = () => {
  pastTestsArea.classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
};

backToHomeBtn.onclick = () => {
  resultArea.classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
};

logoutBtn.onclick = () => {
  localStorage.removeItem("typingUser");
  location.reload();
};
// Profile dropdown toggle
document.getElementById("profileIcon").onclick = () => {
  const menu = document.getElementById("profileMenu");
  menu.classList.toggle("hidden");
};

