var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	animateButton = document.getElementById("animateButton"),
	sky = new Image(),
	tree = new Image(),
	nearTree = new Image(),
	grass = new Image(),
	grass2 = new Image(),
	pause = true,
	lastTime = 0,
	skyOffset = 0,
	treeOffset = 0,
	nearTreeOffset = 0,
	grassOffset = 0,
	fps = 60,
	animateHandler;

var SKY_VELOCITY = 8,
	TREE_VELOCITY = 20,
	NEAR_TREE_VELOCITY = 40,
	GRASS_VELOCITY = 75;

// Functions...................................................................
function erase() {
	context.clearRect(0, 0, canvas.width, canvas.height);
}

function draw() {
	drawSky();
	drawTree();
	drawNearTree();
	drawGrass();
}

function drawSky() {
	context.save();

	skyOffset = skyOffset < canvas.width ? skyOffset + SKY_VELOCITY/fps : 0;

	context.translate(-skyOffset, 0);
	context.drawImage(sky, 0, 0);
	context.drawImage(sky, sky.width - 2, 0);

	context.restore();
}

function drawTree() {
	context.save();

	treeOffset = treeOffset < canvas.width ? treeOffset + TREE_VELOCITY/fps : 0;

	context.translate(-treeOffset, 0);
	context.drawImage(tree, 100, 240);
	context.drawImage(tree, 1100, 240);
	context.drawImage(tree, 400, 240);
	context.drawImage(tree, 1400, 240);
	context.drawImage(tree, 700, 240);
	context.drawImage(tree, 1700, 240);

	context.restore();
}

function drawNearTree() {
	context.save();

	nearTreeOffset = nearTreeOffset < canvas.width ? nearTreeOffset + NEAR_TREE_VELOCITY/fps : 0;

	context.translate(-nearTreeOffset, 0);
	context.drawImage(nearTree, 250, 220);
	context.drawImage(nearTree, 1250, 220);
	context.drawImage(nearTree, 800, 220);
	context.drawImage(nearTree, 1800, 220);

	context.restore();
}

function drawGrass() {
	var grassHeight = canvas.height - grass.height,
		grass2Height = canvas.height - grass2.height;

	context.save();

	grassOffset = grassOffset < canvas.width ? grassOffset + GRASS_VELOCITY/fps : 0;

	context.translate(-grassOffset, 0);
	context.drawImage(grass, 0, grass2Height);
	context.drawImage(grass, grass2.width - 2, grass2Height);
	context.drawImage(grass, 0, grassHeight);
	context.drawImage(grass, grass.width - 2, grassHeight);

	context.restore();
}

function animate(now) {
	if (now === undefined) {
		now = new Date();
	}

	if (!pause) {
		erase();
		draw();
		animateHandler = requestAnimationFrame(animate);
	}
}

// Event handles..................................................................
animateButton.onclick = function(e) {
	e.preventDefault();
	pause = !pause;
	
	if (pause) {
		animateButton.value = "动画";
		cancelAnimationFrame(animateHandler);
	} else {
		animateButton.value = "暂停";
		requestAnimationFrame(animate);
	}
}

// Initialization.................................................................
grass.src = "../../shared/images/grass.png";
grass2.src = "../../shared/images/grass2.png";
tree.src = "../../shared/images/smalltree.png";
nearTree.src = "../../shared/images/tree-twotrunks.png";
sky.src = "../../shared/images/sky.png";
sky.onload = function() {
	draw();
}