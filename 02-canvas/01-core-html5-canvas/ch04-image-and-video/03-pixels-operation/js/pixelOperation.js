var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	resetRadio= document.getElementById("resetRadio"),
	negativeRadio= document.getElementById("negativeRadio"),
	blackAndWhiteRadio= document.getElementById("blackAndWhiteRadio"),
	image = new Image(),
	imageData = undefined,
	imageDataCopy = context.createImageData(canvas.width, canvas.height),
	worker = new Worker("js/workerFilter.js");

// Functions...................................................................
function drawImage() {
	context.drawImage(image, 0, 0, canvas.width, canvas.height);
}

function sendToWorker(filterName) {
	worker.postMessage({
		filter: filterName,
		input: imageData,
		output: imageDataCopy
	});

	worker.onmessage = function(e) {
		context.putImageData(e.data, 0, 0);
	}
}

// Event handles..................................................................
resetRadio.onchange = function(e) {
	e.preventDefault();
	drawImage();
}

negativeRadio.onchange = function(e) {
	e.preventDefault();
	sendToWorker("negative");
}

blackAndWhiteRadio.onchange = function(e) {
	e.preventDefault();
	sendToWorker("blackAndWhite");
}

embossRadio.onchange = function(e) {
	e.preventDefault();
	sendToWorker("emboss");
}

sunglassRadio.onchange = function(e) {
	e.preventDefault();
	sendToWorker("sunglass");
}

// Initialization.................................................................
image.src = "../../shared/images/curved-road.png";
image.onload = function() {
	drawImage();

	imageData = context.getImageData(0, 0, canvas.width, canvas.height);
}