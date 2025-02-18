let board = [];
let gameState = [];
let currentPlayer = 0;

const CENTERX = 375;
const CENTERY = 375;
const RADIUSSTEP = 100;
const SECTIONS = 6;
const NCIRCLE = 3;
let canMove = true;


initializeGameBoard();


const themeToggleButton = document.querySelector(".theme-toggle");
const body = document.body;
const statusMessage = document.querySelector(".status-message");
const currentPlayerDisplay = document.getElementById("current-player");
const gameModeSelect = document.getElementById("game-mode");
let gameMode = "human";  //default

gameModeSelect.addEventListener("change", (e) => {
    gameMode = e.target.value;
    resetGameNoReload();
});

themeToggleButton.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    body.classList.toggle("light-mode");
    themeToggleButton.textContent = body.classList.contains("dark-mode") ? "Light Mode" : "Dark Mode";
});




function updateStatusMessage() {
    console.log("updated");
    const playerText = currentPlayer === 0 ? "Player 1" : (gameMode === "human" ? "Player 2" : "Computer");
    currentPlayerDisplay.textContent = playerText;
}


function isBoardFull() {
    for (let i = 0; i < NCIRCLE; i++) {
        for (let j = 0; j < SECTIONS; j++) {
            if (gameState[i][j] === -1) {
                return false;
            }
        }
    }
    return true;
}

function initializeGameBoard() {
    for (let i = 0; i < NCIRCLE; i++) {
        board[i] = [];
        gameState[i] = Array(SECTIONS).fill(-1);
    }

    for (let ring = 1; ring <= NCIRCLE; ring++) {
        const svg = document.getElementById(`ring-${ring}`);
        svg.innerHTML = "";
        const innerRadius = RADIUSSTEP * (ring - 1);
        const outerRadius = RADIUSSTEP * ring;
        for (let section = 0; section < SECTIONS; section++) {
            const path = createSector(CENTERX, CENTERY, innerRadius, outerRadius, SECTIONS, section);
            board[ring - 1][section] = path;
            path.addEventListener("click", () => handleSectorClick(ring - 1, section));
            svg.appendChild(path);
        }
    }
}


function createSector(centerX, centerY, innerRadius, outerRadius, sections, section) {
    const startAngle = (section * 2 * Math.PI) / sections;
    const endAngle = ((section + 1) * 2 * Math.PI) / sections;

    const x1 = centerX + innerRadius * Math.cos(startAngle);
    const y1 = centerY + innerRadius * Math.sin(startAngle);
    const x2 = centerX + outerRadius * Math.cos(startAngle);
    const y2 = centerY + outerRadius * Math.sin(startAngle);
    const x3 = centerX + outerRadius * Math.cos(endAngle);
    const y3 = centerY + outerRadius * Math.sin(endAngle);
    const x4 = centerX + innerRadius * Math.cos(endAngle);
    const y4 = centerY + innerRadius * Math.sin(endAngle);

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const d = `
        M ${x1} ${y1}
        L ${x2} ${y2}
        A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3}
        L ${x4} ${y4}
        A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1}
        Z
    `;
    path.setAttribute("d", d);
    path.setAttribute("fill", "#f1f1f1");
    path.setAttribute("stroke", "#000");
    path.setAttribute("stroke-width", "3px");
    path.setAttribute("class", "sector");

    return path;
}

async function handleSectorClick(x, y) {
    if (gameState[x][y] === -1) {
        if (makeMove(x, y, false) === false) return;

        const winner = checkWin(true);
        if (winner !== -1) {
            await sleep(100);
            alert(`Player ${winner + 1} wins!`);
            window.location.reload();
            return;
        } else if (isBoardFull()) {
            alert("It's a tie! No more moves available.");
            window.location.reload();
            return;
        }

        if (gameMode === "ai" && currentPlayer === 1) {
            canMove = false;
            setTimeout(() => makeAIMove2(), 500);
        }
    }
}

function makeMove(x, y, force) {
    if(canMove === false && force===false) return false;
    const color = currentPlayer === 0 ? "#FEA82F" : "#F4989C";
    gameState[x][y] = currentPlayer;
    board[x][y].setAttribute("fill", color);
    board[x][y].classList.remove("sector");
    board[x][y].removeEventListener("click", () => handleSectorClick(x, y)); 
    currentPlayer = 1 - currentPlayer;

    updateStatusMessage();
    return true;
}


function makeAIMove() {
    for (let i = 0; i < NCIRCLE; i++) {
        for (let j = 0; j < SECTIONS; j++) {
            if (gameState[i][j] === -1) {
                makeMove(i, j, true);
                canMove = true;
                return;
            }
        }
    }
    canMove = true;
}

function resetGame() {
    window.location.reload();
}

function resetGameNoReload() {
    initializeGameBoard();
    for (let i = 0; i < NCIRCLE; i++) {
        for (let j = 0; j < SECTIONS; j++) {
            board[i][j].setAttribute("fill", "#f1f1f1");
            board[i][j].classList.add("sector");
            board[i][j].addEventListener("click", () => handleSectorClick(i, j));
        }
    }
    currentPlayer = 0;
    updateStatusMessage();
}

