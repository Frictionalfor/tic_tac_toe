let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let scores = { X: 0, O: 0 };
let gameMode = 'pvp'; // 'pvp' or 'pvc'
let difficulty = 'medium';
let isAiTurn = false;

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function setGameMode(mode) {
    gameMode = mode;
    document.getElementById('pvpBtn').classList.toggle('active', mode === 'pvp');
    document.getElementById('pvcBtn').classList.toggle('active', mode === 'pvc');
    document.getElementById('difficultySelector').style.display = mode === 'pvc' ? 'block' : 'none';

    if (mode === 'pvc') {
        document.getElementById('playerOLabel').textContent = 'AI';
        difficulty = document.getElementById('difficultySelect').value;
    } else {
        document.getElementById('playerOLabel').textContent = 'Player O';
    }

    resetGame();
}

function makeMove(cellIndex) {
    if (gameBoard[cellIndex] !== '' || !gameActive || isAiTurn) return;

    executeMove(cellIndex, currentPlayer);

    if (gameActive && gameMode === 'pvc' && currentPlayer === 'O') {
        isAiTurn = true;
        document.getElementById('currentPlayer').innerHTML = '<span class="ai-thinking">AI is thinking...</span>';
        setTimeout(() => {
            makeAiMove();
            isAiTurn = false;
        }, 800);
    }
}

function executeMove(cellIndex, player) {
    gameBoard[cellIndex] = player;
    const cell = document.querySelectorAll('.cell')[cellIndex];

    const content = document.createElement('span');
    content.className = `cell-content ${player.toLowerCase()}`;
    content.textContent = player;
    cell.innerHTML = '';
    cell.appendChild(content);

    setTimeout(() => content.classList.add('show'), 50);

    cell.disabled = true;

    if (checkWinner()) {
        const winner = gameMode === 'pvc' && player === 'O' ? 'AI' : `Player ${player}`;
        setTimeout(() => {
            highlightWinningLine();
            setTimeout(() => {
                createConfetti();
                endGame(`${winner} wins!`, 'winner');
            }, 800);
        }, 300);
        scores[player]++;
        updateScoreboard();
    } else if (checkTie()) {
        setTimeout(() => endGame("It's a tie!", 'tie'), 300);
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        document.getElementById('currentPlayer').textContent = currentPlayer;
    }
}

function highlightWinningLine() {
    const winningCondition = winningConditions.find(condition =>
        condition.every(index => gameBoard[index] === currentPlayer)
    );

    if (winningCondition) {
        const board = document.getElementById('board');
        const line = document.createElement('div');
        line.className = 'winning-line';

        const [start, , end] = winningCondition;
        let lineStyle = '';

        if (Math.floor(start / 3) === Math.floor(end / 3)) {
            const row = Math.floor(start / 3);
            lineStyle = `
                top: ${row * 98 + 57}px;
                left: 15px;
                width: 290px;
                height: 4px;
            `;
        } else if (start % 3 === end % 3) {
            const col = start % 3;
            lineStyle = `
                top: 15px;
                left: ${col * 98 + 57}px;
                width: 4px;
                height: 290px;
            `;
        } else if (start === 0 && end === 8) {
            lineStyle = `
                top: 152px;
                left: 15px;
                width: 290px;
                height: 4px;
                transform: rotate(45deg);
                transform-origin: center;
            `;
        } else if (start === 2 && end === 6) {
            lineStyle = `
                top: 152px;
                left: 15px;
                width: 290px;
                height: 4px;
                transform: rotate(-45deg);
                transform-origin: center;
            `;
        }

        line.style.cssText = lineStyle + 'position: absolute;';
        board.appendChild(line);
    }
}

function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#ffd93d', '#ff9ff3', '#6bcf7f'];

    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            confetti.style.animationDelay = Math.random() * 0.5 + 's';

            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 4000);
        }, i * 50);
    }

    const container = document.querySelector('.game-container');
    container.classList.add('celebration-pulse');
    setTimeout(() => container.classList.remove('celebration-pulse'), 600);
}

function makeAiMove() {
    let move;
    switch (difficulty) {
        case 'easy':
            move = getRandomMove();
            break;
        case 'medium':
            move = Math.random() < 0.7 ? getOptimalMove() : getRandomMove();
            break;
        case 'hard':
            move = getOptimalMove();
            break;
    }

    if (move !== -1) {
        executeMove(move, 'O');
    }
}

function getRandomMove() {
    const available = gameBoard.map((v, i) => (v === '' ? i : null)).filter(v => v !== null);
    return available.length > 0 ? available[Math.floor(Math.random() * available.length)] : -1;
}

function getOptimalMove() {
    for (let i = 0; i < 9; i++) {
        if (gameBoard[i] === '') {
            gameBoard[i] = 'O';
            if (checkWinnerForPlayer('O')) {
                gameBoard[i] = '';
                return i;
            }
            gameBoard[i] = '';
        }
    }

    for (let i = 0; i < 9; i++) {
        if (gameBoard[i] === '') {
            gameBoard[i] = 'X';
            if (checkWinnerForPlayer('X')) {
                gameBoard[i] = '';
                return i;
            }
            gameBoard[i] = '';
        }
    }

    if (gameBoard[4] === '') return 4;

    const corners = [0, 2, 6, 8].filter(i => gameBoard[i] === '');
    if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];

    return getRandomMove();
}

function checkWinnerForPlayer(player) {
    return winningConditions.some(condition =>
        condition.every(index => gameBoard[index] === player)
    );
}

function checkWinner() {
    return checkWinnerForPlayer(currentPlayer);
}

function checkTie() {
    return gameBoard.every(cell => cell !== '');
}

function endGame(message, type) {
    gameActive = false;
    isAiTurn = false;
    document.getElementById('gameMessage').innerHTML =
        `<div class="winner-message ${type}">${message}</div>`;
    document.querySelectorAll('.cell').forEach(cell => cell.disabled = true);
}

function resetGame() {
    currentPlayer = 'X';
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    isAiTurn = false;

    document.getElementById('currentPlayer').textContent = currentPlayer;
    document.getElementById('gameMessage').innerHTML = '';

    const line = document.querySelector('.winning-line');
    if (line) line.remove();

    document.querySelectorAll('.cell').forEach(cell => {
        cell.innerHTML = '';
        cell.disabled = false;
        cell.className = 'cell';
    });

    if (gameMode === 'pvc') {
        difficulty = document.getElementById('difficultySelect').value;
    }
}

function updateScoreboard() {
    document.getElementById('scoreX').textContent = scores.X;
    document.getElementById('scoreO').textContent = scores.O;
}

document.getElementById('difficultySelect').addEventListener('change', function () {
    difficulty = this.value;
});