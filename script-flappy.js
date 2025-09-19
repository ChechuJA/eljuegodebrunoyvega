function registerGame(){
  const canvas = document.getElementById('gameCanvas');
  return initFlappy(canvas);
}

function initFlappy(canvas) {
  const ctx = canvas.getContext('2d');
  let animationFrame = null;
  canvas.width = 800;
  canvas.height = 500;
  
  // Configuración del juego
  const ui = window.GameUI;
  const playerName = localStorage.getItem('playerName') || 'Jugador';
  
  // Variables del juego
  let score = 0;
  let highScore = +(localStorage.getItem('flappyHighScore') || 0);
  let highScoreName = localStorage.getItem('flappyHighScoreName') || '';
  let gameOver = false;
  let showIntro = true;
  let particles = [];
  
  // Constantes
  const gravity = 0.4;
  const flapPower = 7;
  const buildingWidth = 80;
  const windowGapHeight = 130; // Altura del hueco para pasar
  const buildingSpacing = 220; // Espaciado entre edificios
  const groundHeight = 80;
  
  // Colores
  const COLORS = {
    sky: ['#81d4fa', '#4fc3f7'], // Azul claro para el cielo diurno
    bird: ['#f4ce4a', '#f4b400'], // Amarillo para el pájaro
    buildings: ['#455a64', '#37474f', '#263238'], // Grises para edificios
    windows: ['#ffeb3b', '#fdd835'], // Amarillo claro para ventanas iluminadas
    ground: ['#8d6e63', '#795548'], // Marrón para el suelo
    clouds: 'rgba(255, 255, 255, 0.8)', // Blanco para nubes
    text: '#ffffff', // Blanco para texto
    particles: ['#f4ce4a', '#ffeb3b', '#ffc107', '#ff9800'] // Amarillos y naranjas para partículas
  };
  
  // Objeto pájaro
  const bird = {
    x: canvas.width / 4,
    y: canvas.height / 2,
    width: 34,
    height: 24,
    velocity: 0,
    rotation: 0,
    wingPosition: 0,
    wingDirection: 1,
    wingSpeed: 0.15,
    
    flap: function() {
      if (gameOver) return;
      this.velocity = -flapPower;
      createParticles(this.x, this.y + this.height/2, 5, COLORS.particles);
    },
    
    update: function() {
      // Aleteo de alas (animación)
      this.wingPosition += this.wingSpeed * this.wingDirection;
      if (this.wingPosition > 1 || this.wingPosition < 0) {
        this.wingDirection *= -1;
      }
      
      // Física
      this.velocity += gravity;
      this.y += this.velocity;
      
      // Rotación basada en la velocidad
      const targetRotation = this.velocity * 3;
      this.rotation = this.rotation * 0.8 + targetRotation * 0.2;
      
      // Limitar la rotación
      if (this.rotation > 60) this.rotation = 60;
      if (this.rotation < -30) this.rotation = -30;
      
      // Colisión con el suelo
      if (this.y + this.height > canvas.height - groundHeight) {
        this.y = canvas.height - groundHeight - this.height;
        if (!gameOver) {
          gameOver = true;
          createParticles(this.x, this.y + this.height/2, 40, COLORS.particles);
          
          // Actualizar récord si es necesario
          if (score > highScore) {
            highScore = score;
            highScoreName = playerName;
            localStorage.setItem('flappyHighScore', highScore);
            localStorage.setItem('flappyHighScoreName', highScoreName);
          }
        }
      }
      
      // Colisión con el techo
      if (this.y < 0) {
        this.y = 0;
        this.velocity = 1;
      }
    },
    
    draw: function() {
      ctx.save();
      ctx.translate(this.x + this.width/2, this.y + this.height/2);
      ctx.rotate(this.rotation * Math.PI / 180);
      
      // Sombra
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 5;
      
      // Cuerpo del pájaro
      const gradient = ctx.createLinearGradient(-this.width/2, -this.height/2, -this.width/2, this.height/2);
      gradient.addColorStop(0, COLORS.bird[0]);
      gradient.addColorStop(1, COLORS.bird[1]);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.width/2, this.height/2, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Ala
      ctx.beginPath();
      const wingY = this.wingPosition * 6 - 3;
      ctx.ellipse(-2, wingY, this.width/3, this.height/4, 0.5, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.bird[0];
      ctx.fill();
      
      // Ojo
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(this.width/4, -this.height/6, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Brillo
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(-this.width/4, -this.height/4, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Pico
      ctx.fillStyle = '#ff9800';
      ctx.beginPath();
      ctx.moveTo(this.width/2, -2);
      ctx.lineTo(this.width/2 + 10, 0);
      ctx.lineTo(this.width/2, 2);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    }
  };
  
  // Arreglo de edificios
  let buildings = [];
  
  // Función para generar un nuevo edificio con ventana
  function addBuilding() {
    // La ventana debe estar a una altura aleatoria pero siempre accesible
    const windowY = Math.random() * (canvas.height - groundHeight - windowGapHeight - 120) + 60;
    
    // Altura del edificio (llega hasta el suelo)
    const buildingHeight = canvas.height - groundHeight;
    
    // Patrón de ventanas para este edificio
    const windowPattern = Math.floor(Math.random() * 3); // 0, 1 o 2 para diferentes patrones
    
    buildings.push({
      x: canvas.width,
      y: 0, // Siempre desde arriba
      height: buildingHeight,
      width: buildingWidth,
      windowY: windowY,
      windowHeight: windowGapHeight,
      windowPattern: windowPattern,
      color: COLORS.buildings[Math.floor(Math.random() * COLORS.buildings.length)],
      passed: false
    });
  }
  
  // Función para dibujar nubes
  function drawClouds() {
    const cloudPositions = [
      {x: canvas.width * 0.1, y: canvas.height * 0.15, size: 40},
      {x: canvas.width * 0.4, y: canvas.height * 0.1, size: 50},
      {x: canvas.width * 0.7, y: canvas.height * 0.2, size: 35},
      {x: canvas.width * 0.9, y: canvas.height * 0.12, size: 45}
    ];
    
    ctx.fillStyle = COLORS.clouds;
    
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
  
  // Funciones para partículas
  function createParticles(x, y, count, colors) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x: x,
        y: y,
        size: Math.random() * 5 + 2,
        speedX: (Math.random() - 0.5) * 6,
        speedY: (Math.random() - 0.5) * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 30 + Math.random() * 20
      });
    }
  }
  
  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].x += particles[i].speedX;
      particles[i].y += particles[i].speedY;
      particles[i].speedY += 0.1; // Ligera gravedad
      particles[i].life--;
      particles[i].size *= 0.95;
      
      if (particles[i].life <= 0 || particles[i].size <= 0.5) {
        particles.splice(i, 1);
      }
    }
  }
  
  function drawParticles() {
    particles.forEach(p => {
      ctx.globalAlpha = p.life / 50;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
  
  // Función para dibujar el suelo
  function drawGround() {
    // Gradiente para el suelo
    const groundGradient = ctx.createLinearGradient(0, canvas.height - groundHeight, 0, canvas.height);
    groundGradient.addColorStop(0, COLORS.ground[0]);
    groundGradient.addColorStop(1, COLORS.ground[1]);
    
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);
    
    // Detalles del suelo (líneas)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - groundHeight);
    ctx.lineTo(canvas.width, canvas.height - groundHeight);
    ctx.stroke();
    
    // Elementos del suelo (árboles, arbustos)
    for (let x = 20; x < canvas.width; x += 80) {
      // Arbustos
      ctx.fillStyle = '#2e7d32';
      ctx.beginPath();
      ctx.arc(x, canvas.height - groundHeight + 15, 12, 0, Math.PI * 2);
      ctx.arc(x + 10, canvas.height - groundHeight + 10, 10, 0, Math.PI * 2);
      ctx.arc(x - 10, canvas.height - groundHeight + 8, 9, 0, Math.PI * 2);
      ctx.fill();
      
      // Ocasionalmente un árbol
      if (Math.random() > 0.7) {
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(x + 30, canvas.height - groundHeight - 20, 5, 25);
        
        ctx.fillStyle = '#388e3c';
        ctx.beginPath();
        ctx.arc(x + 32, canvas.height - groundHeight - 25, 15, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  
  // Función para dibujar edificios con ventanas
  function drawBuildings() {
    buildings.forEach(building => {
      // Sombra para el edificio
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 5;
      
      // Edificio principal
      ctx.fillStyle = building.color;
      ctx.fillRect(building.x, building.y, building.width, building.height);
      
      // Quitar sombra para detalles
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      
      // Borde del edificio
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(building.x, building.y, building.width, building.height);
      
      // Ventana por donde debe pasar el pájaro (hueco)
      ctx.clearRect(building.x, building.windowY, building.width, building.windowHeight);
      
      // Marco de la ventana
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 3;
      ctx.strokeRect(building.x, building.windowY, building.width, building.windowHeight);
      
      // Luces de ventana (patrón aleatorio basado en windowPattern)
      const windowSize = 12;
      const windowMargin = 8;
      const windowsPerRow = Math.floor((building.width - windowMargin * 2) / (windowSize + windowMargin));
      const windowsPerCol = Math.floor((building.height - building.windowHeight - windowMargin * 2) / (windowSize + windowMargin));
      
      // Dibujar ventanas en el edificio (evitando el hueco)
      ctx.fillStyle = COLORS.windows[0];
      
      // Ventanas encima del hueco
      for (let row = 0; row < Math.floor(building.windowY / (windowSize + windowMargin)); row++) {
        for (let col = 0; col < windowsPerRow; col++) {
          // Patrón aleatorio basado en windowPattern
          if (building.windowPattern === 0 || 
              (building.windowPattern === 1 && (row + col) % 2 === 0) ||
              (building.windowPattern === 2 && Math.random() > 0.4)) {
            
            const windowX = building.x + windowMargin + col * (windowSize + windowMargin);
            const windowY = windowMargin + row * (windowSize + windowMargin);
            
            ctx.fillRect(windowX, windowY, windowSize, windowSize);
            
            // Ocasionalmente añadir un brillo
            if (Math.random() > 0.7) {
              ctx.fillStyle = COLORS.windows[1];
              ctx.fillRect(windowX, windowY, windowSize, windowSize);
              ctx.fillStyle = COLORS.windows[0];
            }
          }
        }
      }
      
      // Ventanas debajo del hueco
      for (let row = 0; row < windowsPerCol; row++) {
        for (let col = 0; col < windowsPerRow; col++) {
          // Patrón aleatorio basado en windowPattern
          if (building.windowPattern === 0 || 
              (building.windowPattern === 1 && (row + col) % 2 === 0) ||
              (building.windowPattern === 2 && Math.random() > 0.4)) {
            
            const windowX = building.x + windowMargin + col * (windowSize + windowMargin);
            const windowY = building.windowY + building.windowHeight + windowMargin + row * (windowSize + windowMargin);
            
            // Solo dibujar si está dentro del edificio
            if (windowY < building.height - groundHeight) {
              ctx.fillRect(windowX, windowY, windowSize, windowSize);
              
              // Ocasionalmente añadir un brillo
              if (Math.random() > 0.7) {
                ctx.fillStyle = COLORS.windows[1];
                ctx.fillRect(windowX, windowY, windowSize, windowSize);
                ctx.fillStyle = COLORS.windows[0];
              }
            }
          }
        }
      }
      
      // Antena en la parte superior (ocasionalmente)
      if (Math.random() > 0.5) {
        ctx.strokeStyle = '#616161';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(building.x + building.width / 2, 0);
        ctx.lineTo(building.x + building.width / 2, building.y);
        ctx.stroke();
        
        // Parte superior de la antena
        ctx.fillStyle = '#e53935';
        ctx.beginPath();
        ctx.arc(building.x + building.width / 2, 0, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }
  
  // Función para verificar colisiones
  function checkCollisions() {
    if (gameOver) return;
    
    // Verificar colisión con cada edificio
    for (let i = 0; i < buildings.length; i++) {
      const building = buildings[i];
      
      // Verificar si el pájaro ha pasado el edificio
      if (!building.passed && bird.x > building.x + building.width) {
        building.passed = true;
        score++;
        // Partículas de celebración al pasar
        createParticles(bird.x + bird.width, bird.y, 10, COLORS.particles);
      }
      
      // Verificar si el pájaro está en la zona del edificio
      if (bird.x + bird.width > building.x && 
          bird.x < building.x + building.width) {
        
        // Verificar si el pájaro pasa por la ventana (hueco)
        const isThroughWindow = (bird.y > building.windowY && 
                                bird.y + bird.height < building.windowY + building.windowHeight);
        
        // Si no está pasando por la ventana, hay colisión
        if (!isThroughWindow) {
          gameOver = true;
          createParticles(bird.x, bird.y, 30, COLORS.particles);
          
          // Actualizar récord si es necesario
          if (score > highScore) {
            highScore = score;
            highScoreName = playerName;
            localStorage.setItem('flappyHighScore', highScore);
            localStorage.setItem('flappyHighScoreName', highScoreName);
          }
        }
      }
    }
  }
  
  // Función para dibujar la información del juego
  function drawInfo() {
    // Barra superior
    if (ui) {
      ui.gradientBar(ctx, canvas, {from: '#3949ab', to: '#1a237e'});
      ui.shadowText(ctx, 'Flappy City', 20, 25, {size: 20});
    } else {
      const headerGrad = ctx.createLinearGradient(0, 0, 0, 50);
      headerGrad.addColorStop(0, '#3949ab');
      headerGrad.addColorStop(1, '#1a237e');
      ctx.fillStyle = headerGrad;
      ctx.fillRect(0, 0, canvas.width, 50);
      
      ctx.font = 'bold 20px Arial';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'left';
      ctx.fillText('Flappy City', 20, 25);
    }
    
    // Información del juego
    ctx.font = '16px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('Puntuación: ' + score, canvas.width/2, 25);
    ctx.textAlign = 'right';
    ctx.fillText('Récord: ' + highScore + (highScoreName ? ' (' + highScoreName + ')' : ''), canvas.width - 20, 25);
    ctx.textAlign = 'left';
  }
  
  // Función para dibujar la pantalla de introducción
  function drawIntro() {
    if (ui) {
      const lines = [
        "Pulsa ARRIBA o ABAJO para que el pájaro aletee.",
        "Pasa por las ventanas de los edificios sin chocar.",
        "Cada edificio superado suma un punto.",
        "No toques el suelo ni el techo.",
        "Pulsa cualquier tecla para empezar."
      ];
      
      ui.drawInstructionPanel(ctx, "Flappy City", lines, {
        bgColor: 'rgba(15, 25, 40, 0.95)',
        titleColor: '#ffeb3b'
      });
      
      // Dibujar ejemplo de pájaro
      bird.draw();
      
    } else {
      // Versión manual del panel si GameUI no está disponible
      const w = canvas.width - 140;
      const h = 250;
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
      ctx.fillStyle = '#ffeb3b';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 8;
      ctx.fillText('Flappy City', canvas.width/2, y + 40);
      
      // Texto de instrucciones
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = '15px Arial';
      ctx.fillText('Pulsa ARRIBA o ABAJO para que el pájaro aletee.', canvas.width/2, y + 80);
      ctx.fillText('Pasa por las ventanas de los edificios sin chocar.', canvas.width/2, y + 110);
      ctx.fillText('Cada edificio superado suma un punto.', canvas.width/2, y + 140);
      ctx.fillText('No toques el suelo ni el techo.', canvas.width/2, y + 170);
      ctx.fillText('Pulsa cualquier tecla para empezar.', canvas.width/2, y + 210);
      
      // Dibujar ejemplo de pájaro
      bird.draw();
    }
  }
  
  // Función para dibujar la pantalla de Game Over
  function drawGameOver() {
    // Panel de Game Over
    const w = canvas.width - 200;
    const h = 200;
    const x = 100;
    const y = 150;
    
    ctx.fillStyle = 'rgba(30, 30, 60, 0.9)';
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
    ctx.fillText('Puntuación final: ' + score, canvas.width/2, y + 90);
    
    // Récord
    if (score === highScore && score > 0) {
      ctx.fillStyle = '#ffeb3b';
      ctx.fillText('¡NUEVO RÉCORD!', canvas.width/2, y + 130);
    }
    
    // Indicación para reiniciar
    ctx.font = '16px Arial';
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    
    // Efecto pulsante
    const pulse = Math.sin(Date.now() / 300) * 0.1 + 0.9;
    ctx.globalAlpha = pulse;
    ctx.fillText('Pulsa ESPACIO para jugar de nuevo', canvas.width/2, y + 170);
    ctx.globalAlpha = 1;
  }
  
  // Función principal de dibujo
  function draw() {
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar fondo con gradiente
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, COLORS.sky[0]);
    bgGradient.addColorStop(1, COLORS.sky[1]);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar nubes
    drawClouds();
    
    // Dibujar edificios
    drawBuildings();
    
    // Dibujar el suelo
    drawGround();
    
    // Dibujar el pájaro
    bird.draw();
    
    // Dibujar partículas
    drawParticles();
    
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
    }
  }
  
  // Función de actualización
  let frameCount = 0;
  let buildingTimer = 0;
  
  function update() {
    if (showIntro || gameOver) return;
    
    frameCount++;
    buildingTimer++;
    
    // Actualizar posición del pájaro
    bird.update();
    
    // Generar nuevos edificios
    if (buildingTimer >= buildingSpacing) {
      addBuilding();
      buildingTimer = 0;
    }
    
    // Actualizar posición de los edificios
    for (let i = buildings.length - 1; i >= 0; i--) {
      buildings[i].x -= 3;
      
      // Eliminar edificios que salen de la pantalla
      if (buildings[i].x + buildings[i].width < 0) {
        buildings.splice(i, 1);
      }
    }
    
    // Verificar colisiones
    checkCollisions();
    
    // Actualizar partículas
    updateParticles();
  }
  
  // Función para reiniciar el juego
  function resetGame() {
    score = 0;
    gameOver = false;
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    bird.rotation = 0;
    buildings = [];
    particles = [];
    frameCount = 0;
    buildingTimer = 0;
  }
  
  // Eventos
  function keyDownHandler(e) {
    if (showIntro) {
      showIntro = false;
      return;
    }
    
    if (e.key === ' ' || e.code === 'Space') {
      if (gameOver) {
        resetGame();
      }
    }
    
    if (e.key === 'Up' || e.key === 'ArrowUp' || e.key === 'Down' || e.key === 'ArrowDown') {
      if (!gameOver) {
        bird.flap();
      }
    }
  }
  
  function clickHandler() {
    if (showIntro) {
      showIntro = false;
      return;
    }
    
    if (gameOver) {
      resetGame();
    } else {
      bird.flap();
    }
  }
  
  // Registrar eventos
  const keyDownListener = e => keyDownHandler(e);
  const clickListener = () => clickHandler();
  
  document.addEventListener('keydown', keyDownListener);
  canvas.addEventListener('click', clickListener);
  
  // Función de loop principal
  function gameLoop() {
    update();
    draw();
    animationFrame = requestAnimationFrame(gameLoop);
  }
  
  // Iniciar el juego
  gameLoop();
  
  // Función de limpieza
  return function cleanup() {
    document.removeEventListener('keydown', keyDownListener);
    canvas.removeEventListener('click', clickListener);
    if (animationFrame) cancelAnimationFrame(animationFrame);
  };
}

window.registerGame = registerGame;