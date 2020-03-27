var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	fillCbx = document.getElementById("fillCbx"),
	guidelineCbx = document.getElementById("guidelineCbx"),
	shearCbx = document.getElementById("shearCbx"),
	strokeStyleSelect = document.getElementById("strokeStyleSelect"),
	fillStyleSelect = document.getElementById("fillStyleSelect"),
	sidesSelect = document.getElementById("sidesSelect"),
	startAngleSelect = document.getElementById("startAngleSelect"),
	clearButton = document.getElementById("clearButton"),
	drawingSurfaceImageData = undefined,
	mousedown = {},
	rubberbandRect = {},
	dragging = false,
	showGuideline = guidelineCbx.checked,
	filled = fillCbx.checked,
	sheared = shearCbx.checked,
	sides = sidesSelect.value,
	startAngle = (Math.PI/180) * parseInt(startAngleSelect.value);
	
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

function drawRubberbandShape() {
	var polygon = new Polygon(mousedown.x, mousedown.y, rubberbandRect.hypotenuse, 
		sides, startAngle, context.strokeStyle, context.fillStyle, filled);

	context.save();
	
	if (sheared) {
		context.transform(1, 0, 0.25, 1, 0, 0);
	}

	polygon.draw(context);

	context.restore();
}

function updateRubberband(loc) {
	updateRubberbandRectangle(loc);
	drawRubberbandShape();
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

shearCbx.onchange = function(e) {
	sheared = shearCbx.checked;
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
drawGrid(context, "lightgray", 10, 10);
context.strokeStyle = strokeStyleSelect.value;
context.fillStyle = fillStyleSelect.value;