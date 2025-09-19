function registerGame(){
  const canvas = document.getElementById('gameCanvas');
  return initAhorcado(canvas);
}
function initAhorcado(canvas){
  const ctx = canvas.getContext('2d');
  const ui = window.GameUI;
  const palabras = [
    'GALAXIA','NEBULOSA','ASTEROIDE','COMETA','SATELITE','PLANETA','ORION','METEORO','CUASAR','GRAVEDAD',
    'LUNA','SOL','VENUS','MARTE','URANO','PLUTON','ECLIPSE','ROVER','PROTON','ATOMO'
  ];
  let secreta = '', mostrada = [], usadas = new Set();
  let vidas = 7, score = 0, high = +(localStorage.getItem('ahorcadoHigh') || 0);
  let highName = localStorage.getItem('ahorcadoHighName') || '';
  let playerName = localStorage.getItem('playerName') || 'Jugador';
  let intro = true, ended = false;
  let particles = [];
  
  // Efecto de partículas para astronauta
  function createParticles(x, y, count) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 4 + 1,
        color: `hsla(${260 + Math.random() * 30}, 80%, 70%, ${Math.random() * 0.5 + 0.3})`,
        life: Math.random() * 30 + 20
      });
    }
  }
  
  function updateParticles() {
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      p.size *= 0.97;
    });
  }
  
  function drawParticles() {
    particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  
  function nuevaPalabra(){
    secreta = palabras[Math.floor(Math.random() * palabras.length)];
    mostrada = Array(secreta.length).fill('_');
    usadas.clear();
    vidas = 7;
    ended = false;
  }
  
  function start(){ 
    intro = false; 
    score = 0; 
    nuevaPalabra(); 
    // Efecto de inicio
    createParticles(canvas.width / 2, canvas.height / 2, 30);
  }
  
  function dibujaNave(){
    ctx.save();
    ctx.translate(120, 300);
    const fails = 7 - vidas;
    
    // Efecto de luz de fondo espacial
    const gradient = ctx.createRadialGradient(60, 15, 10, 60, 15, 120);
    gradient.addColorStop(0, 'rgba(128, 0, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(128, 0, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(60, 15, 120, 0, Math.PI * 2);
    ctx.fill();
    
    // Estilo mejorado
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Base
    ctx.beginPath(); 
    ctx.moveTo(-40, 80); 
    ctx.lineTo(40, 80); 
    ctx.stroke();
    
    // Torre
    if(fails > 0){ 
      ctx.beginPath(); 
      ctx.moveTo(0, 80); 
      ctx.lineTo(0, -20); 
      ctx.stroke(); 
    }
    
    // Brazo
    if(fails > 1){ 
      ctx.beginPath(); 
      ctx.moveTo(0, -20); 
      ctx.lineTo(60, -20); 
      ctx.stroke(); 
    }
    
    // Cuerda
    if(fails > 2){ 
      ctx.beginPath(); 
      ctx.moveTo(60, -20); 
      ctx.lineTo(60, 0); 
      ctx.stroke(); 
    }
    
    // Cabeza casco
    if(fails > 3){ 
      // Casco con efecto de brillo
      ctx.beginPath(); 
      ctx.arc(60, 15, 15, 0, Math.PI * 2); 
      ctx.stroke();
      
      // Visor del casco
      ctx.fillStyle = 'rgba(130, 200, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(60, 15, 10, 0, Math.PI, true);
      ctx.fill();
      
      // Agregar partículas alrededor del casco
      if (Math.random() > 0.85) {
        createParticles(60 + 120, 15 + 300, 1);
      }
    }
    
    // Cuerpo
    if(fails > 4){ 
      ctx.beginPath(); 
      ctx.moveTo(60, 30); 
      ctx.lineTo(60, 60); 
      ctx.stroke(); 
    }
    
    // Brazos
    if(fails > 5){ 
      ctx.beginPath(); 
      ctx.moveTo(60, 38); 
      ctx.lineTo(40, 50); 
      ctx.moveTo(60, 38); 
      ctx.lineTo(80, 50); 
      ctx.stroke(); 
    }
    
    // Piernas
    if(fails > 6){ 
      ctx.beginPath(); 
      ctx.moveTo(60, 60); 
      ctx.lineTo(45, 85); 
      ctx.moveTo(60, 60); 
      ctx.lineTo(75, 85); 
      ctx.stroke(); 
      
      // Mucho más partículas cuando está completo
      if (Math.random() > 0.7) {
        createParticles(60 + 120, 30 + 300, 2);
      }
    }
    
    ctx.restore();
  }
  
  function guess(letter){
    if(intro || ended) return;
    
    letter = letter.toUpperCase();
    if(!/^[A-ZÑ]$/.test(letter)) return;
    if(usadas.has(letter)) return;
    
    usadas.add(letter);
    
    if(secreta.includes(letter)){
      // Efecto de acierto
      createParticles(canvas.width / 2, 140, 10);
      
      for(let i = 0; i < secreta.length; i++){
        if(secreta[i] === letter) mostrada[i] = letter;
      }
      
      if(!mostrada.includes('_')){
        score += 50;
        nuevaPalabra();
        // Efecto de palabra completada
        createParticles(canvas.width / 2, canvas.height / 2, 50);
      }
    } else {
      vidas--;
      // Efecto de fallo
      createParticles(120, 300, 5);
      
      if(vidas <= 0){
        ended = true;
        // Efecto de fin
        createParticles(canvas.width / 2, 220, 30);
        
        if(score > high){
          high = score;
          highName = playerName;
          localStorage.setItem('ahorcadoHigh', high);
          localStorage.setItem('ahorcadoHighName', highName);
          // Efecto de récord
          createParticles(canvas.width / 2, 250, 50);
        }
      }
    }
  }
  
  function drawStarryBackground() {
    // Estrellas estáticas
    for (let i = 0; i < 100; i++) {
      const x = Math.floor(Math.random() * canvas.width);
      const y = Math.floor(Math.random() * canvas.height);
      const size = Math.random() * 1.5;
      const opacity = Math.random() * 0.8 + 0.2;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Nebulosa lejana
    const nebulaGradient = ctx.createRadialGradient(
      canvas.width * 0.8, canvas.height * 0.2, 10,
      canvas.width * 0.8, canvas.height * 0.2, 300
    );
    nebulaGradient.addColorStop(0, 'rgba(150, 100, 255, 0.1)');
    nebulaGradient.addColorStop(0.5, 'rgba(100, 50, 200, 0.05)');
    nebulaGradient.addColorStop(1, 'rgba(50, 0, 100, 0)');
    
    ctx.fillStyle = nebulaGradient;
    ctx.beginPath();
    ctx.arc(canvas.width * 0.8, canvas.height * 0.2, 300, 0, Math.PI * 2);
    ctx.fill();
  }
  
  function draw(){
    // Actualizar partículas
    updateParticles();
    
    // Fondo y cabecera: usar GameUI si existe, si no, estilos básicos
    if(window.GameUI && ui){
      ui.softBg(ctx, canvas, '#4a148c');
      
      // Añadir estrellas sobre el fondo
      drawStarryBackground();
      
      ui.gradientBar(ctx, canvas, {from:'#6a1b9a', to:'#4a148c'});
      ui.shadowText(ctx, 'Ahorcado Espacial', 20, 34, {size:24});
    } else {
      // Fondo espacial mejorado sin GameUI
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, '#4a148c');
      bgGradient.addColorStop(1, '#311b92');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Añadir estrellas
      drawStarryBackground();
      
      // Barra de título
      const barGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      barGradient.addColorStop(0, '#6a1b9a');
      barGradient.addColorStop(1, '#4a148c');
      ctx.fillStyle = barGradient;
      ctx.fillRect(0, 0, canvas.width, 50);
      
      // Título con sombra
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetY = 2;
      ctx.fillText('Ahorcado Espacial', canvas.width/2, 38);
      ctx.shadowColor = 'transparent';
      ctx.textAlign = 'left';
    }
    
    // Información del juego
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('Score: ' + score, 20, 60);
    ctx.fillText('Récord: ' + high + (highName ? ' (' + highName + ')' : ''), 20, 78);
    
    if(intro){
      if(window.GameUI && ui){
        ui.glassPanel(ctx, canvas.width/2 - 240, 110, 480, 260);
      } else {
        // Panel de vidrio mejorado
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = 'rgba(80, 40, 170, 0.4)';
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(canvas.width/2 - 240, 110, 480, 260, 16);
          ctx.fill();
        } else {
          ctx.fillRect(canvas.width/2 - 240, 110, 480, 260);
        }
        ctx.globalAlpha = 1;
        
        // Borde brillante
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(canvas.width/2 - 240, 110, 480, 260, 16);
          ctx.stroke();
        } else {
          ctx.strokeRect(canvas.width/2 - 240, 110, 480, 260);
        }
      }
      
      // Contenido de instrucciones mejorado
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 22px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Instrucciones', canvas.width/2, 140);
      
      ctx.font = '16px Arial';
      const lines = [
        'Adivina la palabra espacial letra a letra.',
        'Pulsa letras (teclado) o usa los botones inferiores.',
        '7 fallos → fin de la ronda.',
        'Cada palabra acertada = +50 puntos.',
        'Consejo: máximo 10 min y descansa la vista.',
        'Pulsa ESPACIO para comenzar.'
      ];
      
      // Texto con mejor contraste
      ctx.shadowColor = 'rgba(0,0,0,0.7)';
      ctx.shadowBlur = 3;
      lines.forEach((l, i) => ctx.fillText(l, canvas.width/2, 180 + i * 24));
      ctx.shadowColor = 'transparent';
      
      // Efecto pulsante en la última línea
      const pulse = Math.sin(Date.now() / 300) * 0.1 + 0.9;
      ctx.globalAlpha = pulse;
      ctx.fillStyle = '#7cf';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('Pulsa ESPACIO para comenzar', canvas.width/2, 350);
      ctx.globalAlpha = 1;
      
      ctx.textAlign = 'left';
      
      // Dibujar partículas para efecto visual
      drawParticles();
      
      return;
    }
    
    // Dibujar juego en progreso
    dibujaNave();
    
    // Palabra a adivinar
    ctx.font = '36px Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    
    // Efecto de sombra para la palabra
    ctx.shadowColor = 'rgba(100, 120, 255, 0.7)';
    ctx.shadowBlur = 8;
    ctx.fillText(mostrada.join(' '), canvas.width/2, 140);
    ctx.shadowColor = 'transparent';
    
    // Letras usadas
    ctx.font = '16px Arial';
    ctx.fillText('Letras usadas: ' + [...usadas].join(' '), canvas.width/2, 180);
    
    if(ended){
      // Panel de fin de juego
      ctx.fillStyle = 'rgba(60, 20, 120, 0.7)';
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(canvas.width/2 - 200, 200, 400, 100, 12);
        ctx.fill();
      } else {
        ctx.fillRect(canvas.width/2 - 200, 200, 400, 100);
      }
      
      // Mensaje de fin
      ctx.font = '22px Arial';
      ctx.fillStyle = '#fff';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.fillText('FIN - Palabra: ' + secreta, canvas.width/2, 230);
      
      ctx.font = '16px Arial';
      if(score === high) {
        // Efecto de nuevo récord
        ctx.fillStyle = '#ffeb3b';
        const glow = Math.sin(Date.now() / 200) * 0.2 + 0.8;
        ctx.shadowColor = `rgba(255, 220, 50, ${glow})`;
        ctx.shadowBlur = 10;
        ctx.fillText('¡Nuevo récord!', canvas.width/2, 260);
      }
      
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 3;
      ctx.fillStyle = '#fff';
      ctx.fillText('Pulsa ESPACIO para reiniciar', canvas.width/2, 285);
      ctx.shadowColor = 'transparent';
    }
    
    // Teclado visual mejorado
    const rows = ['ABCDEFGHIJKLM', 'NOPQRSTUVWXYZ'];
    rows.forEach((row, ri) => {
      [...row].forEach((ch, ci) => {
        const w = 30, h = 34;
        const totalRowWidth = row.length * (w + 6);
        const startX = canvas.width/2 - totalRowWidth/2;
        const x = startX + ci * (w + 6);
        const y = 320 + ri * (h + 8);
        
        // Botones con efecto de cristal
        if (usadas.has(ch)) {
          // Letras ya usadas
          ctx.fillStyle = secreta.includes(ch) ? 
            'rgba(100, 255, 120, 0.25)' : 'rgba(255, 80, 80, 0.25)';
        } else {
          // Letras disponibles con efecto hover simulado
          const hoverEffect = (Math.sin(Date.now() / 1000 + ci * 0.2 + ri * 0.5) + 1) * 0.1;
          ctx.fillStyle = `rgba(255, 255, 255, ${0.25 + hoverEffect})`;
        }
        
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(x, y, w, h, 8);
          ctx.fill();
        } else {
          ctx.fillRect(x, y, w, h);
        }
        
        // Borde con brillo
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(x, y, w, h, 8);
          ctx.stroke();
        } else {
          ctx.strokeRect(x, y, w, h);
        }
        
        // Texto de la letra
        ctx.fillStyle = usadas.has(ch) ? 
          (secreta.includes(ch) ? '#8cff9b' : '#ff9e9e') : '#fff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(ch, x + w/2, y + 22);
      });
    });
    
    ctx.textAlign = 'left';
    
    // Dibujar partículas sobre todo
    drawParticles();
  }

  function key(e){
    if(intro && e.key === ' '){ start(); return; }
    if(ended && e.key === ' '){ start(); return; }
    if(/^[a-zA-ZñÑ]$/.test(e.key)) guess(e.key);
  }
  
  function click(e){
    if(intro) {
      start();
      return;
    }
    
    if(ended) {
      start();
      return;
    }
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const rows = ['ABCDEFGHIJKLM', 'NOPQRSTUVWXYZ'];
    rows.forEach((row, ri) => {
      [...row].forEach((ch, ci) => {
        const w = 30, h = 34;
        const totalRowWidth = row.length * (w + 6);
        const startX = canvas.width/2 - totalRowWidth/2;
        const bx = startX + ci * (w + 6);
        const by = 320 + ri * (h + 8);
        
        if(x >= bx && x <= bx + w && y >= by && y <= by + h){
          guess(ch);
        }
      });
    });
  }

  const keyListener = e => key(e);
  const clickListener = e => click(e);
  window.addEventListener('keydown', keyListener);
  canvas.addEventListener('click', clickListener);

  function loop(){
    draw();
    requestAnimationFrame(loop);
  }
  loop();
  
  // Devolver función de limpieza
  return function cleanup(){
    window.removeEventListener('keydown', keyListener);
    canvas.removeEventListener('click', clickListener);
  };
}
window.registerGame=registerGame;