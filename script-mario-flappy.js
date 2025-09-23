// script-mario-flappy.js
// Juego: Mario Bros Volador
// Autor: ChechuJA + GitHub Copilot

(function(){
  let canvas, ctx, width, height;
  let mario, pipes, score, gameOver, level, keys, gameSpeed;
  let animationFrame = 0;
  const MARIO_SIZE = 32;
  const PIPE_WIDTH = 60;
  const PIPE_GAP = 140;
  const PIPE_SPEED = 3;
  const GRAVITY = 0.6;
  const JUMP_FORCE = -10;
  const PIPE_MOVE_SPEED = 1.5; // Velocidad de movimiento vertical de las tuberías

  function initGame() {
    mario = { 
      x: 80, 
      y: height/2, 
      vy: 0,
      frame: 0 
    };
    pipes = [];
    score = 0;
    gameOver = false;
    level = 1;
    keys = {};
    gameSpeed = 1;
    animationFrame = 0;
    spawnPipes();
  }

  function spawnPipes() {
    pipes = [];
    for (let i = 0; i < 4; i++) {
      const gapY = Math.random() * (height - PIPE_GAP - 100) + 50;
      pipes.push({ 
        x: width + i * 250, 
        gapY: gapY,
        initialGapY: gapY,
        moveDirection: Math.random() > 0.5 ? 1 : -1,
        moving: level >= 2
      });
    }
  }

  function drawMario() {
    // Animación simple de Mario
    animationFrame++;
    
    // Cuerpo de Mario (rojo)
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(mario.x + 4, mario.y + 8, MARIO_SIZE - 8, MARIO_SIZE - 16);
    
    // Cabeza (color piel)
    ctx.fillStyle = '#FFDBAC';
    ctx.fillRect(mario.x + 6, mario.y + 2, MARIO_SIZE - 12, 12);
    
    // Gorra (roja)
    ctx.fillStyle = '#CC0000';
    ctx.fillRect(mario.x + 2, mario.y, MARIO_SIZE - 4, 8);
    
    // Bigote
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(mario.x + 8, mario.y + 10, 8, 2);
    
    // Overol (azul)
    ctx.fillStyle = '#0066CC';
    ctx.fillRect(mario.x + 6, mario.y + 16, MARIO_SIZE - 12, 8);
    
    // Brazos (animación simple)
    ctx.fillStyle = '#FFDBAC';
    if (Math.floor(animationFrame / 10) % 2) {
      ctx.fillRect(mario.x, mario.y + 12, 4, 8);
      ctx.fillRect(mario.x + MARIO_SIZE - 4, mario.y + 10, 4, 8);
    } else {
      ctx.fillRect(mario.x, mario.y + 10, 4, 8);
      ctx.fillRect(mario.x + MARIO_SIZE - 4, mario.y + 12, 4, 8);
    }
    
    // Piernas
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(mario.x + 8, mario.y + 24, 6, 8);
    ctx.fillRect(mario.x + 18, mario.y + 24, 6, 8);
  }

  function drawPipe(x, topHeight, bottomY, bottomHeight) {
    // Tuberías verdes estilo Mario
    ctx.fillStyle = '#00AA00';
    
    // Tubería superior
    ctx.fillRect(x, 0, PIPE_WIDTH, topHeight - 20);
    ctx.fillRect(x - 4, topHeight - 24, PIPE_WIDTH + 8, 24);
    
    // Tubería inferior
    ctx.fillRect(x - 4, bottomY, PIPE_WIDTH + 8, 24);
    ctx.fillRect(x, bottomY + 24, PIPE_WIDTH, bottomHeight - 24);
    
    // Detalles de las tuberías
    ctx.fillStyle = '#008800';
    ctx.fillRect(x + 8, 0, 8, topHeight - 20);
    ctx.fillRect(x + 8, bottomY + 24, 8, bottomHeight - 24);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    
    // Fondo estilo Super Mario (cielo azul con nubes)
    ctx.fillStyle = '#5C94FC';
    ctx.fillRect(0, 0, width, height);
    
    // Nubes decorativas
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 3; i++) {
      const cloudX = (animationFrame + i * 200) % (width + 100) - 50;
      const cloudY = 50 + i * 40;
      ctx.beginPath();
      ctx.arc(cloudX, cloudY, 20, 0, Math.PI * 2);
      ctx.arc(cloudX + 20, cloudY, 25, 0, Math.PI * 2);
      ctx.arc(cloudX + 40, cloudY, 20, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Tuberías
    for (const pipe of pipes) {
      drawPipe(pipe.x, pipe.gapY, pipe.gapY + PIPE_GAP, height - pipe.gapY - PIPE_GAP);
    }
    
    // Mario
    drawMario();
    
    // Marcador estilo Mario
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.font = 'bold 24px Arial';
    ctx.strokeText(`MARIO`, 10, 30);
    ctx.fillText(`MARIO`, 10, 30);
    ctx.strokeText(`${score.toString().padStart(6, '0')}`, 10, 55);
    ctx.fillText(`${score.toString().padStart(6, '0')}`, 10, 55);
    
    ctx.font = 'bold 20px Arial';
    ctx.strokeText(`WORLD ${level}-1`, width - 120, 30);
    ctx.fillText(`WORLD ${level}-1`, width - 120, 30);
    
    // Controles
    ctx.fillStyle = '#FFFF00';
    ctx.font = '16px Arial';
    ctx.fillText('ESPACIO: Saltar | +/-: Velocidad', 10, height - 20);
    
    if (gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, height / 2 - 60, width, 120);
      ctx.fillStyle = '#FF0000';
      ctx.font = 'bold 36px Arial';
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.strokeText('GAME OVER', width / 2 - 100, height / 2 - 10);
      ctx.fillText('GAME OVER', width / 2 - 100, height / 2 - 10);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '20px Arial';
      ctx.fillText(`Puntuación Final: ${score}`, width / 2 - 80, height / 2 + 20);
      ctx.fillText('Presiona ESPACIO para continuar', width / 2 - 120, height / 2 + 50);
    }
  }

  function update() {
    if (gameOver) return;
    
    // Física de Mario
    mario.vy += GRAVITY;
    mario.y += mario.vy;
    
    // Movimiento de tuberías
    for (let i = 0; i < pipes.length; i++) {
      const pipe = pipes[i];
      pipe.x -= PIPE_SPEED * gameSpeed;
      
      // Movimiento vertical de tuberías en nivel 2
      if (pipe.moving && level >= 2) {
        pipe.gapY += pipe.moveDirection * PIPE_MOVE_SPEED;
        
        // Cambiar dirección si llega a los límites
        if (pipe.gapY <= 50 || pipe.gapY >= height - PIPE_GAP - 50) {
          pipe.moveDirection *= -1;
        }
      }
      
      // Reaparición de tuberías
      if (pipe.x + PIPE_WIDTH < 0) {
        pipe.x = width + 50;
        pipe.gapY = Math.random() * (height - PIPE_GAP - 100) + 50;
        pipe.initialGapY = pipe.gapY;
        pipe.moveDirection = Math.random() > 0.5 ? 1 : -1;
        score += 100;
        
        // Cambio de nivel
        if (score >= 1000 && level === 1) {
          level = 2;
          // Activar movimiento en todas las tuberías
          pipes.forEach(p => p.moving = true);
        }
      }
      
      // Colisiones
      if (mario.x < pipe.x + PIPE_WIDTH &&
          mario.x + MARIO_SIZE > pipe.x &&
          (mario.y < pipe.gapY || mario.y + MARIO_SIZE > pipe.gapY + PIPE_GAP)) {
        gameOver = true;
      }
    }
    
    // Límites de pantalla
    if (mario.y < 0 || mario.y + MARIO_SIZE > height) {
      gameOver = true;
    }
  }

  function keydown(e) {
    keys[e.key] = true;
    
    if (e.key === ' ') {
      if (!gameOver) {
        mario.vy = JUMP_FORCE;
      } else {
        initGame();
      }
    }
    
    // Control de velocidad
    if (e.key === '+') {
      gameSpeed = Math.min(gameSpeed + 0.1, 3);
    } else if (e.key === '-') {
      gameSpeed = Math.max(gameSpeed - 0.1, 0.5);
    }
  }

  function keyup(e) {
    keys[e.key] = false;
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  function start(canvasElement) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
    width = canvas.width;
    height = canvas.height;
    canvas.style.zIndex = '10';
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