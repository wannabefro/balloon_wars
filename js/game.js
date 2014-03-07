var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

var blockCount = 10;
var movingBlocksCount = 2;
var score = 0;
var foodCount = 3;
var level = 1;
var playing = true;
var gameloop;
var finalScore;
ctx.canvas.height = HEIGHT;
ctx.canvas.width = WIDTH;

var GRAVITY = 0.5;
var ACCELERATION = 0.8;
var MAX_SPEED = 15.0;
var JUMP_SPEED = 10.0;

function keyDown(game, event) {
  var handled = true;

  switch (event.keyCode) {
    case SPACE_KEY: jump(game); break;
    case LEFT_KEY: toggleAcceleration(game.faizaan, 'left', true); break;
    case RIGHT_KEY: toggleAcceleration(game.faizaan, 'right', true); break;
    default: handled = false; break;
  }

  if (handled) {
    event.preventDefault();
  }
}

function keyUp(game, event) {
  var handled = true;

  switch (event.keyCode) {
    case LEFT_KEY: toggleAcceleration(game.faizaan, 'left', false); break;
    case RIGHT_KEY: toggleAcceleration(game.faizaan, 'right', false); break;
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
  game.faizaan = {};
  playing = false;
  addToLocalStorage();
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
    score += game.faizaan.xVel;

    game.faizaan.yVel += GRAVITY;
    if (game.faizaan.yVel > MAX_SPEED) {
      game.faizaan.yVel = MAX_SPEED;
    }

    game.faizaan.y += game.faizaan.yVel;

    var xAccel = 0;
    if (game.faizaan.accelLeft) { xAccel -= ACCELERATION; }
    if (game.faizaan.accelRight) { xAccel += ACCELERATION; }

    game.faizaan.xVel += xAccel;
    if (game.faizaan.xVel > MAX_SPEED) {
      game.faizaan.xVel = MAX_SPEED;
    }

    if (game.faizaan.xVel <= -MAX_SPEED) {
      game.faizaan.xVel = -MAX_SPEED;
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
        block.y++;
      } else {
        block.y--;
      }
    }

    if (game.faizaan.y > HEIGHT + 1){
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
      game.faizaan.y = HEIGHT;
      level++;
      game.blocks = makeBlocks(blockCount);
      game.movingBlocks = makeBlocks(movingBlocksCount);
      game.blocks = makeBlocks(blockCount);
      game.movingBlocks = makeBlocks(movingBlocksCount);
      animateBlocks(game);
    }
    if (game.faizaan.x >  WIDTH - 20){
      game.faizaan.x = 20;
      blockCount += 5;
      movingBlocksCount += 1;
      game.blocks = makeBlocks(blockCount);
      game.movingBlocks = makeBlocks(movingBlocksCount);
      game.food = makeCircles(foodCount);
      animateBlocks(game);
    }
    if (game.faizaan.x <  20){
      game.faizaan.x = WIDTH;
    }
  }
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
    if (didHitCircle(circle, wiz)){
      console.log('score');
      game.food.splice(i, 1);
      score += 1000;
    }
  }
  } else {
    drawTextCentered(ctx, finalScore, 48, 48, 24, 'monospace');
  }
  if(game.highscore){
    drawTextCentered(ctx, 'High Score: ' + game.highscore, WIDTH - 120, 48, 24, 'monospace');
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
    blocks.push({x: Math.floor(Math.random() * WIDTH) + 150, y: Math.floor(Math.random() * (HEIGHT - 100)) + 50, w: 10 + Math.floor(Math.random() * 50), h: 10 + Math.floor(Math.random() * 50), color: getRandomColor()})
  }
  return blocks;
}

function makeCircles(amount){
  var circles = [];
  for(var i=0; i < amount; i++){
    circles.push({radius: 10, x: Math.floor(Math.random() * WIDTH) + 150, y: Math.floor(Math.random() * (HEIGHT - 100)) + 50, color: getRandomColor()});
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
    faizaan: {
      x: 20,
      y: HEIGHT / 2,
      w: 20,
      h: 30,
      xVel: 0,
      yVel: 0,
      accelLeft: false,
      accelRight: false,
      color: getRandomColor()
    },

    blocks: makeBlocks(blockCount),
    movingBlocks: makeBlocks(movingBlocksCount),
    food: makeCircles(foodCount)
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

  var gameLoop = window.requestAnimationFrame(function(time) {
    loop(game, time);
  });
}

run();
