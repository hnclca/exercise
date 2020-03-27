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
	isFill = fillCbx.checked,
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

	rubberbandRect.width = width < radius*2 ? radius*2 : width;
	rubberbandRect.height = height < radius*2 ? radius*2 : height;
}

function drawRubberbandShape() {
	context.save();
	context.beginPath();
	roundRect(mousedown.x, mousedown.y, rubberbandRect.width, rubberbandRect.height, radius);
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

// round rect.
function roundRect(centerX, centerY, width, height, cornerRadius) {
	context.moveTo(centerX - width/2, centerY);
	context.arcTo(centerX - width/2, centerY - height/2, 
		centerX + width/2, centerY - height/2, cornerRadius);
	context.arcTo(centerX + width/2, centerY - height/2, 
		centerX + width/2, centerY + height/2, cornerRadius);
	context.arcTo(centerX + width/2, centerY + height/2, 
		centerX - width/2, centerY + height/2, cornerRadius);
	context.arcTo(centerX - width/2, centerY + height/2, 
		centerX - width/2, centerY - height/2, cornerRadius);
	context.closePath();
	// if (width > 0) {
	// 	if (height > 0) {
	// 		context.moveTo(cornerX, cornerY + height);
	// 		context.arcTo(cornerX, cornerY, 
	// 			cornerX + width + cornerRadius * 2, cornerY, cornerRadius);
	// 	} else {
	// 		context.moveTo(cornerX, cornerY - cornerRadius);
	// 		context.arcTo(cornerX, cornerY, 
	// 			cornerX + width, cornerY, cornerRadius);
	// 	}
	// 	context.arcTo(cornerX + width + cornerRadius * 2, cornerY, 
	// 		cornerX + width + cornerRadius * 2, cornerY + height, cornerRadius);
	// 	context.arcTo(cornerX + width + cornerRadius * 2, cornerY + height + cornerRadius * 2, 
	// 		cornerX, cornerY + height + cornerRadius * 2, cornerRadius);
	// 	context.arcTo(cornerX, cornerY + height + cornerRadius * 2, 
	// 		cornerX, cornerY, cornerRadius);
	// 		context.closePath();
	// } else {
	// 	context.moveTo(cornerX - cornerRadius, cornerY);
	// 	context.arcTo(cornerX + width, cornerY, cornerX + width, cornerY + height, cornerRadius);
	// 	context.arcTo(cornerX + width, cornerY + height, cornerX, cornerY + height, cornerRadius);
	// 	context.arcTo(cornerX, cornerY + height, cornerX, cornerY, cornerRadius);
	// 	context.arcTo(cornerX, cornerY, cornerX - cornerRadius, cornerY, cornerRadius);
	// }
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

radiusSelect.onchange = function(e) {
	radius = parseInt(radiusSelect.value);
}

// Initialization.
drawGrid(context, "lightgray", 10, 10);
context.strokeStyle = strokeStyleSelect.value;
context.fillStyle = fillStyleSelect.value;