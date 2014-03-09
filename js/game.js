var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
  var WIDTH = screen.width;
  var HEIGHT = sreen.height;
} else {
  var WIDTH = window.innerWidth;
  var HEIGHT = window.innerHeight;
}

var FAIZAAN_WIDTH = 20;
var FAIZAAN_HEIGHT = 20;


var blockCount = 10;
var movingBlocksCount = 2;
var score = 0;
var foodCount = 3;
var level = 1;
var playing = false;
var gameloop;
var finalScore;
var blockSpeed = 2;
ctx.canvas.height = HEIGHT;
ctx.canvas.width = WIDTH;

var GRAVITY = 0.5;
var ACCELERATION = 0.1;
var MAX_SPEED = 15.0;
var JUMP_SPEED = 10.0;

function keyDown(game, event) {
  var handled = true;

  switch (event.keyCode) {
    case SPACE_KEY: jump(game); break;
    default: handled = false; break;
  }

  if (handled) {
    event.preventDefault();
  }
}

function keyUp(game, event) {
  var handled = true;

  switch (event.keyCode) {
    default: handled = false; break;
  }

  if (handled) {
    event.preventDefault();
  }
}

function jump(game){
  game.faizaan.yVel = -JUMP_SPEED;
}

function toggleAcceleration(wizard, direction, isEnabled) {
  switch (direction) {
  case 'left': wizard.accelLeft = isEnabled; break;
  case 'right': wizard.accelRight = isEnabled; break;
  default: break;
  }
}

function gameOver(game){
  finalScore = score;
  playing = false;
  addToLocalStorage();
  resetGame(game);
  startScreen();
}

function resetGame(game){
  game.faizaan = {};
  game.blocks = {};
  game.food = {};
  game.movingBlocks = {};
  score = 0;
  level = 1;
  blockCount = 10;
  movingBlocksCount = 2;
  foodCount = 3;
  blockSpeed = 2;
}

function addToLocalStorage(){
  name = prompt('Enter your name');
  if(name){
    var data = {name: name, score: finalScore};
    if (localStorage.scores){
      previousScores = JSON.parse(localStorage.scores);
      previousScores.push(data);
      localStorage.scores = JSON.stringify(previousScores);
    } else {
      localStorage.scores = JSON.stringify([data]);
    }
  }
}

function tick(game) {
  if (playing) {
    score += Math.floor(game.faizaan.xVel);

    game.faizaan.yVel += GRAVITY;
    if (game.faizaan.yVel > MAX_SPEED) {
      game.faizaan.yVel = MAX_SPEED;
    }

    game.faizaan.y += game.faizaan.yVel;

    var xAccel = 0;
    if (game.faizaan.accelLeft) { xAccel -= ACCELERATION / 1.5; }
    if (game.faizaan.accelRight) { xAccel += ACCELERATION; }

    game.faizaan.xVel += xAccel;
    if (game.faizaan.xVel > MAX_SPEED) {
      game.faizaan.xVel = MAX_SPEED;
    }

    if (game.faizaan.xVel <= -MAX_SPEED) {
      game.faizaan.xVel = -MAX_SPEED;
    }

    if (game.faizaan.xVel < 0.1) {
      game.faizaan.xVel = 0.1;
    }

    game.faizaan.x += game.faizaan.xVel;

    var xVel = game.faizaan.xVel;
    game.faizaan.xVel = Math.min(xVel + xAccel, xVel);

    for(var i = 0; i < game.movingBlocks.length; i++){
      block = game.movingBlocks[i];
      if(block.y < 20){
        block.movement = 'positive';
      } else if (block.y > HEIGHT - 40){
        block.movement = 'negative';
      }
      if(block.movement == 'positive'){
        block.y += block.speed;
      } else {
        block.y -= block.speed;
      }
    }

    if (game.faizaan.y > HEIGHT){
      edgeCollision(game, 'bottom');
    }
    if (game.faizaan.y < FAIZAAN_WIDTH){
      edgeCollision(game, 'top');
    }
    if (game.faizaan.x >  WIDTH - 20){
      levelUp(game)
    }
    if (game.faizaan.x <  20){
      game.faizaan.x = WIDTH;
    }
  }
}

function levelUp(game){
  game.faizaan.x = 20;
  game.faizaan.xVel++;
  blockCount += 2;
  level++;
  blockSpeed++;
  movingBlocksCount += 1;
  game.blocks = makeBlocks(blockCount);
  game.movingBlocks = makeBlocks(movingBlocksCount);
  game.food = makeCircles(foodCount, game.blocks);
  animateBlocks(game);
}

