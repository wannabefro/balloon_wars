var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var width = window.innerWidth;
var height = window.innerHeight;
var blockCount = 10;
var movingBlocksCount = 2;
var score = 0;
var foodCount = 3;
var level = 1;
var playing = true;
var gameloop;
var finalScore;
ctx.canvas.height = height;
ctx.canvas.width = width;

var GRAVITY = 0.5;

function drawRect(context, x, y, w, h, color) {
  context.strokeStyle = color;
  context.fillStyle = color;

  context.fillRect(x, y, w, h);
}

function clearScreen(context) {
  context.clearRect(0, 0, width, height);
}

function keyDown(game, event) {
  var handled = true;

  switch (event.keyCode) {
    case SPACE_KEY: movefaizaanUp(game); break;
    case LEFT_KEY: movefaizaanLeft(game); break;
    case RIGHT_KEY: movefaizaanRight(game); break;
    default: handled = false; break;
  }

  if (handled) {
    event.preventDefault();
  }
}

function movefaizaanUp(game){
  game.faizaan.yVel = -10;
}
function movefaizaanLeft(game){
  if(game.faizaan.xVel > 1){
    game.faizaan.xVel -= 1;
  }
}
function movefaizaanRight(game){
  game.faizaan.xVel += 1;
}

function gameOver(game){
  finalScore = score;
  game.faizaan = {};
  playing = false;
}

function tick(game) {
  if(playing){
    score += game.faizaan.xVel;
    game.faizaan.y += game.faizaan.yVel;
    game.faizaan.yVel += GRAVITY;
    game.faizaan.x += game.faizaan.xVel;
    for(var i = 0; i < game.movingBlocks.length; i++){
      block = game.movingBlocks[i];
      if(block.y < 20){
        block.movement = 'positive';
      } else if (block.y > height - 40){
        block.movement = 'negative';
      }
      if(block.movement == 'positive'){
        block.y++;
      } else {
        block.y--;
      }
    }

    if (game.faizaan.y > height + 1){
      if(level == 1){
        gameOver(game);
      } else {
        level--;
        game.blocks = makeBlocks(blockCount);
        game.faizaan.y = 20;
        game.blocks = makeBlocks(blockCount);
        game.movingBlocks = makeBlocks(movingBlocksCount);
        animateBlocks(game);
      }
    }
    if (game.faizaan.y <  20){
      game.faizaan.y = height;
      level++;
      game.blocks = makeBlocks(blockCount);
      game.movingBlocks = makeBlocks(movingBlocksCount);
      game.blocks = makeBlocks(blockCount);
      game.movingBlocks = makeBlocks(movingBlocksCount);
      animateBlocks(game);
    }
    if (game.faizaan.x >  width - 20){
      game.faizaan.x = 20;
      blockCount += 5;
      movingBlocksCount += 1;
      game.blocks = makeBlocks(blockCount);
      game.movingBlocks = makeBlocks(movingBlocksCount);
      game.food = makeCircles(foodCount);
      animateBlocks(game);
    }
    if (game.faizaan.x <  20){
      game.faizaan.x = width;
    }
  }
}
function drawTextCentered(context, text, x, y, fontHeight, fontName) {
  context.font = fontHeight + 'px ' + fontName;
  var textWidth = context.measureText(text).width;

  var actualX = x - (textWidth / 2);
  var actualY = y - (fontHeight / 2);

  context.fillText(text, actualX, actualY);
}

function drawCircle(context, x, y, radius, color){
  context.beginPath();
  context.arc(x, y, radius, 0, 2 * Math.PI, false);
  context.fillStyle = color;
  context.fill();
  context.lineWidth = 1;
  context.strokeStyle = '#003300';
  context.stroke();
}

function drawSmileyFace(ctx, x, y, radius, color){
  ctx.beginPath();
  ctx.arc(x,y,50,0,Math.PI*2,true); // Outer circle
  ctx.moveTo(110,75);
  ctx.arc(75,75,35,0,Math.PI,false);   // Mouth (clockwise)
  ctx.moveTo(65,65);
  ctx.arc(60,65,5,0,Math.PI*2,true);  // Left eye
  ctx.moveTo(95,65);
  ctx.arc(90,65,5,0,Math.PI*2,true);  // Right eye
  ctx.stroke();
}

function getRandomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
    color += letters[Math.round(Math.random() * 15)];
  }
  return color;
}

function draw(game) {
  clearScreen(ctx);
  if(playing){
  drawTextCentered(ctx, score, 48, 48, 24, 'monospace');
  var wiz = game.faizaan;
  drawRect(ctx, wiz.x, wiz.y, wiz.w, wiz.h, wiz.color);
  for(var i = 0; i < game.blocks.length; i++){
    block = game.blocks[i];
    drawRect(ctx, block.x, block.y, block.w, block.h, block.color);
    if (didHit(game, game.blocks[i], wiz)){
      game.faizaan = {};
      console.log('you lost');
    }
  }
  for(var i = 0; i < game.movingBlocks.length; i++){
    block = game.movingBlocks[i];
    drawRect(ctx, block.x, block.y, block.w, block.h, block.color);
    if (didHit(game, game.movingBlocks[i], wiz)){
      game.faizaan = {};
      console.log('you lost');
    }
  }
  for(var i = 0; i < game.food.length; i++){
    circle = game.food[i];
    drawCircle(ctx, circle.x, circle.y, circle.radius, circle.color);
    if (didHitCircle(game, circle, wiz)){
      console.log('score');
      game.food.splice(i, 1);
      score += 1000;
    }
  }
  } else {
    drawTextCentered(ctx, finalScore, 48, 48, 24, 'monospace');
  }
}

function didHitCircle(game, circle, rect){
  var distX = Math.abs(circle.x - rect.x-rect.w/2);
  var distY = Math.abs(circle.y - rect.y-rect.h/2);

  if (distX > (rect.w/2 + circle.radius)) { return false; }
  if (distY > (rect.h/2 + circle.radius)) { return false; }

  if (distX <= (rect.w/2)) { return true; } 
  if (distY <= (rect.h/2)) { return true; }

  var dx=distX-rect.w/2;
  var dy=distY-rect.h/2;
  return (dx*dx+dy*dy<=(circle.radius*circle.radius));
}

function didHit(game, block, faizaan){
    if((faizaan.x + faizaan.w >= block.x  && faizaan.x < block.x + block.w) && (faizaan.y + faizaan.h >= block.y && faizaan.y < block.y + block.h)){
      gameOver(game);
      return true;
    } else {
      return false;
  }
}


function makeBlocks(amount){
  var blocks = [];
  for(var i=0; i < amount; i++){
    blocks.push({x: Math.floor(Math.random() * width) + 150, y: Math.floor(Math.random() * height), w: 10 + Math.floor(Math.random() * 50), h: 10 + Math.floor(Math.random() * 50), color: getRandomColor()})
  }
  return blocks;
}

function makeCircles(amount){
  var circles = [];
  for(var i=0; i < amount; i++){
    circles.push({radius: 10, x: Math.floor(Math.random() * width) + 150, y: Math.floor(Math.random() * height), color: getRandomColor()});
  }
  return circles;
}

function loop(game, time) {
  tick(game);
  draw(game);

  window.requestAnimationFrame(function(time) {
    loop(game, time);
  });
}

function animateBlocks(game){
  for(var i = 0; i < game.movingBlocks.length; i++){
    number = Math.floor(Math.random() * 2);
    block = game.movingBlocks[i];
    if(number == 1){
      block.movement = 'positive';
    } else {
      block.movement = 'negative';
    }
  }
}

function run() {
  var game = {
    faizaan: { x: 20, y: height / 2, w: 20, h: 30, yVel: 1, xVel: 1, color: getRandomColor()},
    blocks: makeBlocks(blockCount),
    movingBlocks: makeBlocks(movingBlocksCount),
    food: makeCircles(foodCount)
  };

  window.onkeydown = function(event) {
    keyDown(game, event);
  };

  var gameLoop = window.requestAnimationFrame(function(time) {
    loop(game, time);
  });
}

run();

