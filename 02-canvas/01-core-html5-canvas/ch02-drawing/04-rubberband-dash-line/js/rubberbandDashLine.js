var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	guidelineCbx = document.getElementById("guidelineCbx"),
	strokeStyleSelect = document.getElementById("strokeStyleSelect"),
	clearButton = document.getElementById("clearButton"),
	drawingSurfaceImageData = undefined,
	mousedown = {},
	rubberbandRect = {},
	dragging = false,
	showGuideline = guidelineCbx.checked;
	
var SHADOW_STYLE = "rgba(0, 0, 0, 0.8)",
	SHADOW_OFFSET = 12,
	SHADOW_BLUR = 15;


// Exend CanvasRenderingContext2D.
var moveToFunction = CanvasRenderingContext2D.prototype.moveTo;

CanvasRenderingContext2D.prototype.lastMoveToLocation = {};

CanvasRenderingContext2D.prototype.moveTo = function(x, y) {
	moveToFunction.apply(context, [x, y]);
	this.lastMoveToLocation.x = x;
	this.lastMoveToLocation.y = y;
}

CanvasRenderingContext2D.prototype.dashedLineTo = function(x, y, dashLength) {
	dashLength = dashLength === undefined ? 5 : dashLength;

	var startX = this.lastMoveToLocation.x;
	var startY = this.lastMoveToLocation.y;
	var deltaX = x - startX;
	var deltaY = y - startY;

	var numDashes = Math.floor(Math.sqrt(deltaX*deltaX + deltaY*deltaY) / dashLength);

	for(var i = 0; i < numDashes; i++) {
		this[i % 2 === 0 ? "moveTo" : "lineTo"](
			startX + (deltaX / numDashes) * i,
			startY + (deltaY / numDashes) * i
		);
	}

	this.moveTo(x, y);
}

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

function drawRubberbandShape(loc) {
	context.save();
	context.beginPath();
	// 设置虚线样式，若数组元素为奇数个则重复为偶数，保证样式格式为：线段-间隔交替重复。
	// context.setLineDash([15, 3, 3, 3]);
	context.moveTo(mousedown.x, mousedown.y);
	context.dashedLineTo(loc.x, loc.y, 12);
	context.stroke();
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
			drawGuidelines(context, "rgba(0, 0, 230, 0.4)", loc.x, loc.y);
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

strokeStyleSelect.onchange = function(e) {
	context.strokeStyle = strokeStyleSelect.value;
}

// Initialization.
drawGrid(context, "lightgray", 10, 10);
context.strokeStyle = strokeStyleSelect.value;