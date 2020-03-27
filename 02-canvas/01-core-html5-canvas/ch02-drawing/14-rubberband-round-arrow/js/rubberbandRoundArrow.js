var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	fillCbx = document.getElementById("fillCbx"),
	guidelineCbx = document.getElementById("guidelineCbx"),
	strokeStyleSelect = document.getElementById("strokeStyleSelect"),
	fillStyleSelect = document.getElementById("fillStyleSelect"),
	radiusSelect = document.getElementById("radiusSelect"),
	clearButton = document.getElementById("clearButton"),
	drawingSurfaceImageData = undefined,
	mousedown = {},
	rubberbandRect = {},
	dragging = false,
	showGuideline = guidelineCbx.checked,
	filled = fillCbx.checked,
	radius = parseInt(radiusSelect.value);
	
var SHADOW_STYLE = "rgba(0, 0, 0, 0.8)",
	SHADOW_OFFSET = 12,
	SHADOW_BLUR = 15;

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
	var width = Math.abs(loc.x - mousedown.x);
	var height = Math.abs(loc.y - mousedown.y);

	rubberbandRect.width = width < radius*4 ? radius*4 : width;
	rubberbandRect.height = height < radius*4 ? radius*4 : height;

	rubberbandRect.centerX = mousedown.x - rubberbandRect.width/2;
	rubberbandRect.centerY = mousedown.y - rubberbandRect.height/2;
}

function drawRubberbandShape() {
	var roundArrow = new RoundArrow(
			rubberbandRect.centerX, rubberbandRect.centerY,
			rubberbandRect.width, rubberbandRect.height,
			radius, strokeStyleSelect.value, fillStyleSelect.value, filled);
	roundArrow.draw(context);
}

function updateRubberband(loc) {
	updateRubberbandRectangle(loc);
	drawRubberbandShape(loc);
}

// Event handlers.
// mouse events....................................................
canvas.onmousedown = function(e) {
	mousedown = window2Canvas(canvas, e.clientX, e.clientY);
	e.preventDefault();
	saveDrawingSurface();
	dragging = true;
}

canvas.onmousemove = function(e) {
	e.preventDefault();

	if (dragging) {
		var loc = window2Canvas(canvas, e.clientX, e.clientY);

		restoreDrawingSurface();
		updateRubberband(loc);

		if (showGuideline) {
			drawGuidelines(context, "rgba(0, 0, 230, 0.4)", mousedown.x, mousedown.y);
		}
	}
}

window.onmouseup = canvas.onmouseup = function(e) {
	e.preventDefault();
	if (mousedown !== undefined) {
		var loc = window2Canvas(canvas, e.clientX, e.clientY);
		restoreDrawingSurface();
		updateRubberband(loc);
		dragging = false;
		mousedown = undefined;
	}
}

// controls........................................................
clearButton.onclick = function(e) {
	context.clearRect(0, 0, canvas.width, canvas.height);
	drawGrid(context, "lightgray", 10, 10);
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

radiusSelect.onchange = function(e) {
	radius = parseInt(radiusSelect.value);
}

// Initialization.
drawGrid(context, "lightgray", 10, 10);
context.strokeStyle = strokeStyleSelect.value;
context.fillStyle = fillStyleSelect.value;