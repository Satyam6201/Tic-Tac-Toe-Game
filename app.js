const cells = document.querySelectorAll(".cell");
const statusText = document.querySelector(".status");
const restartBtn = document.querySelector(".restart");
const xScoreText = document.getElementById("xScore");
const oScoreText = document.getElementById("oScore");
const drawScoreText = document.getElementById("drawScore");
const modeToggle = document.getElementById("modeToggle");
const aiToggle = document.getElementById("aiToggle");
const historyList = document.getElementById("historyList");
const voiceBtn = document.getElementById("voiceBtn");
const voiceStatus = document.querySelector(".voice-status");

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let isGameActive = true;
let vsAI = false;

let xWins = 0, oWins = 0, draws = 0;

const winConditions = [
  [0,1,2], [3,4,5], [6,7,8], 
  [0,3,6], [1,4,7], [2,5,8], 
  [0,4,8], [2,4,6]
];

initializeGame();

function initializeGame() {
  cells.forEach(cell => {
    cell.textContent = "";
    cell.addEventListener("click", cellClicked);
  });
  restartBtn.addEventListener("click", restartGame);
  modeToggle.addEventListener("change", toggleDarkMode);
  aiToggle.addEventListener("change", toggleAI);
  voiceBtn.addEventListener("click", startVoiceRecognition);

  statusText.textContent = `Player ${currentPlayer}'s turn`;
}

function cellClicked() {
  const index = this.dataset.cellIndex;
  if (board[index] !== "" || !isGameActive) return;

  board[index] = currentPlayer;
  this.textContent = currentPlayer;
  checkWinner();

  if (vsAI && isGameActive && currentPlayer === "O") {
    setTimeout(makeAIMove, 500);
  }
}

function makeAIMove() {
  let emptyCells = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
  let randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  board[randomIndex] = currentPlayer;
  cells[randomIndex].textContent = currentPlayer;
  checkWinner();
}

function checkWinner() {
  let roundWon = false;

  for (let condition of winConditions) {
    const [a, b, c] = condition;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      roundWon = true;
      break;
    }
  }

  if (roundWon) {
    isGameActive = false;
    statusText.textContent = `Player ${currentPlayer} Wins! 🎉`;
    celebrateWinner();
    updateScore(currentPlayer);
    updateHistory(`${currentPlayer} Wins`);
  } else if (!board.includes("")) {
    isGameActive = false;
    statusText.textContent = "It's a Draw!";
    draws++;
    drawScoreText.textContent = draws;
    updateHistory("Draw");
  } else {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.textContent = `Player ${currentPlayer}'s turn`;
  }
}

function updateScore(player) {
  if (player === "X") {
    xWins++;
    xScoreText.textContent = xWins;
  } else {
    oWins++;
    oScoreText.textContent = oWins;
  }
}

function updateHistory(result) {
  const li = document.createElement("li");
  li.textContent = `${result} (${new Date().toLocaleTimeString()})`;
  historyList.prepend(li);
}

function celebrateWinner() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
}

function restartGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  isGameActive = true;
  cells.forEach(cell => cell.textContent = "");
  statusText.textContent = `Player ${currentPlayer}'s turn`;
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode", modeToggle.checked);
}

function toggleAI() {
  vsAI = aiToggle.checked;
  restartGame();
}

// ------------------ Voice Command Feature ------------------
function startVoiceRecognition() {
  if (!('webkitSpeechRecognition' in window)) {
    voiceStatus.textContent = "Voice not supported.";
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();
  voiceStatus.textContent = "Listening...";

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    const match = transcript.match(/(?:place|put)\s?(x|o)\s?(on|in)?\s?(\d)/);
    
    if (match) {
      const player = match[1].toUpperCase();
      const index = parseInt(match[3]) - 1;

      if (board[index] === "" && isGameActive) {
        currentPlayer = player;
        board[index] = currentPlayer;
        cells[index].textContent = currentPlayer;
        checkWinner();
      } else {
        voiceStatus.textContent = "Invalid move.";
      }
    } else {
      voiceStatus.textContent = "Try saying: Place X on 5";
    }
  };

  recognition.onerror = () => {
    voiceStatus.textContent = "Voice recognition error.";
  };

  recognition.onend = () => {
    voiceStatus.textContent += " [Done]";
  };
}