function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}


function checkWin(display) {
    console.log("checkWin", display);
    console.log(gameState);
    for (let i = 0; i < NCIRCLE; i++) {
        for (let j = 0; j < SECTIONS; j++) {
            if (checkLine(gameState[i], j)) {
                if(display){
                    highlightWinningSectors(i, j, 'row');
                }
                return gameState[i][j];
            }
        }
    }

    for (let j = 0; j < SECTIONS; j++) {
        if (
            gameState[0][j] !== -1 &&
            gameState[0][j] === gameState[1][j] &&
            gameState[1][j] === gameState[2][j]
        ) {
            if (display) {
                highlightWinningSectors(j, 0, 'column');   
            }
            return gameState[0][j];
        }
    }

    for (let i = 0; i < SECTIONS; i++) {
        if (checkDiagonal(i) === 1) {
            highlightWinningSectors(i, 0, 'diagonal');
            return gameState[0][i];
        } else if (checkDiagonal(i) === -1) {
            if(display){
                highlightWinningSectors(i, 0, '!diagonal');
            }
            return gameState[0][i];
        }
    }

    return -1;//no winner
}

function highlightWinningSectors(index, start, type) {
    console.log(type);
    console.log(index);
    console.log(start); 
    let sectors = [];
    if (type === 'row') {
        for (let k = 0; k < NCIRCLE; k++) {
            sectors.push([index, (start + k) % SECTIONS]);
        }
    } else if (type === 'column') {
        for (let k = 0; k < NCIRCLE; k++) {
            sectors.push([k, index]);
        }
    } else if (type === 'diagonal') {
        for (let k = 0; k < NCIRCLE; k++) {
            sectors.push([k, (index + k) % SECTIONS]);
        }
    }else if (type === '!diagonal') {
        for (let k = 0; k < NCIRCLE; k++) {
            sectors.push([k, (index - k + SECTIONS) % SECTIONS]);
        }
    }

    sectors.forEach(([x, y]) => {
        console.log(x, y)
        board[x][y].setAttribute("fill", "#60AFFF");
        board[x][y].classList.remove("sector");
    });
}

function checkLine(row, start) {
    return row[start] !== -1 &&
        row[start] === row[(start + 1) % SECTIONS] &&
        row[start] === row[(start + 2) % SECTIONS]
}

function checkDiagonal(i) {
    if (gameState[0][i] !== -1 &&
        gameState[0][i] === gameState[1][(i + 1) % SECTIONS] &&
        gameState[0][i] === gameState[2][(i + 2) % SECTIONS]) {
        console.log("diagonal");
        console.log(0, i);
        console.log(1, (i + 1) % SECTIONS);
        console.log(2, (i + 2) % SECTIONS);
        return 1;
    }

    
    if (gameState[0][i] !== -1 &&
        gameState[0][i] === gameState[1][(i + 5) % SECTIONS] &&
        gameState[0][i] === gameState[2][(i + 4) % SECTIONS]) {
        console.log("!diagonal");
        console.log(0, i);
        console.log(1, (i + 5) % SECTIONS);
        console.log(2, (i + 4) % SECTIONS);
        return -1;
    }

    return 0;
}

async function makeAIMove2() {
    //win
    for (let i = 0; i < NCIRCLE; i++) {
        for (let j = 0; j < SECTIONS; j++) {
            if (gameState[i][j] === -1) {
                gameState[i][j] = 1;
                if (checkWin(false) === 1) {
                    makeMove(i, j, true);
                    canMove = true;
                    const winner = checkWin(true);
                    if (winner !== -1) {
                        await sleep(100);
                        alert(`Player ${winner + 1} wins!`);
                        window.location.reload();
                        return;
                    } else if (isBoardFull()) {
                        alert("It's a tie! No more moves available.");
                        window.location.reload();
                        return;
                    }
                    return;
                }
                gameState[i][j] = -1;
            }
        }
    }

    //block
    for (let i = 0; i < NCIRCLE; i++) {
        for (let j = 0; j < SECTIONS; j++) {
            if (gameState[i][j] === -1) {
                gameState[i][j] = 0;
                if (checkWin(false) === 0) {
                    gameState[i][j] = 1;
                    makeMove(i, j, true);
                    canMove = true;
                    return;
                }
                gameState[i][j] = -1;
            }
        }
    }

    //strategic
    const strategicPositions = [
        [2, 0], [2, 3], [1, 2], [1, 5], [0, 1], [0, 4]
    ];

    for (const [i, j] of strategicPositions) {
        if (gameState[i][j] === -1) {
            makeMove(i, j, true);
            canMove = true;
            return;
        }
    }

    //randon
    let availableMoves = [];
    for (let i = 0; i < NCIRCLE; i++) {
        for (let j = 0; j < SECTIONS; j++) {
            if (gameState[i][j] === -1) {
                availableMoves.push([i, j]);
            }
        }
    }

    if (availableMoves.length > 0) {
        const [i, j] = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        makeMove(i, j, true);
        canMove = true;
    }
}
