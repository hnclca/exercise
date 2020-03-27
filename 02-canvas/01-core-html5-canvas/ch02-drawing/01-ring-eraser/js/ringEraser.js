var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	mousedown = {},
	lastX, lastY, dragging = false;
	
var LINE_WIDTH = 15,
	STROKE_STYLE = "rgba(0, 0, 255, 0.6)",
	FILL_STYLE = "rgba(0, 255, 0, 0.1)";
	RADIUS = 160,
	SHADOW_STYLE = "red",
	SHADOW_OFFSET = -5,
	SHADOW_BLUR = 60,
	ERASER_LINE_WIDTH = 1,
	ERASER_STROKE_STYLE = "rgba(0, 0, 255)",
	ERASER_RADIUS = 20,
	ERASER_SHADOW_STYLE = "blue",
	ERASER_SHADOW_OFFSET = -5,
	ERASER_SHADOW_BLUR = 20,
	GRID_STROKE_STYLE = "lightgray",
	GRID_STEP = 10;

// Functions.
function drawCircle(loc) {
	context.save();
	
	setCircleAttributes();
	
	context.beginPath();
	context.arc(loc.x, loc.y, RADIUS, 0, Math.PI*2);
	// 限制阴影范围在路径范围内.
	// context.clip();
	context.stroke();
	context.fill();
	
	context.restore();
}

function setCircleAttributes() {
	context.lineWidth = LINE_WIDTH;
	context.strokeStyle = STROKE_STYLE;
	context.fillStyle = STROKE_STYLE;
	context.shadowColor = SHADOW_STYLE;
	context.shadowOffsetX = SHADOW_OFFSET;
	context.shadowOffsetY = SHADOW_OFFSET;
	context.shadowBlur = SHADOW_BLUR;
}

function drawEraser(loc) {
	context.save();

	setEraserAttributes();
	setDrawPathForEraser(loc);
	context.stroke();

	context.restore();
}

function setEraserAttributes() {
	context.lineWidth = ERASER_LINE_WIDTH;
	context.strokeStyle = ERASER_STROKE_STYLE;
	context.shadowColor = ERASER_SHADOW_STYLE;
	context.shadowOffsetX = ERASER_SHADOW_OFFSET;
	context.shadowOffsetY = ERASER_SHADOW_OFFSET;
	context.shadowBlur = ERASER_SHADOW_BLUR;
}

function setDrawPathForEraser(loc) {
	context.beginPath();
	context.arc(loc.x, loc.y, ERASER_RADIUS, 0, Math.PI*2, false);
	// 绘图仅限在路径区域内。
	context.clip();
}

function setEraserPathForEraser() {
	context.beginPath();
	context.arc(lastX, lastY, ERASER_RADIUS + ERASER_LINE_WIDTH, 0, Math.PI*2, false);
	// 启用下行代码，擦除区域会是环形。
	context.arc(lastX, lastY, ERASER_RADIUS/2, 0, Math.PI*2, true);
	// 绘图仅限在路径区域内。
	context.clip();
}

function eraseLast() {
	context.save();

	setEraserPathForEraser();
	context.clearRect(0, 0, canvas.width, canvas.height);
	drawGrid(context, GRID_STROKE_STYLE, GRID_STEP, GRID_STEP);

	context.restore();
}

// Event handlers.
canvas.onmousedown = function (e) {
	var loc = window2Canvas(canvas, e.clientX, e.clientY);
	e.preventDefault();
	
	mousedown.x = lastX = loc.x;
	mousedown.y = lastY = loc.y;
	dragging = true;
}

canvas.onmousemove = function(e) {
	var loc = window2Canvas(canvas, e.clientX, e.clientY);
	
	if (dragging) {
		e.preventDefault();

		eraseLast();
		drawEraser(loc);

		lastX = loc.x;
		lastY = loc.y;
	}
}

canvas.onmouseup = function (e) {
	e.preventDefault();
	
	eraseLast();
	dragging = false;
}

// Initialization.................................................
drawGrid(context, GRID_STROKE_STYLE, GRID_STEP, GRID_STEP);
drawCircle({
	x: canvas.width/2, 
	y: canvas.height/2
});