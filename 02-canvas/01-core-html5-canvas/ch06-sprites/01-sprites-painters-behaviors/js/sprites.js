var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	animateButton = document.getElementById("animateButton"),
	runInPlaceRadio = document.getElementById("runInPlaceRadio"),
	moveToLeftRadio = document.getElementById("moveToLeftRadio"),
	ball = new Sprite("ball", new BallPainter()),
	bomb = new Sprite("bomb", new ImagePainter("../../shared/images/bomb.png")),
	spritesheet = new Image(),
	runnerCells = [
		{x: 0, y: 0, w: 47, h: 64},
		{x: 55, y: 0, w: 44, h: 64},
		{x: 107, y: 0, w: 39, h: 64},
		{x: 150, y: 0, w: 46, h: 64},
		{x: 208, y: 0, w: 49, h: 64},
		{x: 265, y: 0, w: 46, h: 64},
		{x: 320, y: 0, w: 42, h: 64},
		{x: 380, y: 0, w: 35, h: 64},
		{x: 425, y: 0, w: 35, h: 64}
	],
	lastAdvance = 0,
	interval = 100;
	runInPlace = new RunInPlace(lastAdvance, interval);
	lastMove = 0;
	moveToLeft = new MoveToLeft(lastMove);
	runner = new Sprite("runner", new SpriteSheetPainter(runnerCells, spritesheet),
		[runInPlace]);

var SPRITE_CELL_SIZE = 64,
	PAGE_FLIP_INTERVAL = 100;

// Functions...................................................................
function startAnimation() {
	animateButton.value = "暂停";
	runner.animating = true;
	runInPlace.lastAdvance = 0;
	moveToLeft.lastMove = 0;
	window.requestAnimationFrame(animate)
}

function pauseAnimation() {
	animateButton.value = "动画";
	runner.animating = false;
}

// Event handlers..................................................................
animateButton.onclick = function(e) {
	if (animateButton.value === "动画")
		startAnimation();
	else
		pauseAnimation(); 
}

runInPlaceRadio.onchange = function(e) {
	if (runInPlaceRadio.checked) {
		runner.removeBehavior(moveToLeft);
	}
}

moveToLeftRadio.onchange = function(e) {
	if (moveToLeftRadio.checked) {
		moveToLeft.lastMove = 0;
		runner.addBehavior(moveToLeft);
	}
}

// Animation.......................................................................
function animate(time) {
	if (runner.animating) {
		context.save();
		context.beginPath();
		context.rect(runner.left, runner.top, canvas.width, runner.height);
		context.clip();
		context.clearRect(0, 0, canvas.width, canvas.height);
		drawGrid(context, "lightgray", 10, 10);
		runner.update(context, time)
		runner.paint(context);
		context.restore();

		window.requestAnimationFrame(animate);
	}
}

// Initialization.................................................................
drawGrid(context, "lightgray", 10, 10);
ball.width = ball.height = 150;
ball.left = (canvas.width - ball.width ) / 2;
ball.top = (canvas.height - ball.height ) / 2;
ball.paint(context);

bomb.left = 20;
bomb.top = 20;
bomb.width = 180;
bomb.height = 130;
bomb.paint(context);

spritesheet.src = "../../shared/images/running-sprite-sheet.png";
runner.left = 0;
runner.top = canvas.height - SPRITE_CELL_SIZE;
runner.width = SPRITE_CELL_SIZE;
runner.height = SPRITE_CELL_SIZE;
runner.velocityX = 50;
runner.paint(context);


