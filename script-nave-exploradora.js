function registerGame(){
// Nave exploradora - Juego educativo de planetas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let af = null;

// Estado principal
let nave = { x: canvas.width / 2, y: canvas.height - 60, w: 30, h: 40, speed: 5 };
let teclas = {};
let planetas = [];
let orbes = [];
let mensajes = [];
let score = 0;
let highScore = Number(localStorage.getItem('naveHighScore')||0);
let highName = localStorage.getItem('naveHighScoreName')||'-';
const playerName = localStorage.getItem('playerName')||'';
let infoActual = null;
let mostrarInstrucciones = true;
let nivel = 1;
let maxNivel = 5;
let metaOrbes = 5; // orbes necesarios por nivel
let orbesNivel = 0; // contador independiente de orbes en el nivel actual

const datosPlanetas = [
  { nombre: 'Mercurio', dato: 'El más cercano al Sol y el más rápido.' },
  { nombre: 'Venus', dato: 'Tiene una atmósfera muy densa y caliente.' },
  { nombre: 'Tierra', dato: 'Nuestro hogar, único con vida conocida.' },
  { nombre: 'Marte', dato: 'Conocido como el planeta rojo.' },
  { nombre: 'Júpiter', dato: 'El más grande, con una gran tormenta.' },
  { nombre: 'Saturno', dato: 'Famoso por sus anillos de hielo.' },
  { nombre: 'Urano', dato: 'Gira casi tumbado de lado.' },
  { nombre: 'Neptuno', dato: 'El más distante, muy ventoso.' }
];

function crearPlanetas() {
  planetas = [];
  const usados = new Set();
  for (let i = 0; i < 3; i++) {
    let idx;
    do { idx = Math.floor(Math.random() * datosPlanetas.length); } while (usados.has(idx));
    usados.add(idx);
    planetas.push({
      x: 60 + Math.random() * (canvas.width - 120),
      y: 60 + Math.random() * (canvas.height / 2),
      r: 25 + Math.random() * 15,
      nombre: datosPlanetas[idx].nombre,
      dato: datosPlanetas[idx].dato,
      descubierto: false
    });
  }
}

function crearOrbe() {
  orbes.push({ x: 30 + Math.random() * (canvas.width - 60), y: -20, r: 8, dy: 2 + Math.random() * 2 });
}

function drawNave() {
  ctx.save();
  ctx.translate(nave.x, nave.y);
  ctx.fillStyle = '#90caf9';
  ctx.beginPath();
  ctx.moveTo(0, -nave.h/2);
  ctx.lineTo(nave.w/2, nave.h/2);
  ctx.lineTo(-nave.w/2, nave.h/2);
  ctx.closePath();
  ctx.fill();
  // Fuego del motor cuando se pulsa arriba
  if (teclas['ArrowUp']) {
    ctx.beginPath();
    ctx.moveTo(0, nave.h/2);
    ctx.lineTo(6, nave.h/2 + 15);
    ctx.lineTo(-6, nave.h/2 + 15);
    ctx.closePath();
    ctx.fillStyle = '#ffb300';
    ctx.fill();
  }
  ctx.restore();
}

function drawPlanetas() {
  for (let p of planetas) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.descubierto ? '#ffca28' : '#6d4c41';
    ctx.fill();
    ctx.closePath();
    if (p.descubierto) {
      ctx.font = '12px Arial';
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.fillText(p.nombre, p.x, p.y - p.r - 6);
    }
  }
}

