// script-alcala-canas-tapas.js
// Juego: Alcalá: Cañas y Tapas
// Autor: ChechuJA + GitHub Copilot

(function(){
  let canvas, ctx, width, height;
  let player, cañas, tapas, score, gameOver, keys, timer, timeLeft;
  const PLAYER_SIZE = 34;
  const CAÑA_SIZE = 22;
  const TAPA_SIZE = 26;
  const GAME_TIME = 45; // segundos
  const CAÑA_COUNT = 3;
  const TAPA_COUNT = 3;

  function initGame() {
    score = 0;
    timeLeft = GAME_TIME;
    gameOver = false;
    player = { x: width/2-PLAYER_SIZE/2, y: height-PLAYER_SIZE-10, speed: 5 };
    cañas = [];
    tapas = [];
    for(let i=0; i<CAÑA_COUNT; i++) {
      cañas.push({ x: Math.random()*(width-CAÑA_SIZE), y: -Math.random()*height, speed: 2+Math.random()*2, caught: false });
    }
    for(let i=0; i<TAPA_COUNT; i++) {
      tapas.push({ x: Math.random()*(width-TAPA_SIZE), y: -Math.random()*height, speed: 2+Math.random()*2, caught: false });
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
    ctx.fillStyle = '#ffe082';
    ctx.fillRect(0,0,width,height);
    // Jugador
    ctx.fillStyle = '#1976d2';
    ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
    ctx.fillStyle = '#fff';
    ctx.font = '15px Arial';
    ctx.fillText('Tú', player.x+7, player.y+24);
    // Cañas
    for(let c of cañas) {
      if(!c.caught) {
        ctx.fillStyle = '#fffde7';
        ctx.fillRect(c.x, c.y, CAÑA_SIZE, CAÑA_SIZE);
        ctx.fillStyle = '#fbc02d';
        ctx.fillRect(c.x+4, c.y+CAÑA_SIZE-8, CAÑA_SIZE-8, 8);
        ctx.strokeStyle = '#bdbdbd';
        ctx.strokeRect(c.x, c.y, CAÑA_SIZE, CAÑA_SIZE);
      }
    }
    // Tapas
    for(let t of tapas) {
      if(!t.caught) {
        ctx.beginPath();
        ctx.arc(t.x+TAPA_SIZE/2, t.y+TAPA_SIZE/2, TAPA_SIZE/2, 0, 2*Math.PI);
        ctx.fillStyle = '#d84315';
        ctx.fill();
        ctx.strokeStyle = '#6d4c41';
        ctx.stroke();
      }
    }
    // Marcadores
    ctx.fillStyle = '#222';
    ctx.font = '18px Arial';
    ctx.fillText('Cañas: '+cañas.filter(c=>c.caught).length, 10, 24);
    ctx.fillText('Tapas: '+tapas.filter(t=>t.caught).length, 120, 24);
    ctx.fillText('Tiempo: '+timeLeft+'s', width-120, 24);
    ctx.fillText('Puntos: '+score, width/2-40, 24);
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
    // Caída de cañas
    for(let c of cañas) {
      if(!c.caught) {
        c.y += c.speed;
        if(c.y > height) {
          c.x = Math.random()*(width-CAÑA_SIZE);
          c.y = -CAÑA_SIZE;
          c.speed = 2+Math.random()*2;
        }
        if(collide(player, PLAYER_SIZE, c, CAÑA_SIZE)) {
          c.caught = true;
          score++;
        }
      }
    }
    // Caída de tapas
    for(let t of tapas) {
      if(!t.caught) {
        t.y += t.speed;
        if(t.y > height) {
          t.x = Math.random()*(width-TAPA_SIZE);
          t.y = -TAPA_SIZE;
          t.speed = 2+Math.random()*2;
        }
        if(collide(player, PLAYER_SIZE, t, TAPA_SIZE)) {
          t.caught = true;
          score++;
        }
      }
    }
    // Si todas atrapadas, reponer
    if(cañas.every(c=>c.caught) && tapas.every(t=>t.caught)) {
      for(let c of cañas) {
        c.x = Math.random()*(width-CAÑA_SIZE);
        c.y = -Math.random()*height;
        c.speed = 2+Math.random()*2;
        c.caught = false;
      }
      for(let t of tapas) {
        t.x = Math.random()*(width-TAPA_SIZE);
        t.y = -Math.random()*height;
        t.speed = 2+Math.random()*2;
        t.caught = false;
      }
    }
  }

  function collide(a, asize, b, bsize) {
    return a.x < b.x+bsize && a.x+asize > b.x && a.y < b.y+bsize && a.y+asize > b.y;
  }

  function endGame() {
    gameOver = true;
    clearInterval(timer);
    // Guardar récord si es el mejor
    let best = parseInt(localStorage.getItem('alcalaCañasTapasRecord')||'0');
    if(score>best) localStorage.setItem('alcalaCañasTapasRecord', score);
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

  window.registerGame = function(canvas) {
    const cleanup = (function(){
      document.addEventListener('keydown', keydown);
      document.addEventListener('keyup', keyup);
      initGame();
      loop();
      return function cleanup() {
        document.removeEventListener('keydown', keydown);
        document.removeEventListener('keyup', keyup);
        if(timer) clearInterval(timer);
      };
    })();
    start(canvas);
    return cleanup;
  };
})();
