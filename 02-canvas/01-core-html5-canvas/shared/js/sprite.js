class Sprite {

    constructor(name, painter, behaviors) {
        if (name !== undefined)
            this.name = name;
        if (painter !== undefined)
            this.painter = painter;
        
        this.top = 0;
        this.left = 0;
        this.width = 10;
        this.height = 10;
        this.velocityX = 0;
        this.velocityY = 0;
        this.visible = true;
        this.animating = false;
        this.behaviors = behaviors || [];

        return this;
    }

    paint(context) {
        if (this.painter !== undefined & this.visible === true)
            this.painter.paint(this, context); 
    }

    update(context, time) {
        for (var i = this.behaviors.length; i > 0; i--) {
            this.behaviors[i-1].execute(this, context, time);
        }
    }

    addBehavior(behavior) {
        this.behaviors.push(behavior);
    }
    
    removeBehavior(behavior) {
        var index = this.behaviors.indexOf(behavior);
        if (index > -1) {
            this.behaviors.splice(index, 1);
        }
    }
}

class BallPainter {

    paint(sprite, context) {
        context.save();
        context.beginPath();
        context.arc(sprite.left + sprite.width / 2,
            sprite.top + sprite.height / 2, sprite.width/2,
            0, Math.PI * 2, false);
        context.clip();

        context.shadowColor = "rgb(0, 0, 0)";
        context.shadowOffsetX = -4;
        context.shadowOffsetY = -4;
        context.shadowBlur = 8;

        context.lineWidth = 2;
        context.strokeStyle = "rgb(100, 100, 195)";
        context.fillStyle = "rgb(30, 144, 255, 0.15)";
        context.fill();
        context.stroke();
        context.restore();
    }
}

class ImagePainter {
    constructor(imageUrl) {
        this.image = new Image();
        this.image.src = imageUrl;
    }

    paint(sprite, context) {
        if (this.image.src !== undefined) {
            if (this.image.complete) {
                context.drawImage(this.image, sprite.left,
                    sprite.top, sprite.width, sprite.height);
            } else {
                this.image.onload = function(e) {
                    sprite.width = this.width;
                    sprite.height = this.height;
                    context.drawImage(this, sprite.left,
                        sprite.top, sprite.width, sprite.height);
                }
            }
        }
    }
}

class SpriteSheetPainter {

    constructor(cells, spritesheet) {
        this.spritesheet = spritesheet;
        this.cells = cells || [];
        this.cellIndex = 0;
    }

    advance() {
        if (this.cellIndex === this.cells.length - 1) {
            this.cellIndex = 0;
        } else {
            this.cellIndex++;
        }
    }

    paint(sprite, context) {
        var cell = this.cells[this.cellIndex];
        if (this.spritesheet.complete) {
            context.drawImage(this.spritesheet, cell.x, cell.y, cell.w, cell.h,
                sprite.left, sprite.top, cell.w, cell.h);
        } else {
            this.spritesheet.onload = function(e) {
                context.drawImage(this, cell.x, cell.y, cell.w, cell.h,
                    sprite.left, sprite.top, cell.w, cell.h);
            }
        }
    }
}