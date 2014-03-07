var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var width = window.innerWidth;
var height = window.innerHeight;
var blockCount = 10;
var score = 0;
var gameLoop;
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
  
  if (game.faizaan.y > height - 20){
    gameOver(game);
  }
  if (game.faizaan.y <  20){
    game.faizaan.y = height;
  }
  if (game.faizaan.x >  width - 20){
    game.faizaan.x = 20;
    blockCount += 5;
    game.blocks = makeBlocks();
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
  // var winner = game.winningBlock;
  for(var i = 0; i < game.blocks.length; i++){
    block = game.blocks[i];
    drawRect(ctx, block.x, block.y, block.w, block.h, block.color);
  }
  drawRect(ctx, wiz.x, wiz.y, wiz.w, wiz.h, wiz.color);
  // drawRect(ctx, winner.x, winner.y, winner.w, winner.h, winner.color);
  for(var i = 0; i < game.blocks.length; i++){
    if (didHit(game, game.blocks[i], wiz)){
      game.faizaan = {};
      console.log('you lost');
    }
  }
  // if (didHit(game, winner, wiz)){
  //   game.faizaan = {};
  //   console.log('you won');
  // }
}

function didHit(game, block, faizaan){
    if((faizaan.x + faizaan.w >= block.x  && faizaan.x < block.x + block.w) && (faizaan.y + faizaan.h >= block.y && faizaan.y < block.y + block.h)){
      gameOver(game);
      return true;
    } else {
      return false;
  }
}


function makeBlocks(){
  var blocks = [];
  for(var i=1; i < blockCount; i++){
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

function run() {
  var game = {
    faizaan: { x: 20, y: height / 2, w: 20, h: 30, yVel: 1, xVel: 0, color: getRandomColor()},
    blocks: makeBlocks()
    // winningBlock: { x: Math.floor(Math.random() * width), y: Math.floor(Math.random() * height), w: 20, h: 20, color: 'red'}
  };

  window.onkeydown = function(event) {
    keyDown(game, event);
  };

  var gameLoop = window.requestAnimationFrame(function(time) {
    loop(game, time);
  });
}

run();

