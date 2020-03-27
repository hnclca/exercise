var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	cursor = new TextCursor(),
	paragraph;

var TEXT_STROKE_STYLE = "rgba(200, 0, 0, 0.7)",
	TEXT_FILL_STYLE = "rgba(100, 130, 240, 0.5)",
	TEXT_FONT_STYLE = "38px Lucida Sans";

// Functions.
// save and restore drawing surface.......................
function saveDrawingSurface() {
	drawingSurfaceImageData = context.getImageData(
		0, 0, canvas.width, canvas.height);
}

function restoreDrawingSurface() {
	context.putImageData(drawingSurfaceImageData, 0, 0);
}

// draw functions........................................................
function drawBackground() {
	drawGrid(context, "lightgray", 10, 10);
}

// event handlers........................................................
canvas.onmousedown = function(e) {
	var loc = window2Canvas(canvas, e.clientX, e.clientY),
		fontHeight;
	e.preventDefault();

	cursor.erase(context, drawingSurfaceImageData);
	saveDrawingSurface();

	if (paragraph && paragraph.isPointInside(context, loc)) {
		paragraph.moveCursorCloseTo(context, loc.x, loc.y);
	} else {
		fontHeight = context.measureText("W").width;
		fontHeight += fontHeight / 6;
		paragraph = new Paragraph(loc.x, loc.y - fontHeight, 
			drawingSurfaceImageData, cursor);
		paragraph.addLine(context, new TextLine(loc.x, loc.y));
	}
}

document.onkeydown = function (e) {
	if (e.keyCode === 8 || e.keyCode === 13) {
		e.preventDefault();

		if (e.keyCode === 8) {
			paragraph.backspace(context);
		} else {
			paragraph.newLine(context);
		}
	}
}

document.onkeypress = function(e) {
	var key = String.fromCharCode(e.which);

	if (e.keyCode !== 8 && !e.ctrlKey && !e.metaKey) {
		e.preventDefault();

		paragraph.insert(context, key);
	}
}

// Initialization........................................................
// context.textAlign = "center";
// context.textBaseline = "middle";
context.fillStyle = TEXT_FILL_STYLE;
context.strokeStyle = TEXT_STROKE_STYLE;
context.font = TEXT_FONT_STYLE;

drawBackground();
saveDrawingSurface();