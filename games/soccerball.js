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
let img;

// Load the image
function preload() {
  img = loadImage('../imgs/superpole.png');
}

function setup() {
    p5Div = document.getElementById("game-div");
    gwidth = Utils.elementWidth(p5Div);
    gheight = Math.min(window.innerHeight, Utils.elementWidth(p5Div) * 3/4); // windowHeight in p5js contains the same information as window.innerHeight
    const p5Canvas = createCanvas(gwidth, gheight);
    p5Canvas.parent(p5Div);
    
    gsize = gwidth/gheight;
    ballvy = 1;
    ballvx = 0;
    ballx = gwidth/2;
    bally = gheight/2;
    ballweight = 15;
    gravity = 0.7;
    csize = 100;
    points = 0;
}

function draw() {
    background(220);
    frameRate(60);

    ballvy += gravity; 
    bally += ballvy;
    ballx += ballvx

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

    textSize(30);
    text("Points: " + points, 15, 35)
    text("Highscore: " + maxpoints, 15, 65)
    image(img, ballx - gsize * csize/2, bally - gsize * csize/2, gsize * csize, gsize * csize);
}

function mouseClicked() {
    if (mouseX > ballx - gsize * csize / 2 && mouseX < ballx + gsize * csize / 2 
        && mouseY > bally - gsize * csize / 2 && mouseY < bally + gsize * csize / 2) { // TODO: make the click detection on a round surface
        ballvy = -ballweight;
        ballvx = -(mouseX - ballx)/10;
        points++;
        if (points > maxpoints) maxpoints = points;
    }
}

class Utils {
    // Calculate the Width in pixels of a Dom element
    static elementWidth(element) {
        return (
            element.clientWidth -
            parseFloat(window.getComputedStyle(element, null).getPropertyValue("padding-left")) -
            parseFloat(window.getComputedStyle(element, null).getPropertyValue("padding-right"))
        )
    }

    // Calculate the Height in pixels of a Dom element
    static elementHeight(element) {
        return (
            element.clientHeight -
            parseFloat(window.getComputedStyle(element, null).getPropertyValue("padding-top")) -
            parseFloat(window.getComputedStyle(element, null).getPropertyValue("padding-bottom"))
        )
    }
}