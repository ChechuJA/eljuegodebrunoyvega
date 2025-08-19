// script-juego-habilidad.js
// Juego: Esquiva Obstáculos
// Autor: ChechuJA + GitHub Copilot

(function(){
  let canvas, ctx, width, height;
  let player, obstacles, score, gameOver, keys;
  let backgroundImage, characterImage;
  const PLAYER_SIZE = 30;
  const OBSTACLE_SIZE = 20;
  const OBSTACLE_COUNT = 5;
  const GAME_SPEED = 3;
  function bgReady(){ return backgroundImage && backgroundImage.complete && backgroundImage.naturalWidth>0; }
  function charReady(){ return characterImage && characterImage.complete && characterImage.naturalWidth>0; }

  function initGame() {
    score = 0;
    gameOver = false;
    player = { x: width/2 - PLAYER_SIZE/2, y: height - PLAYER_SIZE - 10, speed: 5 };
    obstacles = [];
    for(let i=0; i<OBSTACLE_COUNT; i++) {
      obstacles.push({ x: Math.random() * (width - OBSTACLE_SIZE), y: -Math.random() * height, speed: GAME_SPEED + Math.random() * 2 });
    }
    keys = {};
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    // Fondo
    if (bgReady()) {
      ctx.drawImage(backgroundImage, 0, 0, width, height);
    } else {
      ctx.fillStyle = '#b3e5fc';
      ctx.fillRect(0, 0, width, height);
    }
    // Jugador
    if (charReady()) {
      ctx.drawImage(characterImage, player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
    } else {
      ctx.fillStyle = '#ff5722';
      ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
    }
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('Tú', player.x + 8, player.y + 20);
    // Obstáculos
    for(let obstacle of obstacles) {
      ctx.fillStyle = '#4caf50';
      ctx.fillRect(obstacle.x, obstacle.y, OBSTACLE_SIZE, OBSTACLE_SIZE);
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
    if(keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if(keys['ArrowRight'] && player.x < width - PLAYER_SIZE) player.x += player.speed;
    if(keys['ArrowUp'] && player.y > 0) player.y -= player.speed;
    if(keys['ArrowDown'] && player.y < height - PLAYER_SIZE) player.y += player.speed;
    // Movimiento obstáculos
    for(let obstacle of obstacles) {
      obstacle.y += obstacle.speed;
      if(obstacle.y > height) {
        obstacle.y = -OBSTACLE_SIZE;
        obstacle.x = Math.random() * (width - OBSTACLE_SIZE);
        score++;
      }
      // Colisión
      if(collide(player, PLAYER_SIZE, OBSTACLE_SIZE, obstacle, OBSTACLE_SIZE, OBSTACLE_SIZE)) {
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
  // Carga de imágenes
  backgroundImage = new Image();
  backgroundImage.src = 'assets/juego-habilidad-background.png';
  backgroundImage.onerror = () => { backgroundImage.src = 'assets/juego-habilidad-background.svg'; };
  characterImage = new Image();
  characterImage.src = 'assets/juego-habilidad-character.png';
  characterImage.onerror = () => { characterImage.src = 'assets/juego-habilidad-character.svg'; };
    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', keyup);
    initGame();
    loop();
  }

  window.registerGame = function registerGame() {
    const canvasEl = document.getElementById('gameCanvas');
    start(canvasEl);
    return function cleanup() {
      document.removeEventListener('keydown', keydown);
      document.removeEventListener('keyup', keyup);
    };
  };
})();
