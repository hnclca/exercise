function main_call_setup_content() {
    let $logo = $("#logo");
    $logo.css("width", 400 * ratio);
    $logo.css("height", 146 * ratio);
    $logo.css("left", 0);
    $logo.css("top", 0);

    let $box1 = $("#box1");
    $box1.css("width", 631 * ratio);
    $box1.css("height", 457 * ratio);
    $box1.css("left", ($(window).width() / 2) - ((637 * ratio) / 2));
    $box1.css("top", ($(window).height() / 2) - ((457 * ratio) / 2));

    let $SZ_mainContent = $("#SZ_mainContent");
    $SZ_mainContent.css("width", 600 * ratio);
    $SZ_mainContent.css("height", 400 * ratio);
    $SZ_mainContent.css("left", ($(window).width() / 2) - ((600 * ratio) / 2));
    $SZ_mainContent.css("top", ($(window).height() / 2) - ((400 * ratio) / 2));

    for (let i = 0; i < div_ids.length; i++)  {
        $(div_ids[i]).css("width", image_sizes[i][0] * ratio);
        $(div_ids[i]).css("height", image_sizes[i][1] * ratio);
    }

    if ($(window).height() < $(window).width()) {
        use_ratio = $(window).height() / 800;
    }

    let $SZ0_4 = $("#SZ0_4");
    $SZ0_4.css("width", 458 * ratio);
    $SZ0_4.css("height", 370 * ratio);
    $SZ0_4.css("left", 71 * ratio);

    $("#score").css({'width':'100%', 'height':'50%'});

    setup_gun_SS();

    for (let i = 1; i < 7; i++ ) {
        SZ_createZombie(i);
    }

    $('img').on('mousedown',function (e) {
        e.preventDefault()
    });

    start_end_game(0);
}

function start_end_game(gameover) {
    for (let i = 1; i < 4; i++) {
        $("#SZ0_" + i).css({ opacity: 0 });
    }

    let $zombieX;
    for (let i = 1; i < 7; i++) {
        $zombieX = $("#zombie" + i);
        $zombieX.stop();
        $zombieX.css({ opacity: 0 });
        $zombieX.css("z-index", i + 100);
        $("#bubble_zombie" + i).css({ opacity: 0 });
    }

    if (gameover == 0) {
        $("#SZ0_4").css("background-image", 'url(images/splash_intro.png)');
    } else {
        $("#SZ0_3").css({ opacity: 1 });
        $("#SZ0_4").css("background-image", 'url(images/splash_gameover.png)');
    }

    let $SZ0_4 = $("#SZ0_4");
    $SZ0_4.css("top", 0);
    $SZ0_4.css({ opacity: 1 });

    game_ended = 1;
}

function start_game() {
    current_zindex = 0;
    current_shots = 0;
    game_ended = 0;

    current_score = 0;
    updateScore();

    let $SZ0_4 = $("#SZ0_4");
    $SZ0_4.css("top", $(window).height());
    $SZ0_4.css({ opacity: 0 });

    for (let i = 1; i < 4; i++) {
        $("#SZ0_" + i).css({ opacity: 1 });
    }

    $("#SZ0_2").css({ opacity: 0 });

    for (let i = 1; i < 7; i++) {
        SZ_reset_Zombie(i, 0);
    }

    $("#SZ0_3").css({ opacity: 0.5 });
}

function updateScore() {
    $("#score").text(current_score);
}