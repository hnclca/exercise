var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	readout = document.getElementById("readout"),
	spritesheet = new Image();

var VERTICAL_SPACING = 12;

// Functions...................................................................
function window2Canvas(canvas, x, y) {
	var bbox = canvas.getBoundingClientRect();
	return {
		x: x - bbox.left * (canvas.width / bbox.width),
		y: y - bbox.top * (canvas.height / bbox.height)
	};
}

function drawBackground() {
	var height = canvas.height;

	context.clearRect(0, 0, canvas.width, height);
	context.strokeStyle = "lightgray";
	context.lineWidth = 0.5;

	while(height > VERTICAL_SPACING * 4) {
		context.beginPath();
		context.moveTo(0, height);
		context.lineTo(canvas.width, height);
		context.stroke();

		height -= VERTICAL_SPACING;
	}
}

function drawSpritesheet() {
	context.drawImage(spritesheet, 0, 0);
}

function drawVerticalLine(x) {
	context.beginPath();
	context.moveTo(x, 0);
	context.lineTo(x, canvas.height);
	context.stroke();
}

function drawHorizontalLine(y) {
	context.beginPath();
	context.moveTo(0, y);
	context.lineTo(canvas.width, y);
	context.stroke();
}

function drawGuidelines(x, y) {
	context.strokeStyle = "rgba(0, 0, 230, 0.8)";
	context.lineWidth = 0.5;
	drawVerticalLine(x);
	drawHorizontalLine(y);
}

function updateReadout(x, y) {
	readout.innerText = "(" + x.toFixed(0) + ", " + y.toFixed(0) + ")";
}

// Event handles..................................................................
canvas.onmousemove = function(e) {
	var loc = window2Canvas(canvas, e.clientX, e.clientY);

	drawBackground();
	drawSpritesheet();
	drawGuidelines(loc.x, loc.y);
	updateReadout(loc.x, loc.y);
}

// Initialization.................................................................
spritesheet.src = "../../shared/images/running-sprite-sheet.png";
spritesheet.onload = function(e) {
	drawSpritesheet();
};

drawBackground();