function drawOrbes() {
  ctx.fillStyle = '#7e57c2';
  for (let o of orbes) {
    ctx.beginPath();
    ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
}

function drawHUD() {
  ctx.save();
  if(window.GameUI){ GameUI.gradientBar(ctx,canvas.width,60,'#0d47a1','#1565c0'); } else { ctx.fillStyle='#0d47a1'; ctx.fillRect(0,0,canvas.width,60);} 
  ctx.font = '16px Arial';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  ctx.fillText('Puntos: ' + score, 12, 24);
  ctx.fillText('Nivel: ' + nivel + ' / ' + maxNivel, 12, 44);
  ctx.textAlign = 'right';
  ctx.fillText('Orbes: ' + orbesNivel + ' / ' + metaOrbes, canvas.width - 12, 24);
  ctx.fillText('Récord: ' + highScore + ' ('+highName+')', canvas.width - 12, 44);
  ctx.restore();
}

function drawInfo() {
  if (!infoActual) return;
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = '#fff';
  ctx.fillRect(40, canvas.height - 120, canvas.width - 80, 80);
  ctx.fillStyle = '#000';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(infoActual.nombre + ': ' + infoActual.dato, canvas.width / 2, canvas.height - 75);
  ctx.restore();
}

function drawInstrucciones() {
  if (!mostrarInstrucciones) return;
  const x=40,y=80,w=canvas.width-80,h=160; if(window.GameUI){ GameUI.glassPanel(ctx,x,y,w,h,20);} else { ctx.save(); ctx.globalAlpha=0.92; ctx.fillStyle='#000'; ctx.fillRect(x,y,w,h); ctx.restore(); }
  ctx.save(); ctx.fillStyle='#fff'; ctx.font='bold 22px Arial'; ctx.textAlign='center'; ctx.fillText('Nave exploradora', canvas.width/2, y+36); ctx.font='14px Arial'; ctx.fillText('Flechas: mover | Arriba: acelerar | Reúne orbes', canvas.width/2, y+70); ctx.fillText('Acércate a un planeta para descubrir un dato.', canvas.width/2, y+92); ctx.fillText('Completa niveles reuniendo orbes. Pulsa tecla para empezar.', canvas.width/2, y+114); ctx.restore();
}

function update() {
  // Movimiento nave
  if (teclas['ArrowLeft'] && nave.x - nave.w/2 > 0) nave.x -= nave.speed;
  if (teclas['ArrowRight'] && nave.x + nave.w/2 < canvas.width) nave.x += nave.speed;
  if (teclas['ArrowUp'] && nave.y - nave.h/2 > 0) nave.y -= nave.speed;
  if (teclas['ArrowDown'] && nave.y + nave.h/2 < canvas.height) nave.y += nave.speed;

  // Orbes
  if (Math.random() < 0.02) crearOrbe();
  for (let o of orbes) {
    o.y += o.dy;
  }
  orbes = orbes.filter(o => o.y < canvas.height + 20);

  // Colisión orbes
  for (let i = orbes.length - 1; i >= 0; i--) {
    let o = orbes[i];
    if (Math.abs(o.x - nave.x) < 20 && Math.abs(o.y - nave.y) < 30) {
      score += 20;
      orbesNivel++;
      orbes.splice(i, 1);
    }
  }

  // Descubrir planetas
  for (let p of planetas) {
    let dx = p.x - nave.x;
    let dy = p.y - nave.y;
    let dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < p.r + 30 && !p.descubierto) {
      p.descubierto = true;
      infoActual = { nombre: p.nombre, dato: p.dato };
      setTimeout(() => { if (infoActual && infoActual.nombre === p.nombre) infoActual = null; }, 4000);
    }
  }

  // Subir nivel
  if (orbesNivel >= metaOrbes) {
    nivel++;
    score += 50; // bonus
  if(score>highScore){ highScore=score; highName=playerName||'-'; localStorage.setItem('naveHighScore', String(highScore)); localStorage.setItem('naveHighScoreName', highName); }
    orbesNivel = 0;
    metaOrbes = Math.min(metaOrbes + 1, 10);
    crearPlanetas();
    if (nivel > maxNivel) {
      infoActual = { nombre: '¡Completado!', dato: 'Has explorado el mini-sistema. ¡Gran trabajo!' };
    }
  }
}

// Pre-generar estrellas con formas reales (puntas)
const estrellas = Array.from({length:60},()=>({
  x: Math.random()*canvas.width,
  y: Math.random()*canvas.height,
  r: 1+Math.random()*1.5,
  p: 5 + Math.floor(Math.random()*2),
  o: 0.5 + Math.random()*0.5
}));

function drawStar(s){
  const rot = Math.PI/2 * 3;
  let x = s.x;
  let y = s.y;
  let spikes = s.p;
  let outerRadius = s.r*2.2;
  let innerRadius = s.r;
  let angle = 0;
  ctx.beginPath();
  ctx.moveTo(x, y - outerRadius);
  for (let i=0;i<spikes;i++){
    let rx = x + Math.cos(angle) * outerRadius;
    let ry = y + Math.sin(angle) * outerRadius;
    ctx.lineTo(rx, ry);
    angle += Math.PI / spikes;
    rx = x + Math.cos(angle) * innerRadius;
    ry = y + Math.sin(angle) * innerRadius;
    ctx.lineTo(rx, ry);
    angle += Math.PI / spikes;
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,'+s.o+')';
  ctx.fill();
}

function drawFondo() {
  ctx.save();
  ctx.fillStyle = '#000014';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  estrellas.forEach(drawStar);
  ctx.restore();
}

function loop() {
  drawFondo();
  drawPlanetas();
  drawOrbes();
  drawNave();
  drawHUD();
  drawInfo();
  drawInstrucciones();
  if (!mostrarInstrucciones) update();
  af = requestAnimationFrame(loop);
}

// Eventos
function keydown(e){
  if (mostrarInstrucciones) { mostrarInstrucciones = false; return; }
  teclas[e.key] = true;
}
function keyup(e){ teclas[e.key] = false; }
window.addEventListener('keydown',keydown);
window.addEventListener('keyup',keyup);

crearPlanetas();
loop();
return function cleanup(){
  if (af) cancelAnimationFrame(af);
  window.removeEventListener('keydown',keydown);
  window.removeEventListener('keyup',keyup);
};
}
window.registerGame = registerGame;
