var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	strokeStyleSelect = document.getElementById("strokeStyleSelect"),
	clearButton = document.getElementById("clearButton"),
	instructionsDiv = document.getElementById("instructions"),
	instructionOkButton = document.getElementById("instructionOkButton"),
	instructionNoMoreButton = document.getElementById("instructionNoMoreButton"),
	drawingSurfaceImageData = undefined,
	mousedown = {},
	rubberbandRect = {},
	points = [],
	dragging = false,
	draggingPoint = undefined,
	editing = false,
	showInstruction = true;
	
var SHADOW_STYLE = "rgba(0, 0, 0, 0.8)",
	SHADOW_OFFSET = 12,
	SHADOW_BLUR = 15,
	CONTROL_POINT_STROKE_STYLE = "navy",
	CONTROL_POINT_FILL_STYLE = "rgba(0, 140, 230, 0.5)",
	END_POINT_STROKE_STYLE = "navy",
	END_POINT_FILL_STYLE = "rgba(0, 230, 0, 0.5)",
	POINT_RADIUS = 5;

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

function updateCurvePoints(loc) {
	points[0] = {
		x: rubberbandRect.left,
		y: rubberbandRect.top
	};

	points[1] = {
		x: rubberbandRect.left + rubberbandRect.width,
		y: rubberbandRect.top
	};

	points[2] = {
		x: rubberbandRect.left,
		y: rubberbandRect.top + rubberbandRect.height
	};

	points[3] = {
		x: rubberbandRect.left + rubberbandRect.width,
		y: rubberbandRect.top + rubberbandRect.height
	};
}

function drawRubberbandShape() {
	updateCurvePoints();
	drawBezierCurve();
}

function drawBezierCurve() {
	context.save();

	context.beginPath();
	context.moveTo(points[0].x, points[0].y);
	context.bezierCurveTo(
		points[1].x, points[1].y,
		points[2].x, points[2].y,
		points[3].x, points[3].y);
	context.stroke();

	context.restore();
}

function drawPoints() {
	for(var i = 0; i < points.length; i++) {
		if (i === 0 || i === points.length-1) {
			drawEndPoint(points[i].x, points[i].y);
		} else {
			drawControlPoint(points[i].x, points[i].y);
		}
	}
}

function drawEndPoint(x, y) {
	context.save();

	context.strokeStyle = END_POINT_STROKE_STYLE;
	context.fillStyle = END_POINT_FILL_STYLE;
	context.beginPath();
	context.arc(x, y, POINT_RADIUS, 0, Math.PI*2, false);
	context.stroke();
	context.fill();

	context.restore();
}

function drawControlPoint(x, y) {
	context.save();

	context.strokeStyle = CONTROL_POINT_STROKE_STYLE;
	context.fillStyle = CONTROL_POINT_FILL_STYLE;
	context.beginPath();
	context.arc(x, y, POINT_RADIUS, 0, Math.PI*2, false);
	context.stroke();
	context.fill();

	context.restore();
}

function updateRubberband(loc) {
	updateRubberbandRectangle(loc);
	drawRubberbandShape();
}

function updateDraggingPoint(loc) {
	draggingPoint.x = loc.x;
	draggingPoint.y = loc.y;
}

// check point in path..............................................
function cursorInPoints(loc) {
	var pt;
	points.forEach(point => {
		context.beginPath();
		context.arc(point.x, point.y, POINT_RADIUS, 0, Math.PI*2, false);

		if (context.isPointInPath(loc.x, loc.y)) {
			pt = point;
			return;
		}
	});
	return pt;
}

// Event handlers.
// mouse events....................................................
canvas.onmousedown = function(e) {
	var loc = window2Canvas(canvas, e.clientX, e.clientY);
	e.preventDefault();

	if (!editing) {
		saveDrawingSurface();
		drawPoints();
		mousedown = loc;
		dragging = true;
	} else {
		draggingPoint = cursorInPoints(loc);
		mousedown = loc;
	}
}

canvas.onmousemove = function(e) {
	var loc = window2Canvas(canvas, e.clientX, e.clientY);
	e.preventDefault();
	
	if (dragging || draggingPoint) {
		restoreDrawingSurface();
		if(dragging) {
			updateRubberband(loc);
			drawPoints();
		} else if(draggingPoint) {
			updateDraggingPoint(loc);
			drawPoints();
			drawBezierCurve();
		}
	}
}

window.onmouseup = canvas.onmouseup = function(e) {
	e.preventDefault();
	if (mousedown !== undefined) {
		var loc = window2Canvas(canvas, e.clientX, e.clientY);
		restoreDrawingSurface();
		if (editing) {
			if (draggingPoint) {
				drawPoints();
			} else {
				editing = false;
			}
			drawBezierCurve();
			draggingPoint = undefined;
			mousedown = undefined;
		} else {
			updateRubberband(loc);
			drawPoints();
			dragging = false;
			editing = true;
			mousedown = undefined;

			if (showInstruction) {
				instructionsDiv.style.display = "inline";
			}
		}
	}
}

// controls........................................................
clearButton.onclick = function(e) {
	context.clearRect(0, 0, canvas.width, canvas.height);
	drawGrid(context, "lightgray", 10, 10);
	dragging = false;
	editing = false;
	draggingPoint = undefined;
}

strokeStyleSelect.onchange = function(e) {
	context.strokeStyle = strokeStyleSelect.value;
}

instructionOkButton.onclick = function(e) {
	instructionsDiv.style.display = "none";
}

instructionNoMoreButton.onclick = function(e) {
	instructionsDiv.style.display = "none";
	showInstruction = false;
}

// Initialization.
drawGrid(context, "lightgray", 10, 10);
context.strokeStyle = strokeStyleSelect.value;