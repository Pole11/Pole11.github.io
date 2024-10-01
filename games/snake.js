let gsize = 0;
let gwidth = 0;
let gheight = 0;
let snakex = 0;
let snakey = 0;
let speed = 0;
let deltaspeed = 0;
let foodx = 0;
let foody = 0;
let snakesize = 0;
let foodsize = 0;
let direction = 0; // 0 means stopped, 1 is up, 2 is right, 3 is down, 4 is left
let body = [];
let tempbody = [];
let points = 0;
let maxpoints = 0;

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
    snakesize = gsize * 40;
    foodsize = gsize * 35;
    snakex = width/2 - snakesize/2;
    snakey = height/2 - snakesize/2;
    direction = 0;
    speed = 4;
    body = [];
    points = 0;
    maxpoints = 0;
    foodx = random(0 + foodsize/2, width - foodsize/2);
    foody = random(0 + foodsize/2, height - foodsize/2);
    deltaspeed = 0.05;
}

function draw() {
    background(220);
    frameRate(60);

    // handle direction
    if (direction == 1) {
        snakey -= speed;
    } else if (direction == 2) {
        snakex += speed;
    } else if (direction == 3) {
        snakey += speed;
    } else if (direction == 4) {
        snakex -= speed;
    }

    // pacman effect
    if (snakex > width) {
        snakex = -snakesize;
    } else if (snakex < -snakesize) {
        snakex = width;
    }

    if (snakey > height) {
        snakey = -snakesize;
    } else if (snakey < -snakesize) {
        snakey = height;
    }

    // body
    noStroke();
    fill("#009900");
    for (let i = body.length - 1; i > 0; i--) {
        body[i].x = body[i - 1].x;
        body[i].y = body[i - 1].y;
        square(body[i].x, body[i].y, snakesize);
    }
    body[0] = {"x": snakex, "y": snakey};

    // check if food eaten
    if (snakex > foodx - foodsize/2 && snakex < foodx + foodsize/2 && snakey > foody - foodsize/2 && snakey < foody + foodsize/2) {
        foodx = random(0 + foodsize/2, width - foodsize/2);
        foody = random(0 + foodsize/2, height - foodsize/2);
        points++;
        if (points > maxpoints) maxpoints = points; 
        body.push({"x": snakex, "y": snakey});
        speed += deltaspeed;
    }

    stroke("#000000");
    strokeWeight(1);
    fill("#ff0000");
    square(foodx, foody, foodsize);

    fill("#00ff00");
    square(snakex, snakey, snakesize);
}

function keyPressed() {
    if (key === 'w') { // up
        if (direction != 3) {
            direction = 1;
        }
    } else if (key == 'd') { // right
        if (direction != 4) {
            direction = 2;
        }
    } else if (key == 's') { // down
        if (direction != 1) {
            direction = 3;
        }
    } else if (key == 'a') { // left
        if (direction != 2) {
            direction = 4;
        }
    }
}

function touchStarted() {
    // handle touch
    let m = width / height;
    for (let touch of touches) {
        // use touch.x touch.y
        if (touch.x > m * touch.y) {
            if (touch.x < -m * touch.y) {
                // left
                direction = 4;
            } else {
                // up
                direction = 1;
            }
        } else {
            if (touch.x < -m * touch.y) {
                // down
                direction = 3;
            } else {
                // up
                direction = 1;
            }
        }
    }
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
