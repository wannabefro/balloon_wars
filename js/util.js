function drawRect(context, x, y, w, h, color) {
  context.strokeStyle = color;
  context.fillStyle = color;

  context.fillRect(x, y, w, h);
}

function clearScreen(context) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
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

function drawSmileyFace(context, x, y, radius, color){
  context.beginPath();
  context.arc(x,y,50,0,Math.PI*2,true); // Outer circle
  context.moveTo(110,75);
  context.arc(75,75,35,0,Math.PI,false);   // Mouth (clockwise)
  context.moveTo(65,65);
  context.arc(60,65,5,0,Math.PI*2,true);  // Left eye
  context.moveTo(95,65);
  context.arc(90,65,5,0,Math.PI*2,true);  // Right eye
  context.stroke();
}

function getRandomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
    color += letters[Math.round(Math.random() * 15)];
  }
  return color;
}

function didHitCircle(circle, rect){
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
