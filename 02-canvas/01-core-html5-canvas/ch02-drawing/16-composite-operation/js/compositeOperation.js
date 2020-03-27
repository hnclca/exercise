var canvasDiv = document.getElementById("canvasDiv"),
	bitmapCbx = document.getElementById("bitmapCbx"),
	sourceImage = new Image(),
	destinationImage = new Image(),
	isBitmap = bitmapCbx.checked,
	loadImage = 0;
	
var IMAGE_WIDTH = 160,
	IMAGE_HEIGHT = 150,
	CANVAS_WIDTH = 120,
	CANVAS_HEIGHT = 110,
	SOURCE_FILL_STYLE = "blue",
	DEST_FILL_STYLE = "red";

// Functions.
var context;
function addElement(operation) {
	var div = document.createElement("div");
	var p = document.createElement("p");
	var canvas = document.createElement("canvas");
	div.className = "container";
	canvas.width = CANVAS_WIDTH;
	canvas.height = CANVAS_HEIGHT;
	p.innerText = operation;
	p.className = "title";

	div.appendChild(p);
	div.appendChild(canvas);
	canvasDiv.appendChild(div);

	context = canvas.getContext("2d");
}


function draw(isBitmap) {
	var cnt  = operations.length;
	
	for(var i = 0; i < cnt; i++) {
		var operation = operations[i];
		addElement(operation);
		if (isBitmap) {
			drawBitmap(operation);
		} else {
			drawPath(operation);
		}
	}
	
}

// path......................................................
function drawPath(operation) {
	context.save();

	if (operation === "source") {
		drawRect();
	} else if (operation === "destination") {
		drawCircle();
	} else {
		drawRect();
		context.globalCompositeOperation = operation;
		drawCircle();
	}

	context.restore();
}

function drawRect() {
	context.fillStyle = SOURCE_FILL_STYLE;
	context.beginPath();
	context.rect(0, 0, CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
	context.fill();
}

function drawCircle() {
	context.fillStyle = DEST_FILL_STYLE;
	context.beginPath();
	context.arc(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, 
		Math.min(CANVAS_WIDTH, CANVAS_HEIGHT)/2, 0, Math.PI*2, false);
	context.fill();
}

// bitmap....................................................
function drawBitmap(operation) {
	context.save();

	if (operation === "source") {
		drawForeground();
	} else if (operation === "destination") {
		drawBackground();
	} else {
		drawBackground();
		context.globalCompositeOperation = operation;
		drawForeground();
	}

	context.restore();
}

function drawForeground() {
	context.drawImage(sourceImage, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function drawBackground() {
	context.drawImage(destinationImage, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

// Event handlers.
bitmapCbx.onclick = function(e) {
	isBitmap = bitmapCbx.checked;

	canvasDiv.innerHTML = "";
	draw(isBitmap);
}

// Initialization.
var operations = [
	"source", "destination", "source-atop", "source-in", "source-out", "source-over",
	"destination-atop", "destination-in", "destination-out", "destination-over",
	"clear", "soft-light", "darken", "multiply", "overlay", "screen", "lighten", "lighter", 
	"difference", "exclusion", "add", "hard-light", "copy", "xor", "color-dodge", "color-burn",
	"hue", "saturation", "color", "luminosity"
];

sourceImage.src = "../../shared/images/source.png";
sourceImage.onload = function(e) {
	loadImage++;
	if (loadImage===2) {
		draw(isBitmap);
	}
}

destinationImage.src = "../../shared/images/destination.png";
destinationImage.onload = function(e) {
	loadImage++;
	if (loadImage===2) {
		draw(isBitmap);
	}
}