let gsize = 0;
let gwidth = 0;
let gheight = 0;
let ballx = 0;
let bally = 0;
let ballvy = 0;
let ballvx = 0;
let ballweight = 0;
let gravity = 0;
let csize = 0;
let points = 0;
let maxpoints = 0;
let colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#00ffff", "#ff00ff"];
let img;

// Load the image
function preload() {
  img = loadImage('../imgs/superpole.png');
}

function setup() {
    p5Div = document.getElementById("game-div");
    gwidth = elementWidth(p5Div);
    //gheight = Math.min(window.innerHeight, Utils.elementWidth(p5Div) * 3/4); // windowHeight in p5js contains the same information as window.innerHeight
    gheight = window.innerHeight * 9/10; 
    const p5Canvas = createCanvas(gwidth, gheight);
    p5Canvas.parent(p5Div);
    
    gsize = Math.min(gwidth/gheight, gheight/gwidth);
    ballvy = 1;
    ballvx = 0;
    ballx = gwidth/2;
    bally = gheight/2;
    ballweight = 12;
    gravity = 0.7;
    csize = 100;
    points = 0;
    const random = Math.floor(Math.random() * colors.length);
    color = colors[random];
}

function draw() {
    background(220);
    frameRate(60);

    ballvy += gravity; 
    bally += ballvy;
    ballx += ballvx;

    // wall bouncing
    if (ballx + gsize * csize/2 >= width) {
        ballvx *= -0.9;
        ballx = width - gsize * csize/2 - 1;
        points = 0;
    } else if (ballx - gsize * csize/2 <= 0) {
        ballvx *= -0.9;
        ballx = gsize * csize/2 + 1;
        points = 0;
    }
    if (bally + gsize * csize/2 >= height) {
        ballvy *= -1;
        bally = height - gsize * csize/2 - 1;
        points = 0;
    } else if (bally - gsize * csize/2 <= 0) {
        ballvy *= -0.9;
        bally = gsize * csize/2 + 1;
        points = 0;
    }

    textSize(width/30);
    fill(0,0,0);
    text("Points: " + points, width/30, width/20);
    text("Highscore: " + maxpoints, width/30, width/12);
    fill(color);
    circle(ballx, bally, gsize * csize);
    image(img, ballx - gsize * csize/2, bally - gsize * csize/2, gsize * csize, gsize * csize);

}

function mouseClicked() {
    if (ballKicked(mouseX, mouseY)) { // TODO: make the click detection on a round surface
        bounceBall();
        incrementPoints();
    }
}

function touchStarted() {
    // handle touch
    for (let touch of touches) {
        if (ballKicked(touch.x, touch.y)) {
            bounceBall();
            incrementPoints();
        }
    }
}

function bounceBall() {
    ballvy = -ballweight;
    ballvx = -(mouseX - ballx)/10;
}

function incrementPoints() {
    points++;
    if (points > maxpoints) maxpoints = points;
}

function ballKicked(x, y) {
    return x > ballx - gsize * csize/1.5 && x < ballx + gsize * csize/1.5 && y > bally - gsize * csize/1.5 && y < bally + gsize * csize/1.5;
}

// Calculate the Width in pixels of a Dom element
function elementWidth(element) {
    return (
        element.clientWidth -
        parseFloat(window.getComputedStyle(element, null).getPropertyValue("padding-left")) -
        parseFloat(window.getComputedStyle(element, null).getPropertyValue("padding-right"))
    )
}

// Calculate the Height in pixels of a Dom element
function elementHeight(element) {
    return (
        element.clientHeight -
        parseFloat(window.getComputedStyle(element, null).getPropertyValue("padding-top")) -
        parseFloat(window.getComputedStyle(element, null).getPropertyValue("padding-bottom"))
    )
}
