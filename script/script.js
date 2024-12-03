let board = [];
let gameState = [];
let currentPlayer = 0;

const CENTERX = 250;
const CENTERY = 250;
const RADIUSSTEP = 60;
const SECTIONS = 6;
const NCIRCLE = 3;

document.addEventListener("DOMContentLoaded", () => {
    initializeGameBoard();

    



    for (let ring = 1; ring <= NCIRCLE; ring++) {
        const svg = document.getElementById(`ring-${ring}`);
        const innerRadius = RADIUSSTEP * (ring - 1);
        const outerRadius = RADIUSSTEP * ring;

        for (let section = 0; section < SECTIONS; section++) {
            const path = createSector(CENTERX, CENTERY, innerRadius, outerRadius, SECTIONS, section);
            board[ring - 1][section] = path;

            path.addEventListener("click", () => handleSectorClick(ring - 1, section));
            svg.appendChild(path);
        }
    }
});


function initializeGameBoard() {
    for (let i = 0; i < NCIRCLE; i++) {
        board[i] = [];
        gameState[i] = Array(SECTIONS).fill(-1);
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
        const color = currentPlayer === 0 ? "#FEA82F" : "#F4989C";
        gameState[x][y] = currentPlayer;
        board[x][y].setAttribute("fill", color);
        board[x][y].classList.remove("sector");
        board[x][y].removeEventListener("click", () => handleSectorClick(x, y)); 
        currentPlayer = 1 - currentPlayer;

        const winner = checkWin();
        if (winner !== -1) {
            await sleep(100);
            alert(`Player ${winner} wins!`);
            window.location.reload();
        }
    }
}


function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}


function checkWin() {
    
    for (let i = 0; i < NCIRCLE; i++) {
        for (let j = 0; j < SECTIONS; j++) {
            if (checkLine(gameState[i], j)) {
                highlightWinningSectors(i, j, 'row');
                return gameState[i][j];
            }
        }
    }

    
    for (let j = 0; j < SECTIONS; j++) {
        if (gameState[0][j] !== -1 && gameState[0][j] === gameState[1][j] && gameState[1][j] === gameState[2][j]) {
            highlightWinningSectors(j, 0, 'column');
            return gameState[0][j];
        }
    }

    
    for (let i = 0; i < SECTIONS; i++) {
        if (checkDiagonal(i)===1) {
            highlightWinningSectors(i, 0, 'diagonal');
            return gameState[0][i];
        }else if (checkDiagonal(i)===-1) {
            highlightWinningSectors(i, 0, '!diagonal');
            return gameState[0][i];
        }
    }

    return -1;
}


function highlightWinningSectors(index, start, type) {
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
        board[x][y].setAttribute("fill", "#60AFFF");
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
        return 1;
    }

    
    if (gameState[0][i] !== -1 &&
        gameState[0][i] === gameState[1][(i + 5) % SECTIONS] &&
        gameState[0][i] === gameState[2][(i + 4) % SECTIONS]) {
        return -1;
    }

    return 0;
}