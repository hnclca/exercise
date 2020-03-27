var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	sameDirectionCbx = document.getElementById("sameDirectionCbx"),
	annotationCbx = document.getElementById("annotationCbx");
	
var SHADOW_STYLE = "rgba(0, 0, 0, 0.8)",
	SHADOW_OFFSET = 12,
	SHADOW_BLUR = 15,
	FONT_CONTENT_STYLE = "16px Lucida Sans",
	FONT_CONTENT_COLOR = "blue";

// Functions.
function setShadowAttributes() {
	context.shadowColor = SHADOW_STYLE;
	context.shadowOffsetX = SHADOW_OFFSET;
	context.shadowOffsetY = SHADOW_OFFSET;
	context.shadowBlur = SHADOW_BLUR;
}

function clearShadowAttributes() {
	context.shadowColor = undefined;
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
}

function setFontContentAttributes() {
	context.font = FONT_CONTENT_STYLE;
	context.fillStyle = FONT_CONTENT_COLOR;
}

function drawTwoArcs(sameDirection){	
	var x = 300
		y = 170;
	
	context.beginPath();
	context.arc(x, y, 100, 0, Math.PI*2, false);
	context.arc(x, y, 150, 0, Math.PI*2, !sameDirection);
	context.fill();
	clearShadowAttributes();
	context.stroke();
}

function draw(sameDirection) {
	context.clearRect(0, 0, canvas.width, canvas.height);
	
	drawGrid(context, "lightgray", 10, 10);
	
	context.save();
	setShadowAttributes();
	drawTwoArcs(sameDirection);
	context.restore();
	
	drawText();
	
	if (annotationCbx.checked) {
		drawAnnotation(sameDirection);
	}
}

function drawText() {
	context.save();
	
	// title.
	context.font = "18px Arial";
	context.fillStyle="rgb(0, 0, 200)";
	context.fillText("Two arcs, one path", 10, 30);
	
	// arc details.
	setFontContentAttributes();
	context.fillText("context.arc(300, 170, 100, 0, Math.PI*2, false)", 10, 360);
	context.fillText("context.arc(300, 170, 150, 0, Math.PI*2, !sameDirection)", 10, 380);
	
	context.restore();
}

function drawAnnotation(sameDirection) {
	context.save();
	
	context.strokeStyle = "blue";
	
	drawInnerCircleAnnotation(sameDirection);
	drawOuterCircleAnnotation(sameDirection);
	drawArcDirectionAnnotation(sameDirection);
	
	context.restore();
}

function drawInnerCircleAnnotation(sameDirection) {
	context.save();
	
	context.strokeStyle = "navy";
	context.fillStyle = "navy";
	context.beginPath();
	context.moveTo(300, 175);
	context.lineTo(100, 250);
	context.stroke();
	
	context.beginPath();
	context.arc(100, 250, 3, 0, Math.PI*2);
	context.fill();
	
	setFontContentAttributes();
	context.fillText("+1", 215, 185);
	context.fillText(sameDirection ? "+1" : "-1", 125, 225);
	context.fillText(sameDirection ? "2" : "0", 75, 255);
	
	context.restore();
}

function drawOuterCircleAnnotation(sameDirection) {
	context.save();
	
	context.strokeStyle = "navy";
	context.fillStyle = "navy";
	context.beginPath();
	context.moveTo(410, 210);
	context.lineTo(500, 250);
	context.stroke();
	
	context.beginPath();
	context.arc(500, 250, 3, 0, Math.PI*2);
	context.fill();
	
	setFontContentAttributes();
	context.fillText(sameDirection ? "+1" : "-1", 455, 225);
	context.fillText(sameDirection ? "1" : "-1", 515, 255);
	
	context.restore();
}

function drawArcDirectionAnnotation(sameDirection) {
	context.save();
	
	setFontContentAttributes();
	context.fillText("CW", 345, 145);
	context.fillText(sameDirection ? "CW" : "CCW", 425, 75);
	
	context.restore();
}

// Event handlers.
sameDirectionCbx.onclick = function(e) {
	draw(sameDirectionCbx.checked);
}

annotationCbx.onclick = function(e) {
	draw(sameDirectionCbx.checked);
}

// Initialization.
context.fillStyle = 'rgba(100, 140, 230, 0.5)';
context.strokeStyle = context.fillStyle;
draw(sameDirectionCbx.checked);