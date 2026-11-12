const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");

const box = 21;
let score = 0;
let isGameOver = false;

//players snake
let player = [{ x: 5 * box, y: 5 * box }];
let dx = 1, dy = 0;

//enemy snake bot
let bot = [{ x: 12 *box, y: 12 * box }];

//direction of snake
function setDir(newDx, newDy) {
    if (dx !== -newDx || dy !== -newDy) {
        dx = newDx;
        dy = newDy;
    }
}

document.addEventListener("keydown",(e)=> {
    if (e.key === "ArrowUp") setDir(0, -1);
    if (e.key === "ArrowDown") setDir(0, 1);
    if (e.key === "ArrowLeft") setDir(-1, 0);
    if (e.key === "ArrowRight") setDir(1, 0);
});

//survive timer
setInterval(() => {
    if (isGameOver) {
        score++;
        scoreEl.innerText = score;
    }
}, 1000);

function update() {
    if (isGameOver) return;

//player move
let headX = player[0].x + dx * box;
let headY = player[0].y + dy * box;

//wall collision 
if (headX < 0 || headX >= canvas.width || headY < 0 || headY >= canvas.height) {
    isGameOver = true;
    alert("Game Over! Survived: " + score + " seconds");
    location.reload();
    return;
}

player.unshift({ x: headX, y: headY });
player.pop();

//bot chase logic
let botX = bot[0].x;
let botY = bot[0].y;

if (botX < headX) botX += box;
else if (botX > headX) botX -= box;
else if (botY < headY) botY += box;
else if (botY > headY) botY -= box;

bot[0] = { x: botX, y: botY};

//bot collision with player
if (headX === botX && headY === botY) {
    isGameOver = true;
    alert("Bot caught you! Score: " +score + " seconds");
    location.reload();
}

draw();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //draw players snake 
    ctx.fillStyle = "#00ff88";
    ctx.fillRect(player[0].x,player[0].y, box -2, box -2);

    //draw bots snake
    ctx.fillStyle = "#ff4444";
    ctx.fillRect(bot[0].x, bot[0].y, box -2, box -2);
}

//game speed
setInterval(update, 222);