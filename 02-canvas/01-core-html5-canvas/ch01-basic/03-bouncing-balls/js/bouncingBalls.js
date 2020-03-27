var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	glasspane = document.getElementById("glasspane"),
	startButton = document.getElementById("startButton"),
	pause = true,
	circles = [];

var GRID_SPACING = 10;

// Functions...................................................................
function drawGrid() {
	var width = canvas.width;
	var height = canvas.height;

	context.strokeStyle = "lightgray";
	context.lineWidth = 0.5;

	while(height > 0) {
		drawHorizontalLine(height);
		height -= GRID_SPACING;
	}

	while(width > 0) {
		drawVerticalLine(width);
		width -= GRID_SPACING;
	}
}

function drawVerticalLine(x) {
	context.beginPath();
	context.moveTo(x, 0);
	context.lineTo(x, canvas.height);
	context.stroke();
}

function drawHorizontalLine(y) {
	context.beginPath();
	context.moveTo(0, y);
	context.lineTo(canvas.width, y);
	context.stroke();
}


function adjustPosition(circle) {
	if (circle.x + circle.velocityX + circle.radius > canvas.width ||
		circle.x + circle.velocityX - circle.radius < 0) {
			circle.velocityX = -circle.velocityX;
	}

	if (circle.y + circle.velocityY + circle.radius > canvas.height ||
		circle.y + circle.velocityY - circle.radius < 0) {
			circle.velocityY = -circle.velocityY;
	}

	circle.x += circle.velocityX;
	circle.y += circle.velocityY;
}

var animate = function(time) {
	if (!pause) {
		context.clearRect(0, 0, canvas.width, canvas.height);

		drawGrid();

		circles.forEach(function(circle) {
			context.beginPath();
			context.arc(circle.x, circle.y, circle.radius, 0, Math.PI*2);
			context.fillStyle = circle.color;
			context.fill();
			adjustPosition(circle);
		});

		window.requestAnimationFrame(animate);
	}
};

// Event handles..................................................................
startButton.onclick = function(e) {
	e.preventDefault();
	pause = !pause;
	startButton.innerText = pause ? "开始" : "结束";

	if (!pause) {
		animate(0);
	}
}

glasspane.onmousedown = function(e) {
	e.preventDefault();
}

canvas.onmousedown = function(e) {
	e.preventDefault();
}

// Initialization.................................................................
for(var i = 0; i < 100; i++) {
	circles[i] = {
		x: 100,
		y: 100,
		velocityX: 3 * Math.random(),
		velocityY: 3 * Math.random(),
		radius: 50 * Math.random() + 5,
		color: 'rgb(' + 
			(Math.random()*255).toFixed(0) + ', ' +
			(Math.random()*255).toFixed(0) + ', ' +
			(Math.random()*255).toFixed(0) + ')'
	};
}

drawGrid();