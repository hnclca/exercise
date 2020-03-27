var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	fontHeight = 24,
	alignValues = ["start", "center", "end"];
	alignValues2 = ["left", "center", "right"];
	baselineValues = ["top", "middle", "bottom", "alphabetic", "ideographic", "hanging"],
	x = y = 0;

// Functions...........................................................................
function drawTextMarker() {
	context.fillStyle = "yellow";
	context.fillRect(x, y, 7, 7);
	context.strokeRect(x, y, 7, 7);
}

function drawText(text, textAlign, textBaseline) {
	if (textAlign) context.textAlign = textAlign;
	if (textBaseline) context.textBaseline = textBaseline;

	context.fillStyle = "cornflowerblue";
	context.fillText(text, x, y);
}

function drawTextLine() {
	context.strokeStyle = "gray";
	context.beginPath();
	context.moveTo(x, y);
	context.lineTo(x + 738, y);
	context.stroke();
}

// Initialization........................................................
context.font = "oblique normal bold 24px palatino";

drawGrid(context, "lightgray", 10, 10);

var textAlign, textBaseline;
for (var align=0; align < alignValues.length; align++) {
	for (var baseline = 0; baseline < baselineValues.length; baseline++) {
		x = 20 + align*fontHeight*15;
		y = 20 + baseline*fontHeight*3;

		if (baseline % 2 === 0) {
			textAlign = alignValues[align];
		} else {
			textAlign = alignValues2[align];
		}
		textBaseline = baselineValues[baseline];

		drawText(textAlign + "/" + textBaseline, textAlign, textBaseline);

		drawTextMarker();
		drawTextLine();
	}
}