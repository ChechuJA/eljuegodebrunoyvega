// Utilidades gráficas comunes para los juegos
// Disponibles en window.GameUI
(function(){
  function gradientBar(ctx, w, h, c1='#0d47a1', c2='#1976d2'){
    const g=ctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0,c1); g.addColorStop(1,c2);
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    ctx.fillStyle='rgba(255,255,255,0.08)';
    ctx.fillRect(0,0,w,h*0.55);
  }
  function softBg(ctx,w,h,colors=['#eef3f7','#f5f9fc']){
    const g=ctx.createLinearGradient(0,0,w,h);
    g.addColorStop(0,colors[0]); g.addColorStop(1,colors[1]);
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
  }
  function glassPanel(ctx,x,y,w,h,r=16){
    ctx.save();
    ctx.globalAlpha=0.85; ctx.fillStyle='rgba(255,255,255,0.55)';
    roundRect(ctx,x,y,w,h,r); ctx.fill();
    ctx.globalAlpha=1; ctx.strokeStyle='rgba(255,255,255,0.9)'; ctx.lineWidth=2; ctx.stroke();
    ctx.restore();
  }
  function shadowedText(ctx, text, x, y, color='#fff', shadow='rgba(0,0,0,0.5)'){ ctx.save(); ctx.fillStyle=shadow; ctx.fillText(text,x+2,y+2); ctx.fillStyle=color; ctx.fillText(text,x,y); ctx.restore(); }
  function outlineText(ctx, text, x,y, fill='#fff', stroke='#000', lw=3){ ctx.save(); ctx.lineWidth=lw; ctx.strokeStyle=stroke; ctx.strokeText(text,x,y); ctx.fillStyle=fill; ctx.fillText(text,x,y); ctx.restore(); }
  function roundRect(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath(); }
  
  /**
   * Dibuja un panel de instrucciones con fondo oscuro, título y líneas de texto
   * @param {CanvasRenderingContext2D} ctx - Contexto de canvas
   * @param {string} title - Título del panel (nombre del juego)
   * @param {string[]} lines - Array de líneas de instrucciones
   * @param {Object} options - Opciones adicionales
   * @param {number} [options.panelX=40] - Posición X del panel
   * @param {number} [options.panelY=50] - Posición Y del panel
   * @param {number} [options.panelW] - Ancho del panel (por defecto canvas.width - 80)
   * @param {number} [options.panelH] - Alto del panel (calculado automáticamente si no se proporciona)
   * @param {string} [options.titleColor='#4fc3f7'] - Color del título
   * @param {string} [options.textColor='#ffffff'] - Color del texto
   * @param {string} [options.bgColor='rgba(15,25,40,0.92)'] - Color de fondo del panel
   */
  function drawInstructionPanel(ctx, title, lines, options = {}) {
    const canvasW = ctx.canvas.width;
    const canvasH = ctx.canvas.height;
    
    const panelX = options.panelX || 40;
    const panelY = options.panelY || 50;
    const panelW = options.panelW || (canvasW - 80);
    const lineHeight = 23;
    const titleHeight = 42;
    const topMargin = 30;
    const bottomMargin = 20;
    const panelH = options.panelH || (topMargin + titleHeight + lines.length * lineHeight + bottomMargin);
    
    const titleColor = options.titleColor || '#4fc3f7';
    const textColor = options.textColor || '#ffffff';
    const bgColor = options.bgColor || 'rgba(15,25,40,0.92)';
    
    // Fondo oscuro semi-transparente con borde
    ctx.save();
    ctx.fillStyle = bgColor;
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 2;
    
    // Usar roundRect si está disponible, sino el polyfill
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(panelX, panelY, panelW, panelH, 16);
      ctx.fill();
      ctx.stroke();
    } else {
      roundRect(ctx, panelX, panelY, panelW, panelH, 16);
      ctx.fill();
      ctx.stroke();
    }
    
    // Título
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = titleColor;
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 8;
    ctx.fillText(title, canvasW/2, panelY + topMargin + 10);
    
    // Texto instrucciones
    ctx.shadowBlur = 0;
    ctx.font = '15px Arial';
    ctx.fillStyle = textColor;
    let y = panelY + topMargin + titleHeight;
    
    for (const line of lines) {
      ctx.fillText(line, canvasW/2, y);
      y += lineHeight;
    }
    
    ctx.restore();
  }
  
  // Arte vectorial original. Se invoca explícitamente desde cada juego:
  // no altera Canvas, entrada, estado ni temporizadores. Caché limitada por juego.
  const sceneThemes = {
    '4enraya': ['table', '#193c70', '#277dc0', '#ffd166'],
    'ahorcado': ['space', '#100f38', '#482366', '#ffa9da'],
    'aire-limpio': ['town', '#b9edff', '#e4f6df', '#297e86'],
    'ajedrez': ['table', '#ecd8b7', '#bd8d60', '#714d34'],
    'alcala-canas-tapas': ['town', '#ffedca', '#e9b282', '#bb644b'],
    'alonso-noel': ['snow', '#142d59', '#759abd', '#ffcf77'],
    'arkanoid': ['space', '#101c48', '#44317b', '#64e9ff'],
    'atrapa-bola': ['sport', '#17385e', '#93572f', '#ffb759'],
    'bloques': ['crystal', '#17152f', '#342b62', '#73e6db'],
    'bosque-verde': ['forest', '#a8dded', '#c4dfac', '#367650'],
    'bubble': ['water', '#183a70', '#427db0', '#bba4ff'],
    'canaveras': ['reeds', '#b3e8ec', '#b5d399', '#458b68'],
    'carrera': ['race', '#5b9e62', '#bedb8b', '#f9d56e'],
    'constelaciones': ['space', '#080f30', '#27295b', '#b4c8ff'],
    'energia-sabia': ['energy', '#9cdef6', '#d2ecc0', '#467d60'],
    'flappy': ['sky', '#69bade', '#d4f6e5', '#43876c'],
    'futbol': ['sport', '#102f56', '#258443', '#ffe66d'],
    'geometria-espacio': ['crystal', '#171a4d', '#474788', '#74e7ff'],
    'huerto': ['garden', '#d0efd7', '#f2e7bd', '#65a660'],
    'juego-habilidad': ['sky', '#85d4ed', '#e0edbc', '#db9a5c'],
    'laberinto': ['maze', '#e6eedf', '#bed8b5', '#69907c'],
    'mario-flappy': ['hills', '#a6d9f4', '#e0f2c6', '#4b996c'],
    'math-catcher': ['numbers', '#ebf4ff', '#dfdcf5', '#7c79b6'],
    'mecanografia': ['keyboard', '#e0f2ff', '#efdefa', '#8e81b4'],
    'memoria': ['animals', '#fff1cb', '#ccebdc', '#a67a59'],
    'moto-desierto': ['desert', '#3d367a', '#f5bc7b', '#b96c57'],
    'nave-exploradora': ['space', '#071b31', '#213a67', '#66e4d7'],
    'paracaidista': ['sky', '#64b9e1', '#dcf5ff', '#5d9cba'],
    'ping-pong': ['sport', '#123b4c', '#206957', '#7ff2c2'],
    'planeta-azul': ['water', '#65c9e6', '#064f88', '#8fdfc5'],
    'quiz': ['numbers', '#174c53', '#25354f', '#b8d2dc'],
    'recoge-moras': ['berries', '#d3efd9', '#accd8e', '#7961a1'],
    'salva-costa': ['coast', '#9edfec', '#2981ac', '#f2d394'],
    'serpiente': ['garden', '#d9efb5', '#b6d79e', '#679b50'],
    'sokoban': ['warehouse', '#e6dac3', '#baa186', '#94765b'],
    'sonseca-camino': ['thread', '#f3e7d4', '#d8bfa2', '#aa6464'],
    'teclado-rapido': ['keyboard', '#e5f4fc', '#bfe4dc', '#5e9ba2'],
    'uno': ['table', '#194b43', '#318071', '#f6d88c'],
    'vega-bailarina': ['stage', '#3b2355', '#9f567d', '#ffdda3']
  };
  const sceneCache = new Map();
  function vehicle(ctx, x, y, w, h, kind = 'ship') {
    ctx.save(); ctx.translate(x, y); ctx.scale(w / 40, h / 60);
    if (kind === 'bike') {
      ctx.fillStyle = '#203444';
      ctx.beginPath(); ctx.roundRect(15, 0, 10, 15, 4); ctx.roundRect(14, 44, 12, 16, 4); ctx.fill();
      ctx.fillStyle = '#e76853'; ctx.beginPath(); ctx.roundRect(8, 14, 24, 35, 7); ctx.fill();
      ctx.strokeStyle = '#cadce6'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(2, 17); ctx.lineTo(38, 17); ctx.stroke();
      circle(ctx, 20, 27, 10, '#ffd36e');
      ctx.fillStyle = '#325375'; ctx.beginPath(); ctx.roundRect(12, 22, 16, 7, 3); ctx.fill();
      ctx.fillStyle = '#faffde'; ctx.fillRect(15, 8, 10, 5);
    } else {
      ctx.fillStyle = '#ffcb65'; ctx.beginPath();
      ctx.moveTo(14, 47); ctx.lineTo(20, 60); ctx.lineTo(26, 47); ctx.fill();
      ctx.fillStyle = '#3e648e'; ctx.beginPath();
      ctx.moveTo(20, 0); ctx.lineTo(40, 47); ctx.lineTo(0, 47); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#b5e9ef'; ctx.beginPath();
      ctx.moveTo(20, 2); ctx.lineTo(30, 45); ctx.lineTo(10, 45); ctx.closePath(); ctx.fill();
      circle(ctx, 20, 25, 7, '#31587c'); circle(ctx, 18, 23, 2, '#fff');
    }
    ctx.restore();
  }
  function explorer(ctx, x, y, w, h, color = '#258d9d') {
    ctx.save(); ctx.translate(x, y); ctx.scale(w / 40, h / 60);
    ctx.fillStyle = '#263d53';
    ctx.beginPath(); ctx.roundRect(8, 41, 9, 17, 3); ctx.roundRect(23, 41, 9, 17, 3); ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.roundRect(5, 23, 30, 25, 7); ctx.fill();
    ctx.fillStyle = '#ffd2a2';
    ctx.beginPath(); ctx.roundRect(8, 5, 24, 23, 9); ctx.fill();
    ctx.fillStyle = '#3f3542';
    ctx.beginPath(); ctx.roundRect(7, 2, 26, 10, 5); ctx.fill();
    circle(ctx, 15, 17, 2, '#243848'); circle(ctx, 25, 17, 2, '#243848');
    ctx.strokeStyle = '#a56254'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(20, 20, 4, 0, Math.PI); ctx.stroke();
    ctx.fillStyle = '#ffcd64'; ctx.beginPath();
    ctx.moveTo(6, 25); ctx.lineTo(32, 25); ctx.lineTo(23, 33); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f2fbff'; ctx.fillRect(10, 55, 8, 4); ctx.fillRect(23, 55, 10, 4);
    ctx.restore();
  }
  function circle(ctx, x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
  }
  function scenery(ctx, id) {
    const theme = sceneThemes[id];
    if (!theme) throw new Error('Falta tema gráfico: ' + id);
    const w = ctx.canvas.width, h = ctx.canvas.height;
    const key = id + ':' + w + ':' + h;
    if (!sceneCache.has(key)) {
      // Solo un tamaño por juego; una sesión larga no acumula resoluciones.
      for (const oldKey of sceneCache.keys()) {
        if (oldKey.startsWith(id + ':')) sceneCache.delete(oldKey);
      }
      // No retener los 39 fondos a la vez en dispositivos de poca memoria.
      if (sceneCache.size >= 4) sceneCache.delete(sceneCache.keys().next().value);
      const layer = document.createElement('canvas');
      layer.width = w; layer.height = h;
      const art = layer.getContext('2d');
      paintScene(art, w, h, theme, id);
      sceneCache.set(key, layer);
    }
    ctx.save();
    ctx.drawImage(sceneCache.get(key), 0, 0);
    ctx.restore();
  }
  function paintScene(ctx, w, h, [kind, sky, ground, accent], id) {
    softBg(ctx, w, h, [sky, ground]);
    ctx.save();
    ctx.scale(w / 800, h / 500);
    ctx.lineWidth = 2;
    if (kind === 'space' || kind === 'crystal') {
      for (let i = 0; i < 75; i++) {
        const x = (i * 137 + id.length * 17) % 800, y = (i * 83) % 500;
        circle(ctx, x, y, i % 9 ? 1 : 2, '#cde9ff');
      }
      if (kind === 'space') {
        circle(ctx, 705, 135, 49, accent);
        circle(ctx, 718, 125, 40, '#ffffff22');
        ctx.strokeStyle = '#ffffff88';
        ctx.beginPath(); ctx.ellipse(705, 135, 76, 17, -0.35, 0, Math.PI * 2); ctx.stroke();
        circle(ctx, 691, 116, 10, '#00000016');
        circle(ctx, 723, 150, 7, '#00000016');
      } else {
        ctx.strokeStyle = accent; ctx.globalAlpha = 0.3;
        for (let i = 0; i < 9; i++) {
          const x = 25 + i * 95, y = 380 + i % 3 * 30;
          ctx.beginPath(); ctx.moveTo(x, y - 45); ctx.lineTo(x + 24, y);
          ctx.lineTo(x, y + 32); ctx.lineTo(x - 24, y); ctx.closePath(); ctx.stroke();
        }
      }
    } else if (['sky', 'hills', 'forest', 'garden', 'berries', 'reeds', 'snow', 'desert', 'energy', 'town'].includes(kind)) {
      circle(ctx, 690, 104, 35, kind === 'snow' ? '#fff5cc' : '#ffeab0');
      if (kind !== 'desert') {
        for (let i = 0; i < 5; i++) {
          const x = 45 + i * 174, y = 90 + (i % 3) * 39;
          circle(ctx, x, y, 18, '#ffffff77');
          circle(ctx, x + 20, y - 8, 24, '#ffffff77');
          circle(ctx, x + 42, y, 17, '#ffffff77');
        }
      }
      ctx.fillStyle = accent; ctx.globalAlpha = 0.2;
      ctx.beginPath(); ctx.moveTo(0, 390);
      ctx.bezierCurveTo(170, 190, 250, 430, 410, 310);
      ctx.bezierCurveTo(560, 190, 680, 300, 800, 230);
      ctx.lineTo(800, 500); ctx.lineTo(0, 500); ctx.fill();
      ctx.globalAlpha = 1;
      if (kind === 'town') {
        // Fachadas de plaza castellana, sin imágenes ni marcas comerciales.
        for (let i = 0; i < 9; i++) {
          const x = i * 100 - 20, y = 300 + i % 3 * 18;
          ctx.fillStyle = ['#dcb498', '#edccaa', '#d5a589'][i % 3];
          ctx.fillRect(x, y, 88, 140);
          ctx.fillStyle = '#985f51'; ctx.fillRect(x - 4, y - 6, 96, 9);
          for (let col = 0; col < 3; col++) {
            ctx.fillStyle = '#566c78'; ctx.fillRect(x + 10 + col * 25, y + 23, 12, 21);
            ctx.fillStyle = '#fff1cf'; ctx.fillRect(x + 9 + col * 25, y + 44, 14, 3);
          }
          ctx.fillStyle = '#865d48'; ctx.beginPath();
          ctx.roundRect(x + 29, y + 72, 30, 65, [15, 15, 0, 0]); ctx.fill();
        }
      } else if (kind === 'desert') {
        ctx.fillStyle = '#d99462'; ctx.beginPath(); ctx.moveTo(0, 430);
        ctx.bezierCurveTo(170, 280, 320, 480, 500, 385);
        ctx.bezierCurveTo(600, 320, 740, 330, 800, 390);
        ctx.lineTo(800, 500); ctx.lineTo(0, 500); ctx.fill();
        for (const x of [36, 745]) {
          ctx.strokeStyle = '#457263'; ctx.lineWidth = 10; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(x, 455); ctx.lineTo(x, 354);
          ctx.moveTo(x, 400); ctx.lineTo(x - 15, 400); ctx.lineTo(x - 15, 376);
          ctx.moveTo(x, 414); ctx.lineTo(x + 16, 414); ctx.lineTo(x + 16, 390); ctx.stroke();
        }
        ctx.fillStyle = '#414859'; ctx.beginPath();
        ctx.moveTo(387, 260); ctx.lineTo(413, 260);
        ctx.lineTo(550, 500); ctx.lineTo(250, 500); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#ffe5a0'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(387, 260); ctx.lineTo(250, 500);
        ctx.moveTo(413, 260); ctx.lineTo(550, 500); ctx.stroke();
        ctx.strokeStyle = '#f5f4e7';
        for (let i = 0; i < 7; i++) {
          const y = 273 + i * i * 5;
          ctx.lineWidth = 1 + i * 0.6;
          ctx.beginPath(); ctx.moveTo(400, y); ctx.lineTo(400, y + 3 + i * 2); ctx.stroke();
        }
      } else if (kind === 'energy') {
        for (const x of [60, 740]) {
          ctx.strokeStyle = '#faffff'; ctx.lineWidth = 5;
          ctx.beginPath(); ctx.moveTo(x, 420); ctx.lineTo(x, 270); ctx.stroke();
          for (let blade = 0; blade < 3; blade++) {
            const a = blade * Math.PI * 2 / 3;
            ctx.beginPath(); ctx.moveTo(x, 270);
            ctx.lineTo(x + Math.cos(a) * 48, 270 + Math.sin(a) * 48); ctx.stroke();
          }
          circle(ctx, x, 270, 7, '#6394a5');
        }
      } else if (kind === 'reeds') {
        for (let i = 0; i < 18; i++) {
          const x = i < 9 ? i * 7 : 742 + (i - 9) * 7;
          ctx.strokeStyle = '#648a51'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(x, 500); ctx.quadraticCurveTo(x + 13, 420, x, 343 + i % 4 * 13); ctx.stroke();
          ctx.fillStyle = '#876447'; ctx.fillRect(x - 3, 338 + i % 4 * 13, 6, 28);
        }
      } else {
        for (let i = 0; i < 12; i++) {
          const x = i * 77 - 20, y = 423 + (i % 3) * 28;
          ctx.fillStyle = '#887655'; ctx.fillRect(x - 3, y - 15, 6, 42);
          if (kind === 'snow' || kind === 'forest') {
            ctx.fillStyle = kind === 'snow' ? '#d6e8ed' : '#588d67';
            ctx.beginPath(); ctx.moveTo(x, y - 72); ctx.lineTo(x + 26, y + 4);
            ctx.lineTo(x - 26, y + 4); ctx.fill();
          } else {
            circle(ctx, x, y - 26, 22, accent);
            circle(ctx, x - 12, y - 17, 15, accent);
            if (kind === 'berries') {
              for (let b = 0; b < 5; b++) circle(ctx, x - 11 + b * 6, y - 18 - b % 2 * 7, 4, '#584477');
            }
          }
        }
      }
    } else if (kind === 'water' || kind === 'coast') {
      ctx.strokeStyle = '#b7f4ff55'; ctx.lineWidth = 3;
      for (let y = 95; y < 470; y += 42) {
        ctx.beginPath(); ctx.moveTo(0, y);
        for (let x = 0; x < 800; x += 80) ctx.quadraticCurveTo(x + 40, y - 13, x + 80, y);
        ctx.stroke();
      }
      ctx.fillStyle = kind === 'coast' ? '#f3d9a1' : '#477e8c';
      ctx.beginPath(); ctx.moveTo(0, 470);
      ctx.bezierCurveTo(200, 425, 480, 505, 800, 450);
      ctx.lineTo(800, 500); ctx.lineTo(0, 500); ctx.fill();
      for (const x of [20, 45, 751, 775]) {
        ctx.strokeStyle = accent; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(x, 493); ctx.bezierCurveTo(x - 20, 460, x + 20, 437, x, 404); ctx.stroke();
      }
    } else if (kind === 'stage') {
      ctx.fillStyle = '#502843'; ctx.fillRect(0, 425, 800, 75);
      ctx.strokeStyle = '#c19088'; ctx.lineWidth = 2;
      for (let x = -300; x < 1100; x += 100) {
        ctx.beginPath(); ctx.moveTo(400, 360); ctx.lineTo(x, 500); ctx.stroke();
      }
      for (const x of [0, 710]) {
        const curtain = ctx.createLinearGradient(x, 0, x + 90, 0);
        curtain.addColorStop(0, '#4d1847'); curtain.addColorStop(0.5, '#b85281'); curtain.addColorStop(1, '#4d1847');
        ctx.fillStyle = curtain; ctx.fillRect(x, 0, 90, 425);
      }
      ctx.fillStyle = '#fff1c51a';
      for (const x of [170, 630]) {
        ctx.beginPath(); ctx.moveTo(x, 30); ctx.lineTo(x - 110, 425); ctx.lineTo(x + 110, 425); ctx.fill();
      }
    } else if (kind === 'race' || kind === 'sport') {
      for (let row = 0; row < 7; row++) {
        for (let seat = 0; seat < 7; seat++) {
          for (const edge of [0, 732]) {
            const x = edge + seat * 10, y = 90 + row * 53;
            circle(ctx, x, y, 3, ['#ffe2b7', '#c98c61', '#f0bd95'][seat % 3]);
            ctx.fillStyle = seat % 2 ? accent : '#f2f4ff'; ctx.fillRect(x - 3, y + 4, 6, 8);
          }
        }
      }
      ctx.strokeStyle = '#ffffff33'; ctx.lineWidth = 3;
      ctx.strokeRect(90, 70, 620, 400);
      if (kind === 'sport') {
        ctx.beginPath(); ctx.arc(400, 270, 72, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(90, 270); ctx.lineTo(710, 270); ctx.stroke();
      }
    } else {
      // Mesas, cuadernos y talleres: textura discréta y motivos propios.
      ctx.strokeStyle = accent + '33'; ctx.lineWidth = 1;
      for (let y = 75; y < 500; y += 28) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(800, y); ctx.stroke();
      }
      if (kind === 'warehouse' || kind === 'table') {
        for (let x = 0; x < 800; x += 100) {
          ctx.beginPath(); ctx.moveTo(x, 60); ctx.lineTo(x, 500); ctx.stroke();
        }
        if (kind === 'maze') {
          ctx.strokeStyle = accent + '55'; ctx.lineWidth = 3;
          for (const x of [9, 751]) {
            ctx.beginPath(); ctx.moveTo(x, 100); ctx.lineTo(x + 35, 100);
            ctx.lineTo(x + 35, 420); ctx.lineTo(x + 12, 420);
            ctx.lineTo(x + 12, 135); ctx.lineTo(x + 23, 135); ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 0.38;
      for (let i = 0; i < 10; i++) {
        const x = i % 2 ? 754 : 18, y = 110 + Math.floor(i / 2) * 76;
        ctx.strokeStyle = accent; ctx.fillStyle = accent;
        if (kind === 'thread') {
          ctx.setLineDash([4, 5]); ctx.strokeRect(x, y, 28, 42); ctx.setLineDash([]);
          circle(ctx, x + 14, y + 21, 6, accent);
        } else if (kind === 'animals') {
          circle(ctx, x + 10, y + 14, 10, accent);
          circle(ctx, x + 1, y + 2, 5, accent); circle(ctx, x + 19, y + 2, 5, accent);
          circle(ctx, x + 6, y + 12, 2, '#fff'); circle(ctx, x + 14, y + 12, 2, '#fff');
        } else if (kind === 'numbers') {
          ctx.font = 'bold 25px monospace'; ctx.fillText(['+', '7', '×', '?', '3'][i % 5], x, y + 25);
        } else {
          ctx.beginPath(); ctx.roundRect(x, y, 28, 28, 5); ctx.stroke();
          ctx.font = 'bold 14px monospace'; ctx.fillText(kind === 'keyboard' ? ['A', 'S', 'D', 'F', 'J'][i % 5] : '◆', x + 7, y + 19);
        }
      }
    }
    ctx.restore();
  }

  window.GameUI = {
    vehicle,
    explorer,
    scenery,
    sceneThemes,
    gradientBar, 
    softBg, 
    glassPanel, 
    shadowedText, 
    outlineText, 
    roundRect,
    drawInstructionPanel
  };
})();

function handleClick(e) {
  const coords = window.GameUtils.getCanvasCoords(e, canvas);
  const x = coords.x; // coordenada X lógica (en espacio 800x500)
  const y = coords.y; // coordenada Y lógica (en espacio 800x500)
  // usar x,y para la lógica del juego
}