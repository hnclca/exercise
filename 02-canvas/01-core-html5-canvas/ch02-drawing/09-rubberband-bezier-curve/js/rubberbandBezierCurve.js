var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	strokeStyleSelect = document.getElementById("strokeStyleSelect"),
	clearButton = document.getElementById("clearButton"),
	drawingSurfaceImageData = undefined,
	mousedown = {},
	rubberbandRect = {},
	dragging = false;
	
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
	rubberbandRect.width = Math.abs(loc.x - mousedown.x);
	rubberbandRect.height = Math.abs(loc.y - mousedown.y);

	if (loc.x < mousedown.x) {
		rubberbandRect.left = loc.x;		
	} else {
		rubberbandRect.left = mousedown.x;
	}

	if (loc.y < mousedown.y) {
		rubberbandRect.top = loc.y;		
	} else {
		rubberbandRect.top = mousedown.y;
	}
}

function drawRubberbandShape() {
	context.save();

	context.beginPath();
	context.moveTo(rubberbandRect.left, rubberbandRect.top);
	context.bezierCurveTo(
		rubberbandRect.left + rubberbandRect.width, rubberbandRect.top,
		rubberbandRect.left, rubberbandRect.top + rubberbandRect.height,
		rubberbandRect.left + rubberbandRect.width, rubberbandRect.top + rubberbandRect.height);
	context.stroke();

	context.restore();
}

function drawPoints() {
	context.save();

	context.strokeStyle = "blue";
	context.fillStyle = "red";
	context.beginPath();
	context.arc(rubberbandRect.left, rubberbandRect.top, 5, 0, Math.PI*2, false);
	context.stroke();
	context.fill();

	context.beginPath();
	context.arc(rubberbandRect.left + rubberbandRect.width, 
		rubberbandRect.top + rubberbandRect.height, 5, 0, Math.PI*2, false);
	context.stroke();
	context.fill();

	context.strokeStyle = "yellow";
	context.fillStyle = "blue";
	context.beginPath();
	context.arc(rubberbandRect.left + rubberbandRect.width, 
		rubberbandRect.top, 5, 0, Math.PI*2, false);
	context.stroke();
	context.fill();

	context.beginPath();
	context.arc(rubberbandRect.left, 
		rubberbandRect.top + rubberbandRect.height, 5, 0, Math.PI*2, false);
	context.stroke();
	context.fill();

	context.restore();
}

function updateRubberband(loc) {
	updateRubberbandRectangle(loc);
	drawRubberbandShape();
	drawPoints();
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

strokeStyleSelect.onchange = function(e) {
	context.strokeStyle = strokeStyleSelect.value;
}

// Initialization.
drawGrid(context, "lightgray", 10, 10);
context.strokeStyle = strokeStyleSelect.value;