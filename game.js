"use strict";
$(document).ready(init);

var ctx, fpsInterval, startTime, now, then, elapsed, boom, winner;

var scalefX = $(window).width() / 1366;  // Responsive X scale
var scalefY = $(window).height() / 667;  // Responsive Y scale

var keys = [];
var loop = true;  // Loop state (true -> On / false -> off)

const tom = {
    x: SCREEN_TOM_X / scalefX,
    y: SCREEN_TOM_Y / scalefY,
    width: CHARACTER_WIDTH,
    height: CHARACTER_HEIGHT,
    frameX: 1,
    frameY: 3,
    speed: SCREEN_CHARACTER_SPEED,
    moving: false,
	lifes: 5,
};

const jerry = {
    x: SCREEN_JERRY_X / scalefX,
    y: SCREEN_JERRY_Y / scalefY,
    width: CHARACTER_WIDTH,
    height: CHARACTER_HEIGHT,
    frameX: 1,
    frameY: 1,
    speed: SCREEN_CHARACTER_SPEED,
    moving: false,
	lifes: 5,
};

const bomb = {
    x: (($(window).width() / 2) - (39 * scalefX)) / scalefX,
    y: (($(window).height() / 2) - CHARACTER_HEIGHT) / scalefY,
    width: BOMB_WIDTH,
    height: BOMB_HEIGHT,
	timer: 15,
	imgPath: PATH_BOMB_DEFAULT,
};

const explosion = {
	x: 0,
	y: 0,
	width: EXPLOSION_WIDTH,
	height: EXPLOSION_HEIGHT,
	frameX: 0,
	frameY: 0,
};

// Load images
const tomImage = new Image();
tomImage.src = PATH_TOM;
const jerryImage = new Image();
jerryImage.src = PATH_JERRY;
const bombImage = new Image();
const explosionImage = new Image();
explosionImage.src = PATH_EXPLOSION;

// Load sounds (audios)
var tomSound = new sound(PATH_TOM_SOUND, false);  // Tom sound effect
var jerrySound = new sound(PATH_JERRY_SOUND, false);  // Jerry sound effect
var backgroundSound = new sound(PATH_BACKGROUND_SOUND, true);  // Background music
var backgroundSoundStarted = false;
/*----------------------------------------  Functions  ----------------------------------------*/

// Create canvas and set screen dimensions and font
function init() {
    ctx = $("#gameCanvas")[0].getContext("2d");  
    $('body').css('margin', '0');  // No margins
    $('body').css('overflow', 'hidden'); // Hide scrollbars
    ctx.canvas.width  = $(window).width();
    ctx.canvas.height = $(window).height();	
	ctx.font = "bold " + (25 * scalefX) + "px sans-serif";  // Responsive text size
    $(window).resize(resize);
	bombColor();
    startAnimating(TIME_PER_FRAME);  // Fps-rate
}

// Reset screen dimensions and font
function resize() {
    ctx.canvas.width = $(window).width();
    ctx.canvas.height = $(window).height();
	scalefX = $(window).width() / 1366;
	scalefY = $(window).height() / 667;
	ctx.font = "bold " + (25 * scalefX) + "px sans-serif";  // Responsive text size
	if (loop === false) {
		gameOver();
	}
	
}

// The main loop function
function animate() {
    now = Date.now();
    elapsed = now - then;
    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);
		drawBackground();
		screenInfo();
		
		// Draw the main objects
		drawCharacter(jerryImage, jerry.width * jerry.frameX, jerry.height * jerry.frameY,
					  jerry.width, jerry.height, jerry.x * scalefX, jerry.y * scalefY, jerry.width * scalefX, jerry.height * scalefY);
        drawCharacter(tomImage, tom.width * tom.frameX, tom.height * tom.frameY,
					  tom.width, tom.height, tom.x * scalefX, tom.y * scalefY, tom.width * scalefX, tom.height * scalefY);   
		drawCharacter(bombImage, 0, 0, bomb.width, bomb.height, bomb.x * scalefX, bomb.y * scalefY, bomb.width * scalefX, bomb.height * scalefY);
		
		moveTom();
        moveJerry();
        handleTomFrame();
        handleJerryFrame();
		
		if (boom == true){explosionBlown();}
		
		collisionDetection((tom.x + 15) * scalefX, (tom.y + 30) * scalefY, (tom.width - 30) * scalefX, (tom.height - 30) * scalefY,
						   bomb.x * scalefX, bomb.y * scalefY, bomb.width * scalefX, bomb.height * scalefY, keys[ENTER_KEY]);
		collisionDetection((jerry.x + 15) * scalefX, (jerry.y + 30) * scalefY, (jerry.width - 30) * scalefX, (jerry.height - 30) * scalefY,
						   bomb.x * scalefX, bomb.y * scalefY, bomb.width * scalefX, bomb.height * scalefY, keys[SPACE_KEY]);
	}
	if (loop === true){requestAnimationFrame(animate);}
	
	else if (loop === false){gameOver();}  // Execute gameOver function when a player loses and the loop stops
	
	// Error
	else {
		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.textAlign = "center";
		ctx.fillStyle = 'red';
		ctx.fillText("Unexpected Error!", (ctx.canvas.width / 2), (ctx.canvas.height / 2));
	}
}

