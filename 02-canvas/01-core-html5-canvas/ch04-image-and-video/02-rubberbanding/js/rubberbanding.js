var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	resetButton = document.getElementById("resetButton"),
	image = new Image(),
	imageData = undefined,
	imageDataCopy = context.createImageData(canvas.width, canvas.height),
	mousedown = {},
	rubberbandRectangle = {},
	dragging = false;

// Functions...................................................................
function captureRubberbandPixels() {
	imageData = context.getImageData(0, 0, canvas.width, canvas.height);

	halfAlpha(imageData, imageDataCopy);
}

function restoreRubberbandPixels() {
	var deviceWidthOverCssPixels = imageData.width / canvas.width,
		deviceHeightOverCssPixels = imageData.height / canvas.height;
	
	context.putImageData(imageData, 0, 0);

	context.putImageData(imageDataCopy, 0, 0,
		rubberbandRectangle.left + context.lineWidth,
		rubberbandRectangle.top + context.lineWidth,
		(rubberbandRectangle.width - context.lineWidth*2) * deviceWidthOverCssPixels,
		(rubberbandRectangle.height - context.lineWidth*2) * deviceHeightOverCssPixels);
}

function setRubberRectangle(x, y) {
	rubberbandRectangle.left = Math.min(x, mousedown.x);
	rubberbandRectangle.top = Math.min(y, mousedown.y);
	rubberbandRectangle.width = Math.abs(x - mousedown.x);
	rubberbandRectangle.height = Math.abs(y - mousedown.y);
}

function rubberbandStart(x, y) {
	mousedown.x = x;
	mousedown.y = y;
	
	rubberbandRectangle.left = mousedown.x;
	rubberbandRectangle.top = mousedown.y;
	rubberbandRectangle.width = 0;
	rubberbandRectangle.height = 0;
	
	dragging = true;
	captureRubberbandPixels();
}

function rubberbandStretch(x, y) {
	if (rubberbandRectangle.width > context.lineWidth * 2
		&& rubberbandRectangle.height > context.lineWidth * 2) {
			if (imageData !== undefined) {
				restoreRubberbandPixels();
			}
	}
	
	setRubberRectangle(x, y);

	if (rubberbandRectangle.width > context.lineWidth * 2
		&& rubberbandRectangle.height > context.lineWidth * 2) {
			drawRubberband();
	}
}

function rubberbandEnd() {
	context.putImageData(imageData, 0, 0);

	context.drawImage(canvas,
		rubberbandRectangle.left + context.lineWidth * 2,
		rubberbandRectangle.top + context.lineWidth * 2,
		rubberbandRectangle.width - context.lineWidth * 4,
		rubberbandRectangle.height - context.lineWidth * 4,
		0, 0, canvas.width, canvas.height
	);

	dragging = false;
	imageData = undefined;
}

function drawRubberband() {
	context.strokeRect(rubberbandRectangle.left + context.lineWidth,
		rubberbandRectangle.top + context.lineWidth,
		rubberbandRectangle.width - context.lineWidth * 2,
		rubberbandRectangle.height - context.lineWidth * 2);
}

function updateRubberband() {
	drawRubberband();
}

function drawImage() {
	context.drawImage(image, 0, 0, canvas.width, canvas.height);
}

// Event handles..................................................................
resetButton.onclick = function(e) {
	e.preventDefault();
	context.clearRect(0, 0, canvas.width, canvas.height);
	drawImage();
}

canvas.onmousedown = function(e) {
	var loc = window2Canvas(canvas, e.clientX, e.clientY);
	e.preventDefault();
	rubberbandStart(loc.x, loc.y);
}

canvas.onmousemove = function(e) {
	e.preventDefault();
	if (dragging) {
		var loc = window2Canvas(canvas, e.clientX, e.clientY);
		rubberbandStretch(loc.x, loc.y);
	}
}

canvas.onmouseup = function(e) {
	e.preventDefault();
	rubberbandEnd();
}

// Initialization.................................................................
image.src = "../../shared/images/arch.png";
image.onload = function() {
	drawImage();
}

context.strokeStyle = "navy";
context.lineWidth = 1.0;