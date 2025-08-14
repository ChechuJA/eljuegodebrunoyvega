// script-moto-desierto.js
// Juego: Moto en el Desierto
// Autor: ChechuJA + GitHub Copilot

(function(){
  let canvas, ctx, width, height;
  let player, obstacles, score, gameOver, keys, timer;
  const PLAYER_WIDTH = 40, PLAYER_HEIGHT = 80;
  const OBSTACLE_WIDTH = 40, OBSTACLE_HEIGHT = 40;
  const OBSTACLE_COUNT = 5;
  const GAME_SPEED = 5;

  function initGame() {
    score = 0;
    gameOver = false;
    player = { x: width/2 - PLAYER_WIDTH/2, y: height - PLAYER_HEIGHT - 20, speed: 6 };
    obstacles = [];
    for(let i=0; i<OBSTACLE_COUNT; i++) {
      obstacles.push({ x: Math.random() * (width - OBSTACLE_WIDTH), y: -Math.random() * height, speed: GAME_SPEED + Math.random() * 2 });
    }
    keys = {};
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    // Fondo del desierto
    ctx.fillStyle = '#f4a261';
    ctx.fillRect(0, 0, width, height);
    // Carretera
    ctx.fillStyle = '#6d6875';
    ctx.fillRect(width/4, 0, width/2, height);
    // Líneas de la carretera
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    for (let i = 0; i < height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(width/2 - 2, i);
      ctx.lineTo(width/2 - 2, i + 20);
      ctx.stroke();
    }
    // Jugador (moto)
    ctx.fillStyle = '#e63946';
    ctx.fillRect(player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('Moto', player.x + 10, player.y + 50);
    // Obstáculos (rocas)
    for(let obstacle of obstacles) {
      ctx.fillStyle = '#2a9d8f';
      ctx.fillRect(obstacle.x, obstacle.y, OBSTACLE_WIDTH, OBSTACLE_HEIGHT);
    }
    // Marcadores
    ctx.fillStyle = '#222';
    ctx.font = '18px Arial';
    ctx.fillText('Puntos: ' + score, 10, 24);
    if(gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, height/2 - 40, width, 80);
      ctx.fillStyle = '#fff';
      ctx.font = '32px Arial';
      ctx.fillText('¡Fin del juego!', width/2 - 110, height/2);
      ctx.font = '20px Arial';
      ctx.fillText('Puntuación: ' + score, width/2 - 60, height/2 + 30);
      ctx.fillText('Pulsa ESPACIO para reiniciar', width/2 - 120, height/2 + 60);
    }
  }

  function update() {
    if(gameOver) return;
    // Movimiento jugador
    if(keys['ArrowLeft'] && player.x > width/4) player.x -= player.speed;
    if(keys['ArrowRight'] && player.x < width/4 + width/2 - PLAYER_WIDTH) player.x += player.speed;
    // Movimiento obstáculos
    for(let obstacle of obstacles) {
      obstacle.y += obstacle.speed;
      if(obstacle.y > height) {
        obstacle.y = -OBSTACLE_HEIGHT;
        obstacle.x = Math.random() * (width - OBSTACLE_WIDTH);
        score++;
      }
      // Colisión
      if(collide(player, PLAYER_WIDTH, PLAYER_HEIGHT, obstacle, OBSTACLE_WIDTH, OBSTACLE_HEIGHT)) {
        endGame();
      }
    }
  }

  function collide(a, aw, ah, b, bw, bh) {
    return a.x < b.x + bw && a.x + aw > b.x && a.y < b.y + bh && a.y + ah > b.y;
  }

  function endGame() {
    gameOver = true;
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  function keydown(e) {
    keys[e.key] = true;
    if(gameOver && e.key === ' ') {
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
      window.registerGame({
        name: 'Moto en el Desierto',
        start: start,
        description: 'Conduce tu moto por el desierto, esquiva obstáculos y consigue la mayor puntuación.'
      });
      return function cleanup() {
        document.removeEventListener('keydown', keydown);
        document.removeEventListener('keyup', keyup);
      };
    })();
    start(canvas);
    return cleanup;
  };
})();
