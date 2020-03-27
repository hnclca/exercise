// 窗口坐标转换为画板坐标.
function window2Canvas(canvas, x, y) {
	var bbox = canvas.getBoundingClientRect();
	return {
		x: x - bbox.left * (canvas.width / bbox.width),
		y: y - bbox.top * (canvas.height / bbox.height)
	}
}

// 绘制网格.
function drawGrid(context, color, stepX, stepY) {
	context.save();
	context.lineWidth = 0.5;
	context.strokeStyle = color;
	
	var width = context.canvas.width
		height = context.canvas.height;
	
	var x = stepX + 0.5,
		y = stepY + 0.5;
	while (x < width) {
		_drawHorizontalLine(context, x, height);
		x += stepX;
	}
	
	while (y < height) {
		_drawVerticalLine(context, width, y);
		y += stepY;
	}
	context.restore();
}

// 绘制辅助线.
function drawGuidelines(context, color, x, y) {
	context.save();
	context.lineWidth = 0.5;
	context.strokeStyle = color;
	
	var width = context.canvas.width
		height = context.canvas.height;
	
	_drawHorizontalLine(context, x + 0.5, height);
	_drawVerticalLine(context, width, y + 0.5);
	context.restore();
}

// 其他函数
function _drawHorizontalLine(context, x, height) {
	context.beginPath();
	context.moveTo(x, 0);
	context.lineTo(x, height);
	context.stroke();
}

function _drawVerticalLine(context, width, y) {
	context.beginPath();
	context.moveTo(0, y);
	context.lineTo(width, y);
	context.stroke();
}