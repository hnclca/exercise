var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	fillCbx = document.getElementById("fillCbx"),
	guidelineCbx = document.getElementById("guidelineCbx"),
	strokeStyleSelect = document.getElementById("strokeStyleSelect"),
	fillStyleSelect = document.getElementById("fillStyleSelect"),
	lineWidthSelect = document.getElementById("lineWidthSelect"),
	clearButton = document.getElementById("clearButton"),
	drawingSurfaceImageData = undefined,
	mousedown = {},
	rubberbandRect = {},
	dragging = false,
	showGuideline = guidelineCbx.checked,
	isFill = fillCbx.checked;
	
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
	var width = rubberbandRect.width = Math.abs(loc.x - mousedown.x);
	var height = rubberbandRect.height = Math.abs(loc.y - mousedown.y);

	rubberbandRect.hypotenuse = Math.sqrt(width*width + height*height);
}

function drawRubberbandShape(loc) {
	context.save();
	context.beginPath();
	context.arc(mousedown.x, mousedown.y, rubberbandRect.hypotenuse, 0, Math.PI*2);
	context.stroke();
	if (isFill) {
		context.fill();
	}
	context.restore();
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
	isFill = fillCbx.checked;
}

strokeStyleSelect.onchange = function(e) {
	context.strokeStyle = strokeStyleSelect.value;
}

fillStyleSelect.onchange = function(e) {
	context.fillStyle = fillStyleSelect.value;
}

lineWidthSelect.onchange = function(e) {
	context.lineWidth = lineWidthSelect.value;
}

// Initialization.
drawGrid(context, "lightgray", 10, 10);
context.strokeStyle = strokeStyleSelect.value;
context.fillStyle = fillStyleSelect.value;
context.lineWidth = lineWidthSelect.value;