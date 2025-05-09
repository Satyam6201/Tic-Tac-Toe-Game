const display = document.querySelector(".status");
const cells = document.querySelectorAll(".cell");
const restartBtn = document.querySelector(".restart");

let active = true;
let currentPlayer = "X";
let gamestatus = ["", "", "", "", "", "", "", "", ""];

let xScore = 0, oScore = 0, drawScore = 0;

const winningMessage = () => `Player ${currentPlayer} has won 🎉!`;
const drawMessage = () => `Game Draw 😶`;
const currentPlayerTurn = () => `It's ${currentPlayer}'s turn 🫵🏻`;

display.innerHTML = currentPlayerTurn();

cells.forEach(cell => cell.addEventListener("click", handleCellClick));
restartBtn.addEventListener("click", handleRestartGame);

document.getElementById("modeToggle").addEventListener("change", () => {
  document.body.classList.toggle("dark");
});

function handleCellClick(e) {
  const cell = e.target;
  const index = parseInt(cell.getAttribute("data-cell-index"));
  if (gamestatus[index] !== "" || !active) return;

  gamestatus[index] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.classList.add("clicked");

  handleResultValidation();
}

const winningConditions = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

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
    display.innerHTML = winningMessage();
    active = false;
    winCombo.forEach(index => cells[index].classList.add("winner"));
    updateScore(currentPlayer);
    return;
  }

  if (!gamestatus.includes("")) {
    display.innerHTML = drawMessage();
    active = false;
    drawScore++;
    document.getElementById("drawScore").textContent = drawScore;
    return;
  }

  handlePlayerChange();
}

function handlePlayerChange() {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  display.innerHTML = currentPlayerTurn();
}

function handleRestartGame() {
  active = true;
  currentPlayer = "X";
  gamestatus = ["", "", "", "", "", "", "", "", ""];
  display.innerHTML = currentPlayerTurn();
  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("winner");
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
