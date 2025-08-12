// Bruno el paracaidista - Base Jump Simulator
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let altura = 10000; // metros
let velocidad = 30; // metros por segundo
let baseX = canvas.width / 2;
let baseWidth = 80;
let baseHeight = 20;
let gameOver = false;
let showInstructions = true;
let humoActivo = false;
let score = 0;
let nivel = 1;
let maxNivel = 5;
let vidas = 3;
let estrellas = [];
let obstaculos = [];
let obstaculoInterval = 80;
let frameCount = 0;
let preguntaPendiente = false;
let preguntaActual = null;
let mensajeNivel = '';

// Muñeco fijo en vertical
let bruno = {
  x: canvas.width / 2,
  y: canvas.height / 2 + 60,
  size: 30,
  color: '#2196f3',
  dx: 0
};

// Teclas
let leftPressed = false;
let rightPressed = false;

  // Muñeco fijo en vertical
  let bruno = {
    x: canvas.width / 2,
    y: canvas.height / 2 + 60,
    size: 30,
    color: '#2196f3',
    dx: 0
  };
function drawInstructions() {
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = '#fff';
  ctx.fillRect(40, 40, canvas.width - 80, 120);
  ctx.font = 'bold 22px Arial';
  ctx.fillStyle = '#333';
  ctx.textAlign = 'center';
  ctx.fillText('Bruno el paracaidista', canvas.width / 2, 80);
  ctx.font = '16px Arial';
  ctx.fillText('Usa las flechas ← → para moverte', canvas.width / 2, 110);
  ctx.fillText('Pulsa H para echar humo', canvas.width / 2, 135);
  ctx.fillText('Evita los pájaros, globos y drones. Recoge estrellas para puntos extra.', canvas.width / 2, 160);
  ctx.fillText('Tienes 3 vidas. Pulsa cualquier tecla para empezar', canvas.width / 2, 185);
  ctx.restore();
}

