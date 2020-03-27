var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	fillCbx = document.getElementById("fillCbx"),
	guidelineCbx = document.getElementById("guidelineCbx"),
	drawRadio = document.getElementById("drawRadio"),
	eraserRadio = document.getElementById("eraserRadio"),
	strokeStyleSelect = document.getElementById("strokeStyleSelect"),
	fillStyleSelect = document.getElementById("fillStyleSelect"),
	sidesSelect = document.getElementById("sidesSelect"),
	startAngleSelect = document.getElementById("startAngleSelect"),
	clearButton = document.getElementById("clearButton"),
	drawingSurfaceImageData = undefined,
	mousedown = {},
	lastX = lastY = undefined,
	rubberbandRect = {},
	dragging = false,
	showGuideline = guidelineCbx.checked,
	filled = fillCbx.checked,
	sides = sidesSelect.value,
	startAngle = (Math.PI/180) * parseInt(startAngleSelect.value),
	polygons = [];
	
var ERASER_LINE_WIDTH = 1,
	ERASER_STROKE_STYLE = "rgba(0, 0, 255)",
	ERASER_RADIUS = 20,
	ERASER_SHADOW_STYLE = "blue",
	ERASER_SHADOW_OFFSET = -5,
	ERASER_SHADOW_BLUR = 20,
	GRID_STROKE_STYLE = "lightgray",
	GRID_STEP = 10;

// Functions.
// save and restore drawing surface.......................
function saveDrawingSurface() {
	drawingSurfaceImageData = context.getImageData(
		0, 0, canvas.width, canvas.height);
}

function restoreDrawingSurface() {
	context.putImageData(drawingSurfaceImageData, 0, 0);
}

// rubberband.............................................
function updateRubberbandRectangle(loc) {
	var width = rubberbandRect.width = Math.abs(loc.x - mousedown.x);
	var height = rubberbandRect.height = Math.abs(loc.y - mousedown.y);

	rubberbandRect.hypotenuse = Math.sqrt(width*width + height*height);
}

function drawRubberbandShape() {
	var polygon = new Polygon(mousedown.x, mousedown.y, rubberbandRect.hypotenuse, 
		sides, startAngle, context.strokeStyle, context.fillStyle, filled);

	polygon.draw(context);

	if (!dragging) {
		polygons.push(polygon);
	}
}

function updateRubberband(loc) {
	updateRubberbandRectangle(loc);
	drawRubberbandShape();
}

function drawPolygons() {
	polygons.forEach(polygon => {
		polygon.draw(context);
	});
}

function drawBackground() {
	drawGrid(context, GRID_STROKE_STYLE, GRID_STEP, GRID_STEP);
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
	context.clip();
}

function setEraserPathForEraser() {
	context.beginPath();
	context.arc(lastX, lastY, ERASER_RADIUS + ERASER_LINE_WIDTH, 0, Math.PI*2, false);
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
// mouse events....................................................
canvas.onmousedown = function(e) {
	var loc = window2Canvas(canvas, e.clientX, e.clientY);
	e.preventDefault();
	if (drawRadio.checked) {
		saveDrawingSurface();
	}

	mousedown = loc;
	lastX = loc.x;
	lastY = loc.y;

	dragging = true;
}

canvas.onmousemove = function(e) {
	var loc = window2Canvas(canvas, e.clientX, e.clientY);
	e.preventDefault();

	if (dragging) {
		if (drawRadio.checked) {
			restoreDrawingSurface();
			updateRubberband(loc);
	
			if (showGuideline) {
				drawGuidelines(context, "rgba(0, 0, 230, 0.4)", mousedown.x, mousedown.y);
			}
		} else {
			eraseLast();
			drawEraser(loc);
		}
		lastX = loc.x;
		lastY = loc.y;
	}
}

window.onmouseup = canvas.onmouseup = function(e) {
	var loc = window2Canvas(canvas, e.clientX, e.clientY);
	e.preventDefault();

	
	if (drawRadio.checked && mousedown !== undefined) {
		restoreDrawingSurface();
		updateRubberband(loc);
		mousedown = undefined;
	}

	if (eraserRadio.checked) {
		eraseLast();
	}

	dragging = false;
}

// controls........................................................
clearButton.onclick = function(e) {
	context.clearRect(0, 0, canvas.width, canvas.height);
	drawBackground();
	polygons = [];
}

guidelineCbx.onchange = function(e) {
	showGuideline = guidelineCbx.checked;
}

fillCbx.onchange = function(e) {
	filled = fillCbx.checked;
}

strokeStyleSelect.onchange = function(e) {
	context.strokeStyle = strokeStyleSelect.value;
}

fillStyleSelect.onchange = function(e) {
	context.fillStyle = fillStyleSelect.value;
}

sidesSelect.onchange = function(e) {
	sides = sidesSelect.value;
}

startAngleSelect.onchange = function(e) {
	startAngle = (Math.PI/180) * parseInt(startAngleSelect.value);
}

// Initialization.
drawBackground();
context.strokeStyle = strokeStyleSelect.value;
context.fillStyle = fillStyleSelect.value;