// script-recoge-moras.js
// Juego: Recoge Moras
// Autor: ChechuJA + GitHub Copilot

(function(){
  let canvas, ctx, width, height;
  let player, moras, score, gameOver, keys, timer, timeLeft;
  const PLAYER_SIZE = 32;
  const MORA_SIZE = 20;
  const GAME_TIME = 30; // segundos
  const MORA_COUNT = 5;

  function initGame() {
    score = 0;
    timeLeft = GAME_TIME;
    gameOver = false;
    player = { x: width/2 - PLAYER_SIZE/2, y: height-PLAYER_SIZE-10, speed: 5 };
    moras = [];
    for(let i=0; i<MORA_COUNT; i++) {
      moras.push({ x: Math.random()*(width-MORA_SIZE), y: Math.random()*(height/2), collected: false });
    }
    keys = {};
    if(timer) clearInterval(timer);
    timer = setInterval(()=>{
      if(!gameOver) {
        timeLeft--;
        if(timeLeft<=0) endGame();
      }
    }, 1000);
  }

  function draw() {
    ctx.clearRect(0,0,width,height);
    // Fondo
    ctx.fillStyle = '#b6e685';
    ctx.fillRect(0,0,width,height);
    // Jugador
    ctx.fillStyle = '#6b3e26';
    ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.fillText('Tú', player.x+6, player.y+22);
    // Moras
    for(let mora of moras) {
      if(!mora.collected) {
        ctx.beginPath();
        ctx.arc(mora.x+MORA_SIZE/2, mora.y+MORA_SIZE/2, MORA_SIZE/2, 0, 2*Math.PI);
        ctx.fillStyle = '#7b1fa2';
        ctx.fill();
        ctx.strokeStyle = '#4a148c';
        ctx.stroke();
      }
    }
    // Marcadores
    ctx.fillStyle = '#222';
    ctx.font = '18px Arial';
    ctx.fillText('Moras: '+score, 10, 24);
    ctx.fillText('Tiempo: '+timeLeft+'s', width-120, 24);
    if(gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, height/2-40, width, 80);
      ctx.fillStyle = '#fff';
      ctx.font = '32px Arial';
      ctx.fillText('¡Fin del juego!', width/2-110, height/2);
      ctx.font = '20px Arial';
      ctx.fillText('Puntuación: '+score, width/2-60, height/2+30);
      ctx.fillText('Pulsa ESPACIO para reiniciar', width/2-120, height/2+60);
    }
  }

  function update() {
    if(gameOver) return;
    // Movimiento jugador
    if(keys['ArrowLeft'] && player.x>0) player.x -= player.speed;
    if(keys['ArrowRight'] && player.x<width-PLAYER_SIZE) player.x += player.speed;
    if(keys['ArrowUp'] && player.y>0) player.y -= player.speed;
    if(keys['ArrowDown'] && player.y<height-PLAYER_SIZE) player.y += player.speed;
    // Colisión con moras
    for(let mora of moras) {
      if(!mora.collected && collide(player, PLAYER_SIZE, mora, MORA_SIZE)) {
        mora.collected = true;
        score++;
      }
    }
    // Si todas recogidas, reponer
    if(moras.every(m=>m.collected)) {
      for(let mora of moras) {
        mora.x = Math.random()*(width-MORA_SIZE);
        mora.y = Math.random()*(height/2);
        mora.collected = false;
      }
    }
  }

  function collide(a, as, b, bs) {
    return a.x < b.x+bs && a.x+as > b.x && a.y < b.y+bs && a.y+as > b.y;
  }

  function endGame() {
    gameOver = true;
    clearInterval(timer);
    // Guardar récord si es el mejor
    let best = parseInt(localStorage.getItem('recogeMorasRecord')||'0');
    if(score>best) localStorage.setItem('recogeMorasRecord', score);
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  function keydown(e) {
    keys[e.key] = true;
    if(gameOver && e.key===' ') {
      initGame();
    }
  }
  function keyup(e) {
    keys[e.key] = false;
  }

  function start(canvasElement) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
    width = canvas.width;
    height = canvas.height;
    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', keyup);
    initGame();
    loop();
  }

  window.registerGame && window.registerGame({
    name: 'Recoge Moras',
    start: start,
    description: 'Recoge el máximo de moras en 30 segundos. Usa las flechas para moverte.'
  });
})();
