var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	drawingSurfaceImageData = undefined,
	dragging = false;
	
var CENTROID_RADIUS = 10,
	CENTROID_STROKE_STYLE = "rgba(0, 0, 0, 0.5)",
	CENTROID_FILL_STYLE = "rgba(80, 190, 240, 0.6)",
	
	// 圆环样式。
	RING_INNER_RADIUS = 35,
	RING_OUTER_RADIUS = 55,
	RING_FILL_STYLE = "rgba(100, 140, 230, 0.1)",
	RING_INNER_STROKE_STYLE = "rgba(0, 0, 0, 0.1)",
	RING_OUTER_STROKE_STYLE = "rgba(100, 140, 230, 0.5)",
	
	ANNOTATIONS_FILL_STYLE = "rgba(0, 0, 230, 0.9)",
	ANNOTATIONS_FONT = "12px Helvetica",
	
	// 刻度样式。
	TICK_WIDTH = 10,
	TICK_LONG_STROKE_STYLE = "rgba(100, 140, 230, 0.9)",
	TICK_SHORT_STROKE_STYLE = "rgba(100, 140, 230, 0.7)",
	
	TRACKING_DIAL_STROKE_STYLE = "rgba(100, 140, 230, 0.5)",
	
	GUIDEWIRE_STROKE_STYLE = "goldenrod",
	GUIDEWIRE_FILL_STYLE = "rgba(250, 250, 0, 0.6)",
	
	circle = {
		x: canvas.width/2,
		y: canvas.height/2,
		radius: 120
	};

// Functions.
// save and restore ImageData.
function saveImageData() {
	drawingSurfaceImageData = context.getImageData(0, 0, canvas.width, canvas.height);
}

function restoreImageData() {
	context.putImageData(drawingSurfaceImageData, 0, 0);
}

// draw dial.
function drawDial() {
	var loc = {x: circle.x, y: circle.y};

	drawCentroid();
	drawCentroidGuidewire(loc);
	drawRing();
	drawTickInnerCircle();
	drawTicks();
	drawAnnotations();
}

function drawCentroid() {
	context.save();

	context.strokeStyle = CENTROID_STROKE_STYLE;
	context.fillStyle = CENTROID_FILL_STYLE;

	context.beginPath();
	context.arc(circle.x, circle.y, CENTROID_RADIUS,
		0, Math.PI*2);
	context.fill();
	context.stroke();

	context.restore();
}

function drawCentroidGuidewire(loc) {
	var angle = Math.atan((loc.y - circle.y)/(loc.x - circle.x)),
		radius, endpoint = {};

	radius = circle.radius + RING_OUTER_RADIUS;

	if (loc.x >= circle.x) {
		endpoint = {
			x: circle.x + radius * Math.cos(angle),
			y: circle.y + radius * Math.sin(angle)
		};
	} else {
		endpoint = {
			x: circle.x - radius * Math.cos(angle),
			y: circle.y - radius * Math.sin(angle)
		};
	}

	context.save();

	context.strokeStyle = GUIDEWIRE_STROKE_STYLE;
	context.fillStyle = GUIDEWIRE_FILL_STYLE;
	context.beginPath();
	context.moveTo(circle.x, circle.y);
	context.lineTo(endpoint.x, endpoint.y);
	context.fill();
	context.stroke();

	context.beginPath();
	context.strokeStyle = TICK_LONG_STROKE_STYLE;
	context.arc(endpoint.x, endpoint.y, 5, 0, Math.PI*2);
	context.fill();
	context.stroke();

	context.restore();
}

function drawRing() {
	context.save();

	context.shadowColor = "rgba(0, 0, 0, 0.7)",
	context.shadowOffsetX = 3,
	context.shadowOffsetY = 3,
	context.shadowBlur = 6;

	context.strokeStyle = RING_OUTER_STROKE_STYLE;
	context.beginPath();
	context.arc(circle.x, circle.y, circle.radius + RING_OUTER_RADIUS,
		0, Math.PI*2, false);
	context.stroke();

	context.strokeStyle = RING_INNER_STROKE_STYLE;
	context.arc(circle.x, circle.y, circle.radius + RING_INNER_RADIUS,
		0, Math.PI*2, true);
	context.stroke();

	context.fillStyle = RING_FILL_STYLE;
	context.fill();

	context.restore();
}

function drawTickInnerCircle() {
	context.save();

	context.strokeStyle = RING_INNER_STROKE_STYLE;
	context.beginPath();
	context.arc(circle.x, circle.y, circle.radius + RING_INNER_RADIUS - TICK_WIDTH,
		0, Math.PI*2, false);
	context.stroke();

	context.restore();
}

function drawTicks() {
	context.save();

	var deltaAngle = Math.PI/64;
	var radius = circle.radius + RING_INNER_RADIUS;

	for(var i = 0; i < 128; i++) {
		drawTick(i*deltaAngle, radius, i);
	}

	context.restore();
}

function drawTick(angle, radius, cnt) {
	var tickWidth;
	if (cnt % 4 === 0) {
		context.strokeStyle = TICK_LONG_STROKE_STYLE;
		tickWidth = TICK_WIDTH;
	} else {
		context.strokeStyle = TICK_SHORT_STROKE_STYLE;
		tickWidth = TICK_WIDTH / 2;
	}

	context.beginPath();
	context.moveTo(
		circle.x + Math.cos(angle) * (radius - tickWidth),
		circle.y + Math.sin(angle) * (radius - tickWidth)
	);
	context.lineTo(
		circle.x + Math.cos(angle) * radius,
		circle.y + Math.sin(angle) * radius
	);
	context.stroke();
}

function drawAnnotations() {
	var radius = circle.radius + RING_INNER_RADIUS;
	var deltaAngle = Math.PI / 8;

	context.save();

	// 刻度文字阴影。
	context.shadowColor = "rgba(0, 0, 0, 0.4)";
	context.shadowOffsetX = 2;
	context.shadowOffsetY = 2;
	context.shadowBlur = 4;

	context.fillStyle = ANNOTATIONS_FILL_STYLE;
	context.font = ANNOTATIONS_FONT;

	for(var angle=0; angle<Math.PI*2; angle+=deltaAngle) {
		context.beginPath();
		context.fillText(
			(angle * 180 / Math.PI).toFixed(0),
			circle.x + Math.cos(angle) * (radius - TICK_WIDTH * 2),
			circle.y - Math.sin(angle) * (radius - TICK_WIDTH * 2)
		);
	}

	context.restore();
}

// Event handlers..........................................................
canvas.onmousedown = function(e) {
	e.preventDefault();
	dragging = true;
}

canvas.onmousemove = function(e) {
	e.preventDefault();
	if (dragging) {
		var loc = window2Canvas(canvas, e.clientX, e.clientY);
		restoreImageData();
		drawCentroidGuidewire(loc);
	}
}

canvas.onmouseup = function(e) {
	e.preventDefault();
	var loc = window2Canvas(canvas, e.clientX, e.clientY);
	restoreImageData();
	drawCentroidGuidewire(loc);
	dragging = false;
}

// Initialization.
context.textAlign = "center";
context.textBaseline = "middle";

drawGrid(context, "lightgray", 10, 10);
drawDial();
saveImageData();