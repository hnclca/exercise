function halfAlpha(imageData, imageDataCopy) {
    var i = 0;
    
    for(i = 0; i < 3; i++) {
        imageDataCopy[i] = imageData[i];
    }

    for(i = 3; i < imageData.data.length - 4; i+=4) {
        imageDataCopy.data[i] = imageData.data[i]/2;
        imageDataCopy.data[i+1] = imageData.data[i+1];
        imageDataCopy.data[i+2] = imageData.data[i+2];
        imageDataCopy.data[i+3] = imageData.data[i+3];
    }

    return imageDataCopy;

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