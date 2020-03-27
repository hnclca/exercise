var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	controlButton = document.getElementById("controlButton"),
	secondsInput = document.getElementById("seconds"),
	drawingSurfaceImageData = undefined,
	circle = {
		x: canvas.width/2,
		y: canvas.height/2,
		radius: 160
	},
	timerSetting = parseFloat(secondsInput.value),
	animationTimer = new AnimationTimer(timerSetting * 1000);

// Functions.
// save and restore ImageData.
function saveImageData() {
	drawingSurfaceImageData = context.getImageData(0, 0, canvas.width, canvas.height);
}

function restoreImageData() {
	context.putImageData(drawingSurfaceImageData, 0, 0);
}

function animate() {
	if (animationTimer.isRunning() && animationTimer.isOver()) {
		animationTimer.stop();
		secondsInput.value = 0;
		controlButton.value === "开始";
		secondsInput.disabled = false;
	} else if (animationTimer.isRunning()) {
		var stopwatchElapsed = animationTimer.getElapsedTime(),
			angle = -Math.PI/2 - (Math.PI / 180) * ((timerSetting - stopwatchElapsed/1000) / 60 * 360),
			seconds = parseFloat(timerSetting - stopwatchElapsed/1000).toFixed(2);
		if (seconds > 0) {
			secondsInput.value = seconds;
		}
		restoreImageData();
		stopwatch.drawCentroidGuidewire(context, angle);
		requestAnimationFrame(animate);
	}
}

function drawGuideWire() {
	angle = -Math.PI/2 - (Math.PI / 180) * (timerSetting / 60 * 360);
	stopwatch.drawCentroidGuidewire(context, angle);
}

// controls..........................................................
secondsInput.onchange = function(e) {
	timerSetting = parseFloat(secondsInput.value);
	restoreImageData();
	drawGuideWire();
}

controlButton.onclick = function(e) {
	if (controlButton.value === "开始") {
		controller = new AnimationTimer(timerSetting * 1000);
		animationTimer.start();
		controlButton.value = "停止";
		secondsInput.disabled = true;
		requestAnimationFrame(animate);
	} else {
		timerSetting = parseFloat(secondsInput.value);
		animationTimer.stop();
		controlButton.value = "开始";
		secondsInput.disabled = false;
	}
	animationTimer.reset();
}

// Initialization.
drawGrid(context, "lightgray", 10, 10);
var stopwatch = new Stopwatch(circle.x, circle.y, circle.radius);
stopwatch.drawDial(context, circle);
saveImageData();
drawGuideWire();