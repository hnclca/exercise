var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	scaleOutput = document.getElementById("scaleOutput"),
	scaleSlider = document.getElementById("scaleSlider"),
	scale = parseFloat(scaleSlider.value),
	radiusOutput = document.getElementById("radiusOutput"),
	radiusSlider = document.getElementById("radiusSlider"),
	radius = parseFloat(radiusSlider.value),
	image = new Image(),
	offscreenCanvas = document.createElement("canvas"),
	offscreenContext = offscreenCanvas.getContext("2d"),
	mousedown = {},
	dragging = false,
	magnifyRectangle = {},
	magnifyglassX = canvas.width/2,
	magnifyglassY = canvas.height/2,
	imageData = undefined;
	
var MAXIMUM_SCALE = 3.0,
	MINIMUM_SCALE = 1.0,
	MAXIMUM_RADIUS = 250,
	MINIMUM_RADIUS = 40;

// Functions.
function draw() {
	drawMagnifyglass();
	drawMagnifyglassBorder();
}

function drawScaledText(scale) {
	var text = parseFloat(scale).toFixed(2),
		percent = (scale - MINIMUM_SCALE) / (MAXIMUM_SCALE - MINIMUM_SCALE);

	scaleOutput.innerText = text;
	percent = percent < 0.35 ? 0.35 : percent;

	scaleOutput.style.fontSize = percent*MAXIMUM_SCALE/1.5 + "em";
}

function drawMagnifyglassBorder() {
	var gradientThickness = 10;
	// gradientThickness = gradientThickness < 10 ? 10:gradientThickness;
	// gradientThickness = gradientThickness > 40 ? 40:gradientThickness;

	context.save();
	context.lineWidth = gradientThickness;
	// context.strokeStyle = "rgba(0, 0, 255, 0.3)";
	context.beginPath();
	context.arc(magnifyglassX, magnifyglassY, radius, 0, Math.PI*2, false);
	context.clip();

	var gradient = context.createRadialGradient(
		magnifyglassX, magnifyglassY, radius - gradientThickness,
		magnifyglassX, magnifyglassY, radius
	);
	gradient.addColorStop(0, "rgba(0, 0, 0, 0.2)");
	gradient.addColorStop(0.8, "rgb(235, 237, 255)");
	gradient.addColorStop(0.9, "rgb(235, 237, 255)");
	gradient.addColorStop(1, "rgba(150, 150, 150, 0.9)");

	context.shadowColor = "rgba(52, 72, 35, 1.0)";
	context.shadowOffsetX = 2;
	context.shadowOffsetY = 2;
	context.shadowBlur = 20;

	context.strokeStyle = gradient;
	context.stroke();

	context.beginPath();
	context.arc(magnifyglassX, magnifyglassY, radius - gradientThickness/2, 0, Math.PI*2, false);
	context.clip();
	context.strokeStyle = "rgba(0, 0, 0, 0.06)";
	context.stroke();

	context.restore();
}

function setClip() {
	context.beginPath();
	context.arc(magnifyglassX, magnifyglassY, radius, 0, Math.PI*2, false);
	context.clip();
}

function drawMagnifyglass() {
	var scaledMagnifyRectangle = null;

	calculateMagnifyglass();

	imageData = context.getImageData(magnifyRectangle.x, magnifyRectangle.y,
		magnifyRectangle.width, magnifyRectangle.height);
	
	scaledMagnifyRectangle = {
		width: magnifyRectangle.width * scale,
		height: magnifyRectangle.height * scale
	}

	context.save();
	setClip();
	context.drawImage(
		canvas, magnifyRectangle.x, magnifyRectangle.y,
		magnifyRectangle.width, magnifyRectangle.height,
		magnifyRectangle.x + magnifyRectangle.width/2 - scaledMagnifyRectangle.width/2,
		magnifyRectangle.y + magnifyRectangle.height/2 - scaledMagnifyRectangle.height/2,
		scaledMagnifyRectangle.width, scaledMagnifyRectangle.height
	);
	context.restore();

	drawMagnifyglassBorder();
}

