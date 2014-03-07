var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var width = window.innerWidth;
var height = window.innerHeight;
var blockCount = 10;
var movingBlocksCount = 2;
var score = 0;
var gameLoop;
var level = 1;
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
  if(game.faizaan.xVel > 0){
    game.faizaan.xVel -= 1;
  }
}
function movefaizaanRight(game){
  game.faizaan.xVel += 1;
}

function gameOver(game){
    var finalScore = score;
    game.faizaan = {};
    window.cancelAnimationFrame(gameLoop);
    console.log(finalScore);
    clearScreen(ctx);
    drawTextCentered(ctx, finalScore, 48, 48, 24, 'monospace');
}

function tick(game) {
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
    animateBlocks(game);
  }
  if (game.faizaan.x <  20){
    game.faizaan.x = width;
  }
}
function drawTextCentered(context, text, x, y, fontHeight, fontName) {
  context.font = fontHeight + 'px ' + fontName;
  var textWidth = context.measureText(text).width;

  var actualX = x - (textWidth / 2);
  var actualY = y - (fontHeight / 2);

  context.fillText(text, actualX, actualY);
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
  drawTextCentered(ctx, score, 48, 48, 24, 'monospace');
  var wiz = game.faizaan;
  for(var i = 0; i < game.blocks.length; i++){
    block = game.blocks[i];
    drawRect(ctx, block.x, block.y, block.w, block.h, block.color);
  }
  drawRect(ctx, wiz.x, wiz.y, wiz.w, wiz.h, wiz.color);
  for(var i = 0; i < game.blocks.length; i++){
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
    faizaan: { x: 20, y: height / 2, w: 20, h: 30, yVel: 1, xVel: 0, color: getRandomColor()},
    blocks: makeBlocks(blockCount),
    movingBlocks: makeBlocks(movingBlocksCount)
  };

  window.onkeydown = function(event) {
    keyDown(game, event);
  };

  var gameLoop = window.requestAnimationFrame(function(time) {
    loop(game, time);
  });
}

run();

