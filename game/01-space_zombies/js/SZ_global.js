// global vars

// need to keep ratio.
let ratio;

let use_ratio = ratio;

//need easy access to the width.
let newWidth;

// div containerId for images.
let div_ids = ["#SZ0_1", "#SZ0_2", "#SZ0_3"];

// size of sprites
let image_sizes = [[150, 150], [200, 90], [235, 100]];

// can I click button.
let canIClick = 0;


let zombieHits_counter = [0,0,0,0,0,0];

let zombieHits_limits = [2,1,3,2,1,3];

let scaleX_zombie = [0,0,0,0,0,0];

let leftX_zombie = [0,0,0,0,0,0];

let current_shots = 0;

let max_shots= 5;

// z-index depth
let current_zindex = 0;

let game_ended = 0;

let current_score = 0;