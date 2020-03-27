var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	thrustersCanvas = document.getElementById("thrustersCanvas"),
	thrustersContext = thrustersCanvas.getContext("2d"),
	ball = new Sprite("ball", new RollingBallPainter()),
	ledge = new Sprite("ledge", new LedgePainter()),
	direction = {"direction": 0},
	lastTime = 0;

var ANIMATION_DURATION = 200,
	THRUSTER_FILL_STYLE = 'rgba(100,140,230,0.8)',
	THRUSTER_FIRING_FILL_STYLE = 'rgba(255,255,0,0.8)',
	ARROW_MARGIN = 5;

// Functions...................................................................
function restartAnimation() {
	if (pushTimer.isRunning()) {
	   pushTimer.stop();
	}
	pushTimer.start();
 }
 
 function pushBallLeft() {
	direction.direction = -1;
	restartAnimation();
 }
 
 function pushBallRight() {
	direction.direction = 1;
	restartAnimation();
 }

 function paintThrusters() {
	thrustersContext.clearRect(0,0,
	   thrustersCanvas.width,thrustersCanvas.height);
 
	if (direction.direction === -1) {
	   thruster.fillStyle =
		  pushTimer.isRunning() ? THRUSTER_FIRING_FILL_STYLE :
								  THRUSTER_FILL_STYLE;
	   paintLeftArrow(thrustersContext);
	   thruster.fillStyle = THRUSTER_FILL_STYLE;
	   paintRightArrow(thrustersContext);
	} else {
		thruster.fillStyle =
		  pushTimer.isRunning() ? THRUSTER_FIRING_FILL_STYLE :
								  THRUSTER_FILL_STYLE;
	   paintRightArrow(thrustersContext);
	   thruster.fillStyle = THRUSTER_FILL_STYLE;
	   paintLeftArrow(thrustersContext);
	}
 }
 
 function paintRightArrow(context) {
	thrustersContext.save();
	thrustersContext.translate(thrustersCanvas.width, 0);
	thrustersContext.scale(-1,1);
	paintArrow(context);
	thrustersContext.restore();
 }
 
 function paintLeftArrow(context) {
	paintArrow(context);
 }

 function paintArrow(context) {
	thruster.draw(context);
 }

// Event handlers..................................................................
thrustersCanvas.onmousedown = function canvasMouseDown(e) {
	var rect = thrustersCanvas.getBoundingClientRect(),
		x = e.clientX,
		y = e.clientY;
 
	e.preventDefault();
 
	if (x - rect.left > thrustersCanvas.width/2) {
	   pushBallRight();
	} else {
	   pushBallLeft();
	}
};

// Animation.......................................................................
function animate(time) {

	context.clearRect(0, 0, canvas.width, canvas.height);

	ball.update(context, time);
	ball.paint(context);

	ledge.paint(context);

	paintThrusters();

	window.requestAnimationFrame(animate);
}

// Initialization.................................................................
ledge.left = 150;
ledge.top = 90;
ledge.width = 44;
ledge.height = 10;

ball.width = ball.height = 30;
ball.left = ledge.left + ledge.width/2 - ball.width/2;
ball.top = ledge.top - ball.height;
ball.velocityX = 110;

pushTimer = new AnimationTimer(ANIMATION_DURATION);
moveBall = new MoveBall(ball.left, ball.top, direction,
	ledge.width, pushTimer);
ball.addBehavior(moveBall);

thrustersContext.shadowColor = 'rgba(0,0,0,0.3)';
thrustersContext.shadowBlur = 6;
thrustersContext.shadowX = 4;
thrustersContext.shadowY = 4;
thruster = new RoundArrow(ARROW_MARGIN, ARROW_MARGIN,
	thrustersCanvas.width/2 - ARROW_MARGIN * 2, 
	thrustersCanvas.height - ARROW_MARGIN * 2,
	5, 'rgba(100,140,230,0.6)', THRUSTER_FILL_STYLE, true);

window.requestAnimationFrame(animate);


