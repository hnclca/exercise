function rotateGun(e) {
    let xPos = e.clientX;

    let currentXPositionPercentage = xPos / newWidth;

    let amountToRotate = -15 + currentXPositionPercentage * 50;

    $('#SZ0_1').css('transform', 'rotate(' + amountToRotate + 'deg)');
}

function bubbleZombie_flyAway(whichOne) {
    current_score++;
    updateScore();

    let $bubble_zombieX = $("#bubble_zombie" + whichOne);

    $bubble_zombieX.animate({
        top: "-=" + 100 * ratio + "px",
    },{
        easing: "easeOutElastic",
        duration: 400,
        complete: function () {
            $(this).delay(150).animate({
                opacity: "-=" + 1,
            }, {
                easing: "easeOutQuint",
                duration: 1000,
                step: function (now, fx) {
                    if ("opacity" == fx.prop && fx.pos > 0.1) {
                        let xx = 0.5 / fx.pos;
                        $bubble_zombieX.css("transform", "scale(" + xx + ")");
                    }
                },
                complete: function () {
                    
                }
            });
        }
    });
}