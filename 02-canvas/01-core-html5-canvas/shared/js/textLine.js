class TextLine {
    constructor(left, bottom) {
        this.text = "";
        this.left = left;
        this.bottom = bottom;
        this.caret = 0;
    }

    insert(text) {
        this.text = this.text.substring(0, this.caret) + text 
            + this.text.substring(this.caret);
        this.caret += text.length;
    }

    removeCharacterBeforeCaret() {
        if(this.caret === 0) {
            return;
        }
        this.text = this.text.substring(0, this.caret-1) 
            + this.text.substring(this.caret);
        this.caret--;
    }

    removeLastCharacter() {
        this.text = this.text.slice(0, -1);
    }

    getWidth(context) {
        return context.measureText(this.text).width;
    }

    getHeight(context) {
        var h = context.measureText("M").width;
        return h + h/6;
    }

    getCaretX(context) {
        var s = this.text.substring(0, this.caret),
            w = context.measureText(s).width;
        return this.left + w;
    }

    draw(context) {
        context.save();

        context.textAlign = "start";
        context.textBaseline = "bottom";

        context.fillText(this.text, this.left, this.bottom);
        context.strokeText(this.text, this.left, this.bottom);

        context.restore();
    }

    erase(context, imageData) {
        context.putImageData(imageData, 0, 0);
    }
}