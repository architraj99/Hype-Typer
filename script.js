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

const gameOverOverlay = document.querySelector("#gameOverOverlay");
const restartButton = document.querySelector("#restartButton");
const finalScoreEl = document.querySelector("#finalScore");
const overchargeButton = document.querySelector("#overchargeButton");

const wordQueue = [
    "hackclub",
    "macondo",
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

const overcharge = {
    cooldown: false,
    cooldownMs: 10000
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

    typeInput.value = "";
    typeInput.classList.remove("input-error");
    wordLayer.innerHTML ="";

    overcharge.cooldown = false;
    overchargeButton.disabled = false;
    overchargeButton.textContent = "TAB";

    updateDashboard();
}

function startGame() {

    resetState();
    game.running = true;
    startOverlay.classList.add("hidden");
    gameOverOverlay.classList.add("hidden");
    roundMessage.textContent = "Game Running";

    addLog("Round Started");
    typeInput.focus();
    requestAnimationFrame(gameLoop);
}
    
function endGame() {

    game.running = false;
    roundMessage.textContent = "Game Over";
    finalScoreEl.textContent = `Score: ${game.score}`;

    gameOverOverlay.classList.remove("hidden");
    addLog("Shield destroyed. Game Over.");
}

function updateDashboard() {

    scoreDisplay.textContent = game.score;
    shieldDisplay.textContent = `${game.shield}%`;

    streakDisplay.textContent = game.streak;
    speedDisplay.textContent = `${game.speed.toFixed(1)}x`;
}

function addLog(message) {

    const item = document.createElement("li");
    item.textContent = message;
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
    moveWords(delta);
    checkShieldLine();
}

function render() {
    updateDashboard();
}

function spawnWord() {

    const text = pickWord();
    const fieldWidth = playField.clientWidth;
    const blockWidth = Math.max(80, text.length * 14 + 28);
    const x = getSpawnX(fieldWidth, blockWidth);

    const element = document.createElement("div");
    element.className = "word-block";
    element.textContent = text;

    wordLayer.appendChild(element);

    const word = {
        id: game.wordId,
        text,
        x,
        y: -40,
        speed: 45 + Math.random() * 18, 
        element
    };

    game.wordId += 1;
    game.activeWords.push(word);

    addLog(`Spawned "${text}".`);
}

function moveWords(delta) {

    for(const word of game.activeWords) {

        word.y += (word.speed * delta) / 1000;
        word.element.style.transform = `translate(${word.x}px, ${word.y}px)`;
    }
}

function checkShieldLine() {

    const shieldY = playField.clientHeight - 52;
    const breached = game.activeWords.filter((word) => word.y >= shieldY);

    for(const word of breached) {

        word.element.remove();
        game.shield = Math.max(0, game.shield - 20);
        game.streak = 0;

        addLog(`"${word.text}" hit the shield! - 20`);
    }
    
    game.activeWords = game.activeWords.filter((word) => word.y < shieldY);

    if(game.shield <= 0) {
        endGame();
    }
}

function handleTyping() {

    if(!game.running) {
        return;
    }

    const typed = typeInput.value.trim().toLowerCase();
    typeInput.classList.toggle("input-error", typed.length > 0 && ! hasAnyPrefix(typed));
    refreshWordHighlights();

    if(!typed) {
        return;
    }
    
    const match = game.activeWords.find((word) => word.text === typed);

    if(match) {
        removeWord(match);
        typeInput.value = "";
        typeInput.classList.remove("input-error");
        refreshWordHighlights();
    }

}

function hasAnyPrefix(typed) {

    return game.activeWords.some((word) => word.text.startsWith(typed));
}

function refreshWordHighlights() {

    const typed = typeInput.value.trim().toLowerCase();

    for(const word of game.activeWords) {

        word.element.classList.toggle("targeted", typed.length > 0 && word.text.startsWith(typed));
        word.element.innerHTML = renderTypedLetters(word.text, typed);
    }
}

function renderTypedLetters(word, typed) {

    let html = "";

    for(let i=0; i<word.length; i+=1) {
        const letter = word[i];

        if(i < typed.length && typed[i] === letter) {
            html += `<span class="correct-letter">${letter}</span>`;
        }
        
        else if(i<typed.length) {
            html += `<span class="wrong-letter">${letter}</span>`;
        }

        else{
            html += letter;
        }
    }
    return html;
}

function removeWord(word) {

    word.element.remove();
    game.activeWords = game.activeWords.filter((item) => item.id !== word.id);

    game.streak += 1;
    game.score += 100 + game.streak * 10;

    if(game.streak % 5 === 0) {

        game.speed = Math.min(3.0, parseFloat((game.speed + 0.2).toFixed(1)));
        game.spawnDelay = Math.max(600, game.spawnDelay - 100);
        addLog(`Speed up! ${game.speed.toFixed(1)}x`);
        addLog(`Cleared "${word.text}". +${ 100 + game.streak * 10}`);
    }

    addLog(`Cleared "${word.text}".`);

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

function triggerOvercharge() {

    if(!game.running || overcharge.cooldown) {
        return;
    }

    const count = game.activeWords.length;

    if(count === 0) {
        return;
    }

    for(const word of game.activeWords){
        word.element.remove();
    }

    game.activeWords = [];
    game.score += count * 50;

    addLog(`Overcharge! Cleared ${count}words. +${count * 50}`);

    overcharge.cooldown = true;
    overchargeButton.disabled = true;
    let remaining = Math.ceil(overcharge.cooldownMs / 1000);

    overchargeButton.textContent = `${remaining}s`;
    const tick = setInterval(() => {
        remaining -=1;

        if(remaining <= 0) {
            clearInterval(tick);
            overcharge.cooldown = false;
            overchargeButton.disabled = false;
            overchargeButton.textContent = "TAB";

            addLog("Overcharge ready.");
        }

        else {
            overchargeButton.textContent = `${remaining}s`;
        }
    }, 1000);

}

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

typeInput.addEventListener("input", handleTyping);

document.addEventListener("keydown", (e) =>{

    if(e.key === "Tab") {
        e.preventDefault();
        triggerOvercharge();
    }
});

overchargeButton.addEventListener("click", triggerOvercharge);

updateDashboard();
addLog("System idle.");
addLog("Engine ready.");