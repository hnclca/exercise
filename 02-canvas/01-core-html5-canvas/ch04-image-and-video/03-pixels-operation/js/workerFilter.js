onmessage = function(event) {
    var filter = event.data.filter,
        imageData = event.data.input,
        imageDataCopy = event.data.output;

    switch(filter) {
        case "negative":
            negative(imageData, imageDataCopy);
            break;
        case "blackAndWhite":
            blackAndWhite(imageData, imageDataCopy);
            break;
        case "emboss":
            emboss(imageData, imageDataCopy);
            break;
        case "sunglass":
            sunglass(imageData, imageDataCopy);
            break;
        default:
            console.log(filter + " not supported.");
    }
    // filter(imageData, imageDataCopy);

    postMessage(imageDataCopy);
}

function negative(imageData, imageDataCopy) {
    for(var i = 0; i < imageData.data.length - 4; i+=4) {
        imageDataCopy.data[i] = 255 - imageData.data[i];
        imageDataCopy.data[i+1] = 255 - imageData.data[i+1];
        imageDataCopy.data[i+2] = 255 - imageData.data[i+2];
        imageDataCopy.data[i+3] = imageData.data[i+3];
    }
    return imageDataCopy;
}

function blackAndWhite(imageData, imageDataCopy) {
    var temp;
    for(var i = 0; i < imageData.data.length - 4; i+=4) {
        temp = (imageData.data[i] + imageData.data[i+1] 
            + imageData.data[i+2]) / 3
        imageDataCopy.data[i] = temp;
        imageDataCopy.data[i+1] = temp;
        imageDataCopy.data[i+2] = temp;
        imageDataCopy.data[i+3] = imageData.data[i+3];
    }

    return imageDataCopy;
}

function emboss(imageData, imageDataCopy) {
    var width = imageData.width,
        length = imageData.data.length;
    for(var i = 0; i < length; i++) {
        if ((i+1) % 4 !== 0) { // 非透明像素
            if (i >= length - width*4) { // 下侧边界像素
                imageDataCopy.data[i] = imageData.data[i-width*4];
            } else if ((i+4) % (width*4) === 0) { // 右侧边界像素
                imageDataCopy.data[i] = imageData.data[i-4];
                imageDataCopy.data[i+1] = imageData.data[i-3];
                imageDataCopy.data[i+2] = imageData.data[i-2];
                imageDataCopy.data[i+3] = imageData.data[i-1];
                i+=4;
            } else {
                imageDataCopy.data[i] = 255/2 + imageData.data[i] * 2 
                    - imageData.data[i+4] - imageData.data[i+width*4]
            }
        } else {
            imageDataCopy.data[i] = imageData.data[i];
        }
    }

    return imageDataCopy;
}

function sunglass(imageData, imageDataCopy) {
    var width = imageData.width,
        length = imageData.data.length;
    for(var i = 0; i < length; i++) {
        if ((i+1) % 4 !== 0) { // 非透明像素
            if ((i+4) % (width*4) === 0) { // 右侧边界像素
                imageDataCopy.data[i] = imageData.data[i-4];
                imageDataCopy.data[i+1] = imageData.data[i-3];
                imageDataCopy.data[i+2] = imageData.data[i-2];
                imageDataCopy.data[i+3] = imageData.data[i-1];
                i+=4;
            } else {
                imageDataCopy.data[i] = imageData.data[i] * 2 - 1.5*imageData.data[i+4]
            }
        } else {
            imageDataCopy.data[i] = imageData.data[i];
        }
    }

    return imageDataCopy;
}