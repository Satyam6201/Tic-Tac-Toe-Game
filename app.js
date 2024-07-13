const display = document.querySelector(".status");

let active = true;
let currentPlayer = "0";
let gamestatus = ["","","","","","","","",""];

const winningMessage = () => `Player ${currentPlayer} has won!`;
const drawMessage = () => `Game ended match is draw!`;
const currentPlayerturn = () => `It's ${currentPlayer}'s Turn`;

display.innerHTML = currentPlayerturn();

document.querySelectorAll(".cell")
.forEach(cell => cell.addEventListener('click' ,handleCellClick ));
document.querySelector(".restart")
.addEventListener('click' , handleRestartGame);

function handleCellClick (clickedCellEvent){
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(
        clickedCell.getAttribute('data-cell-index')
    );
    if (gamestatus[clickedCellIndex] !== "" || !active) {
        return;
    };
    handleCellPlayed (clickedCell , clickedCellIndex);
    handleResultValidation();
};

function handleCellPlayed (clickedCell ,clickedCellIndex ){
    gamestatus [ clickedCellIndex] = currentPlayer;
    clickedCell.innerHTML = currentPlayer;
};

const winningCondition = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6]
];
function handleResultValidation(){
   let roundWon = false;
    for (let i = 0; i<=7; i++){
        const winCondition = winningCondition[i];
        let a = gamestatus[winCondition[0]];
        let b = gamestatus[winCondition[1]];
        let c = gamestatus[winCondition[2]];

        if (a === "" || b === "" || c === "") {
            continue;
        };
        if (a === b && b === c) {
            roundWon = true;
            break;
        };
    };
    if (roundWon) {
        display.innerHTML = winningMessage();
        active = false;
        return;
    };
    let roundDraw = !gamestatus.includes("");
    if (roundDraw) {
        display.innerHTML = drawMessage();
        active = false;
        return;
    };

    handlePlayerChange();
};

function handlePlayerChange() {
    currentPlayer = currentPlayer === "X" ? "O": "X";
    display.innerHTML = currentPlayerturn();
};
function handleRestartGame() {
    active = true;
    gamestatus = ["","","","","","","","",""];
    display.innerHTML = currentPlayerturn();
    document.querySelectorAll(".cell")
    .forEach(cell => cell.innerHTML = "");
};

