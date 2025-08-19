function registerGame(){
// Vega la bailarina - Juego sencillo para 3 años
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let af = null;

let vega = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 40,
  color: '#e91e63'
};
let corazones = [];
let bailando = false;
let totalCorazones = 0;
let highScore = Number(localStorage.getItem('bailarinaHighScore')||0);
let highName = localStorage.getItem('bailarinaHighName')||'-';
const playerName = localStorage.getItem('playerName')||'';

// Assets: fondo y personaje (PNG con fallback a SVG)
const backgroundImage = new Image();
backgroundImage.src = 'assets/vega-bailarina-background.png';
backgroundImage.onerror = () => { backgroundImage.src = 'assets/vega-bailarina-background.svg'; };
const characterImage = new Image();
characterImage.src = 'assets/vega-bailarina-character.png';
characterImage.onerror = () => { characterImage.src = 'assets/vega-bailarina-character.svg'; };
function backgroundReady(){ return backgroundImage.complete && backgroundImage.naturalWidth>0; }
function characterReady(){ return characterImage.complete && characterImage.naturalWidth>0; }

function drawCharacterSprite(){
  const w = 60, h = 80;
  ctx.drawImage(characterImage, vega.x - w/2, vega.y - h/2, w, h);
}

function drawVega() {
  ctx.save();
  // Cabeza
  ctx.beginPath();
  ctx.arc(vega.x, vega.y - 20, 16, 0, Math.PI * 2);
  ctx.fillStyle = '#ffe0b2';
  ctx.fill();
  ctx.closePath();
  // Cuerpo
  ctx.beginPath();
  ctx.rect(vega.x - 10, vega.y, 20, 30);
  ctx.fillStyle = vega.color;
  ctx.fill();
  ctx.closePath();
  // Falda
  ctx.beginPath();
  ctx.ellipse(vega.x, vega.y + 30, 18, 10, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#f8bbd0';
  ctx.fill();
  ctx.closePath();
  // Brazos
  ctx.beginPath();
  ctx.moveTo(vega.x - 10, vega.y + 10);
  ctx.lineTo(vega.x - 30, vega.y + 10 + (bailando ? 20 : 0));
  ctx.moveTo(vega.x + 10, vega.y + 10);
  ctx.lineTo(vega.x + 30, vega.y + 10 + (bailando ? 20 : 0));
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.closePath();
  // Piernas
  ctx.beginPath();
  ctx.moveTo(vega.x - 5, vega.y + 30);
  ctx.lineTo(vega.x - 5, vega.y + 50);
  ctx.moveTo(vega.x + 5, vega.y + 30);
  ctx.lineTo(vega.x + 5, vega.y + 50);
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.closePath();
  ctx.restore();
}

function drawCorazones() {
  for (let c of corazones) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(c.x, c.y);
    ctx.bezierCurveTo(c.x - 8, c.y - 8, c.x - 12, c.y + 8, c.x, c.y + 12);
    ctx.bezierCurveTo(c.x + 12, c.y + 8, c.x + 8, c.y - 8, c.x, c.y);
    ctx.fillStyle = '#ff4081';
    ctx.globalAlpha = c.alpha;
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Fondo de escenario
  if (backgroundReady()) {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  } else {
    if(window.GameUI) GameUI.softBg(ctx,canvas.width,canvas.height,['#fce4ec','#f8bbd0']);
  }
  // Barra superior
  if(window.GameUI) GameUI.gradientBar(ctx,canvas.width,60,'#ad1457','#d81b60'); else { ctx.fillStyle='#d81b60'; ctx.fillRect(0,0,canvas.width,60);} ctx.fillStyle='#fff'; ctx.font='bold 26px Arial'; ctx.textAlign='center'; ctx.fillText('Vega la bailarina', canvas.width/2,40); ctx.font='14px Arial'; ctx.fillStyle='#ffeef5'; ctx.fillText('Corazones: '+totalCorazones+'  Récord: '+highScore+' ('+highName+')', canvas.width/2,58);
  // Vega: sprite si existe, si no el vector actual
  if (characterReady()) drawCharacterSprite(); else drawVega();
  drawCorazones();
  ctx.save(); ctx.font='18px Arial'; ctx.fillStyle='#444'; ctx.textAlign='center'; ctx.fillText('Flechas: mover  |  Espacio: bailar', canvas.width/2, canvas.height-34); ctx.restore();
}

function moveVega() {
  if (leftPressed && vega.x - vega.size > 0) vega.x -= 10;
  if (rightPressed && vega.x + vega.size < canvas.width) vega.x += 10;
  if (upPressed && vega.y - vega.size > 0) vega.y -= 10;
  if (downPressed && vega.y + vega.size < canvas.height) vega.y += 10;
}

function updateCorazones() {
  for (let c of corazones) {
    c.y -= 2;
    c.alpha -= 0.02;
  }
  corazones = corazones.filter(c => c.alpha > 0);
}

let leftPressed = false;
let rightPressed = false;
let upPressed = false;
let downPressed = false;

function keydown(e){
  if (e.key === 'ArrowLeft') leftPressed = true;
  if (e.key === 'ArrowRight') rightPressed = true;
  if (e.key === 'ArrowUp') upPressed = true;
  if (e.key === 'ArrowDown') downPressed = true;
  if (e.code === 'Space') {
    bailando = true;
    for (let i = 0; i < 6; i++) {
      corazones.push({ x: vega.x + Math.random() * 40 - 20, y: vega.y - 10, alpha: 1 });
      totalCorazones++;
    }
  if(totalCorazones>highScore){ highScore=totalCorazones; highName=playerName||'-'; localStorage.setItem('bailarinaHighScore', String(highScore)); localStorage.setItem('bailarinaHighName', highName); }
    setTimeout(() => { bailando = false; }, 400);
  }
}
function keyup(e){
  if (e.key === 'ArrowLeft') leftPressed = false;
  if (e.key === 'ArrowRight') rightPressed = false;
  if (e.key === 'ArrowUp') upPressed = false;
  if (e.key === 'ArrowDown') downPressed = false;
}
document.addEventListener('keydown',keydown);
document.addEventListener('keyup',keyup);

function gameLoop() {
  moveVega();
  updateCorazones();
  draw();
  af = requestAnimationFrame(gameLoop);
}
gameLoop();
return function cleanup(){
  if (af) cancelAnimationFrame(af);
  document.removeEventListener('keydown',keydown);
  document.removeEventListener('keyup',keyup);
};
}
window.registerGame = registerGame;
