var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d");
	
var POINT_RADIUS = 7,
	ARROW_MARGIN = 30;

// Functions.
function drawArrow() {
	context.save();

	context.strokeStyle = "navy";
	context.fillStyle = "cornflowerblue";

	context.beginPath();
	context.moveTo(
		width - ARROW_MARGIN,
		ARROW_MARGIN * 2
	);
	context.lineTo(
		width - ARROW_MARGIN,
		height - ARROW_MARGIN * 2
	);
	context.quadraticCurveTo(
		points[0].x, points[0].y,
		points[1].x, points[1].y,
	);

	context.lineTo(
		ARROW_MARGIN,
		height/2 + ARROW_MARGIN
	);
	context.quadraticCurveTo(
		points[2].x, points[2].y,
		points[3].x, points[3].y,
	);
	context.lineTo(
		width - ARROW_MARGIN*2,
		ARROW_MARGIN
	);
	context.quadraticCurveTo(
		points[4].x, points[4].y,
		points[5].x, points[5].y,
	);

	context.fill();
	context.stroke();
	context.restore();
}

function drawPoints() {
	var i,
		strokeStyle,
		fillStyle;
	
	for(var i = 0; i < points.length; i++) {
		strokeStyle = i % 2 === 0 ? "navy" : "cornflowerblue";
		fillStyle = i % 2 === 0 ? "cornflowerblue" : "navy";
		drawPoint(points[i].x, points[i].y, strokeStyle, fillStyle);
	}
}

function drawPoint(x, y, strokeStyle, fillStyle) {
	context.save();

	context.strokeStyle = strokeStyle;
	context.fillStyle = fillStyle;
	context.beginPath();
	context.arc(x, y, POINT_RADIUS, 0, Math.PI*2, true);
	context.fill();
	context.stroke();

	context.restore();
}

// Initialization.
var width = canvas.width,
	height = canvas.height,
	points = [
	{
		x: width - ARROW_MARGIN,
		y: height - ARROW_MARGIN
	},
	{
		x: width - ARROW_MARGIN*2,
		y: height - ARROW_MARGIN
	},
	{
		x: POINT_RADIUS,
		y: height/2
	},
	{
		x: ARROW_MARGIN,
		y: height/2 - ARROW_MARGIN
	},
	{
		x: width - ARROW_MARGIN,
		y: ARROW_MARGIN
	},
	{
		x: width - ARROW_MARGIN,
		y: ARROW_MARGIN*2
	},
];

drawGrid(context, "lightgray", 10, 10);
drawArrow();
drawPoints();