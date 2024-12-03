let board = [];
let gameState = [];
let currentPlayer = 0;

document.addEventListener("DOMContentLoaded", () => {
    initializeGameBoard();

    const centerX = 250;
    const centerY = 250;
    const radiusStep = 40;
    const sections = 8;

    for (let ring = 1; ring <= 4; ring++) {
        const svg = document.getElementById(`ring-${ring}`);
        const innerRadius = radiusStep * (ring - 1);
        const outerRadius = radiusStep * ring;

        for (let section = 0; section < sections; section++) {
            const path = createSector(centerX, centerY, innerRadius, outerRadius, sections, section);
            board[ring - 1][section] = path;

            path.addEventListener("click", () => handleSectorClick(ring - 1, section));
            svg.appendChild(path);
        }
    }
});

// Initialize game board
function initializeGameBoard() {
    for (let i = 0; i < 4; i++) {
        board[i] = [];
        gameState[i] = Array(8).fill(-1);
    }
}

// Create sector
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
    path.setAttribute("stroke-width", "2px");
    path.setAttribute("class", "sector");

    return path;
}

// Handle sector click
async function handleSectorClick(x, y) {
    if (gameState[x][y] === -1) {
        const color = currentPlayer === 0 ? "blue" : "red";
        gameState[x][y] = currentPlayer;
        board[x][y].setAttribute("fill", color);
        board[x][y].classList.remove("sector");
        board[x][y].removeEventListener("click", () => handleSectorClick(x, y)); 
        currentPlayer = 1 - currentPlayer;

        // Check for a win after updating the color
        const winner = checkWin();
        if (winner !== -1) {
            await sleep(100);
            alert(`Player ${winner} wins!`);
            window.location.reload();
        }
    }
}

// Sleep function
function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

// Check for a win
function checkWin() {
    // Check rows
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 8; j++) {
            if (checkLine(gameState[i], j)) {
                highlightWinningSectors(i, j, 'row');
                return gameState[i][j];
            }
        }
    }

    // Check columns
    for (let j = 0; j < 8; j++) {
        if (gameState[0][j] !== -1 && gameState[0][j] === gameState[1][j] && gameState[1][j] === gameState[2][j] && gameState[2][j] === gameState[3][j]) {
            highlightWinningSectors(j, 0, 'column');
            return gameState[0][j];
        }
    }

    // Check diagonals
    for (let i = 0; i < 8; i++) {
        if (checkDiagonal(i)) {
            highlightWinningSectors(i, 0, 'diagonal');
            return gameState[0][i];
        }
    }

    return -1;
}

// Highlight winning sectors
function highlightWinningSectors(index, start, type) {
    let sectors = [];
    if (type === 'row') {
        for (let k = 0; k < 4; k++) {
            sectors.push([index, (start + k) % 8]);
        }
    } else if (type === 'column') {
        for (let k = 0; k < 4; k++) {
            sectors.push([k, index]);
        }
    } else if (type === 'diagonal') {
        for (let k = 0; k < 4; k++) {
            sectors.push([k, (index + k) % 8]);
        }
    }

    sectors.forEach(([x, y]) => {
        board[x][y].setAttribute("fill", "green");
    });
}

// Check line for win
function checkLine(row, start) {
    return row[start] !== -1 &&
        row[start] === row[(start + 1) % 8] &&
        row[start] === row[(start + 2) % 8] &&
        row[start] === row[(start + 3) % 8];
}

// Check diagonal for win
function checkDiagonal(i) {
    // Check one diagonal direction
    if (gameState[0][i] !== -1 &&
        gameState[0][i] === gameState[1][(i + 1) % 8] &&
        gameState[0][i] === gameState[2][(i + 2) % 8] &&
        gameState[0][i] === gameState[3][(i + 3) % 8]) {
        return true;
    }

    // Check the opposite diagonal direction
    if (gameState[0][i] !== -1 &&
        gameState[0][i] === gameState[1][(i + 7) % 8] &&
        gameState[0][i] === gameState[2][(i + 6) % 8] &&
        gameState[0][i] === gameState[3][(i + 5) % 8]) {
        return true;
    }

    return false;
}