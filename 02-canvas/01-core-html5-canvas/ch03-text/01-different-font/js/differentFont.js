var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	y = 0;
	
var LEFT_COLUMN_X = 25,
	RIGHT_COLUMN_X = 425,
	DELTA_Y = 50,
	LEFT_COLUMN_FONTS = [
		"normal normal normal 2em palatino",
		"italic small-caps normal 1.5em lucida console",
		"oblique bold medium fantasy",
		"normal bolder smaller monaco",
		"normal lighter larger copperplate",
		"normal 900 28px century",
		"normal normal 200 16pt tahoma",
		"normal normal 100 300% impact",
		"normal normal 100 150% Comic Sans MS"
	],
	RIGHT_COLUMN_FONTS = [
		"oblique 1.5em lucida console", "x-large fantasy",
		"italic 28px monaco", "italic large copperplate",
		"36px century", "28px tahoma",
		"28px impact"
	];

// Functions.
context.fillStyle = "blue";

context.font = "28px Arial";
context.fillText("font-style font-variant font-weight font-size font-family", LEFT_COLUMN_X, y+=DELTA_Y);

LEFT_COLUMN_FONTS.forEach(function(font) {
	context.font = font;
	context.fillText(font, LEFT_COLUMN_X, y+=DELTA_Y);
});

y = 0;

// RIGHT_COLUMN_FONTS.forEach(function(font) {
// 	context.font = font;
// 	context.fillText(font, RIGHT_COLUMN_X, y+=DELTA_Y);
// });