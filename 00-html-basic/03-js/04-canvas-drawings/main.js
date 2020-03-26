
// 初始化画板
var canvas = document.querySelector('.myCanvas');
var width = canvas.width = window.innerWidth;
var height = canvas.height = window.innerHeight;
var ctx = canvas.getContext('2d');

// 绘制纯黑背景
ctx.save();
ctx.fillStyle = 'rgb(0,0,0)';
ctx.fillRect(0,0,width,height);
ctx.restore();

// 绘制红色三角
var triHeight = 200;
ctx.save();
ctx.fillStyle = 'red';
ctx.beginPath();
ctx.lineTo(triHeight, 0);
var triHeight = triHeight/2 * Math.tan(degToRad(60));
ctx.lineTo(triHeight/2, triHeight);
ctx.lineTo(0,0);
ctx.fill();
ctx.restore();

// 绘制蓝色圆环
var radius = 100;
ctx.save();
ctx.fillStyle = 'aqua';
ctx.beginPath();
ctx.arc(triHeight + radius, radius, radius, degToRad(0), degToRad(360), false);
ctx.fill();
ctx.restore();

// 绘制黄色吃豆人
ctx.save();
ctx.fillStyle = 'yellow';
ctx.beginPath();
ctx.arc(width - radius, radius, radius, degToRad(-45), degToRad(45), true);
ctx.lineTo(width - radius, radius);
ctx.fill();
ctx.restore();

// 绘制文字
ctx.save();
ctx.strokeStyle = 'white';
ctx.lineWidth = 1;
ctx.font = "36px arial";
ctx.strokeText('Hello', width/2 - 100, 32);
ctx.fillStyle = 'red';
ctx.font = "36px arial";
ctx.fillText('World', width/2, 32);
ctx.restore();

// 行走的精灵
var posX = 0;
var sprite = 0;
var spriteWidth = 102;
var spriteHeight = 148;
var image = new Image();
image.src = 'images/walk-right.png';

var drawSprite = () => {
  ctx.save();
  ctx.translate(0, height);
  ctx.fillRect(0, -spriteHeight, width, height);
  ctx.drawImage(image, (sprite*spriteWidth), 0, spriteWidth, spriteHeight, 
      0+posX, -spriteHeight, spriteWidth, spriteHeight);
  ctx.restore();

  if (posX % 13 === 0) {
    if (sprite === 5) {
      sprite = 0;
    } else {
      sprite++;
    }
  }
  if(posX > width) {
    newStartPos = -(width + spriteWidth);
    posX = Math.ceil(newStartPos % 13) * 13;
  } else {
    posX += 2;
  }

  requestAnimationFrame(drawSprite);
}

image.onload = drawSprite;

// 绘制动态渐变螺旋
var length = 255;
var moveOffset = 10;
var deg = 0;
var drawSpiral = () => {
  ctx.save();
  ctx.translate(width/2, height/2);
  ctx.rotate(degToRad(deg));
  ctx.fillStyle = 'rgba(0,' + (255-length) + ',0,0.9)';
  ctx.beginPath();
  ctx.moveTo(moveOffset, moveOffset);
  ctx.lineTo(moveOffset+length, moveOffset);
  var triHeight = length/2 * Math.tan(degToRad(60));
  ctx.lineTo(moveOffset+(length/2), moveOffset+triHeight);
  ctx.lineTo(moveOffset,moveOffset);
  ctx.fill();

  length--;
  moveOffset+=0.7;
  deg += 5;
  ctx.restore();

  if (length > 10) {
    requestAnimationFrame(drawSpiral);
  }
}
drawSpiral();

function degToRad(degrees) {
  return degrees * Math.PI / 180;
};

function rand(min, max) {
  return Math.floor(Math.random() * (max-min+1)) + (min);
}
