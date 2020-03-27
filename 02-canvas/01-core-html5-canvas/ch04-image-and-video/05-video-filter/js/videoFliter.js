var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	offscreenCanvas = document.createElement("canvas"),
	offscreenContext = offscreenCanvas.getContext("2d"),
	video = document.getElementById("video"),
	controlButton = document.getElementById("controlButton"),
	colorCheckbox = document.getElementById("colorCheckbox"),
	flipCheckbox = document.getElementById("flipCheckbox"),
	poster = new Image(),
	imageData = undefined;

// Functions...................................................................
function removeColor() {
	var average, length, data;

	imageData = offscreenContext.getImageData(0, 0, 
		offscreenCanvas.width, offscreenCanvas.height);
	data = imageData.data;
	length = data.length;

	for(var i = 0; i < length - 4; i+=4) {
		average = (data[i] + data[i+1] + data[i+2])/3;
		data[i] = average;
		data[i+1] = average;
		data[i+2] = average;
	}

	offscreenContext.putImageData(imageData, 0, 0);
}

function drawFlip() {
	var width = canvas.width,
		height = canvas.height;

	context.save();

	context.translate(width/2, height/2);
	context.rotate(Math.PI);
	context.translate(-width/2, -height/2);
	context.drawImage(offscreenCanvas, 0, 0);

	context.restore();
}

function nextVideoFrame() {
	if (video.ended) {
		controlButton.value = "播放";
	} else {
		offscreenContext.drawImage(video, 0, 0);

		if (!colorCheckbox.checked) {
			removeColor();
		}

		if (flipCheckbox.checked) {
			drawFlip();
		} else {
			context.drawImage(offscreenCanvas, 0, 0);
		}
		// requestNextAnimationFrame(nextVideoFrame);
		window.requestAnimationFrame(nextVideoFrame);
	}
}

function startPlaying() {
	// requestAnimationFrame(nextVideoFrame);
	window.requestAnimationFrame(nextVideoFrame);
	video.play();
}

function endPlaying() {
	video.pause();
}

// Event handles..................................................................
controlButton.onclick = function(e) {
	if (controlButton.value === "播放") {
		startPlaying();
		controlButton.value = "暂停";
	} else {
		endPlaying();
		controlButton.value = "播放";
	}
}

// Initialization.................................................................
poster.src = "../../shared/images/big-buck-bunny-poster.png";
poster.onload = function(e) {
	context.drawImage(poster, 0, 0, canvas.width, canvas.height);
}

offscreenCanvas.width = canvas.width;
offscreenCanvas.height = canvas.height;