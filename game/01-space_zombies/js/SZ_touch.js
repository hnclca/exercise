function reloadGun(e) {
    if (!canIClick && game_ended == 0 &&
            $("#SZ0_2").css('opacity') == 1) {
        canIClick = 1;
        $('#SZ0_1').animateSprite("play", "reload");

        current_shots = 0;
        $('#SZ0_2').css({ opacity: 0 });

        $.playSound("sounds/reload");
    }
}

function fireGun(e) {
    if (!canIClick && $("#SZ0_2").css('opacity') != 1) {
        canIClick = 1;
        $('#SZ0_1').animateSprite("play", "fire");
        current_shots++;
        $.playSound("sounds/fire");
        if (current_shots >= max_shots) {
            $('#SZ0_2').css({ opacity: 1 });
        }
    }
}

function zombieHit(whichOne, xx, yy) {
    zombieHits_counter[whichOne]++;

    if (zombieHits_counter[whichOne] >= zombieHits_limits[whichOne]) {
        SZ_reset_Zombie(whichOne + 1, 1);
    }

    let whichOne2 = whichOne + 1;
    let $zombieEffectX = $("#zombie_effect" + whichOne2);

    $zombieEffectX.css({top: yy + "px", left: xx + "px", opacity: 1});
    $zombieEffectX.animateSprite("play", "z1");
    $zombieEffectX.css("transform", "scale(" + scaleX_zombie[whichOne] + ")");
}