var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	scaleOutput = document.getElementById("scaleOutput"),
	scaleSlider = document.getElementById("scaleSlider"),
	image = new Image(),
	offscreenCanvas = document.createElement("canvas"),
	offscreenContext = offscreenCanvas.getContext("2d"),
	scale = scaleSlider.value;
	
var MAXIMUM_SCALE = 3.0,
	MINIMUM_SCALE = 1.0;

// Functions.
function drawScaled(scale) {
	var w = canvas.width,
		h = canvas.height,
		sw = scale * w,
		sh = scale * h;

	context.drawImage(offscreenCanvas, 0, 0, offscreenCanvas.width,
		offscreenCanvas.height, -sw/2 + w/2, -sh/2 + h/2, sw, sh);

	drawScaledText(scale);
}

function drawScaledText(scale) {
	var text = parseFloat(scale).toFixed(2),
		percent = (scale - MINIMUM_SCALE) / (MAXIMUM_SCALE - MINIMUM_SCALE);

	scaleOutput.innerText = text;
	percent = percent < 0.35 ? 0.35 : percent;

	scaleOutput.style.fontSize = percent*MAXIMUM_SCALE/1.5 + "em";
}

function drawWatermark(context) {
	var width = context.canvas.width,
		height = context.canvas.height,
		content = "Copyright";

	context.save();
	context.globalAlpha = 0.6;
	context.textAlign = "center";
	context.textBaseline = "center";
	context.font = "bold 128px Comic Sans MS";
	context.fillStyle = "blueviolet";
	context.fillText(content, width/2, height/2);

	context.restore();
}

// controls........................................................
scaleSlider.onchange = function(e) {
	scale = e.target.value;

	if (scale > MAXIMUM_SCALE) {
		scale = MAXIMUM_SCALE;
	} else if (scale < MINIMUM_SCALE) {
		scale = MINIMUM_SCALE;
	}
	drawScaled(scale);
}

// Initialization.
offscreenCanvas.width = canvas.width;
offscreenCanvas.height = canvas.height;

image.src = "../../shared/images/lonelybeach.png"
image.onload = function(e) {
	context.drawImage(image, 0, 0, canvas.width, canvas.height);
	offscreenContext.drawImage(image, 0, 0, canvas.width, canvas.height);
	drawWatermark(context);
	drawWatermark(offscreenContext);
	drawScaledText(scale);
}