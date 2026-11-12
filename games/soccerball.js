// Soccer ball (keepy-uppy): click or tap the ball to kick it.
// Every kick is a point; if the ball touches the floor you are back to zero.
//
// Sizes and speeds are expressed in "units" (1/100 of the shorter canvas side),
// so the game plays the same on a phone and on a wide monitor.

const BEST_KEY = "soccerball-best";
const GRAVITY = 0.085;      // units / frame^2
const KICK = 1.6;           // upward speed right after a kick, units / frame
const SIDE_KICK = 0.7;      // max horizontal speed from an off-centre kick, units / frame
const BALL_RADIUS = 6;
const KICK_REACH = 1.3;     // how far from the centre (in radii) a click still hits the ball
const KICK_COOLDOWN = 10;   // frames between two kicks, so spam-clicking can't farm points
const WALL_BOUNCE = 0.9;
const FLOOR_BOUNCE = 0.6;
const FLOOR_FRICTION = 0.95;
const COLORS = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#00ffff", "#ff00ff"];

let img;
let unit;
let ball;
let ballColor;              // (not called `color`: that would overwrite p5's color() function)
let lastKick = -Infinity;
let score = 0;
let best = 0;

function preload() {
    img = loadImage("/imgs/superpole.png");
}

function setup() {
    createCanvas(gameWidth(), gameHeight()).parent("game-div");
    frameRate(60);
    best = loadBest(BEST_KEY);
    ballColor = random(COLORS);
    resetBall();
}

function resetBall() {
    unit = min(width, height) / 100;
    ball = { x: width / 2, y: height / 2, vx: 0, vy: 0, r: BALL_RADIUS * unit, angle: 0 };
    score = 0;
}

function draw() {
    background(220);
    updateBall();
    drawBall();
    drawHud();
}

function updateBall() {
    ball.vy += GRAVITY * unit;
    ball.x += ball.vx;
    ball.y += ball.vy;
    ball.angle += ball.vx / ball.r; // roll with the horizontal speed

    // Side walls and ceiling just bounce
    if (ball.x - ball.r < 0) {
        ball.x = ball.r;
        ball.vx = abs(ball.vx) * WALL_BOUNCE;
    } else if (ball.x + ball.r > width) {
        ball.x = width - ball.r;
        ball.vx = -abs(ball.vx) * WALL_BOUNCE;
    }
    if (ball.y - ball.r < 0) {
        ball.y = ball.r;
        ball.vy = abs(ball.vy) * WALL_BOUNCE;
    }

    // The floor resets the score
    if (ball.y + ball.r > height) {
        ball.y = height - ball.r;
        ball.vy = -abs(ball.vy) * FLOOR_BOUNCE;
        if (abs(ball.vy) < GRAVITY * unit * 4) ball.vy = 0; // come to rest instead of jittering
        ball.vx *= FLOOR_FRICTION;
        score = 0;
    }
}

function tryKick(x, y) {
    if (dist(x, y, ball.x, ball.y) > ball.r * KICK_REACH) return;
    if (frameCount - lastKick < KICK_COOLDOWN) return;
    lastKick = frameCount;

    ball.vy = -KICK * unit;
    // Kicking the left side of the ball sends it right, and vice versa
    ball.vx = constrain((ball.x - x) / ball.r, -1, 1) * SIDE_KICK * unit;

    score++;
    if (score > best) {
        best = score;
        saveBest(BEST_KEY, best);
    }
}

// ---------- drawing ----------

function drawBall() {
    push();
    translate(ball.x, ball.y);
    rotate(ball.angle);
    stroke(0);
    strokeWeight(1);
    fill(ballColor);
    circle(0, 0, ball.r * 2);
    imageMode(CENTER);
    image(img, 0, 0, ball.r * 2, ball.r * 2);
    pop();
}

function drawHud() {
    push();
    noStroke();
    fill(0);
    textSize(unit * 4.5);
    textAlign(LEFT, TOP);
    text("Points: " + score, unit * 3, unit * 3);
    text("Highscore: " + best, unit * 3, unit * 9);
    if (score === 0) {
        textAlign(CENTER, CENTER);
        textSize(unit * 4);
        text("Click or tap the ball to kick it", width / 2, height * 0.25);
    }
    pop();
}

// ---------- input ----------
// p5 listens on the whole window: only react to clicks/taps on the canvas.

function mousePressed() {
    if (!insideCanvas(mouseX, mouseY)) return;
    tryKick(mouseX, mouseY);
    return false;
}

function touchStarted() {
    let onCanvas = false;
    for (const t of touches) {
        if (insideCanvas(t.x, t.y)) {
            tryKick(t.x, t.y);
            onCanvas = true;
        }
    }
    if (onCanvas) return false; // prevents the emulated mouse click (double kick) and scrolling
}

function windowResized() {
    const w = gameWidth();
    if (w === width) return; // ignore height-only changes (mobile address bar showing/hiding)
    resizeCanvas(w, gameHeight());
    resetBall();
}

// ---------- helpers ----------

function gameWidth() {
    const div = document.getElementById("game-div");
    const style = window.getComputedStyle(div);
    return floor(div.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight));
}

function gameHeight() {
    return floor(window.innerHeight * 0.9);
}

function insideCanvas(x, y) {
    return x >= 0 && x <= width && y >= 0 && y <= height;
}

function loadBest(storageKey) {
    try {
        return parseInt(localStorage.getItem(storageKey), 10) || 0;
    } catch (e) {
        return 0; // storage disabled (e.g. some private modes)
    }
}

function saveBest(storageKey, value) {
    try {
        localStorage.setItem(storageKey, String(value));
    } catch (e) {
        // ignore, the highscore just won't persist
    }
}