// FPS-CAP
function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    animate();
}

// Draw a new character on the screen
function drawCharacter(img, sX, sY, sW, sH, dX, dY, dW, dH){
    ctx.drawImage(img, sX, sY, sW, sH, dX, dY, dW, dH);
}

// Saving everyone button pressed in an array and start the background music
$(window).keydown(function(e){
    keys[e.keyCode] = true;
	if (backgroundSoundStarted == false) {
		backgroundSound.play();
		backgroundSoundStarted = true;
	}
});

// Delete the unpressed buttons and set moving to false
$(window).keyup(function(e){
    delete keys[e.keyCode];
    tom.moving = false;
    jerry.moving = false;
});


// Tom can not walk out of the screen
function moveTom() {
    // Up
    if (keys[O_KEY] && tom.y * scalefY > (-CHARACTER_HEIGHT * scalefY / 3)) {
        tom.frameY = 0;
        tom.y -= tom.speed;
        tom.moving = true;
    }
    // Down
    if (keys[L_KEY] && tom.y * scalefY < ctx.canvas.height - CHARACTER_HEIGHT * scalefY) {
        tom.frameY = 2;
        tom.y += tom.speed;
        tom.moving = true;
    }
    // Left
    if (keys[K_KEY] && tom.x * scalefX > 0) {
        tom.frameY = 3;
        tom.x -= tom.speed;
        tom.moving = true;
    }
    // Right
    if (keys[Ö_KEY] && tom.x * scalefX < ctx.canvas.width - CHARACTER_WIDTH * scalefX) {
        tom.frameY = 1;
        tom.x += tom.speed;
        tom.moving = true;
    }
}

// Jerry can not walk out of the screen
function moveJerry() {
    // Up
    if (keys[W_KEY] && jerry.y * scalefY > (-CHARACTER_HEIGHT * scalefY / 3)) {
        jerry.frameY = 0;
        jerry.y -= jerry.speed;
        jerry.moving = true;
    }
    // Down
    if (keys[S_KEY] && jerry.y * scalefY < (ctx.canvas.height) - CHARACTER_HEIGHT * scalefY) {
        jerry.frameY = 2;
        jerry.y += jerry.speed;
        jerry.moving = true;
    }
    // Left
    if (keys[A_KEY] && jerry.x * scalefX > 0) {
        jerry.frameY = 3;
        jerry.x -= jerry.speed;
        jerry.moving = true;
    }
    // Right
    if (keys[D_KEY] && jerry.x * scalefX < ctx.canvas.width - CHARACTER_WIDTH * scalefX) {
        jerry.frameY = 1;
        jerry.x += jerry.speed;
        jerry.moving = true;
    }
}

// Tom's frame picture
function handleTomFrame() {
    if (tom.frameX < 2 && tom.moving) {
        tom.frameX++;
    }
    else {
        tom.frameX = 0;
    }
}

// Jerry's frame picture
function handleJerryFrame() {
    if (jerry.frameX < 2 && jerry.moving) {
        jerry.frameX++;
    }
    else {
        jerry.frameX = 0;
    }
}

// Collision between when a player holds the bomb
function collisionDetection(x1, y1, w1, h1, x2, y2, w2, h2, hold_key) {
	//x1, y1 = x and y coordinates of rectangle 1
	//w1, h1 = width and height of rectangle 1
	//x2, y2 = x and y coordinates of rectangle 2
	//w2, h2 = width and height of rectangle 2
	//hold_key = the key to hold/take the bomb
	
	/*
	ctx.beginPath();
	ctx.strokeStyle = 'green';
	ctx.rect(x1,y1,w1,h1);
	ctx.rect(x2,y2,w2,h2);
	ctx.stroke();
	*/
	
	if (x1 <= x2+w2 && x2 <= x1+w1 && y1 <= y2+h2 && y2 <= y1+h1 && hold_key) {
		bomb.x = (x1 - (10 * scalefX)) / scalefX;
		bomb.y = (y1 + (20 * scalefY)) / scalefY;
		return true;
	}
	else {
		return false;
	}
}

