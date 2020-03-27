var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	thrusterCanvas = document.getElementById("thrusterCanvas"),
	thrusterContext = thrusterCanvas.getContext("2d"),
	ball = new Sprite("ball", new RollingBallPainter()),
	ledge = new Sprite("ledge", new LedgePainter()),
	lastTime = 0;

var ANIMATION_DURATION = 200,
	THRUSTER_FILL_STYLE = 'rgba(100,140,255,0.5)',
	THRUSTER_FIRING_FILL_STYLE = 'rgba(255,255,0,0.5)',
	ARROW_MARGIN = 5;

// Functions...................................................................
function restartAnimation() {
	if (pushTimer.isRunning()) {
	   pushTimer.stop();
	}
	pushTimer.start();
}

function pushBall() {
	restartAnimation();
}

function paintThruster() {
	thrusterContext.clearRect(0,0,
	   thrusterCanvas.width, thrusterCanvas.height);

	thruster.fillStyle =
		pushTimer.isRunning() ? THRUSTER_FIRING_FILL_STYLE :
				THRUSTER_FILL_STYLE;
	paintArrow(thrusterContext);
}

function paintArrow(context) {
	thruster.draw(context);
}

// Event handlers..................................................................
thrusterCanvas.onmousedown = function canvasMouseDown(e) {
	var rect = thrusterCanvas.getBoundingClientRect(),
		x = e.clientX,
		y = e.clientY;
 
	e.preventDefault();
 
	pushBall();
};

// Animation.......................................................................
function animate(time) {
	context.clearRect(0, 0, canvas.width, canvas.height);
	drawGrid(context, "lightgray", 10, 10);
 
	ball.update(context, time);
	ball.paint(context);
 
	ledge.paint(context);
 
	paintThruster();
 
	window.requestAnimationFrame(animate);
}

// Initialization.................................................................
ledge.width = 50;
ledge.height = 12;
ledge.left = 280;
ledge.top = 55;

ball.width = ball.height = 46;
ball.left = ledge.left + ledge.width/2 - ball.width/2;
ball.top = ledge.top - ball.height;
ball.velocityX = 110;

var pushTimer = new AnimationTimer(ANIMATION_DURATION);
var fallingTimer = new AnimationTimer();
var moveBall = new MoveBall(ball.left, ball.top, 
	ledge.width, canvas.height - ledge.top, pushTimer, fallingTimer);
ball.addBehavior(moveBall);

thrusterContext.shadowColor = 'rgba(0,0,0,1.0)';
thrusterContext.shadowBlur = 6;
thrusterContext.shadowX = 4;
thrusterContext.shadowY = 4;
thruster = new RoundArrow(ARROW_MARGIN, ARROW_MARGIN,
	thrusterCanvas.width - ARROW_MARGIN * 2, 
	thrusterCanvas.height - ARROW_MARGIN * 2,
	5, 'rgba(0,0,0,0.6)', THRUSTER_FILL_STYLE, true);

window.requestAnimationFrame(animate);


