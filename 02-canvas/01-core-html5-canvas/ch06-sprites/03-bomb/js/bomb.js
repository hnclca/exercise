var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	fireButton = document.getElementById("fireButton"),
	explosionPainters = [],
	fireBurningPainters = [];

var BOMB_LEFT = 16,
	BOMB_TOP = 16,
	BOMB_WIDTH = 180,
	BOMB_HEIGHT = 130,
	NUM_EXPLOSION_PAINTERS = 9,
	NUM_FUSE_PAINTERS = 9.
	FIRE_BURNING_DURATION = 2000,
	EXPLOSION_DURATION = 1000;

// Functions...................................................................
function resetBombNoFuse() {
	bomb.painter = bombNoFusePainter;
}

// Event handlers..................................................................
fireButton.onclick = function(e) {
	if (bomb.animating) {
		return;
	}

	fireBurningAnimtor.start(bomb, FIRE_BURNING_DURATION);

	setTimeout(function () {
		explosionAnimtor.start(bomb, EXPLOSION_DURATION);
	}, 3000);
}

// Animation.......................................................................
function animate(time) {
	context.clearRect(0, 0, canvas.width, canvas.height);
	bomb.paint(context);
	window.requestAnimationFrame(animate);
}

// Initialization.................................................................
bombPainter = new ImagePainter("../../shared/images/bomb.png");
bombNoFusePainter = new ImagePainter("images/bomb-no-fuse.png");

explosionAnimtor = new SpriteAnimator(explosionPainters, 
	function (sprite) {
		sprite.painter = bombPainter;
	});

fireBurningAnimtor = new SpriteAnimator(fireBurningPainters, 
	function (sprite) {
		sprite.painter = bombNoFusePainter;
	});
	

bomb = new Sprite("bomb", bombPainter);
bomb.left = BOMB_LEFT;
bomb.top = BOMB_TOP;
bomb.width = BOMB_WIDTH;
bomb.height = BOMB_HEIGHT;

for (var i = 0; i < NUM_FUSE_PAINTERS; i++) {
	fireBurningPainters.push(new ImagePainter(
		"images/fuse-0" + i + ".png"
	));
}

for (var i = 0; i < NUM_EXPLOSION_PAINTERS; i++) {
	explosionPainters.push(new ImagePainter(
		"images/explosion-0" + i + ".png"
	));
}

window.requestAnimationFrame(animate);


