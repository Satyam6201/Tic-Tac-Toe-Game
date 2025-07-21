const display = document.querySelector(".status");
const cells = document.querySelectorAll(".cell");
const restartBtn = document.querySelector(".restart");
const modeToggle = document.getElementById("modeToggle");

const voiceBtn = document.getElementById("voiceBtn");
const voiceStatus = document.querySelector(".voice-status");

let active = true;
let currentPlayer = "X";
let gamestatus = Array(9).fill("");

let xScore = 0, oScore = 0, drawScore = 0;

const winningConditions = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

const winningMessage = () => `Player ${currentPlayer} has won 🎉!`;
const drawMessage = () => `Game Draw 😶`;
const currentPlayerTurn = () => `It's ${currentPlayer}'s turn 🫵🏻`;

display.textContent = currentPlayerTurn();

// Toggle dark mode
modeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark");
});

// Cell click handler
cells.forEach(cell => cell.addEventListener("click", handleCellClick));
restartBtn.addEventListener("click", handleRestartGame);

// Play audio feedback for clicks
function playClickSound() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
  oscillator.connect(audioCtx.destination);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.1);
}

// Play sound for win
function playWinSound() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(700, audioCtx.currentTime);
  oscillator.connect(audioCtx.destination);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.4);
}

// Play sound for draw
function playDrawSound() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
  oscillator.connect(audioCtx.destination);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.3);
}

function handleCellClick(e) {
  const cell = e.target;
  const index = parseInt(cell.getAttribute("data-cell-index"));
  if (gamestatus[index] !== "" || !active) return;

  updateCell(cell, index);
  playClickSound();
  handleResultValidation();
}

function updateCell(cell, index) {
  gamestatus[index] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.classList.add("clicked");
}

function handleResultValidation() {
  let roundWon = false;
  let winCombo = [];

  for (let i = 0; i < winningConditions.length; i++) {
    const [a, b, c] = winningConditions[i];
    if (gamestatus[a] && gamestatus[a] === gamestatus[b] && gamestatus[a] === gamestatus[c]) {
      roundWon = true;
      winCombo = [a, b, c];
      break;
    }
  }

  if (roundWon) {
    display.textContent = winningMessage();
    active = false;
    winCombo.forEach(index => cells[index].classList.add("winner"));
    updateScore(currentPlayer);
    playWinSound();
    return;
  }

  if (!gamestatus.includes("")) {
    display.textContent = drawMessage();
    active = false;
    drawScore++;
    document.getElementById("drawScore").textContent = drawScore;
    playDrawSound();
    return;
  }

  handlePlayerChange();
}

function handlePlayerChange() {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  display.textContent = currentPlayerTurn();
}

function handleRestartGame() {
  active = true;
  currentPlayer = "X";
  gamestatus = Array(9).fill("");
  display.textContent = currentPlayerTurn();
  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("winner", "clicked");
  });
}

function updateScore(player) {
  if (player === "X") {
    xScore++;
    document.getElementById("xScore").textContent = xScore;
  } else {
    oScore++;
    document.getElementById("oScore").textContent = oScore;
  }
}

// ===== Voice Command Feature =====

// Check for browser support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition;
let recognizing = false;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    recognizing = true;
    voiceStatus.textContent = "Listening...";
    voiceBtn.textContent = "🎙️ Stop Voice Command";
    voiceBtn.style.backgroundColor = "var(--button-hover)";
    console.log("Voice recognition started");
  };

  recognition.onend = () => {
    recognizing = false;
    voiceStatus.textContent = "";
    voiceBtn.textContent = "🎤 Start Voice Command";
    voiceBtn.style.backgroundColor = "var(--button-gradient)";
    console.log("Voice recognition ended");
  };

  recognition.onerror = (event) => {
    voiceStatus.textContent = `Error: ${event.error}`;
    console.error("Speech recognition error:", event.error);
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase().trim();
    voiceStatus.textContent = `Heard: "${transcript}"`;
    console.log("Transcript:", transcript);
    handleVoiceCommand(transcript);
  };
} else {
  voiceBtn.disabled = true;
  voiceStatus.textContent = "Voice commands not supported in this browser.";
}

voiceBtn.addEventListener("click", () => {
  if (!recognizing) {
    recognition.start();
  } else {
    recognition.stop();
  }
});

function handleVoiceCommand(command) {
  const regex = /(?:place|put|mark|set|move)\s([xo])\s(?:on|in|at|to)?\s?(\d)/;
  const match = command.match(regex);

  if (!match) {
    voiceStatus.textContent = "Command not recognized. Try 'Place X on 1'.";
    return;
  }

  const player = match[1].toUpperCase();
  const pos = parseInt(match[2]) - 1;

  if (!active) {
    voiceStatus.textContent = "Game is over. Please restart to play again.";
    return;
  }

  if (player !== currentPlayer) {
    voiceStatus.textContent = `It's not Player ${player}'s turn!`;
    return;
  }

  if (pos < 0 || pos > 8) {
    voiceStatus.textContent = "Position must be between 1 and 9.";
    return;
  }

  if (gamestatus[pos] !== "") {
    voiceStatus.textContent = `Cell ${pos + 1} is already occupied.`;
    return;
  }

  // Make the move - update gamestatus and UI
  gamestatus[pos] = currentPlayer;
  const cell = cells[pos];
  cell.textContent = currentPlayer;
  cell.classList.add("clicked");

  handleResultValidation();
}