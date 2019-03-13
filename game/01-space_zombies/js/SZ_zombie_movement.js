function SZ_createZombie(whichOne) {
    let div = document.createElement('div');
    let div2 = document.createElement('div');
    let div3 = document.createElement('div');

    div.setAttribute('style', 'position: absolute; top: 0; left: 0; opacity: 0; display: inherit;');
    div2.setAttribute('style', 'position: absolute; top: 0; left: 0;');
    div3.setAttribute('style', 'position: absolute; top: 0; left: 0;');

    let $body = $('#SZ0_0');

    let top_position = $body.height() * 0.435;

    let left_position = Math.floor(Math.random() * $body.width() - ratio * 50) + ratio * 50;

    leftX_zombie[whichOne-1]=left_position;

    div.style.top = top_position + 'px';
    div.style.left = left_position + 'px';

    div2.style.top = top_position + 'px';
    div2.style.left = left_position + 'px';

    div3.style.top = top_position + 'px';
    div3.style.left = left_position + 'px';

    div.id = 'zombie' + whichOne;
    div2.id = 'bubble_zombie' + whichOne;
    div3.id = 'zombie_effect' + whichOne;

    let $SZ_mainContent = $("#SZ_mainContent");
    $SZ_mainContent.append(div);
    $SZ_mainContent.append(div2);

    // 点击事件的坐标为相对浏览器坐标。
    document.body.appendChild(div3);

    setup_zombie_SS(whichOne);

    SZ_animate_Zombie(whichOne);

    let $bubbleZombieX = $("#bubble_zombie" + whichOne);
    let $zombieX = $("#zombie" + whichOne);
    let $zombieEffectX = $("#zombie_effect" + whichOne);

    $bubbleZombieX.css("transform", "scale(" + 0 + ")");
    $zombieEffectX.css("pointer-events", "none");

    // change zombies depth level
    $zombieX.css("z-index", whichOne + 100);
    $bubbleZombieX.css("z-index", whichOne);
    $zombieEffectX.css("z-index", whichOne + 150);
    $("#SZ0_1").css("z-index", 200);
    $("#SZ0_4").css("z-index", 201);

    $zombieX.bind('mousedown touchstart', (e) => {
        if ($("#SZ0_2").css("opacity") != 1) {
            fireGun(e);

            if ($("#zombie" + whichOne).css("opacity") != 0) {
                // let offset = $(this).offset();
                zombieHit(whichOne - 1, e.pageX, e.pageY);
            }
        }
    });

    $bubbleZombieX.bind('mousedown touchstart', (e) => {
        if ($("#SZ0_2").css("opacity") != 1) {
            fireGun(e);
        }
    });
}

function SZ_animate_Zombie(whichOne) {

    let timeX = [13000, 8000, 16000, 14000, 10000, 18000];

    let $zombieX = $('#zombie' + whichOne);

    //reset the zombies scale value
    $zombieX.css('transform','scale('+0+')');

    $zombieX.css({opacity:1});

    // distance between zombie and you.
    let amty = $(window).height() * 0.7;

    let ZS_ease = ['easeInSine','easeOutQuart','easeInOutQuad',
        'easeInSine','easeOutQuart','easeInOutQuad'];

    $zombieX.delay(timeX[whichOne-1] / 3).animate({
        left: "+=" + 0.001 + "px",
        // left: "+=" + amty + "px",
    },{
        easing: ZS_ease[whichOne - 1],
        duration: timeX[whichOne - 1],
        step: function (now, fx) {
            if ("left" == fx.prop) {
                let xx = (fx.pos) * 16;

                if (game_ended == 1) {
                    xx = 999;
                }

                if ( xx > 15 ) {
                    $(this).stop();
                    // SZ_reset_Zombie(whichOne, 0);
                    $(this).css({ opacity: 0 });
                    $(this).stop(true, true);
                    $(this).finish();

                    if (game_ended == 0 && xx != 999) {
                        start_end_game(1);
                    }
                } else {
                    $(this).css('transform', 'scale(' + xx + ')');
                    scaleX_zombie[whichOne - 1] = xx;

                    let i = 0;
                    while(i < 6) {
                        let $zombieI = $('#zombie' + (i+1));
                        if (scaleX_zombie[whichOne-1] > scaleX_zombie[i] &&
                            ($(this).zIndex() < $zombieI.zIndex() &&
                            scaleX_zombie[i] != 0)) {
                            let i_index = $zombieI.zIndex();
                            $zombieI.css('z-index', ($(this)).zIndex());
                            $(this).css('z-index', i_index);
                        }
                        i++;
                    }
                }
            }
        },
        complete: function () {
            
        }
    })
}

function SZ_reset_Zombie(whichOne, zombieBubble_generate) {

    zombieHits_counter[whichOne-1] = 0;

    let $zombieX = $("#zombie"+whichOne);

    // $zombieX.css("transform", "scale(" + 0 + ")");

    $zombieX.stop();

    let $body = $('#SZ0_0');

    let top_position = $body.height() * 0.435;

    if (zombieBubble_generate) {
        let $bubble_zombieX = $("#bubble_zombie" + whichOne);

        $bubble_zombieX.css({ top: top_position + "px", left: $zombieX.css('left'), opacity: 1 });

        $bubble_zombieX.css("transform", "scale(" + scaleX_zombie[whichOne - 1] + ")");

        bubbleZombie_flyAway(whichOne);
    }

    let left_position = Math.floor(Math.random() * $body.width() - ratio * 50) + ratio * 50;

    leftX_zombie[whichOne - 1] = left_position;

    $zombieX.css({top: top_position + 'px', left: left_position + 'px', opacity: 0});

    current_zindex++;

    $zombieX.css("z-index", current_zindex);

    // if (zombieBubble_generate == 0) {
        SZ_animate_Zombie(whichOne);
    // }
}