function drawBruno() {
  ctx.save();
  // Cabeza
  ctx.beginPath();
  ctx.arc(bruno.x, bruno.y, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#ffe0b2';
  ctx.fill();
  ctx.closePath();
  // Cuerpo
  ctx.beginPath();
  ctx.rect(bruno.x - 6, bruno.y + 12, 12, 22);
  ctx.fillStyle = bruno.color;
  ctx.fill();
  ctx.closePath();
  // Piernas
  ctx.beginPath();
  ctx.moveTo(bruno.x - 4, bruno.y + 34);
  ctx.lineTo(bruno.x - 4, bruno.y + 46);
  ctx.moveTo(bruno.x + 4, bruno.y + 34);
  ctx.lineTo(bruno.x + 4, bruno.y + 46);
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();
  // Brazos
  ctx.beginPath();
  ctx.moveTo(bruno.x - 6, bruno.y + 18);
  ctx.lineTo(bruno.x - 16, bruno.y + 28);
  ctx.moveTo(bruno.x + 6, bruno.y + 18);
  ctx.lineTo(bruno.x + 16, bruno.y + 28);
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();
  // Paracaídas
  ctx.beginPath();
  ctx.arc(bruno.x, bruno.y - 16, 18, Math.PI, 2 * Math.PI);
  ctx.fillStyle = '#ffeb3b';
  ctx.fill();
  ctx.closePath();
  // Humo
  if (humoActivo) {
    ctx.beginPath();
    ctx.arc(bruno.x, bruno.y + 50, 12, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(200,200,200,0.7)';
    ctx.fill();
    ctx.closePath();
  }
  ctx.restore();
}

function drawObstaculos() {
  for (let o of obstaculos) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(o.x, o.y, o.size, o.size / 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = o.color;
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }
}

function drawBase() {
  ctx.save();
  ctx.fillStyle = '#4caf50';
  ctx.fillRect(baseX - baseWidth / 2, canvas.height - baseHeight, baseWidth, baseHeight);
  ctx.font = 'bold 18px Arial';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText('BASE', baseX, canvas.height - baseHeight / 2 + 6);
  ctx.restore();
}

function drawAltura() {
  ctx.save();
  ctx.font = 'bold 22px Arial';
  ctx.fillStyle = '#e91e63';
  ctx.textAlign = 'right';
  ctx.fillText('Altura: ' + Math.max(0, Math.floor(altura)) + ' m', canvas.width - 30, 40);
  ctx.restore();
}

function drawScore() {
  ctx.save();
  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = '#ff9800';
  ctx.textAlign = 'left';
  ctx.fillText('Puntos: ' + score, 20, 70);
  ctx.restore();
}

function drawVidas() {
  ctx.save();
  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = '#e91e63';
  ctx.textAlign = 'left';
  ctx.fillText('Vidas: ' + vidas, 20, 100);
  ctx.restore();
}

function drawEstrellas() {
  for (let e of estrellas) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(e.x, e.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

function drawMensajeNivel() {
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = '#fff';
  ctx.fillRect(60, canvas.height / 2 - 60, canvas.width - 120, 80);
  ctx.font = 'bold 22px Arial';
  ctx.fillStyle = '#333';
  ctx.textAlign = 'center';
  ctx.fillText(mensajeNivel, canvas.width / 2, canvas.height / 2);
  ctx.restore();
}

function drawPregunta() {
  ctx.save();
  ctx.globalAlpha = 0.95;
  ctx.fillStyle = '#fff';
  ctx.fillRect(60, canvas.height / 2 - 80, canvas.width - 120, 120);
  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = '#333';
  ctx.textAlign = 'center';
  ctx.fillText('Pregunta lógica para puntos extra:', canvas.width / 2, canvas.height / 2 - 30);
  ctx.font = '18px Arial';
  ctx.fillText(preguntaActual.pregunta, canvas.width / 2, canvas.height / 2);
  ctx.font = '16px Arial';
  ctx.fillText('Responde con el número correcto usando el teclado.', canvas.width / 2, canvas.height / 2 + 40);
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.font = 'bold 48px Comic Sans MS, Arial';
  ctx.fillStyle = '#0288d1';
  ctx.textAlign = 'center';
  ctx.fillText('Bruno el paracaidista', canvas.width / 2, canvas.height / 2);
  ctx.restore();
  drawBase();
  drawBruno();
  drawObstaculos();
  drawEstrellas();
  drawAltura();
  drawScore();
  drawVidas();
  if (showInstructions) drawInstructions();
  if (mensajeNivel) drawMensajeNivel();
  if (preguntaPendiente) drawPregunta();
}

function moveBruno() {
  if (leftPressed && bruno.x - bruno.size > 0) bruno.x -= 7;
  if (rightPressed && bruno.x + bruno.size < canvas.width) bruno.x += 7;
}

function crearObstaculo() {
  let r = Math.random();
  let tipo, color, size;
  if (r < 0.5) {
    tipo = 'pajaro'; color = '#795548'; size = 22;
  } else if (r < 0.8) {
    tipo = 'globo'; color = '#e91e63'; size = 26;
  } else {
    tipo = 'drone'; color = '#607d8b'; size = 20;
  }
  let x = 40 + Math.random() * (canvas.width - 80);
  obstaculos.push({ x, y: -30, size, color });
}

function crearEstrella() {
  let x = 40 + Math.random() * (canvas.width - 80);
  estrellas.push({ x, y: -30 });
}

function updateObstaculos() {
  for (let o of obstaculos) {
    o.y += 6 + Math.random() * (2 + nivel);
  }
  obstaculos = obstaculos.filter(o => o.y < canvas.height + 40);
  for (let e of estrellas) {
    e.y += 5 + nivel;
  }
  estrellas = estrellas.filter(e => e.y < canvas.height + 20);
}

function checkColisiones() {
  for (let o of obstaculos) {
    let dx = bruno.x - o.x;
    let dy = bruno.y - o.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < bruno.size + o.size / 2) {
      vidas--;
      if (vidas <= 0) {
        gameOver = true;
      } else {
        mensajeNivel = '¡Cuidado! Has perdido una vida.';
        setTimeout(() => { mensajeNivel = ''; }, 1200);
        bruno.x = canvas.width / 2;
        bruno.y = 60;
      }
      obstaculos = [];
      estrellas = [];
      break;
    }
  }
  for (let i = estrellas.length - 1; i >= 0; i--) {
    let e = estrellas[i];
    let dx = bruno.x - e.x;
    let dy = bruno.y - e.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < bruno.size + 10) {
      score += 50;
      estrellas.splice(i, 1);
      mensajeNivel = '¡Has recogido una estrella! +50 puntos';
      setTimeout(() => { mensajeNivel = ''; }, 1200);
    }
  }
}

function checkLanding() {
  if (altura <= 0 && bruno.y + bruno.size > canvas.height - baseHeight) {
    if (bruno.x > baseX - baseWidth / 2 && bruno.x < baseX + baseWidth / 2) {
      score += 100;
      if (nivel < maxNivel) {
        nivel++;
        mensajeNivel = '¡Nivel superado! Curiosidad: El récord mundial de salto BASE es de más de 7.600 metros.';
        setTimeout(() => { mensajeNivel = ''; preguntaLogica(); }, 1800);
      } else {
        setTimeout(() => {
          alert('¡Has completado todos los niveles! Puntuación final: ' + score);
          reiniciar();
        }, 100);
      }
    } else {
      setTimeout(() => {
        alert('¡Has caído fuera de la base!');
        reiniciar();
      }, 100);
    }
  }
}

function reiniciar() {
  altura = 10000;
  bruno.x = canvas.width / 2;
  bruno.y = canvas.height / 2 + 60;
  obstaculos = [];
  estrellas = [];
  gameOver = false;
  showInstructions = true;
  humoActivo = false;
  score = 0;
  nivel = 1;
  vidas = 3;
  preguntaPendiente = false;
  preguntaActual = null;
  mensajeNivel = '';
}

function preguntaLogica() {
  preguntaPendiente = true;
  let preguntas = [
    { pregunta: '¿Cuánto es 3 + 4?', respuesta: '7' },
    { pregunta: '¿Cuánto es 12 - 5?', respuesta: '7' },
    { pregunta: '¿Cuánto es 2 x 6?', respuesta: '12' },
    { pregunta: '¿Cuánto es 15 / 3?', respuesta: '5' },
    { pregunta: '¿Cuánto es 9 + 8?', respuesta: '17' }
  ];
  preguntaActual = preguntas[Math.floor(Math.random() * preguntas.length)];
}

function gameLoop() {
  if (gameOver) {
    setTimeout(() => {
      alert('¡Te has quedado sin vidas! Intenta de nuevo.');
      reiniciar();
    }, 100);
    return;
  }
  if (preguntaPendiente) {
    draw();
    return;
  }
  if (showInstructions) {
    draw();
    return;
  }
  frameCount++;
  if (frameCount % obstaculoInterval === 0) crearObstaculo();
  if (frameCount % (obstaculoInterval * 2) === 0) crearEstrella();
  altura -= velocidad * 0.03 + nivel * 0.01;
  // Bruno está fijo, los objetos se mueven
  moveBruno();
  updateObstaculos();
  checkColisiones();
  checkLanding();
  draw();
  if (altura > 0) requestAnimationFrame(gameLoop);
  else draw();
}

document.addEventListener('keydown', (e) => {
  if (showInstructions) {
    showInstructions = false;
    gameLoop();
    return;
  }
  if (preguntaPendiente) {
    if (e.key === preguntaActual.respuesta) {
      score += 100;
      mensajeNivel = '¡Respuesta correcta! +100 puntos';
      preguntaPendiente = false;
      preguntaActual = null;
      setTimeout(() => { mensajeNivel = ''; altura = 10000; bruno.x = canvas.width / 2; bruno.y = 60; obstaculos = []; estrellas = []; gameLoop(); }, 1200);
    } else if (!isNaN(Number(e.key))) {
      mensajeNivel = 'Respuesta incorrecta.';
      preguntaPendiente = false;
      preguntaActual = null;
      setTimeout(() => { mensajeNivel = ''; altura = 10000; bruno.x = canvas.width / 2; bruno.y = 60; obstaculos = []; estrellas = []; gameLoop(); }, 1200);
    }
    return;
  }
  if (e.key === 'ArrowLeft') leftPressed = true;
  if (e.key === 'ArrowRight') rightPressed = true;
  if (e.key.toLowerCase() === 'h') humoActivo = true;
});
document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft') leftPressed = false;
  if (e.key === 'ArrowRight') rightPressed = false;
  if (e.key.toLowerCase() === 'h') humoActivo = false;
});

draw();