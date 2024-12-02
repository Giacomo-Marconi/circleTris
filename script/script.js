let campo = [];
let game = [];
let player = 0;

document.addEventListener("DOMContentLoaded", () => {
    const svg = document.getElementById("concentric-circles");
    initGameBoard();

    const centerX = 250;
    const centerY = 250;
    const radiusStep = 40;
    const sections = 8;
    const colors = "#c0c0c0";

    for (let ring = 1; ring <= 4; ring++) {
        const innerRadius = radiusStep * (ring - 1);
        const outerRadius = radiusStep * ring;

        for (let section = 0; section < sections; section++) {
            const path = createSector(centerX, centerY, innerRadius, outerRadius, sections, section, colors);
            campo[ring - 1][section] = path;

            path.addEventListener("click", () => handleSectorClick(ring - 1, section));
            svg.appendChild(path);
        }
    }
});

function initGameBoard() {
    for (let i = 0; i < 4; i++) {
        campo[i] = [];
        game[i] = Array(8).fill(-1);
    }
}

function createSector(centerX, centerY, innerRadius, outerRadius, sections, section, colors) {
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
    path.setAttribute("fill", colors);
    path.setAttribute("stroke", "black");
    path.setAttribute("stroke-width", "1");
    path.setAttribute("class", "sector");

    return path;
}

async function handleSectorClick(x, y) {
    if (game[x][y] === -1) {
        const color = player === 0 ? "blue" : "red";
        game[x][y] = player;
        campo[x][y].setAttribute("fill", color);
        player = 1 - player;

        await sleep(100);
        const winner = checkWin();
        if (winner !== -1) {
            alert(`Ha vinto il giocatore ${winner}`);
            window.location.reload();
        }
    }
}

function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

function checkWin() {
    // Controlla righe
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 8; j++) {
            if (checkLine(game[i], j, 4)) return game[i][j];
        }
    }

    // Controlla colonne
    for (let j = 0; j < 8; j++) {
        if (game[0][j] !== -1 && game[0][j] === game[1][j] && game[1][j] === game[2][j] && game[2][j] === game[3][j]) {
            return game[0][j];
        }
    }

    // Controlla diagonali
    for (let i = 0; i < 8; i++) {
        if (checkDiagonal(i)) return game[0][i];
    }

    return -1;
}

function checkLine(row, start) {
    return row[start] !== -1 &&
        row[start] === row[(start + 1) % 8] &&
        row[start] === row[(start + 2) % 8] &&
        row[start] === row[(start + 3) % 8];
}

function checkDiagonal(i) {
    //console.log(game);
    return ((
        game[0][i] !== -1 &&
        game[0][i] === game[1][(i + 1)%8] &&
        game[0][i] === game[2][(i + 2)%8] &&
        game[0][i] === game[3][(i + 3)%8] 
    ) || (
        game[0][i] !== -1 &&
        game[0][i] === game[1][Math.abs((i - 1))%8] &&
        game[0][i] === game[2][Math.abs((i - 2))%8] &&
        game[0][i] === game[3][Math.abs((i - 3))%8]
    ));
}