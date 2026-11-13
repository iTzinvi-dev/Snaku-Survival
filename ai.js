//Q-Learning method use
let qTable = JSON.parse(localStorage.getItem("snakuQTable")) || {};
let episodes = parseInt(localStorage.getItem("snakuEpisodes")) || 0;
let epsilon = parseFloat(localStorage.getItem("snakuEpsilon")) || 1.0;

//learning rate
const alpha = 0.25;
//discount factor
const gamma = 0.9;
const minEpsilon = 0.05;
const epsilonDecay = 0.985;

const actions = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    {dx: 1, dy: 0 },
];

//clashing logic
function isDanger(x, y, canvasWidth, canvasHeight, obstacles) {
    if (x < 0 || x >= canvasWidth || y < 0 || y >= canvasHeight) return 1;
    for (let i = 0; i < obstacles.length; i++) {
        if (x === obstacles[i].x && y === obstacles[i].y) return 1;
    }
    return 0;
}

//Direction + Obstacle Sensor
function getAIState(botHead, target, box, canvasWidth, canvasHeight, obstacles = []) {
    let dirX = Math.sign(target.x - botHead.x);
    let dirY = Math.sign(target.y - botHead.y);

    let dUp = isDanger(botHead.x, botHead.y - box, canvasWidth, canvasHeight, obstacles);
    let dDown = isDanger(botHead.x, botHead.y + box, canvasWidth, canvasHeight, obstacles);
    let dLeft = isDanger(botHead.x - box, botHead.y, canvasWidth, canvasHeight, obstacles);
    let dRight = isDanger(botHead.x + box, botHead.y, canvasWidth, canvasHeight, obstacles);

    return `${dirX},${dirY},${dUp},${dDown},${dLeft},${dRight}`;
}

//getManhattanDist
function getManhattanDist(a, b, box) {
    return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y)) / box;
}

function chooseAIAction(state, isTraining) {
    if (!qTable[state]) {
        qTable[state] = [0, 0, 0, 0];
    }

    //Exploration During Training
    if (isTraining && Math.random() < epsilon) {
        return Math.floor(Math.random() * 4);
    }

    let maxQ = Math.max(...qTable[state]);
    let bestActions = [];
    qTable[state].forEach((q, idx) => {
        if (q === maxQ) bestActions.push(idx);
    });

    return bestActions[Math.floor(Math.random() * bestActions.length)];
}

function updateQTable(state, actionIdx, reward, nextState) {
    if (!qTable[state]) qTable[state] = [0, 0, 0, 0];
    if (!qTable[nextState]) qTable[nextState] = [0, 0, 0, 0];

    let oldQ = qTable[state] [actionIdx];
    let maxNextQ = Math.max(...qTable[nextState]);

    //Q Learning Rule
    qTable[state] [actionIdx] = Number((oldQ + alpha * (reward + gamma * maxNextQ - oldQ)).toFixed(4));
}

function decayEpsilon() {
    if (epsilon > miniEpsilon) {
        epsilon = Math.max(minEpsilon, epsilon * epsilonDecay);
    }
}

function saveAIBrain() {
    localStorage.setItem("snakuQTable", JSON.stringify (qTable));
    localStorage.setItem("snakuEpisodes", episodes);
    localStorage.setItem("snakuEpsilon", epsilon.toFixed(3));
}