function updateMagnifyglass() {
	eraseMagnifyglass();
	drawMagnifyglass();
}

function eraseMagnifyglass() {
	if (imageData !== undefined) {
		context.putImageData(imageData, magnifyRectangle.x, magnifyRectangle.y);
	}
}

function calculateMagnifyglass() {
	var top, bottom, left, right;

	magnifyRectangle.x = magnifyglassX - radius;
	magnifyRectangle.y = magnifyglassY - radius;
	magnifyRectangle.width = (radius + context.lineWidth) * 2;
	magnifyRectangle.height = (radius + context.lineWidth) * 2;

	top = magnifyRectangle.y;
	left = magnifyRectangle.x;
	bottom = magnifyRectangle.y + magnifyRectangle.height;
	right = magnifyRectangle.x + magnifyRectangle.width;

	if (left < 0) {
		magnifyRectangle.width += left;
		magnifyRectangle.x = 0;
	} else if (right > canvas.width) {
		magnifyRectangle.width -= right - canvas.width;
	}

	if (top < 0) {
		magnifyRectangle.height += top;
		magnifyRectangle.y = 0;
	} else if (bottom > canvas.height) {
		magnifyRectangle.height -= bottom - canvas.height;
	}
}

// controls........................................................
scaleSlider.onchange = function(e) {
	scale = parseFloat(e.target.value);
	drawScaledText(scale);
	updateMagnifyglass();
}

radiusSlider.onchange = function(e) {
	radius = parseFloat(e.target.value);
	radiusOutput.innerText = radius;
	updateMagnifyglass();
	drawMagnifyglassBorder();
}

// mouse event handlers...................................................
canvas.onmousedown = function(e) {
	e.preventDefault();
	dragging = true;
}

canvas.onmousemove = function(e) {
	var loc = window2Canvas(canvas, e.clientX, e.clientY);
	e.preventDefault();

	if (dragging) {
		magnifyglassX = loc.x;
		magnifyglassY = loc.y;
		eraseMagnifyglass();
		draw();
	}
}

window.onmouseup = function(e) {
	e.preventDefault();

	mousedown = {};
	dragging = false;
}

// drag and drop..................................................................
// 阻止浏览器默认动作，在新窗口打开图片。
document.ondrop = function(e) {
	e.preventDefault();
}

canvas.addEventListener('dragenter', function (e) {
	e.preventDefault();
	e.dataTransfer.effectAllowed = 'copy';
 }, false);
 
 canvas.addEventListener('dragover', function (e) {
	e.preventDefault();
 }, false);
 
 window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
 
 canvas.addEventListener('drop', function (e) {
	// set your image types
	var imageTypes = ['image/png', 'image/gif', 'image/bmp', 'image/jpg', 'image/jpeg'];
	if (e.dataTransfer && e.dataTransfer.files) {
	  // e.dataTransfer.files is a FileList
	  // e.dataTransfer.files[0].type is a Blob.type
	  var file = e.dataTransfer.files[0];
	  var fileType = file.type;
	  if (imageTypes.includes(fileType)) {
		window.requestFileSystem(window.TEMPORARY, 5*1024*1024,
			function (fs) {
				fs.root.getFile(file.name, {create: true},
					function (fileEntry) {
						fileEntry.createWriter(function (writer) {
						writer.write(file);
						});
						image.src = fileEntry.toURL();
					},
		
					function (e) {
						alert(e.code);
					}
				);
			},
		
			function (e) {
				alert(e.code);
			}
		);
	  } else {
		window.alert('dropped file is not an image');
	  }
	}
 }, false); 

// Initialization.
offscreenCanvas.width = canvas.width;
offscreenCanvas.height = canvas.height;

image.src = "../../shared/images/camp.png"
image.onload = function(e) {
	// context.drawImage(image, 0, 0, canvas.width, canvas.height);
	// offscreenContext.drawImage(image, 0, 0, canvas.width, canvas.height);
	context.drawImage(image, 0, 0, image.width,
		image.height, 0, 0, canvas.width, canvas.height);

	drawScaledText(scale);
	draw();
}