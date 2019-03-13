function setup_SpriteSheet(div_name, image_name, no_of_frames, widthX, heightX) {
    let divRatio = $(div_name).height() / $(div_name).width();

    let ratio2 = Math.round(ratio * 10) / 10;

    let newDivisible = Math.round((widthX * ratio2) / no_of_frames);

    let newWidthX = newDivisible * no_of_frames;

    let newHeightX = heightX * ratio2;

    $(div_name).css('width', newWidthX);
    $(div_name).css('height', newHeightX);

    $(div_name).css('background-image', 'url(' + image_name + ')');

    $(div_name).css('background-size', newWidthX * no_of_frames + 'px ' + newHeightX + 'px');
}

function setup_gun_SS() {

    setup_SpriteSheet("#SZ0_1", "images/SZ_gun_SS.png", 28, 150, 150);

    $("#SZ0_1").animateSprite({
        fps: 10,
        animations: {
            static: [0],
            reload: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
            fire: [24,25,26,27,28]
        },
        duration: 50,
        loop: false,
        complete: function () {
            'loop: false'

            canIClick = 0;
        }
    });
}

function setup_zombie_SS(whichOne) {
    let type_zombie = [1, 2, 3, 1, 2, 3];

    let speed_zombie = [100, 50, 100];

    setup_SpriteSheet("#zombie" + whichOne, "images/zombiesSS_" + type_zombie[whichOne-1] + ".png",
        9, 20, 20);

    $("#zombie" + whichOne).animateSprite({
        fps: 10,
        animations: {
            static: [0, 1, 2, 3, 4, 5, 6, 7],
        },
        duration: speed_zombie[type_zombie[whichOne-1]-1],
        loop: true,
        complete: function () {
            'loop: false'
        }
    });

    setup_SpriteSheet("#bubble_zombie" + whichOne, "images/SZ_bubble.png",
        3, 20, 20);

    $("#bubble_zombie" + whichOne).animateSprite({
        fps: 10,
        animations: {
            z1: [type_zombie[whichOne - 1] - 1],
        },
        duration: 1,
        loop: false,
        complete: function () {
            'loop: false'
        }
    });

    setup_SpriteSheet("#zombie_effect" + whichOne, "images/SZ_effect_ss.png",
        4, 13, 15);

    $("#zombie_effect" + whichOne).animateSprite({
        fps: 10,
        animations: {
            z1: [0, 1, 2, 3],
        },
        duration: 20,
        loop: false,
        complete: function () {
            'loop: false';
            $("#zombie_effect" + whichOne).css({opacity: 0});
        }
    });
}