var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	fillCbx = document.getElementById("fillCbx"),
	guidelineCbx = document.getElementById("guidelineCbx"),
	editableCbx = document.getElementById("editableCbx"),
	strokeStyleSelect = document.getElementById("strokeStyleSelect"),
	fillStyleSelect = document.getElementById("fillStyleSelect"),
	sidesSelect = document.getElementById("sidesSelect"),
	startAngleSelect = document.getElementById("startAngleSelect"),
	clearButton = document.getElementById("clearButton"),
	drawingSurfaceImageData = undefined,
	mousedown = {},
	rubberbandRect = {},
	dragging = false,
	draggingOffset = {},
	editing = editableCbx.checked,
	showGuideline = guidelineCbx.checked,
	filled = fillCbx.checked,
	sides = sidesSelect.value,
	startAngle = (Math.PI/180) * parseInt(startAngleSelect.value),
	rotatingLockEngaged = false,
	rotatingLockAngle = 0,
	rotatingPolygon = undefined,
	polygons = [];
	
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
	drawGrid(context, "lightgray", 10, 10);
}

function drawPolygon(polygon, angle) {
	var tx = polygon.x,
		ty = polygon.y;

	context.save();

	context.translate(tx, ty);

	if (angle) {
		context.rotate(angle);
	}

	polygon.x = 0;
	polygon.y = 0;
	polygon.draw(context);

	context.restore();

	polygon.x = tx;
	polygon.y = ty;
}

function redraw() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	drawBackground();
	drawPolygons();
}

function drawRotationAnnotations(loc) {
	var dial = new Dial(rotatingPolygon.x, rotatingPolygon.y, rotatingPolygon.radius + 55, 
		"rgba(100, 140, 230, 0.5)", "rgba(100, 140, 230, 0.1)" ,"rgba(0, 0, 230, 0.9)");
	dial.drawDial(context, loc);
}

// dragging.............................................................
function startDragging(loc) {
	saveDrawingSurface();
	mousedown = {};
	mousedown.x = loc.x;
	mousedown.y = loc.y;
}

function stopRotatingPolygon(loc) {
	var angle = Math.atan((loc.y - rotatingPolygon.y) / (loc.x - rotatingPolygon.x))
					- rotatingLockAngle;

	rotatingPolygon.startAngle += angle;
	rotatingPolygon = undefined;
	rotatingLockEngaged = false;
	rotatingLockAngle = 0;
}

function startEditing() {
	canvas.style.cursor = "pointer";
	editing = true;
}

function endEditing() {
	canvas.style.cursor = "crossHair";
	editing = false;
	dragging = false;
	rotatingPolygon = undefined;
	rotatingLockEngaged = false;
	rotatingLockAngle = 0;

	redraw();
}


// Event handlers.
// mouse events....................................................
canvas.onmousedown = function(e) {
	var loc = window2Canvas(canvas, e.clientX, e.clientY);
	e.preventDefault();
	if (editing) {
		if (rotatingPolygon) {
			stopRotatingPolygon(loc);
			redraw();
		}

		polygons.forEach(polygon => {
			polygon.createPath(context);
			if (context.isPointInPath(loc.x, loc.y)) {
				rotatingPolygon = polygon;
				draggingOffset.x = loc.x - polygon.x;
				draggingOffset.y = loc.y - polygon.y;
				return;
			}
		});

		if (rotatingPolygon) {
			drawRotationAnnotations(loc);

			if (!rotatingLockEngaged) {
				rotatingLockEngaged = true;
				rotatingLockAngle = Math.atan(
						(loc.y - rotatingPolygon.y) /(loc.x - rotatingPolygon.x));
			}
		}
	} else {
		startDragging(loc);
		dragging = true;
	}
}

canvas.onmousemove = function(e) {
	var loc = window2Canvas(canvas, e.clientX, e.clientY);
	e.preventDefault();

	if(rotatingLockEngaged) {
		var angle = Math.atan((loc.y - rotatingPolygon.y) / (loc.x - rotatingPolygon.x))
					- rotatingLockAngle;
		redraw();
		drawPolygon(rotatingPolygon, angle);
		drawRotationAnnotations(loc);
	} else if (dragging) {
		restoreDrawingSurface();
		updateRubberband(loc);

		if (showGuideline) {
			drawGuidelines(context, "rgba(0, 0, 230, 0.4)", mousedown.x, mousedown.y);
		}
	}
}

window.onmouseup = canvas.onmouseup = function(e) {
	var loc = window2Canvas(canvas, e.clientX, e.clientY);
	e.preventDefault();

	dragging = false;
	if (!editing && mousedown !== undefined) {
		restoreDrawingSurface();
		updateRubberband(loc);
		mousedown = undefined;
	}
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

editableCbx.onchange = function(e) {
	if(editableCbx.checked) {
		startEditing();
	} else {
		endEditing();
	}
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
