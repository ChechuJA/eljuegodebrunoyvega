function registerGame() {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) throw new Error('No se encontró el lienzo del juego.');

  canvas.width = 800;
  canvas.height = 500;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const ROUND_SECONDS = 60;
  const WORDS = [
    ['sol', 'mar', 'pez', 'luz', 'pan', 'flor', 'luna', 'gato', 'casa', 'nube'],
    ['perro', 'barco', 'planta', 'amigos', 'estrella', 'planeta', 'sonrisa', 'montana'],
    ['mariposa', 'aventura', 'biblioteca', 'chocolate', 'dinosaurio', 'naturaleza', 'caracola'],
    ['aprendemos', 'fantastico', 'exploradores', 'imaginacion', 'compartimos', 'constelacion']
  ];

  let state = 'intro';
  let level = 0;
  let wordIndex = 0;
  let typed = '';
  let score = 0;
  let combo = 0;
  let bestCombo = 0;
  let attempts = 0;
  let correctCharacters = 0;
  let timeLeft = ROUND_SECONDS;
  let lastTime = 0;
  let animationId = 0;
  let disposed = false;
  let wrongFlash = 0;
  let storageAvailable = true;
  let recordWpm = 0;

  try {
    recordWpm = Number(localStorage.getItem('mecanografiaRecordWpm') || 0);
  } catch {
    storageAvailable = false;
  }

  function currentWord() {
    const levelWords = WORDS[level];
    return levelWords[wordIndex % levelWords.length];
  }

  function updateLabel(message) {
    if (message) {
      canvas.setAttribute('aria-label', message);
      return;
    }
    if (state === 'playing') {
      canvas.setAttribute('aria-label',
        `Partida de mecanografía. Nivel ${level + 1}. Palabra: ${currentWord()}. Has escrito ${typed.length} letras. ${Math.ceil(timeLeft)} segundos.`);
    }
  }

  function startRound() {
    state = 'playing';
    level = 0;
    wordIndex = 0;
    typed = '';
    score = 0;
    combo = 0;
    bestCombo = 0;
    attempts = 0;
    correctCharacters = 0;
    timeLeft = ROUND_SECONDS;
    lastTime = 0;
    updateLabel();
  }

  function saveRecord() {
    const wpm = Math.round(correctCharacters / 5);
    if (wpm <= recordWpm) return;
    recordWpm = wpm;
    try {
      localStorage.setItem('mecanografiaRecordWpm', String(recordWpm));
    } catch {
      storageAvailable = false;
    }
  }

  function finishRound() {
    state = 'finished';
    saveRecord();
    const accuracy = attempts ? Math.round((correctCharacters / attempts) * 100) : 0;
    updateLabel(`Tiempo terminado. ${score} palabras, ${accuracy}% de aciertos y ${getWpm()} palabras por minuto.`);
  }

  function getWpm() {
    const elapsed = ROUND_SECONDS - timeLeft;
    if (elapsed <= 0) return 0;
    return Math.round(correctCharacters / 5 / (elapsed / 60));
  }

  function onKeyDown(event) {
    if (document.activeElement !== canvas) return;
    if (event.code === 'Escape') {
      if (state === 'playing') {
        state = 'paused';
        updateLabel('Mecanografía en pausa. Pulsa espacio para continuar.');
        event.preventDefault();
      } else if (state === 'paused') {
        state = 'playing';
        lastTime = 0;
        updateLabel();
        event.preventDefault();
      }
      return;
    }

    if (state === 'intro' || state === 'finished') {
      if (event.code === 'Space' || event.code === 'Enter') {
        event.preventDefault();
        startRound();
      }
      return;
    }
    if (state === 'paused') {
      if (event.code === 'Space' || event.code === 'Enter') {
        event.preventDefault();
        state = 'playing';
        lastTime = 0;
        updateLabel();
      }
      return;
    }
    if (state !== 'playing') return;
    if (event.code === 'Space') {
      event.preventDefault();
      return;
    }

    if (event.code === 'Backspace') {
      event.preventDefault();
      typed = typed.slice(0, -1);
      updateLabel();
      return;
    }

    if (event.key.length !== 1 || !/[a-zñ]/i.test(event.key)) return;
    event.preventDefault();
    attempts += 1;
    const expected = currentWord()[typed.length];
    if (event.key.toLocaleLowerCase('es') !== expected) {
      wrongFlash = 0.25;
      combo = 0;
      updateLabel();
      return;
    }

    typed += expected;
    correctCharacters += 1;
    wrongFlash = 0;
    if (typed === currentWord()) {
      score += 1;
      combo += 1;
      bestCombo = Math.max(bestCombo, combo);
      typed = '';
      wordIndex += 1;
      if (wordIndex > 0 && wordIndex % 5 === 0 && level < WORDS.length - 1) {
        level += 1;
        wordIndex = 0;
        updateLabel(`¡Nivel ${level} superado! Empieza el nivel ${level + 1}: palabras un poco más largas.`);
      } else {
        updateLabel(`¡Palabra correcta! Llevas ${score} palabras. Sigue con ${currentWord()}.`);
      }
    } else {
      updateLabel();
    }
  }

  function pauseOnBlur() {
    if (state === 'playing') {
      state = 'paused';
      updateLabel('Mecanografía en pausa. Vuelve y pulsa espacio para continuar.');
    }
  }

  function onVisibilityChange() {
    if (document.hidden) pauseOnBlur();
  }

  function onCanvasClick() {
    canvas.focus();
    if (state === 'intro' || state === 'finished') startRound();
    else if (state === 'paused') {
      state = 'playing';
      lastTime = 0;
      updateLabel();
    }
  }

  function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, W, H);
    gradient.addColorStop(0, '#e3f2fd');
    gradient.addColorStop(1, '#f3e5f5');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(25,118,210,0.08)';
    for (let i = 0; i < 10; i += 1) {
      ctx.beginPath();
      ctx.arc((i * 97 + 35) % W, 45 + (i % 3) * 35, 18 + (i % 4) * 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawPanel(title, lines, color = '#1565c0') {
    ctx.fillStyle = 'rgba(20,35,70,0.92)';
    ctx.beginPath();
    ctx.roundRect(75, 64, W - 150, H - 128, 22);
    ctx.fill();
    ctx.textAlign = 'center';
    ctx.fillStyle = color;
    ctx.font = 'bold 36px Arial';
    ctx.fillText(title, W / 2, 135);
    ctx.fillStyle = '#fff';
    ctx.font = '18px Arial';
    lines.forEach((line, index) => ctx.fillText(line, W / 2, 190 + index * 34));
  }

  function drawWord() {
    const word = currentWord();
    ctx.fillStyle = '#263238';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(word, W / 2, 245);
    const textWidth = ctx.measureText(word).width;
    const startX = W / 2 - textWidth / 2;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#2e7d32';
    ctx.fillText(typed, startX, 245);

    ctx.fillStyle = 'rgba(21,101,192,0.12)';
    ctx.beginPath();
    ctx.roundRect(W / 2 - 185, 280, 370, 18, 9);
    ctx.fill();
    ctx.fillStyle = wrongFlash > 0 ? '#e53935' : '#42a5f5';
    ctx.beginPath();
    ctx.roundRect(W / 2 - 185, 280, Math.max(12, 370 * (typed.length / word.length)), 18, 9);
    ctx.fill();
  }

  function draw() {
    drawBackground();
    if (window.GameUI) GameUI.scenery(ctx, 'mecanografia');

    if (state === 'intro') {
      drawPanel('¡Misión mecanografía!', [
        'Escribe las palabras antes de que termine el minuto.',
        'Empieza con ESPACIO o ENTER; escribe con calma y precisión.',
        'Si te equivocas, prueba otra letra. Retroceso borra.',
        'Cada 5 palabras el siguiente nivel tiene palabras más largas.',
        'ESC pausa. ¡Tu récord se mide en palabras por minuto!',
        'Necesitas un teclado para jugar.'
      ], '#80deea');
      return;
    }

    if (state === 'paused') {
      drawPanel('PAUSA', ['Pulsa ESPACIO para continuar.', 'El reloj se detiene mientras descansas.'], '#80deea');
      return;
    }

    if (state === 'finished') {
      const accuracy = attempts ? Math.round((correctCharacters / attempts) * 100) : 0;
      drawPanel('¡Buen trabajo!', [
        `Palabras correctas: ${score}`,
        `Rapidez: ${getWpm()} palabras por minuto · Precisión: ${accuracy}%`,
        `Mejor racha: ${bestCombo} palabras`,
        `Récord: ${recordWpm} palabras por minuto`,
        storageAvailable ? 'Pulsa ESPACIO para jugar otra ronda.' : 'El récord no se pudo guardar en este navegador.'
      ], '#a5d6a7');
      return;
    }

    ctx.fillStyle = '#263238';
    ctx.textAlign = 'left';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(`Nivel ${level + 1}`, 32, 42);
    ctx.fillText(`Palabras: ${score}`, 32, 72);
    ctx.fillText(`Racha: ${combo}`, 32, 102);
    ctx.textAlign = 'right';
    ctx.fillStyle = timeLeft < 10 ? '#d32f2f' : '#1565c0';
    ctx.font = 'bold 26px Arial';
    ctx.fillText(`${Math.ceil(timeLeft)} s`, W - 32, 48);
    ctx.fillStyle = '#263238';
    ctx.font = '16px Arial';
    ctx.fillText(`${getWpm()} palabras/min · ESC pausa`, W - 32, 78);

    ctx.fillStyle = 'rgba(255,255,255,0.78)';
    ctx.beginPath();
    ctx.roundRect(115, 145, W - 230, 190, 24);
    ctx.fill();
    ctx.fillStyle = '#455a64';
    ctx.font = '17px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Escribe esta palabra:', W / 2, 190);
    drawWord();
    ctx.fillStyle = '#455a64';
    ctx.font = '15px Arial';
    ctx.fillText('Consejo: mira la palabra completa antes de empezar.', W / 2, 380);
    if (wrongFlash > 0) {
      ctx.fillStyle = '#c62828';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('¡Prueba con otra letra!', W / 2, 425);
    }
  }

  function frame(timestamp) {
    if (disposed) return;
    animationId = requestAnimationFrame(frame);
    const dt = lastTime ? Math.min((timestamp - lastTime) / 1000, 0.05) : 0;
    lastTime = timestamp;
    if (state === 'playing') {
      timeLeft = Math.max(0, timeLeft - dt);
      wrongFlash = Math.max(0, wrongFlash - dt);
      if (timeLeft <= 0) finishRound();
    }
    draw();
  }

  canvas.setAttribute('aria-label', 'Misión mecanografía. Escribe palabras, mejora tu rapidez y precisión. Pulsa espacio para empezar.');
  canvas.addEventListener('keydown', onKeyDown);
  canvas.addEventListener('click', onCanvasClick);
  window.addEventListener('blur', pauseOnBlur);
  document.addEventListener('visibilitychange', onVisibilityChange);
  canvas.focus();
  animationId = requestAnimationFrame(frame);

  return function cleanup() {
    disposed = true;
    cancelAnimationFrame(animationId);
    canvas.removeEventListener('keydown', onKeyDown);
    canvas.removeEventListener('click', onCanvasClick);
    window.removeEventListener('blur', pauseOnBlur);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
}