function draw(game) {
  if(playing){
  clearScreen(ctx);
  drawTextCentered(ctx, level, WIDTH / 2, HEIGHT / 2, HEIGHT / 10, 'monospace');
  drawTextCentered(ctx, score, 48, 48, 24, 'monospace');
  var wiz = game.faizaan;
  drawRect(ctx, wiz.x, wiz.y, wiz.w, wiz.h, wiz.color);
  for(var i = 0; i < game.blocks.length; i++){
    block = game.blocks[i];
    drawRect(ctx, block.x, block.y, block.w, block.h, block.color);
    if (didHitSquare(game.blocks[i], wiz)){
      gameOver(game);
    }
  }
  for(var i = 0; i < game.movingBlocks.length; i++){
    block = game.movingBlocks[i];
    drawRect(ctx, block.x, block.y, block.w, block.h, block.color);
    if (didHitSquare(game.movingBlocks[i], wiz)){
      gameOver(game);
    }
  }
  for(var i = 0; i < game.food.length; i++){
    circle = game.food[i];
    drawCircle(ctx, circle.x, circle.y, circle.radius, circle.color);
    if (didHitCircle(circle, wiz)){
      game.food.splice(i, 1);
      score += 1000;
    }
  }
  } else {
    drawTextCentered(ctx, finalScore, 48, 48, 24, 'monospace');
  }
  if(game.highscore){
    drawTextCentered(ctx, 'High Score: ' + game.highscore, WIDTH - 150, 48, 24, 'monospace');
  }
}

function makeBlocks(amount){
  blocks = [];
  for(var i=0; i < amount; i++){
    function makeBlock(){
      block = {speed: Math.random() * blockSpeed, x: Math.floor(Math.random() * WIDTH - 150) + 150, y: Math.floor(Math.random() * (HEIGHT - 100)) + 50, w: (WIDTH / 50) + Math.floor(Math.random() * 50), h: (HEIGHT / 50) + Math.floor(Math.random() * 50), color: getRandomColor()};
      if (i > 0){
        for(var j = 0; j < blocks.length; j++){
          if (didHitSquare(block, blocks[j])){
            makeBlock();
          }
        }
      }
      return block;
    }
    block = makeBlock();
    blocks.push(block);
  }
  return blocks;
}

function makeCircles(amount, blocks){
  var circles = [];
  for(var i=0; i < amount; i++){
    function makeCircle(){
      circle = {radius: (WIDTH / 100), x: Math.floor(Math.random() * WIDTH) + 150, y: Math.floor(Math.random() * (HEIGHT - 100)) + 50, color: getRandomColor()};
      for(var j = 0; j < blocks.length; j++){
        if (didHitCircle(circle, blocks[j])){
          makeCircle();
        }
      }
      return circle;
    }
    circles.push(makeCircle());
  }
  return circles;
}

function loop(game, time) {
  tick(game);
  draw(game);

  window.requestNextAnimationFrame(function(time) {
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
  playing = true;
  var game = {
    faizaan: {
      x: 20,
      y: HEIGHT / 2,
      w: FAIZAAN_WIDTH,
      h: FAIZAAN_HEIGHT,
      xVel: 4,
      yVel: 0,
      accelLeft: false,
      accelRight: false,
      color: getRandomColor()
    },

    blocks: makeBlocks(blockCount),
    movingBlocks: makeBlocks(movingBlocksCount),
    food: makeCircles(foodCount, blocks)
  };

  if(localStorage.scores){
    scores = JSON.parse(localStorage.scores);
    sortedScores = scores.sort(function(a,b){
      return b.score - a.score;
    });
    if(sortedScores[0].score != undefined) game.highscore = sortedScores[0].score;
  }

  window.onkeydown = function(event) {
    keyDown(game, event);
  };

  window.onkeyup = function(event) {
    keyUp(game, event);
  };

  window.gameLoop = window.requestNextAnimationFrame(function(time) {
    loop(game, time);
  });
}

function startScreen() {
  clearScreen(ctx);
  if (mobileDevice()) {
    var text = 'Touch to start';
  } else {
    var text = 'Hit space to start';
  }
  drawTextCentered(ctx, text, WIDTH / 2, HEIGHT / 2, HEIGHT / 20, 'monospace');
  window.onkeyup = function(event) {
    var handled = true;

    switch (event.keyCode) {
      case SPACE_KEY: run(); break;
      default: handled = false; break;
    }

    if (handled) {
      event.preventDefault();
    }
  }
}

window.onload = function(){
  startScreen();
}
