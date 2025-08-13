function registerGame(){
  // Alonso Noel: Papá Noel recoge regalos y esquiva bolas de nieve
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  let af = null;
  canvas.width = 800;
  canvas.height = 500;
  let player = { x: canvas.width/2, y: canvas.height-90, w: 60, h: 80, vx: 0 };
  let score = 0;
  let high = Number(localStorage.getItem('alonsoNoelHigh')||0);
  let highName = localStorage.getItem('alonsoNoelHighName')||'';
  let playerName = localStorage.getItem('playerName')||'';
  let objects = [];
  let gameOver = false;
  let left = false, right = false;
  let spawnTimer = 0;
  let showIntro = true;
  function reset(){
    player.x = canvas.width/2;
    score = 0;
    objects = [];
    gameOver = false;
    spawnTimer = 0;
    showIntro = true;
  }
  function spawnObject(){
    // 70% regalo, 30% bola de nieve
    if(Math.random()<0.7){
      // Regalo: tamaño aleatorio
      const sizes = [32, 48, 64];
      const points = [100, 50, 20];
      const idx = Math.floor(Math.random()*sizes.length);
      objects.push({
        type: 'gift',
        x: Math.random()*(canvas.width-sizes[idx]),
        y: -sizes[idx],
        w: sizes[idx],
        h: sizes[idx],
        points: points[idx],
        color: idx===0?'#e91e63':(idx===1?'#4caf50':'#1976d2')
      });
    } else {
      // Bola de nieve
      const r = 28+Math.random()*18;
      objects.push({
        type: 'snow',
        x: Math.random()*(canvas.width-2*r),
        y: -2*r,
        w: 2*r,
        h: 2*r,
        r: r
      });
    }
  }
  function update(dt){
    if(showIntro||gameOver) return;
    // Movimiento jugador
    if(left) player.x -= 340*dt/1000;
    if(right) player.x += 340*dt/1000;
    player.x = Math.max(0, Math.min(canvas.width-player.w, player.x));
    // Spawneo
    spawnTimer += dt;
    if(spawnTimer>700){ spawnTimer=0; spawnObject(); }
    // Movimiento objetos
    for(const o of objects){ o.y += 220*dt/1000; }
    // Colisiones
    for(const o of objects){
      if(o.type==='gift'){
        if(
          player.x+player.w>o.x && player.x<o.x+o.w &&
          player.y+player.h>o.y && player.y<o.y+o.h
        ){
          score += o.points;
          o.caught = true;
        }
      } else if(o.type==='snow'){
        // Colisión circular
        const cx = o.x+o.r, cy = o.y+o.r;
        const px = player.x+player.w/2, py = player.y+player.h/2;
        const dist = Math.hypot(cx-px, cy-py);
        if(dist < o.r + Math.min(player.w,player.h)/2-8){
          gameOver = true;
          if(score>high){
            high = score;
            localStorage.setItem('alonsoNoelHigh', String(high));
            localStorage.setItem('alonsoNoelHighName', playerName);
          }
        }
      }
    }
    // Eliminar objetos atrapados o fuera de pantalla
    objects = objects.filter(o=>!o.caught && o.y<canvas.height+60);
  }
  function drawSanta(x,y,w,h){
    // Cuerpo
    ctx.save();
    ctx.translate(x+w/2,y+h/2);
    ctx.scale(w/60,h/80);
    ctx.beginPath(); ctx.arc(0,18,18,0,Math.PI*2); ctx.fillStyle='#fff'; ctx.fill(); // cara
    ctx.beginPath(); ctx.arc(0,32,22,Math.PI*0.9,Math.PI*2.1); ctx.fillStyle='#e53935'; ctx.fill(); // gorro
    ctx.beginPath(); ctx.arc(0,38,20,0,Math.PI,true); ctx.fillStyle='#fff'; ctx.fill(); // barba
    ctx.fillStyle='#e53935'; ctx.fillRect(-16,36,32,30); // cuerpo
    ctx.fillStyle='#fff'; ctx.fillRect(-16,66,32,8); // bajo
    ctx.fillStyle='#000'; ctx.fillRect(-12,74,8,8); ctx.fillRect(4,74,8,8); // pies
    ctx.restore();
  }
  function drawGift(o){
    ctx.save();
    ctx.fillStyle = o.color;
    ctx.fillRect(o.x,o.y,o.w,o.h);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(o.x+o.w/2,o.y);
    ctx.lineTo(o.x+o.w/2,o.y+o.h);
    ctx.moveTo(o.x,o.y+o.h/2);
    ctx.lineTo(o.x+o.w,o.y+o.h/2);
    ctx.stroke();
    ctx.restore();
  }
  function drawSnow(o){
    ctx.save();
    ctx.beginPath();
    ctx.arc(o.x+o.r,o.y+o.r,o.r,0,Math.PI*2);
    ctx.fillStyle = '#b3e5fc';
    ctx.fill();
    ctx.strokeStyle = '#0288d1';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
  function drawHUD(){
    ctx.save();
    ctx.fillStyle = '#1565c0';
    ctx.fillRect(0,0,canvas.width,50);
    ctx.fillStyle = '#fff';
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Puntuación: '+score, 16,32);
    ctx.textAlign = 'right';
    ctx.fillText('Récord: '+high+(highName?' ('+highName+')':''), canvas.width-16,32);
    ctx.restore();
  }
  function drawIntro(){
    ctx.save();
    ctx.globalAlpha=0.92;
    ctx.fillStyle='#fff';
    ctx.fillRect(80,90,canvas.width-160,180);
    ctx.globalAlpha=1;
    ctx.fillStyle='#c62828';
    ctx.font='bold 32px Arial';
    ctx.textAlign='center';
    ctx.fillText('Alonso Noel', canvas.width/2, 140);
    ctx.font='18px Arial';
    ctx.fillStyle='#333';
    ctx.fillText('¡Ayuda a Papá Noel a recoger regalos!', canvas.width/2, 180);
    ctx.font='15px Arial';
    ctx.fillText('Mueve con ← →. Atrapa regalos pequeños para más puntos.', canvas.width/2, 210);
    ctx.fillText('Evita las bolas de nieve. Pulsa cualquier tecla para empezar.', canvas.width/2, 235);
    ctx.restore();
  }
  function drawGameOver(){
    ctx.save();
    ctx.globalAlpha=0.88;
    ctx.fillStyle='#fff';
    ctx.fillRect(120,160,canvas.width-240,120);
    ctx.globalAlpha=1;
    ctx.fillStyle='#d32f2f';
    ctx.font='bold 30px Arial';
    ctx.textAlign='center';
    ctx.fillText('¡Fin del juego!', canvas.width/2, 200);
    ctx.font='18px Arial';
    ctx.fillStyle='#333';
    ctx.fillText('Puntuación: '+score, canvas.width/2, 235);
    ctx.fillText('Pulsa R para reiniciar', canvas.width/2, 265);
    ctx.restore();
  }
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#b3e5fc';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    drawHUD();
    drawSanta(player.x, player.y, player.w, player.h);
    for(const o of objects){
      if(o.type==='gift') drawGift(o);
      else drawSnow(o);
    }
    if(showIntro) drawIntro();
    if(gameOver) drawGameOver();
  }
  function loop(t){
    update(16);
    draw();
    af = requestAnimationFrame(loop);
  }
  function keydown(e){
    if(showIntro){ showIntro=false; return; }
    if(gameOver && e.key.toLowerCase()==='r'){ reset(); return; }
    if(e.key==='ArrowLeft') left=true;
    if(e.key==='ArrowRight') right=true;
  }
  function keyup(e){
    if(e.key==='ArrowLeft') left=false;
    if(e.key==='ArrowRight') right=false;
  }
  window.addEventListener('keydown', keydown);
  window.addEventListener('keyup', keyup);
  reset();
  loop();
  return function cleanup(){
    if(af) cancelAnimationFrame(af);
    window.removeEventListener('keydown', keydown);
    window.removeEventListener('keyup', keyup);
  };
}
window.registerGame = registerGame;