// Bomb's timer and color
function bombColor() {
	var bombTimer = setInterval(function(){
		bomb.timer--;
		
		if (bomb.timer == 10){  // 10s left
			bomb.imgPath = PATH_BOMB_YELLOW;
		}
		else if (bomb.timer == 7){  // 7s left
			bomb.imgPath = PATH_BOMB_ORANGE;
		}
		else if (bomb.timer == 3){  // 3s left
			bomb.imgPath = PATH_BOMB_RED;
		}
		else if (bomb.timer <= 0){  // 0s left
			clearInterval(bombTimer);
			takeLifes();
			explosion.x = bomb.x;
			explosion.y = bomb.y;
			bomb.x = -1000;
			bomb.y = -1000;
			bomb.imgPath = PATH_BOMB_DEFAULT;
			boom = true;
		}
		bombImage.src = bomb.imgPath;
	},2000);
}

// Draw explosion and set a random number for bomb's timer, x, y and then execute bombColor function again
function explosionBlown() {
	drawCharacter(explosionImage, explosion.width * explosion.frameX, explosion.height * explosion.frameY,
				  explosion.width, explosion.height, explosion.x * scalefX, explosion.y * scalefY, explosion.width * scalefX, explosion.height * scalefY);
	
	if (explosion.frameX == 3) {
		explosion.frameX = -1;
		explosion.frameY++;
	}
	explosion.frameX++;	
	
	if (explosion.frameX == 2 && explosion.frameY == 3) {
		boom = false;
		explosion.frameX = 0;
		explosion.frameY = 0;
		
		bomb.timer = Math.floor(Math.random() * 20) + 15;
		bomb.x = (($(window).width() / 2) - (39 * scalefX)) / scalefX;
		bomb.y = Math.floor(Math.random() * (ctx.canvas.height - BOMB_HEIGHT));
		bombColor();
	}
}

// Clear and draw the background colors
function drawBackground() {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);  // Clear Screen
	
	// Left Side-Screen
	ctx.fillStyle = BACKGROUND_LEFT_COLOR;
	ctx.fillRect(0, 0, ctx.canvas.width / 2, ctx.canvas.height);
	
	// Right Side-Screen
	ctx.fillStyle = BACKGROUND_RIGHT_COLOR;
	ctx.fillRect(ctx.canvas.width / 2, 0, ctx.canvas.width, ctx.canvas.height);
}

// Lose a life point, play a sound effect and check for the winner
function takeLifes() {
	if ( bomb.x < (($(window).width() /2) - (39 * scalefX)) / scalefX) {
		jerry.lifes--;
		tom.speed--;
		jerrySound.play();  // Play Jerry's sound effect when losing a life-point
		
		// Stop the loop if Jerry loses
		if (jerry.lifes == 0) {
			loop = false;
			winner = 'Tom';  // If Jerry loses, Tom wins
		}
	}
	else if (bomb.x > (($(window).width() /2) - (39 * scalefX)) / scalefX) {
		tom.lifes--;
		jerry.speed--;
		tomSound.play();  // Play Tom's sound effect when losing a life-point
		
		// Stop the loop if Tom loses
		if (tom.lifes == 0) {
			loop = false;
			winner = 'Jerry';  // If Tom loses, Jerry wins
		}
	}
}

// Draw players' life-points and speed on the screen
function screenInfo() {
	ctx.fillStyle = GAME_FONT_COLOR;
	
	// Left-side texts
	ctx.textAlign = "left";
	ctx.fillText("Jerry's lifes: " + jerry.lifes, 20, 30);  //Jerry's lifes
	ctx.fillText("Jerry's speed: " + jerry.speed, 20, ctx.canvas.height - 20);  // Draw Jerry's speed on screen
	
	// Right-side texts
	ctx.textAlign = "right";
	ctx.fillText("Tom's lifes: " + tom.lifes, ctx.canvas.width - 20, 30);  // Tom's lifes
	ctx.fillText("Tom's speed: " + tom.speed, ctx.canvas.width - 20, ctx.canvas.height - 20);  //Draw Tom's speed on screen
}

// Draw the endgame background and announce the winner on screen
function gameOver() {
	ctx.font = "bold " + (150 * scalefX) + "px sans-serif";
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.textAlign = "center";
	ctx.fillStyle = 'white';
	ctx.fillText(winner + " won!", (ctx.canvas.width / 2), (ctx.canvas.height / 2));
}

//Sound function
function sound(src, loop) {
	this.sound = document.createElement("audio");
	this.sound.src = src;
	this.sound.setAttribute("preload", "auto");
	this.sound.setAttribute("controls", "none");
	if (loop)
		this.sound.setAttribute("loop", true);
	this.sound.style.display = "none";
	document.body.appendChild(this.sound);
	this.play = function() {
		this.sound.play();
	};
	this.stop = function() {
		this.sound.pause();
	};
}