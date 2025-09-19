function registerGame(){
  const canvas = document.getElementById('gameCanvas');
  return initAtrapa(canvas);
}

function initAtrapa(canvas) {
  const ctx = canvas.getContext('2d');
  let animationFrame = null;
  canvas.width = 800;
  canvas.height = 500;
  
  // Configuración del juego
  const ui = window.GameUI;
  const bucketHeight = 50;
  const bucketWidth = 80;
  let bucketX = (canvas.width - bucketWidth) / 2;
  
  const dropRadius = 10;
  let drops = []; // Array para múltiples gotas
  let dropSpeed = 3; // Velocidad inicial de las gotas
  
  // Niveles
  let level = 1;
  let dropCount = 0; // Contador de gotas atrapadas
  let dropsToNextLevel = 15; // Gotas necesarias para pasar de nivel
  
  let score = 0;
  let lives = 3;
  let highScore = +(localStorage.getItem('atrapaBallHigh') || 0);
  let highScoreName = localStorage.getItem('atrapaBallHighName') || '';
  let playerName = localStorage.getItem('playerName') || 'Jugador';
  
  // Estado del juego
  let showIntro = true;
  let gameOver = false;
  let particles = [];
  let bucketFill = 0; // 0-100%, cuánto se ha llenado el cubo
  
  
  // Variables para el movimiento del cubo
  let rightPressed = false;
  let leftPressed = false;
  let upPressed = false;
  let downPressed = false;
  
  // Crear un arreglo de colores para los elementos del juego
  const COLORS = {
    drop: ['#4db6ac', '#26a69a', '#0288d1'], // Azules para gotas de agua
    bucket: ['#8d6e63', '#795548', '#5d4037'], // Marrones para el cubo
    water: ['#29b6f6', '#03a9f4', '#0288d1'], // Azules para el agua dentro del cubo
    background: ['#e0f7fa', '#b2ebf2'], // Fondo celeste claro
    particleColors: ['#81d4fa', '#4fc3f7', '#29b6f6', '#03a9f4', '#0288d1'] // Partículas azules
  };
  
  // Función para crear una nueva gota
  function createDrop() {
    drops.push({
      x: Math.random() * (canvas.width - 2 * dropRadius) + dropRadius,
      y: -dropRadius,
      speed: dropSpeed * (0.8 + Math.random() * 0.4) // Variación en la velocidad
    });
  }
  
  // Función para crear partículas
  function createParticles(x, y, count, colors) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x: x,
        y: y,
        size: Math.random() * 4 + 2,
        speedX: (Math.random() - 0.5) * 6,
        speedY: (Math.random() - 0.5) * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 40 + Math.random() * 20
      });
    }
  }
  
  // Función para actualizar partículas
  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].x += particles[i].speedX;
      particles[i].y += particles[i].speedY;
      particles[i].life--;
      particles[i].size *= 0.96;
      
      if (particles[i].life <= 0 || particles[i].size <= 0.5) {
        particles.splice(i, 1);
      }
    }
  }
  
  // Función para dibujar partículas
  function drawParticles() {
    particles.forEach(p => {
      ctx.globalAlpha = p.life / 60;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
  
  // Función para dibujar una gota de agua
  function drawDrop(x, y) {
    // Sombra
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 2;
    
    // Gota con gradiente
    const gradient = ctx.createRadialGradient(
      x, y, 0,
      x, y, dropRadius
    );
    gradient.addColorStop(0, COLORS.drop[0]);
    gradient.addColorStop(0.6, COLORS.drop[1]);
    gradient.addColorStop(1, COLORS.drop[2]);
    
    // Forma de gota (combinación de círculo y triángulo)
    ctx.beginPath();
    ctx.arc(x, y, dropRadius, 0, Math.PI);
    ctx.lineTo(x, y - dropRadius * 1.5);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Brillo
    ctx.beginPath();
    ctx.arc(x - dropRadius * 0.3, y - dropRadius * 0.3, dropRadius * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fill();
    
    // Restaurar sombra
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }
  
  // Función para dibujar el cubo
  function drawBucket() {
    // Sombra
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 5;
    
    // Cubo
    ctx.beginPath();
    // Base del cubo
    ctx.moveTo(bucketX, canvas.height - bucketHeight);
    ctx.lineTo(bucketX + bucketWidth, canvas.height - bucketHeight);
    ctx.lineTo(bucketX + bucketWidth - 5, canvas.height);
    ctx.lineTo(bucketX + 5, canvas.height);
    ctx.closePath();
    
    // Gradiente del cubo
    const bucketGradient = ctx.createLinearGradient(
      bucketX, canvas.height - bucketHeight,
      bucketX, canvas.height
    );
    bucketGradient.addColorStop(0, COLORS.bucket[0]);
    bucketGradient.addColorStop(0.5, COLORS.bucket[1]);
    bucketGradient.addColorStop(1, COLORS.bucket[2]);
    
    ctx.fillStyle = bucketGradient;
    ctx.fill();
    
    // Contorno del cubo
    ctx.strokeStyle = '#4e342e';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Agua dentro del cubo (si hay)
    if (bucketFill > 0) {
      const waterHeight = (bucketHeight - 5) * (bucketFill / 100);
      
      ctx.beginPath();
      ctx.moveTo(bucketX + 5, canvas.height - waterHeight);
      ctx.lineTo(bucketX + bucketWidth - 5, canvas.height - waterHeight);
      ctx.lineTo(bucketX + bucketWidth - 9, canvas.height - 5);
      ctx.lineTo(bucketX + 9, canvas.height - 5);
      ctx.closePath();
      
      // Gradiente del agua
      const waterGradient = ctx.createLinearGradient(
        bucketX, canvas.height - waterHeight,
        bucketX, canvas.height
      );
      waterGradient.addColorStop(0, COLORS.water[0]);
      waterGradient.addColorStop(0.7, COLORS.water[1]);
      waterGradient.addColorStop(1, COLORS.water[2]);
      
      ctx.fillStyle = waterGradient;
      ctx.fill();
      
      // Brillo en el agua
      ctx.beginPath();
      ctx.moveTo(bucketX + 10, canvas.height - waterHeight + 3);
      ctx.lineTo(bucketX + bucketWidth - 20, canvas.height - waterHeight + 3);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Restaurar sombra
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }
  
  // Eventos del teclado
  function keyDownHandler(e) {
    if (showIntro) {
      showIntro = false;
      return;
    }
    
    if (gameOver && (e.key === ' ' || e.code === 'Space')) {
      resetGame();
      return;
    }
    
    if (e.key === 'Right' || e.key === 'ArrowRight') {
      rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
      leftPressed = true;
    } else if (e.key === 'Up' || e.key === 'ArrowUp') {
      upPressed = true;
    } else if (e.key === 'Down' || e.key === 'ArrowDown') {
      downPressed = true;
    }
  }
  
  function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
      rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
      leftPressed = false;
    } else if (e.key === 'Up' || e.key === 'ArrowUp') {
      upPressed = false;
    } else if (e.key === 'Down' || e.key === 'ArrowDown') {
      downPressed = false;
    }
  }
  
  function mouseMoveHandler(e) {
    if (showIntro || gameOver) return;
    
    const rect = canvas.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    if (relativeX > 0 && relativeX < canvas.width) {
      bucketX = relativeX - bucketWidth / 2;
      
      // Evitar que el cubo salga del canvas
      if (bucketX < 0) {
        bucketX = 0;
      } else if (bucketX + bucketWidth > canvas.width) {
        bucketX = canvas.width - bucketWidth;
      }
    }
  }
  
  // Función para dibujar información del juego
  function drawInfo() {
    // Barra superior
    if (ui) {
      ui.gradientBar(ctx, canvas, {from: '#0288d1', to: '#01579b'});
      ui.shadowText(ctx, 'Gotas de Agua', 20, 25, {size: 20});
    } else {
      const headerGrad = ctx.createLinearGradient(0, 0, 0, 50);
      headerGrad.addColorStop(0, '#0288d1');
      headerGrad.addColorStop(1, '#01579b');
      ctx.fillStyle = headerGrad;
      ctx.fillRect(0, 0, canvas.width, 50);
      
      ctx.font = 'bold 20px Arial';
      ctx.fillStyle = '#fff';
      ctx.fillText('Gotas de Agua', 20, 25);
    }
    
    // Información del juego
    ctx.font = '16px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('Nivel: ' + level, 220, 25);
    ctx.fillText('Gotas: ' + dropCount + '/' + dropsToNextLevel, 300, 25);
    ctx.fillText('Vidas: ' + lives, 420, 25);
    ctx.textAlign = 'right';
    ctx.fillText('Récord: ' + highScore + (highScoreName ? ' (' + highScoreName + ')' : ''), canvas.width - 20, 25);
    ctx.textAlign = 'left';
  }
  
  // Función para dibujar la pantalla de introducción
  function drawIntro() {
    if (ui) {
      const lines = [
        "Usa cualquier FLECHA o el ratón para mover el cubo.",
        "Atrapa las gotas de agua que caen del cielo.",
        "Llena el cubo con 15 gotas para subir de nivel.",
        "Cada nivel las gotas caen más rápido.",
        "Tienes 3 vidas para conseguir la mejor puntuación.",
        "Pulsa cualquier tecla para empezar."
      ];
      
      ui.drawInstructionPanel(ctx, "Gotas de Agua", lines, {
        bgColor: 'rgba(15, 25, 40, 0.95)',
        titleColor: '#29b6f6'
      });
      
      // Dibujar ejemplo de gota y cubo
      drawDrop(canvas.width/2, canvas.height/2 - 50);
      bucketX = canvas.width/2 - bucketWidth/2;
      drawBucket();
      
    } else {
      // Versión manual del panel si GameUI no está disponible
      const w = canvas.width - 140;
      const h = 270;
      const x = 70;
      const y = 120;
      
      // Panel semi-transparente
      ctx.fillStyle = 'rgba(15, 25, 40, 0.95)';
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 16);
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Título
      ctx.fillStyle = '#29b6f6';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 8;
      ctx.fillText('Gotas de Agua', canvas.width/2, y + 40);
      
      // Texto de instrucciones
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = '15px Arial';
      ctx.fillText('Usa cualquier FLECHA o el ratón para mover el cubo.', canvas.width/2, y + 80);
      ctx.fillText('Atrapa las gotas de agua que caen del cielo.', canvas.width/2, y + 110);
      ctx.fillText('Llena el cubo con 15 gotas para subir de nivel.', canvas.width/2, y + 140);
      ctx.fillText('Cada nivel las gotas caen más rápido.', canvas.width/2, y + 170);
      ctx.fillText('Tienes 3 vidas para conseguir la mejor puntuación.', canvas.width/2, y + 200);
      ctx.fillText('Pulsa cualquier tecla para empezar.', canvas.width/2, y + 230);
      
      // Dibujar ejemplo de gota y cubo
      drawDrop(canvas.width/2, canvas.height/2 + 50);
      bucketX = canvas.width/2 - bucketWidth/2;
      drawBucket();
    }
  }
  
  // Función para dibujar la pantalla de Game Over
  function drawGameOver() {
    // Fondo oscuro semitransparente
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 50, canvas.width, canvas.height - 50);
    
    // Panel de Game Over
    const w = canvas.width - 200;
    const h = 220;
    const x = 100;
    const y = 140;
    
    ctx.fillStyle = 'rgba(40, 80, 120, 0.9)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 16);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Texto de Game Over
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 8;
    ctx.fillText('¡GAME OVER!', canvas.width/2, y + 50);
    
    // Puntuación final
    ctx.font = '22px Arial';
    ctx.fillText('Nivel alcanzado: ' + level, canvas.width/2, y + 90);
    ctx.fillText('Gotas atrapadas: ' + score, canvas.width/2, y + 120);
    
    // Récord
    if (score > highScore) {
      ctx.fillStyle = '#ffeb3b';
      ctx.fillText('¡NUEVO RÉCORD!', canvas.width/2, y + 160);
    }
    
    // Indicación para reiniciar
    ctx.font = '16px Arial';
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    
    // Efecto pulsante
    const pulse = Math.sin(Date.now() / 300) * 0.1 + 0.9;
    ctx.globalAlpha = pulse;
    ctx.fillText('Pulsa ESPACIO para jugar de nuevo', canvas.width/2, y + 190);
    ctx.globalAlpha = 1;
  }
  
  // Función principal de dibujo
  function draw() {
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar fondo con gradiente
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, COLORS.background[0]);
    bgGradient.addColorStop(1, COLORS.background[1]);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar nubes en el fondo
    drawClouds();
    
    // Dibujar información
    drawInfo();
    
    // Si estamos en la pantalla de intro
    if (showIntro) {
      drawIntro();
      return;
    }
    
    // Si el juego ha terminado
    if (gameOver) {
      drawGameOver();
      drawParticles();
      return;
    }
    
    // Dibujar elementos del juego
    drops.forEach(drop => {
      drawDrop(drop.x, drop.y);
    });
    drawBucket();
    drawParticles();
    
    // Actualizar posición de las gotas
    updateDrops();
    
    // Mover el cubo
    if (rightPressed && bucketX < canvas.width - bucketWidth) {
      bucketX += 8;
    } else if (leftPressed && bucketX > 0) {
      bucketX -= 8;
    } else if (upPressed && bucketX < canvas.width - bucketWidth) {
      bucketX += 8;
    } else if (downPressed && bucketX > 0) {
      bucketX -= 8;
    }
    
    // Actualizar partículas
    updateParticles();
  }
  
  // Función para dibujar nubes
  function drawClouds() {
    const cloudPositions = [
      {x: canvas.width * 0.1, y: canvas.height * 0.15, size: 40},
      {x: canvas.width * 0.4, y: canvas.height * 0.1, size: 50},
      {x: canvas.width * 0.7, y: canvas.height * 0.2, size: 35},
      {x: canvas.width * 0.9, y: canvas.height * 0.12, size: 45}
    ];
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    
    cloudPositions.forEach(cloud => {
      // Nubes suaves con varias formas circulares
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
      ctx.arc(cloud.x + cloud.size * 0.8, cloud.y, cloud.size * 0.7, 0, Math.PI * 2);
      ctx.arc(cloud.x + cloud.size * 1.5, cloud.y, cloud.size * 0.9, 0, Math.PI * 2);
      ctx.arc(cloud.x + cloud.size * 0.6, cloud.y - cloud.size * 0.4, cloud.size * 0.8, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  
  // Función para actualizar las gotas
  let dropSpawnTimer = 0;
  function updateDrops() {
    // Generar nuevas gotas
    dropSpawnTimer++;
    if (dropSpawnTimer >= 60 - level * 5) { // Más frecuente en niveles más altos
      dropSpawnTimer = 0;
      createDrop();
    }
    
    // Mover y verificar colisiones
    for (let i = drops.length - 1; i >= 0; i--) {
      const drop = drops[i];
      drop.y += drop.speed;
      
      // Verificar colisión con el cubo
      if (drop.y + dropRadius > canvas.height - bucketHeight && 
          drop.y - dropRadius < canvas.height &&
          drop.x > bucketX && drop.x < bucketX + bucketWidth) {
        
        // La gota cayó en el cubo
        drops.splice(i, 1);
        score++;
        dropCount++;
        
        // Efectos visuales
        createParticles(drop.x, drop.y, 15, COLORS.particleColors);
        
        // Aumentar el nivel de agua en el cubo
        bucketFill += 100 / dropsToNextLevel;
        
        // Verificar si se ha llenado el cubo
        if (dropCount >= dropsToNextLevel) {
          // Subir de nivel
          level++;
          dropCount = 0;
          bucketFill = 0;
          dropSpeed += 0.5; // Aumentar velocidad
          
          // Efectos visuales para el cambio de nivel
          createParticles(bucketX + bucketWidth/2, canvas.height - bucketHeight/2, 40, ['#ffeb3b', '#ffc107', '#ff9800']);
        }
        
      } 
      // Verificar si la gota tocó el suelo
      else if (drop.y - dropRadius > canvas.height) {
        drops.splice(i, 1);
        lives--;
        
        // Efectos visuales
        createParticles(drop.x, canvas.height, 15, ['#f44336', '#e53935', '#c62828']);
        
        if (lives <= 0) {
          gameOver = true;
          
          // Actualizar récord si es necesario
          if (score > highScore) {
            highScore = score;
            highScoreName = playerName;
            localStorage.setItem('atrapaBallHigh', highScore);
            localStorage.setItem('atrapaBallHighName', highScoreName);
            
            // Efectos visuales para récord
            createParticles(canvas.width/2, canvas.height/2, 100, ['#ffd700', '#ffeb3b', '#ffc107']);
          }
        }
      }
    }
  }
  
  // Función para reiniciar el juego
  function resetGame() {
    score = 0;
    level = 1;
    dropCount = 0;
    bucketFill = 0;
    lives = 3;
    dropSpeed = 3;
    drops = [];
    bucketX = (canvas.width - bucketWidth) / 2;
    gameOver = false;
    particles = [];
    dropSpawnTimer = 0;
  }
  
  // Registrar eventos
  const keyDownListener = e => keyDownHandler(e);
  const keyUpListener = e => keyUpHandler(e);
  const mouseMoveListener = e => mouseMoveHandler(e);
  
  document.addEventListener('keydown', keyDownListener);
  document.addEventListener('keyup', keyUpListener);
  canvas.addEventListener('mousemove', mouseMoveListener);
  
  // Función de loop principal
  function gameLoop() {
    draw();
    animationFrame = requestAnimationFrame(gameLoop);
  }
  
  // Iniciar el juego
  gameLoop();
  
  // Función de limpieza
  return function cleanup() {
    document.removeEventListener('keydown', keyDownListener);
    document.removeEventListener('keyup', keyUpListener);
    canvas.removeEventListener('mousemove', mouseMoveListener);
    if (animationFrame) cancelAnimationFrame(animationFrame);
  };
}

window.registerGame = registerGame;