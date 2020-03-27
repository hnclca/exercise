var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	radius = canvas.width/2;
	
var SHADOW_STYLE = "rgba(100, 100, 150, 0.8)",
	SHADOW_OFFSET = 5,
	SHADOW_BLUR = 15,
	FONT_CONTENT_TEXT = "HELLO",
	FONT_CONTENT_STYLE = "128pt Comic Sans MS",
	FONT_FILL_COLOR = "cornflowerblue",
	FONT_STROKE_COLOR = "yellow",
	FONT_POSITION_X = 20,
	FONT_POSITION_Y = 250;

// Functions.
function setShadowAttributes() {
	context.shadowColor = SHADOW_STYLE;
	context.shadowOffsetX = SHADOW_OFFSET;
	context.shadowOffsetY = SHADOW_OFFSET;
	context.shadowBlur = SHADOW_BLUR;
}

function setFontContentAttributes() {
	context.lineWidth = 0.5;
	context.font = FONT_CONTENT_STYLE;
	context.fillStyle = FONT_FILL_COLOR;
	context.strokeStyle = FONT_STROKE_COLOR;
}

function drawText() {
	context.save();

	setShadowAttributes();
	setFontContentAttributes();
	context.fillText(FONT_CONTENT_TEXT, FONT_POSITION_X, FONT_POSITION_Y);
	context.strokeText(FONT_CONTENT_TEXT, FONT_POSITION_X, FONT_POSITION_Y);

	context.restore();
}

function setClippingRegion(radius) {
	context.beginPath();
	context.arc(canvas.width/2, canvas.height/2, radius, 0, Math.PI*2, false);
	context.clip();
}

function fillCanvas(color) {
	context.fillStyle = color;
	context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawAnimationFrame(radius) {
	context.save();

	setClippingRegion(radius);
	fillCanvas("wheat");
	drawText();

	context.restore();
}

function animateClipping() {
	radius -= canvas.width/100;
	fillCanvas("charcoal");

	if (radius > 0) {
		drawAnimationFrame(radius)
		requestAnimationFrame(animateClipping);
	} else {
		setTimeout(function(e) {
			context.clearRect(0, 0, canvas.width, canvas.height);
			drawText();
		}, 1000);
	}
}

// Event handlers.
canvas.onmousedown = function(e) {
	radius = canvas.width/2;
	animateClipping();
}

// Initialization.
drawText();