console.log("Hype Typer booted");

const playField = document.querySelector("#playField");
const wordLayer = document.querySelector("#wordLayer");
const typeInput = document.querySelector("#typeInput");
const eventLog = document.querySelector("#eventLog");

const scoreDisplay = document.querySelector("#scoreDisplay");
const shieldDisplay = document.querySelector("#shieldDisplay");
const streakDisplay = document.querySelector("#streakDisplay");
const speedDisplay = document.querySelector("#speedDisplay");
const roundMessage = document.querySelector("#roundMessage");

const startOverlay = document.querySelector("#startOverlay");
const startButton = document.querySelector("#startButton");

const wordQueue = [
    "arcade",
    "button",
    "player",
    "ticket",
    "cabinet",
    "score",
    "combo",
    "timer",
    "shield",
    "typing",
    "letter",
    "screen",
    "window",
    "pixel",
    "quarter",
    "bonus",
    "insert",
    "credit",
    "level",
    "target"
];

const game = {
    running: false,
    score: 0,
    shield: 100,
    streak: 0,
    speed: 1,
    elapsedTime: 0,
    lastFrame: 0,
    spawnTimer: 0,
    spawnDelay: 1400,
    wordId: 0,
    activeWords: []
};

function resetState() {
    game.score = 0;
    game.shield = 100;
    game.streak = 0;
    game.speed = 1;
    game.elapsedTime = 0;
    game.lastFrame = 0;
    game.spawnTimer = 0;
    game.spawnDelay = 1400;
    game.wordId = 0;
    game.activeWords = [];

    wordLayer.innerHTML ="";

    updateDashboard();
}

function startGame() {

    resetState();
    game.running = true;
    startOverlay.classList.add("hidden");
    roundMessage.textContent = "Game Running";

    addLog("Round Started");
    requestAnimationFrame(gameLoop);
}
    
function updateDashboard() {

    scoreDisplay.textContent = game.score;
    shieldDisplay.textContent = `${game.shield}%`;

    streakDisplay.textContent = game.streak;
    speedDisplay.textContent = `${game.speed.toFixed(1)}x`;
}

function addLog(message) {

    const item = document.createElement("li");
    item.textContent = messasge;
    eventLog.prepend(item);

    while(eventLog.children.length > 5) {
        eventLog.lastElementChild.remove();
    }
}

function gameLoop(timestamp) {

    if(!game.running) {
        return;
    }

    if(!game.lastFrame) {
        game.lastFrame = timestamp;
    }

    const delta = timestamp - game.lastFrame;
    game.lastFrame = timestamp;

    update(delta);
    render();
    requestAnimationFrame(gameLoop);
}

function update(delta) {
    game.elapsedTime += delta;
    game.spawnTimer += delta;
    
    if(game.spawnTimer >= game.spawnDelay) {
        game.spawnTimer = 0;
        spawnWord();
    }
}

function render() {
    updateDashboard();
}

function spawnWord() {

    const text = pickWord();
    const fieldWidth = playField.clientWidth;
    const blockWidth = Math.max(80, text.length * 14 + 28);
    const x = getSpawnX(fieldWidth, blockWidth);

    const word = {
        id: game.wordId,
        text,
        x,
        y: -40,
        speed: 45 + Math.random() * 18
    };

    game.wordId += 1;
    game.activeWords.push(word);

    addLog(`Spawned "${text}".`);
}

function pickWord() {

    const index = Math.floor(Math.random() * wordQueue.length);
    return wordQueue[index];
}

function getSpawnX(fieldWidth, blockWidth) {
    const padding = 10;
    const maxX = Math.max(padding, fieldWidth - blockWidth - padding);
    return padding + Math.random() * (maxX - padding);
}

startButton.addEventListener("click", startGame);
updateDashboard();
addLog("System idle.");
addLog("Engine ready.");