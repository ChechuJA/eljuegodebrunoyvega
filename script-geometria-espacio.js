function registerGame() {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) throw new Error('No se encontró el lienzo del juego.');

  canvas.width = 800;
  canvas.height = 500;
  canvas.setAttribute('aria-label', 'Geometría en carrera. Pulsa espacio para empezar.');

  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const GROUND_Y = 405;
  const PLAYER_X = 156;
  const PLAYER_SIZE = 38;
  const GRAVITY = 1550;
  const JUMP_SPEED = -650;
  const LEVELS = [
    { name: 'Formas amigas', speed: 270, length: 2700, color: '#29b6f6', hazards: [[500, 48, 38], [930, 54, 60], [1370, 82, 38], [1840, 48, 60], [2290, 82, 38]] },
    { name: 'Giros y saltos', speed: 300, length: 2900, color: '#ab47bc', hazards: [[470, 48, 38], [850, 82, 38], [1210, 54, 62], [1580, 82, 38], [1980, 48, 62], [2380, 82, 38]] },
    { name: 'Ritmo geométrico', speed: 330, length: 3100, color: '#ff7043', hazards: [[450, 48, 38], [790, 54, 60], [1130, 82, 38], [1490, 48, 60], [1840, 82, 38], [2200, 54, 60], [2580, 82, 38]] },
    { name: 'Maestro de formas', speed: 350, length: 3300, color: '#66bb6a', hazards: [[430, 48, 38], [770, 82, 38], [1110, 54, 60], [1460, 82, 38], [1810, 48, 62], [2160, 82, 38], [2520, 54, 60], [2880, 82, 38]] }
  ];

  let state = 'intro';
  let levelIndex = 0;
  let distance = 0;
  let playerY = GROUND_Y - PLAYER_SIZE;
  let velocityY = 0;
  let onGround = true;
  let lives = 3;
  let gems = 0;
  let particles = [];
  let invulnerable = 0;
  let lastTime = 0;
  let animationId = 0;
  let disposed = false;
  let storageAvailable = true;
  let highScore = 0;
  let highScoreName = '';
  let lastAnnouncedLevel = 0;

  try {
    highScore = Number(localStorage.getItem('geometriaEspacioHighScore') || 0);
    highScoreName = localStorage.getItem('geometriaEspacioHighScoreName') || '';
  } catch {
    storageAvailable = false;
  }

  const playerName = (() => {
    try {
      return localStorage.getItem('playerName') || 'Jugador';
    } catch {
      storageAvailable = false;
      return 'Jugador';
    }
  })();

  function setState(next, announcement) {
    state = next;
    canvas.setAttribute('aria-label', announcement);
  }

  function levelGems() {
    return LEVELS[levelIndex].hazards.map(([x], index) => ({
      x: x - 125,
      y: GROUND_Y - (index % 2 === 0 ? 105 : 125),
      collected: false
    }));
  }

  let gemsInLevel = levelGems();

  function startLevel(index) {
    levelIndex = index;
    distance = 0;
    playerY = GROUND_Y - PLAYER_SIZE;
    velocityY = 0;
    onGround = true;
    invulnerable = 0;
    particles = [];
    gemsInLevel = levelGems();
    lastAnnouncedLevel = index;
    setState('playing', `Nivel ${index + 1}: ${LEVELS[index].name}. Pulsa espacio para saltar y Escape para pausar.`);
  }

  function resetGame() {
    levelIndex = 0;
    lives = 3;
    gems = 0;
    startLevel(0);
  }

  function saveScore() {
    if (gems <= highScore) return;
    highScore = gems;
    highScoreName = playerName;
    try {
      localStorage.setItem('geometriaEspacioHighScore', String(highScore));
      localStorage.setItem('geometriaEspacioHighScoreName', highScoreName);
    } catch {
      storageAvailable = false;
    }
  }

  function jump() {
    if (state !== 'playing') return;
    if (onGround) {
      velocityY = JUMP_SPEED;
      onGround = false;
    }
  }

  function pause() {
    if (state === 'playing') setState('paused', 'Juego en pausa. Pulsa espacio para continuar.');
  }

  function resume() {
    if (state !== 'paused') return;
    lastTime = 0;
    setState('playing', `Nivel ${levelIndex + 1}: ${LEVELS[levelIndex].name}. Pulsa espacio para saltar y Escape para pausar.`);
  }

  function finishGame(won) {
    saveScore();
    setState(won ? 'won' : 'gameOver', won
      ? `¡Has completado los cuatro niveles y conseguido ${gems} gemas!`
      : `Fin de la partida. Has conseguido ${gems} gemas. Pulsa espacio para intentarlo de nuevo.`);
  }

  function addSparkles(x, y, color) {
    for (let i = 0; i < 10; i += 1) {
      particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 180,
        vy: (Math.random() - 0.5) * 180,
        life: 0.45,
        color
      });
    }
  }

  function update(dt) {
    if (state !== 'playing') return;

    const level = LEVELS[levelIndex];
    distance += level.speed * dt;
    velocityY += GRAVITY * dt;
    playerY += velocityY * dt;
    if (playerY >= GROUND_Y - PLAYER_SIZE) {
      playerY = GROUND_Y - PLAYER_SIZE;
      velocityY = 0;
      onGround = true;
    }
    invulnerable = Math.max(0, invulnerable - dt);

    for (const gem of gemsInLevel) {
      if (gem.collected) continue;
      const screenX = gem.x - distance;
      if (screenX < PLAYER_X + PLAYER_SIZE && screenX + 24 > PLAYER_X &&
          gem.y < playerY + PLAYER_SIZE && gem.y + 24 > playerY) {
        gem.collected = true;
        gems += 1;
        addSparkles(screenX + 12, gem.y + 12, '#ffeb3b');
      }
    }

    if (invulnerable <= 0) {
      for (const [hazardX, hazardW, hazardH] of level.hazards) {
        const screenX = hazardX - distance;
        const overlapsX = screenX < PLAYER_X + PLAYER_SIZE - 7 && screenX + hazardW > PLAYER_X + 7;
        const overlapsY = playerY + PLAYER_SIZE > GROUND_Y - hazardH + 10;
        if (overlapsX && overlapsY) {
          lives -= 1;
          addSparkles(PLAYER_X + PLAYER_SIZE / 2, playerY + PLAYER_SIZE / 2, '#ff5252');
          distance = Math.max(0, hazardX - PLAYER_X - 175);
          playerY = GROUND_Y - PLAYER_SIZE;
          velocityY = 0;
          onGround = true;
          invulnerable = 1.1;
          if (lives <= 0) finishGame(false);
          break;
        }
      }
    }

    for (const particle of particles) {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.life -= dt;
    }
    particles = particles.filter(particle => particle.life > 0);

    if (distance >= level.length) {
      if (levelIndex === LEVELS.length - 1) {
        finishGame(true);
      } else {
        startLevel(levelIndex + 1);
        canvas.setAttribute('aria-label', `¡Nivel ${lastAnnouncedLevel} superado! Comienza el nivel ${levelIndex + 1}: ${LEVELS[levelIndex].name}. Pulsa espacio para saltar.`);
      }
    }
  }

  function drawBackground(level) {
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    sky.addColorStop(0, '#18204f');
    sky.addColorStop(1, '#5e4d91');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    if (window.GameUI) GameUI.scenery(ctx, 'geometria-espacio');

    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    for (let x = -((distance * 0.18) % 50); x < W; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, GROUND_Y);
      ctx.stroke();
    }
    for (let y = 30; y < GROUND_Y; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    ctx.fillStyle = '#24204e';
    for (let i = 0; i < 7; i += 1) {
      const x = ((i * 147 - distance * 0.1) % (W + 80) + W + 80) % (W + 80) - 40;
      ctx.beginPath();
      ctx.moveTo(x, GROUND_Y);
      ctx.lineTo(x + 55, GROUND_Y - 70 - (i % 3) * 25);
      ctx.lineTo(x + 110, GROUND_Y);
      ctx.fill();
    }

    ctx.fillStyle = '#171a3d';
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
    ctx.fillStyle = level.color;
    ctx.fillRect(0, GROUND_Y, W, 8);
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    for (let x = -((distance * 0.8) % 48); x < W; x += 48) {
      ctx.fillRect(x, GROUND_Y + 18, 24, 4);
    }
  }

  function drawHazard(hazard, index, level) {
    const [worldX, width, height] = hazard;
    const x = worldX - distance;
    if (x + width < -5 || x > W + 5) return;
    const y = GROUND_Y - height;
    ctx.save();
    ctx.shadowColor = level.color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = index % 2 === 0 ? level.color : '#ffca28';
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y);
    ctx.lineTo(x + width / 2, y);
    ctx.lineTo(x + width, GROUND_Y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawGem(gem) {
    if (gem.collected) return;
    const x = gem.x - distance;
    if (x < -30 || x > W + 30) return;
    ctx.save();
    ctx.translate(x + 12, gem.y + 12);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#ffeb3b';
    ctx.shadowColor = '#ffeb3b';
    ctx.shadowBlur = 14;
    ctx.fillRect(-9, -9, 18, 18);
    ctx.restore();
  }

  function drawPlayer(level) {
    const centerX = PLAYER_X + PLAYER_SIZE / 2;
    const centerY = playerY + PLAYER_SIZE / 2;
    ctx.save();
    if (invulnerable > 0 && Math.floor(invulnerable * 12) % 2 === 0) ctx.globalAlpha = 0.45;
    ctx.translate(centerX, centerY);
    if (!onGround) ctx.rotate((distance / 45) % (Math.PI * 2));
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = level.color;
    ctx.shadowBlur = 18;
    ctx.fillRect(-PLAYER_SIZE / 2, -PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE);
    ctx.fillStyle = level.color;
    ctx.fillRect(-PLAYER_SIZE / 2 + 8, -PLAYER_SIZE / 2 + 8, PLAYER_SIZE - 16, PLAYER_SIZE - 16);
    ctx.restore();
  }

  function drawHUD(level) {
    ctx.fillStyle = 'rgba(8,10,35,0.72)';
    ctx.beginPath();
    ctx.roundRect(14, 14, 260, 68, 12);
    ctx.fill();
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(`Nivel ${levelIndex + 1}: ${level.name}`, 28, 42);
    ctx.font = '15px Arial';
    ctx.fillStyle = '#ffeb3b';
    ctx.fillText(`Gemas: ${gems}`, 28, 66);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText('♥ '.repeat(lives).trim() || '¡Ánimo!', W - 20, 38);
    ctx.font = '14px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillText('ESC: pausa', W - 20, 62);

    const progress = Math.min(1, distance / level.length);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(W / 2 - 100, 25, 200, 8);
    ctx.fillStyle = level.color;
    ctx.fillRect(W / 2 - 100, 25, 200 * progress, 8);
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('META', W / 2, 48);
  }

  function drawOverlay(title, lines, color = '#ffeb3b') {
    ctx.fillStyle = 'rgba(8,10,35,0.88)';
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.fillStyle = color;
    ctx.font = 'bold 38px Arial';
    ctx.fillText(title, W / 2, 145);
    ctx.fillStyle = '#fff';
    ctx.font = '19px Arial';
    lines.forEach((line, index) => ctx.fillText(line, W / 2, 195 + index * 32));
  }

  function draw() {
    const level = LEVELS[levelIndex];
    drawBackground(level);

    for (const hazard of level.hazards) drawHazard(hazard, level.hazards.indexOf(hazard), level);
    for (const gem of gemsInLevel) drawGem(gem);
    drawPlayer(level);
    drawHUD(level);

    for (const particle of particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, particle.life / 0.45);
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x, particle.y, 5, 5);
      ctx.restore();
    }

    if (state === 'intro') {
      drawOverlay('GEOMETRÍA EN CARRERA', [
        '¡Salta obstáculos y recoge gemas brillantes!',
        'Pulsa ESPACIO para empezar y saltar.',
        'Completa 4 niveles; cada uno va un poco más rápido.',
        'Tienes 3 vidas. ESC pausa; ESPACIO continúa.',
        'Necesitas un teclado para jugar.'
      ], '#80deea');
    } else if (state === 'paused') {
      drawOverlay('PAUSA', ['Pulsa ESPACIO para continuar.', 'La carrera espera mientras descansas.'], '#80deea');
    } else if (state === 'gameOver') {
      drawOverlay('¡A SEGUIR PRACTICANDO!', [
        `Has recogido ${gems} gemas.`,
        `Récord: ${highScore} gemas${highScoreName ? ` (${highScoreName})` : ''}.`,
        'Pulsa ESPACIO para volver a intentarlo.',
        storageAvailable ? '' : 'El récord no se puede guardar en este navegador.'
      ].filter(Boolean), '#ff8a80');
    } else if (state === 'won') {
      drawOverlay('¡NIVELES COMPLETADOS!', [
        `¡Has recogido ${gems} gemas!`,
        `Récord: ${highScore} gemas${highScoreName ? ` (${highScoreName})` : ''}.`,
        'Pulsa ESPACIO para jugar otra vez.',
        storageAvailable ? '' : 'El récord no se puede guardar en este navegador.'
      ].filter(Boolean), '#a5d6a7');
    }
  }

  function frame(timestamp) {
    if (disposed) return;
    animationId = requestAnimationFrame(frame);
    const dt = lastTime ? Math.min((timestamp - lastTime) / 1000, 0.033) : 0;
    lastTime = timestamp;
    update(dt);
    draw();
  }

  function onKeyDown(event) {
    if (document.activeElement !== canvas) return;
    if (event.code === 'Space') {
      if (['intro', 'paused', 'gameOver', 'won'].includes(state)) {
        event.preventDefault();
        if (state === 'intro' || state === 'gameOver' || state === 'won') resetGame();
        else resume();
      } else if (state === 'playing') {
        event.preventDefault();
        if (!event.repeat) jump();
      }
      return;
    }
    if (event.code === 'Escape' && state === 'playing') {
      event.preventDefault();
      pause();
    }
  }

  function onWindowBlur() {
    if (state === 'playing') pause();
  }

  function onVisibilityChange() {
    if (document.hidden && state === 'playing') pause();
  }

  function onCanvasClick() {
    canvas.focus();
    if (state === 'intro' || state === 'gameOver' || state === 'won') resetGame();
    else if (state === 'paused') resume();
  }

  canvas.addEventListener('keydown', onKeyDown);
  canvas.addEventListener('click', onCanvasClick);
  window.addEventListener('blur', onWindowBlur);
  document.addEventListener('visibilitychange', onVisibilityChange);
  canvas.focus();
  animationId = requestAnimationFrame(frame);

  return function cleanup() {
    disposed = true;
    cancelAnimationFrame(animationId);
    canvas.removeEventListener('keydown', onKeyDown);
    canvas.removeEventListener('click', onCanvasClick);
    window.removeEventListener('blur', onWindowBlur);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
}
