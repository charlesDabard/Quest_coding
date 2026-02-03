const { ipcRenderer } = require("electron");

// ── Challenge definitions ──
const CHALLENGES = [
  // Simple buttons
  { id: "cross",     name: "X",           desc: "Appuie sur X. C'est le bouton pour dire oui.", check: (e) => e.buttonId === "cross" && noMod(e) },
  { id: "circle",    name: "O",           desc: "Appuie sur le rond. Celui pour parler.", check: (e) => e.buttonId === "circle" && noMod(e) },
  { id: "square",    name: "Carre",       desc: "Appuie sur le carre. Celui pour effacer.", check: (e) => e.buttonId === "square" && noMod(e) },
  { id: "triangle",  name: "Triangle",    desc: "Appuie sur le triangle. Le chapeau pointu.", check: (e) => e.buttonId === "triangle" && noMod(e) },

  // D-pad
  { id: "dpad_up",    name: "D-pad Haut",    desc: "La croix directionnelle. En haut.", check: (e) => e.buttonId === "dpad_up" },
  { id: "dpad_down",  name: "D-pad Bas",     desc: "La croix directionnelle. En bas.", check: (e) => e.buttonId === "dpad_down" },
  { id: "dpad_left",  name: "D-pad Gauche",  desc: "La croix directionnelle. A gauche.", check: (e) => e.buttonId === "dpad_left" },
  { id: "dpad_right", name: "D-pad Droite",  desc: "La croix directionnelle. A droite.", check: (e) => e.buttonId === "dpad_right" },

  // Small buttons
  { id: "options",  name: "Options",   desc: "Le petit bouton Options a droite.", check: (e) => e.buttonId === "options" },
  { id: "create",   name: "Create",    desc: "Le petit bouton Create a gauche.", check: (e) => e.buttonId === "create" },
  { id: "mute",     name: "Mute",      desc: "Le bouton micro sous le touchpad.", check: (e) => e.buttonId === "mute" },
  { id: "touchpad", name: "Touchpad",  desc: "Clique sur le gros touchpad au milieu.", check: (e) => e.buttonId === "touchpad" },
  { id: "l3",       name: "L3",        desc: "Clique sur le stick gauche. Appuie dessus.", check: (e) => e.buttonId === "l3" },
  { id: "r3",       name: "R3",        desc: "Clique sur le stick droit. Appuie dessus.", check: (e) => e.buttonId === "r3" },

  // Combos - Square
  { id: "r1_square",     name: "R1 + Carre",       desc: "Tiens R1 et appuie sur carre. Ca efface un mot.", check: (e) => e.buttonId === "square" && e.held.r1 },
  { id: "r2_square",     name: "R2 + Carre",       desc: "Tiens R2 et appuie sur carre. Ca efface une ligne.", check: (e) => e.buttonId === "square" && e.held.r2 && !e.held.l2 },
  { id: "l2r2_square",   name: "L2 + R2 + Carre",  desc: "Tiens L2 et R2 en meme temps, puis carre. Ca efface TOUT.", check: (e) => e.buttonId === "square" && e.held.l2 && e.held.r2 },

  // Combos - Cross
  { id: "r1_cross",  name: "R1 + X",  desc: "Tiens R1 et appuie sur X. Ca tient le clic souris.", check: (e) => e.buttonId === "cross" && e.held.r1 },
  { id: "r2_cross",  name: "R2 + X",  desc: "Tiens R2 et appuie sur X. Pour selectionner du texte.", check: (e) => e.buttonId === "cross" && e.held.r2 },

  // Combos - Triangle
  { id: "l1_triangle", name: "L1 + Triangle", desc: "Tiens L1 et appuie sur triangle. C'est l'espace.", check: (e) => e.buttonId === "triangle" && e.held.l1 },
  { id: "r1_triangle", name: "R1 + Triangle", desc: "Tiens R1 et appuie sur triangle. C'est echap.", check: (e) => e.buttonId === "triangle" && e.held.r1 },
  { id: "r2_triangle", name: "R2 + Triangle", desc: "Tiens R2 et appuie sur triangle. C'est Spotlight.", check: (e) => e.buttonId === "triangle" && e.held.r2 },

  // Sticks
  { id: "stick_l_left",  name: "Stick gauche ←",  desc: "Pousse le stick gauche a fond a gauche.", check: (e) => e.stickX < -0.7, type: "stick" },
  { id: "stick_l_right", name: "Stick gauche →",  desc: "Pousse le stick gauche a fond a droite.", check: (e) => e.stickX > 0.7, type: "stick" },
  { id: "stick_l_up",    name: "Stick gauche ↑",  desc: "Pousse le stick gauche a fond en haut.", check: (e) => e.stickY > 0.7, type: "stick" },
  { id: "stick_l_down",  name: "Stick gauche ↓",  desc: "Pousse le stick gauche a fond en bas.", check: (e) => e.stickY < -0.7, type: "stick" },
  { id: "stick_r_left",  name: "Stick droit ←",   desc: "Pousse le stick droit a fond a gauche.", check: (e) => e.rStickX < -0.7, type: "stick" },
  { id: "stick_r_right", name: "Stick droit →",   desc: "Pousse le stick droit a fond a droite.", check: (e) => e.rStickX > 0.7, type: "stick" },

  // Both sticks
  { id: "both_left",  name: "2 Sticks ← ←",  desc: "Les DEUX sticks a fond a gauche. En meme temps. Pour changer de bureau.", check: (e) => e.stickX < -0.7 && e.rStickX < -0.7, type: "stick" },
  { id: "both_right", name: "2 Sticks → →",  desc: "Les DEUX sticks a fond a droite. En meme temps. Pour changer de bureau.", check: (e) => e.stickX > 0.7 && e.rStickX > 0.7, type: "stick" },
];

