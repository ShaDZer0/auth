const GRID_SIZE = 15;
const CELL_SIZE = 20;
const TICK_MS = 150;
let snake = [];
let direction = 'RIGHT';
let nextDirection = 'RIGHT';
let food = { x: 0, y: 0 };
let score = 0;
let isGameActive = false;
let tickTimer = null;
let listenersAttached = false;
let onGameOverCallback = null;
function getElements() {
    const canvas = document.getElementById('snakeCanvas');
    const scoreEl = document.getElementById('snakeScore');
    const statusEl = document.getElementById('snakeStatus');
    const resetBtn = document.getElementById('resetSnakeBtn');
    return { canvas, scoreEl, statusEl, resetBtn };
}
function randomEmptyCell() {
    let cell;
    do {
        cell = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
        };
    } while (snake.some((s) => s.x === cell.x && s.y === cell.y));
    return cell;
}
function draw() {
    const { canvas } = getElements();
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx)
        return;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE - 2, CELL_SIZE - 2);
    snake.forEach((segment, i) => {
        ctx.fillStyle = i === 0 ? '#60a5fa' : '#34d399';
        ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE - 2, CELL_SIZE - 2);
    });
}
function drawIdle(message) {
    const { canvas } = getElements();
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx)
        return;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}
function updateScoreDisplay() {
    const { scoreEl } = getElements();
    if (scoreEl)
        scoreEl.textContent = `Рахунок: ${score}`;
}
function stopTicking() {
    if (tickTimer !== null) {
        clearInterval(tickTimer);
        tickTimer = null;
    }
}
function endGame() {
    isGameActive = false;
    stopTicking();
    const { statusEl } = getElements();
    if (statusEl)
        statusEl.textContent = `Гру закінчено. Рахунок: ${score}`;
    drawIdle('Натисніть "Нова гра", щоб зіграти ще раз');
    onGameOverCallback?.(score);
}
function tick() {
    direction = nextDirection;
    const head = snake[0];
    let newHead;
    switch (direction) {
        case 'UP':
            newHead = { x: head.x, y: head.y - 1 };
            break;
        case 'DOWN':
            newHead = { x: head.x, y: head.y + 1 };
            break;
        case 'LEFT':
            newHead = { x: head.x - 1, y: head.y };
            break;
        case 'RIGHT':
            newHead = { x: head.x + 1, y: head.y };
            break;
    }
    const hitWall = newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE;
    const hitSelf = snake.some((s) => s.x === newHead.x && s.y === newHead.y);
    if (hitWall || hitSelf) {
        endGame();
        return;
    }
    snake.unshift(newHead);
    if (newHead.x === food.x && newHead.y === food.y) {
        score += 10;
        updateScoreDisplay();
        food = randomEmptyCell();
    }
    else {
        snake.pop();
    }
    draw();
}
function handleKeyDown(e) {
    if (!isGameActive)
        return;
    const keyToDirection = {
        ArrowUp: 'UP', w: 'UP', W: 'UP',
        ArrowDown: 'DOWN', s: 'DOWN', S: 'DOWN',
        ArrowLeft: 'LEFT', a: 'LEFT', A: 'LEFT',
        ArrowRight: 'RIGHT', d: 'RIGHT', D: 'RIGHT',
    };
    const requested = keyToDirection[e.key];
    if (!requested)
        return;
    const opposite = {
        UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT',
    };
    if (requested !== opposite[direction]) {
        nextDirection = requested;
    }
    e.preventDefault();
}
function renderIdle() {
    isGameActive = false;
    stopTicking();
    score = 0;
    updateScoreDisplay();
    const { statusEl } = getElements();
    if (statusEl)
        statusEl.textContent = 'Натисніть "Нова гра", щоб почати';
    drawIdle('Натисніть "Нова гра", щоб почати');
}
function startNewGame() {
    const mid = Math.floor(GRID_SIZE / 2);
    snake = [
        { x: mid, y: mid },
        { x: mid - 1, y: mid },
        { x: mid - 2, y: mid },
    ];
    direction = 'RIGHT';
    nextDirection = 'RIGHT';
    score = 0;
    food = randomEmptyCell();
    isGameActive = true;
    updateScoreDisplay();
    const { statusEl } = getElements();
    if (statusEl)
        statusEl.textContent = 'Гра йде...';
    stopTicking();
    tickTimer = setInterval(tick, TICK_MS);
    draw();
}
export function initSnake(onGameOver) {
    const { canvas, resetBtn } = getElements();
    if (!canvas || !resetBtn)
        return;
    onGameOverCallback = onGameOver;
    renderIdle();
    if (!listenersAttached) {
        resetBtn.addEventListener('click', startNewGame);
        document.addEventListener('keydown', handleKeyDown);
        listenersAttached = true;
    }
}
