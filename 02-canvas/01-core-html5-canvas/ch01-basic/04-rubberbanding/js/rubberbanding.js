var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	resetButton = document.getElementById("resetButton"),
	rubberbandDiv = document.getElementById("rubberbandDiv"),
	image = new Image(),
	mousedown = {},
	rubberbandRectangle = {},
	dragging = false;

// Functions...................................................................
function rubberbandStart(x, y) {
	mousedown.x = x;
	mousedown.y = y;
	
	rubberbandRectangle.left = mousedown.x;
	rubberbandRectangle.top = mousedown.y;
	
	moveRubberbandDiv();
	showRubberbandDiv();
	
	dragging = true;
}

function rubberbandStretch(x, y) {
	rubberbandRectangle.left = x < mousedown.x ? x : mousedown.x;
	rubberbandRectangle.top = y < mousedown.y ? y : mousedown.y;
	
	rubberbandRectangle.width = Math.abs(x - mousedown.x);
	rubberbandRectangle.height = Math.abs(y - mousedown.y);
	
	moveRubberbandDiv();
	resizeRubberbandDiv();
}

function rubberbandEnd() {
	var bbox = canvas.getBoundingClientRect();
	
	try {
		context.drawImage(canvas,
			rubberbandRectangle.left - bbox.left,
			rubberbandRectangle.top - bbox.top,
			rubberbandRectangle.width,
			rubberbandRectangle.height,
			0, 0, canvas.width, canvas.height
		);
	} catch(e) {
		console.log(e);
	}
	
	resetRubberbandRectangle();
	rubberbandDiv.style.width = 0;
	rubberbandDiv.style.height = 0;
	
	hideRubberbandDiv();
	dragging = false;
}

function moveRubberbandDiv() {
	rubberbandDiv.style.left = rubberbandRectangle.left + "px";
	rubberbandDiv.style.top = rubberbandRectangle.top + "px";
}

function resizeRubberbandDiv() {
	rubberbandDiv.style.width = rubberbandRectangle.width + "px";
	rubberbandDiv.style.height = rubberbandRectangle.height + "px";
}

function resetRubberbandRectangle() {
	rubberbandRectangle = {
		top: 0, left: 0, width: 0, height: 0
	};
}

function showRubberbandDiv() {
	rubberbandDiv.style.display = "inline";
}

function hideRubberbandDiv() {
	rubberbandDiv.style.display = "none";
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
	var x = e.x || e.clientX,
		y = e.y || e.clientY;
	e.preventDefault();
	rubberbandStart(x, y);
}

window.onmousemove = function(e) {
	var x = e.x || e.clientX,
		y = e.y || e.clientY;
	e.preventDefault();
	if (dragging) {
		rubberbandStretch(x, y);
	}
}

window.onmouseup = function(e) {
	e.preventDefault();
	rubberbandEnd();
}

// Initialization.................................................................
image.src = "../../shared/images/arch.png";
image.onload = function() {
	drawImage();
}