function noMod(e) {
  return !e.held.l1 && !e.held.r1 && !e.held.l2 && !e.held.r2;
}

// ── Game state ──
let challenges = [];
let currentIndex = 0;
let score = 0;
let streak = 0;
let bestStreak = 0;
let done = false;

const TOTAL = 20; // challenges per round

// ── DOM ──
const gameArea = document.getElementById("game-area");
const stepLabel = document.getElementById("step-label");
const actionName = document.getElementById("action-name");
const actionDesc = document.getElementById("action-desc");
const hint = document.getElementById("hint");
const progress = document.getElementById("progress");
const scoreEl = document.getElementById("score");
const streakEl = document.getElementById("streak");
const bestStreakEl = document.getElementById("best-streak");
const doneScreen = document.getElementById("done-screen");
const doneSub = document.getElementById("done-sub");
const restartBtn = document.getElementById("restart-btn");

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startGame() {
  challenges = shuffle(CHALLENGES).slice(0, TOTAL);
  currentIndex = 0;
  score = 0;
  streak = 0;
  bestStreak = 0;
  done = false;

  doneScreen.classList.remove("visible");
  gameArea.style.display = "flex";

  updateUI();
}

function updateUI() {
  const c = challenges[currentIndex];
  stepLabel.textContent = `${currentIndex + 1} / ${TOTAL}`;
  actionName.textContent = c.name;
  actionDesc.textContent = c.desc;
  hint.textContent = c.type === "stick" ? "Bouge le stick..." : "Appuie maintenant...";
  progress.style.width = `${(currentIndex / TOTAL) * 100}%`;
  scoreEl.textContent = score;
  streakEl.textContent = streak;
  bestStreakEl.textContent = bestStreak;
}

function onSuccess() {
  score++;
  streak++;
  if (streak > bestStreak) bestStreak = streak;

  // Flash
  gameArea.classList.add("success");
  hint.textContent = "BRAVO !";

  setTimeout(() => {
    gameArea.classList.remove("success");
    currentIndex++;

    if (currentIndex >= TOTAL) {
      endGame();
    } else {
      updateUI();
    }
  }, 600);
}

function endGame() {
  done = true;
  gameArea.style.display = "none";
  doneScreen.classList.add("visible");
  doneSub.textContent = `Score: ${score}/${TOTAL} — Meilleur streak: ${bestStreak}`;
  progress.style.width = "100%";
  scoreEl.textContent = score;
  streakEl.textContent = streak;
  bestStreakEl.textContent = bestStreak;
}

// ── Input handling ──
ipcRenderer.on("game-input", (_event, data) => {
  if (done) return;
  if (currentIndex >= TOTAL) return;

  const c = challenges[currentIndex];
  if (c.check(data)) {
    onSuccess();
  }
});

restartBtn.addEventListener("click", startGame);

// ── Start ──
startGame();
