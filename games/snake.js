let gsize = 0;
let gwidth = 0;
let gheight = 0;
let snakex = 0;
let snakey = 0;
let snakenosex = 0;
let snakenosey = 0;
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
let bodyincrement = 0;
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
    maxpoints = 0;
    bodyincrement = 10;
    deltaspeed = 0.05;
    gameReset();
}

function draw() {
    background(220);
    frameRate(60);

    snakenosey
    // handle direction
    if (direction == 1) {
        snakey -= speed;
        snakenosey = snakey - snakesize/2;
        snakenosex = snakex;
    } else if (direction == 2) {
        snakex += speed;
        snakenosey = snakey;
        snakenosex = snakex + snakesize/2;
    } else if (direction == 3) {
        snakey += speed;
        snakenosey = snakey + snakesize/2;
        snakenosex = snakex;
    } else if (direction == 4) {
        snakex -= speed;
        snakenosey = snakey;
        snakenosex = snakex - snakesize/2;
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
    // if (snakex > foodx - foodsize/2 && snakex < foodx + foodsize/2 && snakey > foody - foodsize/2 && snakey < foody + foodsize/2) {
    //     foodx = random(0 + foodsize/2, width - foodsize/2);
    //     foody = random(0 + foodsize/2, height - foodsize/2);
    //     points++;
    //     if (points > maxpoints) maxpoints = points;
    //     for (let i = 0; i < bodyincrement; i++) {
    //         body.push({"x": tempbody[i].x, "y": tempbody[i].y});
    //     } 
    //     speed += deltaspeed;
    // }

    // check if food eaten
    if (snakex > foodx - foodsize/2 && snakex < foodx + foodsize/2 && snakey > foody - foodsize/2 && snakey < foody + foodsize/2) {
        foodx = random(0 + foodsize/2, width - foodsize/2);
        foody = random(0 + foodsize/2, height - foodsize/2);
        points++;
        if (points > maxpoints) maxpoints = points;

        // Initialize new body segments at the current head position
        for (let i = 0; i < bodyincrement; i++) {
            body.push({"x": snakex, "y": snakey});
        }
        
        speed += deltaspeed;
    }

    // make body longer
    tempbody.push({"x": snakex, "y": snakey});
    if (tempbody.length > bodyincrement) tempbody.shift(); // remove first element

    // body detection
    // for (let i = 1; i < body.length; i++) {
    //     if (body[i].x == snakex && body[i].y == snakey) {
    //         gameReset();
    //     }
    // }

    // body detection (skip detection for new body segments)
    for (let i = 1; i < body.length - bodyincrement; i++) {
        let distX = Math.abs(body[i].x - snakenosex);
        let distY = Math.abs(body[i].y - snakenosey);

        // Check collision only if the body segment is visibly separated from the head
        if (distX < snakesize/2 && distY < snakesize/2) {
            gameReset();
            break;
        }
    }

    textSize(width/30);
    fill(0,0,0);
    text("Points: " + points, width/30, width/20);
    text("Highscore: " + maxpoints, width/30, width/12);

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
    let m = height / width;
    for (let touch of touches) {
          // handle touch
        if (touch.y < m * touch.x && touch.y < -m * touch.x + height) {
            // up
            if (direction != 3) direction = 1;
        } else if (touch.y < m * touch.x && touch.y > -m * touch.x + height) {
            // right
            if (direction != 4) direction = 2;
        } else if (touch.y > m * touch.x && touch.y < -m * touch.x + height) {
            // left
            if (direction != 2) direction = 4;
        } else {
            if (direction != 1) direction = 3;
        }
    }
}

function gameReset() {
    snakex = width/2 - snakesize/2;
    snakey = height/2 - snakesize/2;
    direction = 0;
    speed = 4;
    body = [];
    points = 0; 
    foodx = random(0 + foodsize/2, width - foodsize/2);
    foody = random(0 + foodsize/2, height - foodsize/2);
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
