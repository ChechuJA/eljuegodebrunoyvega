// script-teclado-rapido.js
// Juego: Teclado Rápido - OCR (Obstacle Course Race) para aprender el teclado

function registerGame() {
  'use strict';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 800;
  canvas.height = 500;

  // ── Constantes ─────────────────────────────────────────────────────────────
  const W = canvas.width;
  const H = canvas.height;
  const GROUND_Y = H - 80;
  const PLAYER_W = 36;
  const PLAYER_H = 56;
  const GRAVITY = 0.55;
  const JUMP_VY = -13;
  const SLIDE_H = 28; // altura agachado
  const MAX_LIVES = 3;
  const POINTS_CORRECT = 10;
  const POINTS_WRONG = -5;
  const COMBO_BONUS = 5;

  // Teclas por nivel (se van desbloqueando)
  const OBSTACLE_TYPES = {
    jump:  { key: ' ',       label: 'ESPACIO', color: '#1976d2', emoji: '⬆️', desc: 'Saltar'    },
    slide: { key: 'Shift',   label: 'SHIFT',   color: '#388e3c', emoji: '⬇️', desc: 'Agacharse' },
    grab:  { key: 'e',       label: 'E',       color: '#f57f17', emoji: '✋', desc: 'Agarrar'   },
    climb: { key: 'q',       label: 'Q',       color: '#7b1fa2', emoji: '🧗', desc: 'Trepar'    }
  };

  // Velocidad base y cómo crece por nivel
  function levelSpeed(lvl) { return 3.5 + (lvl - 1) * 0.6; }
  // Intervalo de generación de obstáculos (ms) — decrece con nivel
  function spawnInterval(lvl) { return Math.max(1600, 2800 - (lvl - 1) * 200); }

  // Tipos disponibles según el nivel
  function availableTypes(lvl) {
    if (lvl === 1) return ['jump'];
    if (lvl === 2) return ['jump', 'slide'];
    if (lvl === 3) return ['jump', 'slide', 'grab'];
    return ['jump', 'slide', 'grab', 'climb'];
  }

  // ── Estado del juego ────────────────────────────────────────────────────────
  let state; // 'intro' | 'playing' | 'levelComplete' | 'gameOver'
  let score, combo, maxCombo, lives, level, highScore;
  let bgOffset, obstacleTimer, gameSpeed;
  let levelCompleteTimer;
  let lastTime;
  let animId;

  // ── Clases ──────────────────────────────────────────────────────────────────

  class Player {
    constructor() { this.reset(); }

    reset() {
      this.x = 100;
      this.y = GROUND_Y - PLAYER_H;
      this.vy = 0;
      this.onGround = true;
      this.sliding = false;
      this.grabbing = false;
      this.grabY = 0;
      this.climbing = false;
      this.climbY = 0;
      this.w = PLAYER_W;
      this.h = PLAYER_H;
      this.hitFlash = 0;   // frames de parpadeo al recibir daño
      this.actionAnim = 0; // frames de animación de acción correcta
      this.actionColor = '#fff';
    }

    update(keys) {
      if (this.hitFlash > 0) this.hitFlash--;
      if (this.actionAnim > 0) this.actionAnim--;

      // Gravedad normal (salvo grab/climb)
      if (!this.grabbing && !this.climbing) {
        this.vy += GRAVITY;
        this.y += this.vy;
      }

      // Suelo
      if (this.y >= GROUND_Y - this.h) {
        this.y = GROUND_Y - this.h;
        this.vy = 0;
        this.onGround = true;
        this.sliding = false;
      } else {
        this.onGround = false;
      }

      // Actualizar h según estado
      this.h = this.sliding ? SLIDE_H : PLAYER_H;
      if (this.sliding) {
        this.y = GROUND_Y - SLIDE_H;
      }
    }

    jump()  { if (this.onGround) { this.vy = JUMP_VY; this.onGround = false; } }
    slide() { if (this.onGround) { this.sliding = true; } }
    grab(barY) {
      this.grabbing = true;
      this.grabY = barY;
      this.y = barY - 16;
      this.vy = 0;
    }
    releaseGrab() {
      if (this.grabbing) { this.grabbing = false; this.vy = JUMP_VY * 0.4; }
    }
    startClimb(wallX) {
      this.climbing = true;
      this.climbY = this.y;
      this.x = wallX - this.w;
    }
    finishClimb() {
      this.climbing = false;
      this.y = this.climbY - PLAYER_H * 2;
      this.vy = 0;
    }

    draw(ctx) {
      ctx.save();
      // Parpadeo rojo al recibir daño
      if (this.hitFlash > 0 && Math.floor(this.hitFlash / 3) % 2 === 0) {
        ctx.globalAlpha = 0.3;
      }
      const ph = this.sliding ? SLIDE_H : PLAYER_H;
      const py = GROUND_Y - ph;
      const px = this.x;

      // Cuerpo
      ctx.fillStyle = this.hitFlash > 0 ? '#f44336' : '#1565c0';
      ctx.beginPath();
      ctx.roundRect(px, py, PLAYER_W, ph, 6);
      ctx.fill();

      // Cara
      if (!this.sliding) {
        ctx.fillStyle = '#ffe0b2';
        ctx.beginPath();
        ctx.ellipse(px + PLAYER_W / 2, py + 14, 11, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        // Ojos
        ctx.fillStyle = '#333';
        ctx.fillRect(px + PLAYER_W / 2 - 6, py + 10, 4, 4);
        ctx.fillRect(px + PLAYER_W / 2 + 2, py + 10, 4, 4);
        // Boca
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(px + PLAYER_W / 2, py + 18, 4, 0, Math.PI);
        ctx.stroke();
      }

      // Anim de acción correcta: aro de luz
      if (this.actionAnim > 0) {
        ctx.strokeStyle = this.actionColor;
        ctx.lineWidth = 3;
        ctx.globalAlpha = this.actionAnim / 20;
        ctx.beginPath();
        ctx.ellipse(px + PLAYER_W / 2, py + ph / 2, PLAYER_W * 1.1 + (20 - this.actionAnim) * 1.5,
          ph * 0.6 + (20 - this.actionAnim), 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    getBounds() {
      const ph = this.sliding ? SLIDE_H : PLAYER_H;
      const py = GROUND_Y - ph;
      return { x: this.x, y: py, w: PLAYER_W, h: ph };
    }
  }

  class Obstacle {
    constructor(type, lvl) {
      this.type = type;
      this.info = OBSTACLE_TYPES[type];
      this.x = W + 60;
      this.passed = false;
      this.triggered = false; // jugador pulsó tecla mientras estaba activo
      this.active = false;    // el obstáculo está en zona de interacción
      this.missed = false;    // pasó sin interacción

      // Geometría según tipo
      switch (type) {
        case 'jump':
          // Valla en el suelo
          this.y = GROUND_Y - 55;
          this.w = 28;
          this.h = 55;
          break;
        case 'slide':
          // Barra baja sobre el suelo
          this.y = GROUND_Y - 60;
          this.w = 60;
          this.h = 20;
          break;
        case 'grab':
          // Barra colgante
          this.y = GROUND_Y - 160;
          this.w = 80;
          this.h = 14;
          break;
        case 'climb':
          // Pared
          this.y = GROUND_Y - 130;
          this.w = 30;
          this.h = 130;
          break;
      }
    }

    update(speed) {
      this.x -= speed;
      // Zona activa: cuando el obstáculo está cerca del jugador (±70px)
      this.active = Math.abs(this.x - 110) < 70;
    }

    isOffScreen() { return this.x + this.w < -20; }

    draw(ctx) {
      const info = this.info;
      ctx.save();

      // Indicador de tecla sobre el obstáculo (si no ha pasado)
      if (!this.passed && this.x > 60) {
        const labelX = this.x + this.w / 2;
        const labelY = this.y - 38;
        // Fondo de la etiqueta
        ctx.fillStyle = this.active ? info.color : 'rgba(0,0,0,0.55)';
        ctx.beginPath();
        ctx.roundRect(labelX - 36, labelY - 18, 72, 26, 8);
        ctx.fill();
        // Texto de la tecla
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(info.label, labelX, labelY - 1);
        // Emoji
        ctx.font = '16px Arial';
        ctx.fillText(info.emoji, labelX, this.y - 12);
      }

      switch (this.type) {
        case 'jump':
          // Valla con rayas
          ctx.fillStyle = '#d32f2f';
          ctx.fillRect(this.x, this.y, this.w, this.h);
          ctx.fillStyle = '#fff';
          for (let i = 0; i < 3; i++) {
            ctx.fillRect(this.x, this.y + i * 18 + 4, this.w, 8);
          }
          break;
        case 'slide':
          // Barra baja con soporte
          ctx.fillStyle = '#ef6c00';
          ctx.fillRect(this.x - 5, this.y + this.h, 10, GROUND_Y - this.y - this.h);
          ctx.fillRect(this.x + this.w - 5, this.y + this.h, 10, GROUND_Y - this.y - this.h);
          ctx.fillStyle = '#ff9800';
          ctx.fillRect(this.x, this.y, this.w, this.h);
          break;
        case 'grab':
          // Barra colgante con soporte
          ctx.strokeStyle = '#555';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(this.x + this.w / 2, 0);
          ctx.lineTo(this.x + this.w / 2, this.y);
          ctx.stroke();
          ctx.fillStyle = '#9c27b0';
          ctx.beginPath();
          ctx.roundRect(this.x, this.y, this.w, this.h, 7);
          ctx.fill();
          // Brillos
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.fillRect(this.x + 6, this.y + 3, this.w - 12, 4);
          break;
        case 'climb':
          // Pared con peldaños
          ctx.fillStyle = '#795548';
          ctx.fillRect(this.x, this.y, this.w, this.h);
          ctx.fillStyle = '#a1887f';
          for (let i = 0; i < 4; i++) {
            ctx.fillRect(this.x + 4, this.y + i * 30 + 10, this.w - 8, 10);
          }
          break;
      }
      ctx.restore();
    }

    getBounds() {
      return { x: this.x, y: this.y, w: this.w, h: this.h };
    }
  }

  class Game {
    constructor() {
      this.player = new Player();
      this.obstacles = [];
      this.particles = [];
      this.messages = [];
    }

    reset(keepLevel) {
      score = keepLevel ? score : 0;
      combo = 0;
      maxCombo = 0;
      lives = MAX_LIVES;
      level = keepLevel ? level : 1;
      highScore = Number(localStorage.getItem('tecladoRapidoHigh') || 0);
      bgOffset = 0;
      obstacleTimer = 0;
      gameSpeed = levelSpeed(level);
      this.player.reset();
      this.obstacles = [];
      this.particles = [];
      this.messages = [];
      state = 'playing';
    }

    // Genera el siguiente obstáculo con tipo aleatorio del nivel actual
    spawnObstacle() {
      const types = availableTypes(level);
      const type = types[Math.floor(Math.random() * types.length)];
      this.obstacles.push(new Obstacle(type, level));
    }

    addParticles(x, y, color, count) {
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6 - 2,
          alpha: 1,
          r: Math.random() * 5 + 3,
          color
        });
      }
    }

    addMessage(text, color) {
      this.messages.push({ text, color, y: GROUND_Y - PLAYER_H - 60, alpha: 1, x: 140 });
    }

    handleKey(key) {
      if (state !== 'playing') return;

      // R siempre reinicia
      if (key === 'r' || key === 'R') {
        this.reset(false);
        return;
      }

      // Buscar obstáculo activo
      const active = this.obstacles.find(o => o.active && !o.triggered);
      if (!active) {
        // Pulsó en el vacío — penar sólo si hay un obstáculo cercano que no se ha activado
        return;
      }

      const correctKey = active.info.key;
      const pressed = key;

      let correct = false;
      if (correctKey === ' ' && pressed === ' ') correct = true;
      else if (correctKey === 'Shift' && (pressed === 'Shift')) correct = true;
      else if (correctKey === 'e' && (pressed === 'e' || pressed === 'E')) correct = true;
      else if (correctKey === 'q' && (pressed === 'q' || pressed === 'Q')) correct = true;

      active.triggered = true;

      if (correct) {
        // Acción correcta
        score += POINTS_CORRECT;
        combo++;
        if (combo > maxCombo) maxCombo = combo;
        if (combo > 1) {
          score += (combo - 1) * COMBO_BONUS;
          this.addMessage(`¡Combo x${combo}! +${(combo - 1) * COMBO_BONUS}`, '#ffd600');
        } else {
          this.addMessage(`+${POINTS_CORRECT}`, active.info.color);
        }
        // Efecto visual
        this.player.actionAnim = 20;
        this.player.actionColor = active.info.color;
        this.addParticles(120, GROUND_Y - PLAYER_H / 2, active.info.color, 12);
        active.passed = true;
        // Ejecutar la acción del jugador
        this._doPlayerAction(active.type, active);
      } else {
        // Tecla incorrecta
        score += POINTS_WRONG;
        combo = 0;
        lives--;
        this.player.hitFlash = 22;
        this.addMessage(`-${Math.abs(POINTS_WRONG)} Tecla incorrecta`, '#f44336');
        this.addParticles(120, GROUND_Y - PLAYER_H / 2, '#f44336', 8);
        if (lives <= 0) {
          this._checkHighScore();
          state = 'gameOver';
        }
      }
    }

    _doPlayerAction(type, obs) {
      switch (type) {
        case 'jump':  this.player.jump(); break;
        case 'slide': this.player.slide(); break;
        case 'grab':  this.player.grab(obs.y); break;
        case 'climb': this.player.startClimb(obs.x); break;
      }
    }

    _checkHighScore() {
      if (score > highScore) {
        highScore = score;
        localStorage.setItem('tecladoRapidoHigh', String(highScore));
        localStorage.setItem('tecladoRapidoHighName', localStorage.getItem('playerName') || '');
      }
    }

    update(dt) {
      if (state !== 'playing') return;

      bgOffset = (bgOffset + gameSpeed * 0.5) % W;

      // Timer obstáculos
      obstacleTimer += dt;
      if (obstacleTimer >= spawnInterval(level)) {
        obstacleTimer = 0;
        this.spawnObstacle();
      }

      // Actualizar player
      this.player.update();

      // Si el jugador está agarrado y ya pasó el obstáculo, soltar
      if (this.player.grabbing) {
        const grabObs = this.obstacles.find(o => o.type === 'grab' && o.triggered);
        if (grabObs) {
          grabObs.x -= gameSpeed;
          this.player.x = grabObs.x + grabObs.w / 2 - PLAYER_W / 2;
          if (grabObs.x + grabObs.w < this.player.x - 40) {
            this.player.releaseGrab();
          }
        }
      }

      // Si el jugador está trepando, animar subida
      if (this.player.climbing) {
        this.player.y -= 3;
        if (this.player.y <= this.player.climbY - PLAYER_H * 2) {
          this.player.finishClimb();
        }
      }

      // Actualizar obstáculos
      for (const obs of this.obstacles) {
        obs.update(gameSpeed);
        // Si el obstáculo pasó al jugador sin que se haya interactuado: fallo silencioso
        if (!obs.triggered && !obs.missed && obs.x + obs.w < this.player.x - 10) {
          obs.missed = true;
          // Solo penalizar si el obstáculo estaba activo (en zona de interacción)
          score += POINTS_WRONG;
          lives--;
          combo = 0;
          this.player.hitFlash = 22;
          this.addMessage('¡Tecla perdida! -5', '#ff7043');
          if (lives <= 0) {
            this._checkHighScore();
            state = 'gameOver';
            return;
          }
        }
      }
      this.obstacles = this.obstacles.filter(o => !o.isOffScreen());

      // Partículas
      for (const p of this.particles) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.alpha -= 0.04;
      }
      this.particles = this.particles.filter(p => p.alpha > 0);

      // Mensajes flotantes
      for (const m of this.messages) {
        m.y -= 1.2; m.alpha -= 0.025;
      }
      this.messages = this.messages.filter(m => m.alpha > 0);

      // Avance de puntuación → cambio de nivel cada 200 pts (máx nivel 4)
      const newLevel = Math.min(4, 1 + Math.floor(score / 200));
      if (newLevel > level) {
        level = newLevel;
        gameSpeed = levelSpeed(level);
        levelCompleteTimer = 180; // ~3 seg a 60fps
        state = 'levelComplete';
      }
    }

    drawBG() {
      // Cielo degradado
      const grad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      grad.addColorStop(0, '#87ceeb');
      grad.addColorStop(1, '#e0f7fa');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, GROUND_Y);

      // Nubes en movimiento
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      const cloudPositions = [60, 220, 420, 620];
      cloudPositions.forEach((cx, i) => {
        const ox = ((cx - bgOffset * 0.3 * (i % 2 === 0 ? 1 : 0.7)) % (W + 120) + W + 120) % (W + 120) - 60;
        ctx.beginPath();
        ctx.ellipse(ox, 60 + i * 22, 55, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(ox + 35, 52 + i * 22, 38, 18, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Decoraciones de fondo (árboles/colinas)
      ctx.fillStyle = '#4caf50';
      const treeXs = [80, 280, 500, 720];
      treeXs.forEach((tx, i) => {
        const ox = ((tx - bgOffset * 0.6) % (W + 80) + W + 80) % (W + 80) - 40;
        // Tronco
        ctx.fillStyle = '#795548';
        ctx.fillRect(ox - 5, GROUND_Y - 55, 10, 30);
        // Copa
        ctx.fillStyle = '#388e3c';
        ctx.beginPath();
        ctx.moveTo(ox, GROUND_Y - 95);
        ctx.lineTo(ox - 22, GROUND_Y - 48);
        ctx.lineTo(ox + 22, GROUND_Y - 48);
        ctx.closePath();
        ctx.fill();
      });

      // Suelo
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
      ctx.fillStyle = '#a5d6a7';
      ctx.fillRect(0, GROUND_Y, W, 12);

      // Líneas de movimiento del suelo
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 2;
      ctx.setLineDash([20, 30]);
      ctx.beginPath();
      const lineOffset = bgOffset % 50;
      for (let lx = -50 + lineOffset; lx < W + 50; lx += 50) {
        ctx.moveTo(lx, GROUND_Y + 6);
        ctx.lineTo(lx + 20, GROUND_Y + 6);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    drawHUD() {
      // Panel superior
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath();
      ctx.roundRect(8, 8, 220, 54, 10);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Puntos: ${score}`, 18, 30);
      ctx.fillText(`Nivel: ${level}  Combo: x${combo}`, 18, 52);

      // Vidas
      for (let i = 0; i < MAX_LIVES; i++) {
        ctx.fillStyle = i < lives ? '#f44336' : '#555';
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('❤️', W - 38 - i * 32, 32);
      }

      // Récord
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.roundRect(W - 160, 44, 150, 24, 8);
      ctx.fill();
      ctx.fillStyle = '#ffd600';
      ctx.font = '13px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`🏆 Récord: ${highScore}`, W - 10, 61);
    }

    drawLegend() {
      // Leyenda de teclas en la parte inferior derecha
      const types = availableTypes(level);
      const boxW = 170;
      const boxH = types.length * 22 + 14;
      const bx = W - boxW - 8;
      const by = H - boxH - 8;

      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.beginPath();
      ctx.roundRect(bx, by, boxW, boxH, 10);
      ctx.fill();

      ctx.textAlign = 'left';
      types.forEach((t, i) => {
        const info = OBSTACLE_TYPES[t];
        ctx.fillStyle = info.color;
        ctx.font = 'bold 13px Arial';
        ctx.fillText(`${info.emoji} ${info.label}: ${info.desc}`, bx + 10, by + 20 + i * 22);
      });
    }

    drawParticles() {
      for (const p of this.particles) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    drawMessages() {
      for (const m of this.messages) {
        ctx.save();
        ctx.globalAlpha = m.alpha;
        ctx.fillStyle = m.color;
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(m.text, m.x, m.y);
        ctx.restore();
      }
    }

    drawIntro() {
      ctx.fillStyle = 'rgba(0,0,30,0.88)';
      ctx.fillRect(0, 0, W, H);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffd600';
      ctx.font = 'bold 38px Arial';
      ctx.fillText('⌨️ Teclado Rápido', W / 2, 90);

      ctx.fillStyle = '#fff';
      ctx.font = '17px Arial';
      ctx.fillText('¡Un juego OCR para aprender a usar el teclado!', W / 2, 130);
      ctx.fillText('El personaje corre solo. Pulsa la tecla correcta', W / 2, 158);
      ctx.fillText('cuando aparezca el obstáculo para superarlo.', W / 2, 181);

      // Teclas explicadas
      const keys = [
        ['ESPACIO', 'Saltar sobre vallas', '#1976d2'],
        ['SHIFT',   'Agacharse bajo barras', '#388e3c'],
        ['E',       'Agarrar barras colgantes', '#f57f17'],
        ['Q',       'Trepar paredes', '#7b1fa2']
      ];
      ctx.font = 'bold 15px Arial';
      keys.forEach(([k, d, c], i) => {
        const ky = 220 + i * 36;
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.roundRect(W / 2 - 130, ky - 18, 80, 26, 8);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillText(k, W / 2 - 90, ky);
        ctx.fillStyle = '#ddd';
        ctx.font = '14px Arial';
        ctx.fillText(d, W / 2 + 40, ky);
        ctx.font = 'bold 15px Arial';
      });

      ctx.fillStyle = '#ffd600';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('R – Reiniciar en cualquier momento', W / 2, 382);

      // Botón inicio
      ctx.fillStyle = '#1976d2';
      ctx.beginPath();
      ctx.roundRect(W / 2 - 100, 410, 200, 50, 14);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 22px Arial';
      ctx.fillText('▶  Jugar', W / 2, 442);
    }

    drawGameOver() {
      ctx.fillStyle = 'rgba(0,0,0,0.78)';
      ctx.fillRect(0, 0, W, H);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#f44336';
      ctx.font = 'bold 44px Arial';
      ctx.fillText('💀 Game Over', W / 2, 140);

      ctx.fillStyle = '#fff';
      ctx.font = '22px Arial';
      ctx.fillText(`Puntuación final: ${score}`, W / 2, 200);
      ctx.fillText(`Máximo combo: x${maxCombo}`, W / 2, 235);

      if (score >= highScore && score > 0) {
        ctx.fillStyle = '#ffd600';
        ctx.font = 'bold 22px Arial';
        ctx.fillText('🏆 ¡Nuevo récord!', W / 2, 278);
      } else {
        ctx.fillStyle = '#aaa';
        ctx.font = '18px Arial';
        ctx.fillText(`Récord: ${highScore}`, W / 2, 278);
      }

      ctx.fillStyle = '#1976d2';
      ctx.beginPath();
      ctx.roundRect(W / 2 - 110, 320, 220, 50, 14);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px Arial';
      ctx.fillText('▶  Jugar de nuevo', W / 2, 350);

      ctx.fillStyle = '#555';
      ctx.font = '14px Arial';
      ctx.fillText('(o pulsa R)', W / 2, 400);
    }

    drawLevelComplete() {
      ctx.fillStyle = 'rgba(0,20,0,0.78)';
      ctx.fillRect(0, 0, W, H);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffd600';
      ctx.font = 'bold 44px Arial';
      ctx.fillText(`🎉 ¡Nivel ${level - 1} superado!`, W / 2, 160);

      ctx.fillStyle = '#fff';
      ctx.font = '22px Arial';
      ctx.fillText(`Entrando al Nivel ${level}`, W / 2, 215);

      if (level <= 4) {
        const newType = availableTypes(level).at(-1);
        const info = OBSTACLE_TYPES[newType];
        ctx.fillStyle = info.color;
        ctx.font = 'bold 20px Arial';
        ctx.fillText(`Nueva acción: ${info.emoji} ${info.label} – ${info.desc}`, W / 2, 265);
      }

      ctx.fillStyle = '#aaa';
      ctx.font = '16px Arial';
      ctx.fillText('Continuando automáticamente…', W / 2, 340);
    }

    draw() {
      ctx.clearRect(0, 0, W, H);

      if (state === 'intro') {
        this.drawIntro();
        return;
      }
      if (state === 'gameOver') {
        this.drawBG();
        this.player.draw(ctx);
        this.drawHUD();
        this.drawGameOver();
        return;
      }
      if (state === 'levelComplete') {
        this.drawBG();
        for (const obs of this.obstacles) obs.draw(ctx);
        this.player.draw(ctx);
        this.drawHUD();
        this.drawLevelComplete();
        return;
      }

      // Estado normal: playing
      this.drawBG();
      for (const obs of this.obstacles) obs.draw(ctx);
      this.player.draw(ctx);
      this.drawParticles();
      this.drawMessages();
      this.drawHUD();
      this.drawLegend();
    }
  }

  // ── Inicialización ──────────────────────────────────────────────────────────
  const game = new Game();
  highScore = Number(localStorage.getItem('tecladoRapidoHigh') || 0);
  state = 'intro';
  lastTime = null;
  level = 1;
  score = 0;
  combo = 0;
  maxCombo = 0;
  lives = MAX_LIVES;
  bgOffset = 0;
  obstacleTimer = 0;
  gameSpeed = levelSpeed(1);

  // ── Loop principal ──────────────────────────────────────────────────────────
  function loop(ts) {
    animId = requestAnimationFrame(loop);
    const dt = lastTime === null ? 16 : Math.min(ts - lastTime, 50);
    lastTime = ts;

    if (state === 'levelComplete') {
      levelCompleteTimer -= 1;
      game.draw();
      if (levelCompleteTimer <= 0) {
        state = 'playing';
      }
      return;
    }

    game.update(dt);
    game.draw();
  }

  // ── Eventos de teclado ──────────────────────────────────────────────────────
  function onKeyDown(e) {
    // Prevenir scroll en espacio/shift
    if ([' ', 'ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault();

    const key = e.key === ' ' ? ' '
      : e.key === 'Shift' ? 'Shift'
      : e.key.toLowerCase();

    if (state === 'intro') {
      state = 'playing';
      game.reset(false);
      return;
    }
    if (state === 'gameOver') {
      if (key === ' ' || key === 'r' || key === 'enter') {
        game.reset(false);
      }
      return;
    }
    game.handleKey(e.key === ' ' ? ' ' : e.key === 'Shift' ? 'Shift' : e.key);
  }

  // Click/tap en pantallas de intro y game over
  function onClick(e) {
    if (state === 'intro') {
      // Comprobar si el click fue en el botón Jugar
      const rect = canvas.getBoundingClientRect();
      const cx = (e.clientX - rect.left) * (W / rect.width);
      const cy = (e.clientY - rect.top) * (H / rect.height);
      if (cx >= W / 2 - 100 && cx <= W / 2 + 100 && cy >= 410 && cy <= 460) {
        state = 'playing';
        game.reset(false);
      }
      return;
    }
    if (state === 'gameOver') {
      const rect = canvas.getBoundingClientRect();
      const cx = (e.clientX - rect.left) * (W / rect.width);
      const cy = (e.clientY - rect.top) * (H / rect.height);
      if (cx >= W / 2 - 110 && cx <= W / 2 + 110 && cy >= 320 && cy <= 370) {
        game.reset(false);
      }
    }
  }

  // Attach keydown to document so keyboard events work regardless of focus
  document.addEventListener('keydown', onKeyDown);
  canvas.addEventListener('click', onClick);
  canvas.focus();
  animId = requestAnimationFrame(loop);

  // ── Limpieza al cambiar de juego ────────────────────────────────────────────
  return function cleanup() {
    cancelAnimationFrame(animId);
    document.removeEventListener('keydown', onKeyDown);
    canvas.removeEventListener('click', onClick);
  };
}
