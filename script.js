const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const orbsEl = document.getElementById("orbs");
const menuOverlay = document.getElementById("menuOverlay");
const aiStatusEl = document.getElementById("aiStatus");
const trainInfoEl = document.getElementById("trainInfo");
const epCountEl = document.getElementById("epCount");
const epsValEl = document.getElementById("epsVal");

const box = 20;
let score = 0;
let orbs = 0;
let isGameOver = true;
let gameMode = "menu";
let gameLoop = null;
let timerLoop = null;
let stepCount = 0;

let player = [];
let dx = 1, dy = 0;
let bot = [];
let orb = { x: 0, y: 0 };

// Ai Training Status
function updateMenuStatus() {
    let trainedStates = Object.keys(qTable).length;
    if (episodes > 0) {
        aiStatusEl.innerText = `AI Brain: Trained (${episodes} Ep || ${trainedStates} States)`;
    } else {
        aiStatusEl.innerText = "AI Brain: Untrained";
    }
}

//orb spawning
function spawnOrb() {
    orb.x = Math.floor(Math.random() * (canvas.width / box)) * box;
    orb.y = Math.floor(Math.random() * (canvas.height / box)) * box;
}

//positioning of elements
function initEntities() {
    player = [{ x: 4 * box, y: 4 * box}];
    dx = 1;
    dy = 0;
    bot = [{ x: 13 * box, y: 13 * box}];
    stepCount = 0;
    spawnOrb();
    draw();
}

function startGame(mode) {
    gameMode = mode;
    isGameOver = false;
    score = 0;
    orbs = 0;
    scoreEl.innerText = score;
    orbsEl.innerText = orbs;
    menuOverlay.style.display = "none";

    clearInterval(gameLoop);
    clearInterval(timerLoop);
    initEntities();

    if (mode === "train") {
        trainInfoEl.style.display = "block";
        epCountEl.innerText = episodes;
        epsValEl.innerText = epsilon.toFixed(2);
        gameLoop = setInterval(update, 40);
    } else {
        trainInfoEl.style.display = "none";
        gameLoop = setInterval(update, 180);
        timerLoop = setInterval(() => {
            if (!isGameOver && gameMode === "play"){
                score++;
                scoreEl.innerText = score;
            }
        }, 1000);
    }
}

function showMenu() {
    isGaneOver = true;
    gameMode = "menu";
    clearInterval(gameLoop);
    clearInterval(timerLoop);
    updateMenuStatus();
    menuOverlay.style.display = "flex";
}

function resetAI() {
    localStorage.removeItem("snakuQTable");
    localStorage.removeItem("snakuEpisodes");
    localStorage.removeItem("snakuEpsilon");
    qTable = {};
    episodes = 0;
    epsilon = 1.0;
    updateMenuStatus();
    alert("AI Brain memory wiped!");
}

//player controls
function setDir(newDx, newDy) {
    if (dx !== -newDx || dy !== -newDy){
        dx = newDx;
        dy = newDy;
    }
}

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") setDir(0, -1);
    if (e.key === "ArrowDown") setDir(0, 1);
    if (e.key === "ArrowLeft") setDir(-1, 0);
    if (e.key === "ArrowRight") setDir(1, 0);
});

function handleEpisodeEnd(msg) {
    if (gameMode === "train") {
        episodes++;
        decayEpsilon();
        saveAIBrain();
        epCountEl.innerText = episodes;
        epsValEl.innerText = epsilon.toFixed(2);
        initEntities();
    } else {
        isGameOver = true;
        clearInterval(gameLoop);
        clearInterval(timerLoop);
        alert(msg);
        showMenu();
    }
}

function update() {
    if (isGameOver) return;
    stepCount++;

    //player movements
    let headX = player[0].x + dx * box;
    let headY = player[0].y + dy * box;

    if (gameMode === "train") {
        //AI training effect
        if (headX < 0 || headX >= canvas.width) dx = -dx;
        if (headY < 0 || headY >= canvas.height) dy = -dy;
        headX = player[0].x + dx * box;
        headY = player[0].y + dy * box;
    } else {
        //wall crash logic
        if (headX < 0 || headX >= canvas.width || headY < 0 || headY >= canvas.height) {
            handleEpisodeEnd(`Wall Crash! Survived: ${score}s | Orbs: ${orbs}`);
            return;
        }
    }

    player.unshift({ x: headX, y: headY });

    //player orbs eating logic
    if (headX === orb.x && headY === orb.y) {
        orbs++;
        orbsEl.innerText = orbs;
        spawnOrb();
    } else {
        player.pop();
    }

    //Bot Movements
    let botHead = bot[0];
    let target = player[0];
    let obstacles = [...player.slice(1), ...bot.slice(1)];

    let prevState = getAIState(botHead, target, box, canvas.width, canvas.height, obstacles);
    let prevDist = getManhattanDist(botHead, target, box);
    let actionIdx = chooseAIAction(prevState, gameMode === "train");
    let move = actions[actionIdx];

    let nextBotX = botHead.x + move.dx * box;
    let nextBotY = botHead.y + move.dy * box;

    //wall collision logic
    if (nextBotX < 0 || nextBotX >= canvas.width || nextBotY < 0 || nextBotY >= canvas.height) {
        updateQTable(prevState, actionIdx, -10, prevState);
        if (gameMode === "train") {
            handleEpisodeEnd();
            return;
        } else {
            //safe fallback logic
            for (let i= 0; i < actions.length; i++) {
                let testX = botHead.x + actions[i].dx * box;
                let testY = botHead.y + actions[i].dy * box;
                if (testX >= 0 && testX < canvas.width && testY >= 0 && testY < canvas.height) {
                    nextBotX = testX;
                    nextBotY = testY;
                    actionIdx = i;
                    break;
                }
            }
        }
    }

    let newBotHead = { x: nextBotX, y: nextBotY };
    bot.unshift(newBotHead);

    //bot eating orbs logic
    if (nextBotX === orb.x && nextBotY === orb.y) {
        spawnOrb();
} else {
    bot.pop();
}

//reward shaping
let newDist = getManhattanDist(newBotHead, target, box);
let reward = newDist < prevDist ? 1 : -1.5;

//bot catches player logic
if (nextBotX === headX && nextBotY === headY) {
    reward = 20;
    let nextState = getAIState(newBotHead, target, box, canvas.width, canvas.height, obstacles);
    updateQTable(prevState, actionIdx, reward, nextState);
    saveAIBrain();
    handleEpisodeEnd(`Bot caught you! Survived: ${score}s | Orbs: ${orbs}`);
    return;
}

let nextState = getAIState(newBotHead, target, box, canvas.width, canvas.height, obstacles);
updateQTable(prevState, actionIdx, reward, nextState);

//reset if any function fail and run too long
if (gameMode === "train" && stepCount > 150) {
    handleEpisodeEnd();
    return;
}

draw();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //Draw Energy Orb
    ctx.fillStyle = "#ffcc00";
    ctx.fillRect(orb.x, orb.y, box - 2, box - 2);

    //players snake
    ctx.fillStyle = "#00ff88"
    player.forEach(seg => ctx.fillRect(seg.x, seg.y, box - 2, box - 2));

    //Bots snake
    ctx.fillStyle = "#ff4444";
    bot.forEach(seg => ctx.fillRect(seg.x, seg.y, box - 2, box - 2));
}

//Menu state
updateMenuStatus();
initEntities();