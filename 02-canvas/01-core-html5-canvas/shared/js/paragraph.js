class Paragraph {
    BLINK_OUT = 200;
    BLINK_INTERVAL = 1200;

    constructor(left, top, imageData, cursor) {
        this.left = left;
        this.top = top;
        this.imageData = imageData;
        this.cursor = cursor;
        this.lines = [];
        this.activeLine = undefined;
        this.blinkingInterval = undefined;
    }

    // info..............................................................
    getWidth(context) {
        var w = 0, 
            widest = 0;
        this.lines.forEach(function(line) {
            w = line.getWidth(context);

            if (w > widest) {
                widest = w;
            }
        });
        return widest;
    }

    getHeight(context) {
        var h = 0;
        this.lines.forEach(function(line) {
            h += line.getHeight(context);
        });
        return h;
    }

    // draw and erase...........................................................
    draw(context) {
        this.lines.forEach(function(line) {
            line.draw(context);
        });

        var width = this.getWidth(context);
        var height = this.getHeight(context);

        context.save();

        context.fillStyle = "rgba(0, 255, 0, 0.3)";
        context.fillRect(this.left, this.top, width, height);

        context.restore();
    }

    erase(context, imageData) {
        context.putImageData(imageData, 0, 0);
    }

    // text operation............................................................
    newLine(context) {
        var textBeforeCursor = this.activeLine.text.substring(0, this.activeLine.caret),
            textAfterCursor = this.activeLine.text.substring(this.activeLine.caret),
            activeIndex = 0,
            line,
            bottom = 0,
            lineHeight = context.measureText("W").width;
        
        lineHeight += lineHeight/6;
        bottom = this.activeLine.bottom + lineHeight;

        // 擦除片段区域
        this.erase(context, this.imageData);
        this.activeLine.text = textBeforeCursor;

        // 创建新行，插入光标后文本
        line = new TextLine(this.activeLine.left, bottom);
        line.insert(textAfterCursor);

        // 添加新行，重置活动行
        activeIndex = this.lines.indexOf(this.activeLine);
        this.lines.splice(activeIndex+1, 0, line);
        this.activeLine = line;
        this.activeLine.caret = 0;

        // 循环移动新行之后文本行
        activeIndex = this.lines.indexOf(this.activeLine);
        for (var i = activeIndex+1; i < this.lines.length; i++) {
            line = this.lines[i];
            line.bottom += lineHeight;
        }

        // 绘制段落和光标
        this.draw(context);
        this.cursor.draw(context, this.activeLine.left,
            this.activeLine.bottom);
    }

    addLine(context, line) {
        this.lines.push(line);
        this.activeLine = line;
        this.moveCursor(context, line.left, line.bottom);
    }

    insert(context, text) {
        this.erase(context, this.imageData);
        this.activeLine.insert(text);

        var t = this.activeLine.text.substring(0, this.activeLine.caret),
            w = context.measureText(t).width;

        this.moveCursor(context, this.activeLine.left + w,
            this.activeLine.bottom);

        this.draw(context);
    }

    // 下移当前行之后所有行
    moveLinesDown(context, start) {
        var length = this.lines.length,
            line;
        for(var i = start; i < length; i++) {
            line = this.lines[i];
            line.bottom += line.getHeight(context);
        }
    }

    moveUpOneLine(context) {
        var lastActiveText = this.activeLine.text,
            activeIndex = this.lines.indexOf(this.activeLine),
            line;
        
        // 重置当前活动行和插入光标
        this.activeLine = this.lines[activeIndex-1];
        this.activeLine.caret = this.activeLine.text.length;

        // 移除当前行
        this.lines.splice(activeIndex, 1);

        // 绘制光标
        this.moveCursor(context, 
            this.activeLine.left + this.activeLine.getWidth(context)
            , this.activeLine.bottom);

        // 拼接文本
        this.activeLine.text += lastActiveText;
        
        // 光标后所有行上移一行
        for (var i = activeIndex; i < this.lines.length; i++) {
            line = this.lines[i];
            line.bottom -= line.getHeight(context);
        }
    }

    backspace(context) {        
        // 如果光标在行首
        if (this.activeLine.caret === 0) {
            if (!this.activeLineIsTopLine()) { // 如果不是首行
                this.erase(context, this.imageData);
                this.moveUpOneLine(context);
                this.draw(context);
            }
        } else {
            this.erase(context, this.imageData);
            this.activeLine.removeCharacterBeforeCaret();

            var t = this.activeLine.text.slice(0, this.activeLine.caret);
            var w = context.measureText(t).width;

            this.moveCursor(context, this.activeLine.left + w, this.activeLine.bottom);
            this.draw(context);
        }
    }

    // point operation..........................................................
    isPointInside(context, loc) {
        context.beginPath();
        context.rect(this.left, this.top, this.getWidth(context), this.getHeight(context));
        return context.isPointInPath(loc.x, loc.y);
    }

    getLine(context, y) {
        var length = this.lines.length;
        var line;

        for(var i = 0; i < length; i++) {
            line = this.lines[i];
            if (y > line.bottom - line.getHeight(context)
                    && y <= line.bottom) {
                return line;
            }
        }

        return undefined;
    }

    getColumn(context, line, x) {
        var found = false,
            tmpLine = undefined,
            column = 0, 
            before = 0, 
            after = 0, 
            closest = 0;
            

        // 复制当前文本行
        tmpLine = new TextLine(line.left, line.bottom);
        tmpLine.insert(line.text);
        
        while(!found && tmpLine.text.length > 0) {
            before = tmpLine.left + tmpLine.getWidth(context);
            tmpLine.removeLastCharacter();
            after = tmpLine.left + tmpLine.getWidth(context);

            if (after < x) {
                closest = x - after < before - x ? after : before;
                column = closest === before ? tmpLine.text.length + 1 
                    : tmpLine.text.length;
                found = true;
            }
        }

        return column;
    }

    activeLineIsOutOfText() {
        return this.activeLine.length === 0;
    }

    activeLineIsTopLine() {
        return this.lines[0] === this.activeLine;
    }

    // cursor events...........................................................
    blinkCursor(context, x, y) {
        var self = this;

        this.blinkingInterval = setInterval(function(e){
            cursor.erase(context, self.imageData);
            
            setTimeout(function(e) {
                this.cursor.draw(context, cursor.left, 
                    cursor.top + cursor.getHeight(context));
            }, self.BLINK_OUT);
        }, self.BLINK_INTERVAL);
    }

    moveCursor(context, x, y) {
        this.cursor.erase(context, this.imageData);
        this.cursor.draw(context, x, y);

        if (!this.blinkingInterval) {
            this.blinkCursor(context, x, y);
        }
    }

    moveCursorCloseTo(context, x, y) {
        var line = this.getLine(context, y);

        if (line) {
            line.caret = this.getColumn(context, line, x);
            this.activeLine = line;
            this.moveCursor(context, line.getCaretX(context), line.bottom);
        }
    }
}