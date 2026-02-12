function registerGame() {
// ============================================
// JUEGO EDUCATIVO: CLASIFICA LA BASURA ♻️
// ============================================
// Aprende a reciclar correctamente según normativa española
// Drag & drop de residuos a contenedores
// 3 niveles de dificultad con tiempo limitado

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600;

// ============================================
// DEFINICIONES DE CONTENEDORES
// ============================================
const CONTENEDORES = {
  AMARILLO: {
    name: 'Amarillo',
    emoji: '🟨',
    color: '#FFD700',
    accepts: ['botella_plastico', 'lata', 'brick', 'bolsa_plastico', 'envase_yogur'],
    description: 'Envases de plástico, latas y bricks'
  },
  AZUL: {
    name: 'Azul',
    emoji: '🟦',
    color: '#4169E1',
    accepts: ['periodico', 'carton', 'caja', 'revista', 'cuaderno'],
    description: 'Papel y cartón'
  },
  VERDE: {
    name: 'Verde',
    emoji: '🟩',
    color: '#228B22',
    accepts: ['botella_vidrio', 'tarro_vidrio', 'frasco'],
    description: 'Vidrio (botellas y tarros)'
  },
  MARRON: {
    name: 'Marrón',
    emoji: '🟫',
    color: '#8B4513',
    accepts: ['cascara_platano', 'manzana', 'pan_duro', 'huesos', 'resto_comida'],
    description: 'Orgánico (restos de comida)'
  },
  GRIS: {
    name: 'Gris',
    emoji: '⬜',
    color: '#808080',
    accepts: ['juguete_roto', 'ceramica', 'colilla', 'chicle'],
    description: 'Resto (no reciclable)'
  },
  ESPECIAL: {
    name: 'Punto Limpio',
    emoji: '🔴',
    color: '#DC143C',
    accepts: ['pila', 'bombilla', 'movil', 'aceite'],
    description: 'Residuos peligrosos'
  }
};

// ============================================
// DEFINICIONES DE RESIDUOS
// ============================================
const RESIDUOS = [
  // Amarillo (envases)
  { id: 'botella_plastico', name: 'Botella plástico', emoji: '🧃', contenedor: 'AMARILLO' },
  { id: 'lata', name: 'Lata refresco', emoji: '🥫', contenedor: 'AMARILLO' },
  { id: 'brick', name: 'Brick leche', emoji: '📦', contenedor: 'AMARILLO' },
  { id: 'bolsa_plastico', name: 'Bolsa plástico', emoji: '🛍️', contenedor: 'AMARILLO' },
  { id: 'envase_yogur', name: 'Envase yogur', emoji: '🥛', contenedor: 'AMARILLO' },
  
  // Azul (papel)
  { id: 'periodico', name: 'Periódico', emoji: '📰', contenedor: 'AZUL' },
  { id: 'carton', name: 'Caja cartón', emoji: '📦', contenedor: 'AZUL' },
  { id: 'revista', name: 'Revista', emoji: '📕', contenedor: 'AZUL' },
  { id: 'cuaderno', name: 'Cuaderno', emoji: '📓', contenedor: 'AZUL' },
  { id: 'caja', name: 'Caja cereales', emoji: '📦', contenedor: 'AZUL' },
  
  // Verde (vidrio)
  { id: 'botella_vidrio', name: 'Botella vidrio', emoji: '🍾', contenedor: 'VERDE' },
  { id: 'tarro_vidrio', name: 'Tarro mermelada', emoji: '🫙', contenedor: 'VERDE' },
  { id: 'frasco', name: 'Frasco perfume', emoji: '🧴', contenedor: 'VERDE' },
  
  // Marrón (orgánico)
  { id: 'cascara_platano', name: 'Cáscara plátano', emoji: '🍌', contenedor: 'MARRON' },
  { id: 'manzana', name: 'Manzana mordida', emoji: '🍎', contenedor: 'MARRON' },
  { id: 'pan_duro', name: 'Pan duro', emoji: '🍞', contenedor: 'MARRON' },
  { id: 'huesos', name: 'Huesos pollo', emoji: '🍗', contenedor: 'MARRON' },
  { id: 'resto_comida', name: 'Restos comida', emoji: '🥗', contenedor: 'MARRON' },
  
  // Gris (resto)
  { id: 'juguete_roto', name: 'Juguete roto', emoji: '🧸', contenedor: 'GRIS' },
  { id: 'ceramica', name: 'Taza rota', emoji: '☕', contenedor: 'GRIS' },
  { id: 'colilla', name: 'Colilla', emoji: '🚬', contenedor: 'GRIS' },
  { id: 'chicle', name: 'Chicle', emoji: '🍬', contenedor: 'GRIS' },
  
  // Especiales
  { id: 'pila', name: 'Pila gastada', emoji: '🔋', contenedor: 'ESPECIAL' },
  { id: 'bombilla', name: 'Bombilla', emoji: '💡', contenedor: 'ESPECIAL' },
  { id: 'movil', name: 'Móvil viejo', emoji: '📱', contenedor: 'ESPECIAL' },
  { id: 'aceite', name: 'Aceite usado', emoji: '🛢️', contenedor: 'ESPECIAL' }
];

// ============================================
// NIVELES
// ============================================
const NIVELES = [
  {
    name: 'Básico',
    contenedores: ['AMARILLO', 'AZUL', 'MARRON', 'GRIS'],
    numResiduos: 10,
    tiempo: 60,
    description: 'Separa envases, papel, orgánico y resto',
    education: `
🟨 CONTENEDOR AMARILLO
- Envases de plástico (botellas, tarrinas)
- Latas de bebidas y conservas
- Bricks de leche/zumo
¡NO tapas, tapones ni tetrabricks sucios!

🟦 CONTENEDOR AZUL
- Papel y cartón
- Periódicos y revistas
- Cajas de cartón (plegadas)
¡NO papel sucio o manchado de grasa!

🟫 CONTENEDOR MARRÓN
- Restos de comida
- Cáscaras de fruta
- Posos de café
¡Solo orgánico biodegradable!

⬜ CONTENEDOR GRIS
- Todo lo que no se puede reciclar
- Cerámica, juguetes rotos
- Colillas, chicles
    `
  },
  {
    name: 'Medio',
    contenedores: ['AMARILLO', 'AZUL', 'VERDE', 'MARRON', 'GRIS'],
    numResiduos: 15,
    tiempo: 50,
    description: 'Añadimos el contenedor VERDE para vidrio',
    education: `
🟩 CONTENEDOR VERDE (VIDRIO)
- Botellas de vidrio
- Tarros y frascos
- Sin tapas ni tapones

⚠️ IMPORTANTE:
El vidrio NO va con el plástico
Las bombillas NO van al vidrio (son residuo especial)

♻️ El vidrio es 100% reciclable infinitas veces
    `
  },
  {
    name: 'Avanzado',
    contenedores: ['AMARILLO', 'AZUL', 'VERDE', 'MARRON', 'GRIS', 'ESPECIAL'],
    numResiduos: 20,
    tiempo: 45,
    description: 'Nivel completo + residuos peligrosos',
    education: `
🔴 PUNTO LIMPIO (Residuos Especiales)
¡NUNCA tires a la basura normal!

🔋 Pilas y baterías → Contienen metales pesados
💡 Bombillas → Mercurio y gases peligrosos
📱 Electrónica → Componentes tóxicos reciclables
🛢️ Aceite usado → Contamina 1000 litros de agua

🚨 Estos residuos son PELIGROSOS para el medio ambiente
✅ Llévalos al Punto Limpio de tu ciudad

🌍 Reciclar correctamente salva el planeta
    `
  }
];

// ============================================
// ESTADO DEL JUEGO
// ============================================
let gameState = 'menu'; // 'menu', 'playing', 'resultado', 'education'
let currentLevel = 0;
let score = 0;
let errores = 0;
let racha = 0;
let mejorRacha = 0;
let tiempoRestante = 0;
let residuosActuales = [];
let contenedoresVisibles = [];
let residuoDragging = null;
let offsetX = 0, offsetY = 0;
let lastTime = Date.now();
let showingEducation = true;
let mensajeFeedback = null;
let feedbackTimer = 0;

let bestScore = Number(localStorage.getItem('reciclajeBest')) || 0;
let bestName = localStorage.getItem('reciclajeBestName') || 'Anónimo';

// ============================================
// UTILIDADES
// ============================================
function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

function isInsideRect(x, y, rx, ry, rw, rh) {
  return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh;
}

function shuffleArray(array) {
  const arr = [...array];
  for(let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let yPos = y;
  
  for(const word of words) {
    const testLine = line + word + ' ';
    const metrics = ctx.measureText(testLine);
    
    if(metrics.width > maxWidth && line !== '') {
      ctx.fillText(line, x, yPos);
      line = word + ' ';
      yPos += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, yPos);
}

// ============================================
// INICIALIZACIÓN DE NIVEL
// ============================================
function initLevel(levelIndex) {
  currentLevel = levelIndex;
  const nivel = NIVELES[levelIndex];
  
  gameState = 'playing';
  score = 0;
  errores = 0;
  racha = 0;
  mejorRacha = 0;
  tiempoRestante = nivel.tiempo;
  showingEducation = true;
  mensajeFeedback = null;
  
  // Contenedores del nivel
  contenedoresVisibles = nivel.contenedores;
  
  // Generar residuos aleatorios del nivel
  const residuosDisponibles = RESIDUOS.filter(r => 
    nivel.contenedores.includes(r.contenedor)
  );
  
  const shuffled = shuffleArray(residuosDisponibles);
  residuosActuales = shuffled.slice(0, nivel.numResiduos).map((r, i) => ({
    ...r,
    x: 100 + (i % 5) * 140,
    y: 400 + Math.floor(i / 5) * 80,
    dragging: false,
    completado: false
  }));
  
  lastTime = Date.now();
}

// ============================================
// DIBUJO: MENÚ PRINCIPAL
// ============================================
function drawMenu() {
  ctx.fillStyle = '#2e7d32';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Título
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('♻️ Clasifica la Basura', canvas.width/2, 80);
  
  ctx.font = '20px Arial';
  ctx.fillText('Aprende a reciclar correctamente', canvas.width/2, 120);
  
  // Info
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  roundRect(ctx, 100, 160, canvas.width - 200, 120, 12);
  ctx.fill();
  
  ctx.fillStyle = '#fff';
  ctx.font = '16px Arial';
  ctx.textAlign = 'left';
  const infoLines = [
    '🎯 Arrastra cada residuo al contenedor correcto',
    '⏱️ Contra reloj - ¡Sé rápido pero preciso!',
    '✅ +10 puntos por acierto, rachas dan bonus',
    '❌ -10 puntos por error',
    '🏆 Record actual: ' + bestScore + ' puntos'
  ];
  
  infoLines.forEach((line, i) => {
    ctx.fillText(line, 120, 195 + i * 25);
  });
  
  // Botones de niveles
  ctx.textAlign = 'center';
  const startY = 320;
  
  NIVELES.forEach((nivel, i) => {
    const y = startY + i * 80;
    
    // Fondo botón
    ctx.fillStyle = i === 0 ? '#4caf50' : i === 1 ? '#ff9800' : '#f44336';
    roundRect(ctx, canvas.width/2 - 200, y, 400, 60, 10);
    ctx.fill();
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Texto
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Nivel ${i + 1}: ${nivel.name}`, canvas.width/2, y + 25);
    
    ctx.font = '14px Arial';
    ctx.fillText(nivel.description, canvas.width/2, y + 48);
  });
  
  // Volver
  ctx.fillStyle = '#666';
  ctx.font = '16px Arial';
  ctx.fillText('← Volver al menú principal', canvas.width/2, 570);
}

// ============================================
// DIBUJO: PANTALLA DE JUEGO
// ============================================
function drawGame() {
  // Fondo degradado
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#87CEEB');
  gradient.addColorStop(1, '#E0F7FA');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Barra superior
  drawTopBar();
  
  // Contenedores
  drawContenedores();
  
  // Residuos
  drawResiduos();
  
  // Feedback
  if(mensajeFeedback) {
    drawFeedback();
  }
}

function drawTopBar() {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, canvas.width, 80);
  
  // Nivel
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`Nivel ${currentLevel + 1}: ${NIVELES[currentLevel].name}`, 20, 30);
  
  // Tiempo
  const minutos = Math.floor(tiempoRestante / 60);
  const segundos = Math.floor(tiempoRestante % 60);
  const tiempoStr = `${minutos}:${segundos.toString().padStart(2, '0')}`;
  
  ctx.font = 'bold 28px Arial';
  ctx.fillStyle = tiempoRestante < 10 ? '#ff1744' : '#fff';
  ctx.fillText(`⏱️ ${tiempoStr}`, 20, 65);
  
  // Score
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 24px Arial';
  ctx.fillText(`Score: ${score}`, canvas.width/2, 30);
  
  // Racha
  if(racha > 1) {
    ctx.fillStyle = '#ff6f00';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`🔥 Racha x${racha}`, canvas.width/2, 60);
  }
  
  // Errores
  ctx.textAlign = 'right';
  ctx.fillStyle = '#f44336';
  ctx.font = 'bold 20px Arial';
  ctx.fillText(`❌ Errores: ${errores}`, canvas.width - 20, 35);
  
  // Progreso
  const total = residuosActuales.length;
  const completados = residuosActuales.filter(r => r.completado).length;
  ctx.fillStyle = '#4caf50';
  ctx.font = '18px Arial';
  ctx.fillText(`✅ ${completados}/${total}`, canvas.width - 20, 65);
}

function drawContenedores() {
  const numContenedores = contenedoresVisibles.length;
  const containerWidth = 120;
  const spacing = (canvas.width - containerWidth * numContenedores) / (numContenedores + 1);
  
  contenedoresVisibles.forEach((key, i) => {
    const cont = CONTENEDORES[key];
    const x = spacing + i * (containerWidth + spacing);
    const y = 100;
    const h = 250;
    
    // Sombra
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    roundRect(ctx, x + 5, y + 5, containerWidth, h, 10);
    ctx.fill();
    
    // Contenedor
    ctx.fillStyle = cont.color;
    roundRect(ctx, x, y, containerWidth, h, 10);
    ctx.fill();
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Emoji grande
    ctx.font = '64px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(cont.emoji, x + containerWidth/2, y + 100);
    
    // Nombre
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(cont.name, x + containerWidth/2, y + 140);
    
    // Descripción pequeña
    ctx.font = '11px Arial';
    ctx.fillStyle = '#333';
    wrapText(ctx, cont.description, x + containerWidth/2 - 50, y + 165, 100, 14);
    
    // Guardar bounds para detección
    cont.bounds = { x, y, w: containerWidth, h };
  });
}

function drawResiduos() {
  residuosActuales.forEach(residuo => {
    if(residuo.completado) return; // No dibujar si ya se recicló
    
    const size = 60;
    const x = residuo.x - size/2;
    const y = residuo.y - size/2;
    
    // Sombra
    if(!residuo.dragging) {
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(x + 3, y + 3, size, size);
    }
    
    // Fondo
    ctx.fillStyle = residuo.dragging ? 'rgba(255,255,255,0.9)' : '#fff';
    roundRect(ctx, x, y, size, size, 8);
    ctx.fill();
    
    ctx.strokeStyle = residuo.dragging ? '#4caf50' : '#ccc';
    ctx.lineWidth = residuo.dragging ? 3 : 2;
    ctx.stroke();
    
    // Emoji
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(residuo.emoji, residuo.x, residuo.y + 5);
    
    // Nombre pequeño
    ctx.font = '10px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText(residuo.name, residuo.x, residuo.y + 25);
  });
}

function drawFeedback() {
  ctx.save();
  
  const alpha = Math.min(1, feedbackTimer / 0.3);
  ctx.globalAlpha = alpha;
  
  ctx.fillStyle = mensajeFeedback.tipo === 'correcto' ? '#4caf50' : '#f44336';
  roundRect(ctx, canvas.width/2 - 150, 250, 300, 80, 15);
  ctx.fill();
  
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(mensajeFeedback.texto, canvas.width/2, 290);
  
  ctx.font = '16px Arial';
  ctx.fillText(mensajeFeedback.detalle, canvas.width/2, 315);
  
  ctx.restore();
}

// ============================================
// PANTALLA DE EDUCACIÓN
// ============================================
function drawEducationScreen() {
  const nivel = NIVELES[currentLevel];
  
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const panelW = 650;
  const panelH = 500;
  const panelX = (canvas.width - panelW) / 2;
  const panelY = (canvas.height - panelH) / 2;
  
  ctx.fillStyle = '#fff';
  roundRect(ctx, panelX, panelY, panelW, panelH, 15);
  ctx.fill();
  
  ctx.strokeStyle = '#2e7d32';
  ctx.lineWidth = 3;
  ctx.stroke();
  
  ctx.fillStyle = '#2e7d32';
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`♻️ Nivel ${currentLevel + 1}: ${nivel.name}`, canvas.width/2, panelY + 40);
  
  // Contenido educativo
  ctx.fillStyle = '#333';
  ctx.font = '15px Arial';
  ctx.textAlign = 'left';
  const lines = nivel.education.trim().split('\n');
  let y = panelY + 80;
  
  for(const line of lines) {
    const trimmed = line.trim();
    if(!trimmed) {
      y += 10;
      continue;
    }
    
    if(trimmed.includes('🟨') || trimmed.includes('🟦') || trimmed.includes('🟩') || 
       trimmed.includes('🟫') || trimmed.includes('⬜') || trimmed.includes('🔴')) {
      ctx.font = 'bold 18px Arial';
      ctx.fillStyle = '#2e7d32';
    } else if(trimmed.startsWith('-') || trimmed.startsWith('¡')) {
      ctx.font = '14px Arial';
      ctx.fillStyle = '#666';
    } else if(trimmed.includes('IMPORTANTE') || trimmed.includes('NUNCA') || trimmed.includes('PELIGROSOS')) {
      ctx.font = 'bold 15px Arial';
      ctx.fillStyle = '#f44336';
    } else {
      ctx.font = '14px Arial';
      ctx.fillStyle = '#555';
    }
    
    wrapText(ctx, trimmed, panelX + 40, y, panelW - 80, 20);
    y += trimmed.startsWith('-') ? 18 : 24;
  }
  
  // Botón
  const btnY = panelY + panelH - 60;
  ctx.fillStyle = '#2e7d32';
  roundRect(ctx, canvas.width/2 - 120, btnY, 240, 45, 8);
  ctx.fill();
  
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('¡Empezar a reciclar!', canvas.width/2, btnY + 30);
  
  ctx.restore();
}

// ============================================
// PANTALLA DE RESULTADO
// ============================================
function drawResultado() {
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const panelW = 500;
  const panelH = 450;
  const panelX = (canvas.width - panelW) / 2;
  const panelY = (canvas.height - panelH) / 2;
  
  ctx.fillStyle = '#fff';
  roundRect(ctx, panelX, panelY, panelW, panelH, 15);
  ctx.fill();
  
  // Título
  const nivel = NIVELES[currentLevel];
  const completados = residuosActuales.filter(r => r.completado).length;
  const total = residuosActuales.length;
  const porcentaje = Math.round((completados / total) * 100);
  
  let titulo = '🎉 ¡Nivel Completado!';
  let color = '#4caf50';
  
  if(porcentaje < 50) {
    titulo = '😅 ¡Inténtalo de nuevo!';
    color = '#f44336';
  } else if(porcentaje < 80) {
    titulo = '👍 ¡Buen trabajo!';
    color = '#ff9800';
  }
  
  ctx.fillStyle = color;
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(titulo, canvas.width/2, panelY + 50);
  
  // Estadísticas
  ctx.fillStyle = '#333';
  ctx.font = '20px Arial';
  
  const stats = [
    `Reciclados: ${completados} / ${total} (${porcentaje}%)`,
    `Puntuación: ${score}`,
    `Errores: ${errores}`,
    `Mejor racha: 🔥 x${mejorRacha}`,
    ``,
    `Record anterior: ${bestScore}`,
  ];
  
  let y = panelY + 100;
  stats.forEach(stat => {
    if(stat === '') {
      y += 10;
      return;
    }
    ctx.fillText(stat, canvas.width/2, y);
    y += 35;
  });
  
  // Nuevo record
  if(score > bestScore) {
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 28px Arial';
    ctx.fillText('🏆 ¡NUEVO RECORD!', canvas.width/2, y + 10);
    y += 45;
    
    // Guardar
    localStorage.setItem('reciclajeBest', score);
    const playerName = localStorage.getItem('playerName') || 'Anónimo';
    localStorage.setItem('reciclajeBestName', playerName);
    bestScore = score;
  }
  
  // Botones
  const btnW = 200;
  const btnH = 45;
  const btnY = panelY + panelH - 100;
  
  // Repetir
  ctx.fillStyle = '#ff9800';
  roundRect(ctx, canvas.width/2 - btnW - 10, btnY, btnW, btnH, 8);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px Arial';
  ctx.fillText('🔄 Repetir', canvas.width/2 - btnW/2 - 10, btnY + 30);
  
  // Siguiente/Menú
  if(currentLevel < NIVELES.length - 1 && porcentaje >= 50) {
    ctx.fillStyle = '#4caf50';
    roundRect(ctx, canvas.width/2 + 10, btnY, btnW, btnH, 8);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText('➡️ Siguiente nivel', canvas.width/2 + btnW/2 + 10, btnY + 30);
  } else {
    ctx.fillStyle = '#666';
    roundRect(ctx, canvas.width/2 + 10, btnY, btnW, btnH, 8);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText('🏠 Menú', canvas.width/2 + btnW/2 + 10, btnY + 30);
  }
}

// ============================================
// LÓGICA: VERIFICAR ACIERTO
// ============================================
function verificarContenedor(residuo, contenedor) {
  const contenedorData = CONTENEDORES[contenedor];
  const correcto = residuo.contenedor === contenedor;
  
  if(correcto) {
    score += 10;
    racha++;
    
    // Bonus por racha
    if(racha >= 3) {
      const bonus = racha * 2;
      score += bonus;
      mensajeFeedback = {
        tipo: 'correcto',
        texto: `¡RACHA x${racha}! +${10 + bonus}`,
        detalle: '🔥 ¡Sigue así!'
      };
    } else {
      mensajeFeedback = {
        tipo: 'correcto',
        texto: '✅ ¡Correcto!',
        detalle: `+10 puntos`
      };
    }
    
    if(racha > mejorRacha) mejorRacha = racha;
    residuo.completado = true;
    
    // Verificar si terminó
    const todos = residuosActuales.every(r => r.completado);
    if(todos) {
      setTimeout(() => {
        gameState = 'resultado';
      }, 500);
    }
  } else {
    score -= 10;
    errores++;
    racha = 0;
    
    mensajeFeedback = {
      tipo: 'error',
      texto: '❌ ¡Incorrecto!',
      detalle: `Debería ir al ${CONTENEDORES[residuo.contenedor].name}`
    };
    
    // Volver a su posición original
    const index = residuosActuales.indexOf(residuo);
    residuo.x = 100 + (index % 5) * 140;
    residuo.y = 400 + Math.floor(index / 5) * 80;
  }
  
  feedbackTimer = 0;
}

// ============================================
// ACTUALIZACIÓN
// ============================================
function update() {
  if(gameState === 'playing' && !showingEducation) {
    const now = Date.now();
    const delta = (now - lastTime) / 1000;
    lastTime = now;
    
    tiempoRestante -= delta;
    
    if(tiempoRestante <= 0) {
      tiempoRestante = 0;
      gameState = 'resultado';
    }
    
    // Fade out del feedback
    if(mensajeFeedback) {
      feedbackTimer += delta;
      if(feedbackTimer > 2) {
        mensajeFeedback = null;
      }
    }
  }
}

// ============================================
// EVENTOS
// ============================================
function handleClick(e) {
  const pos = getMousePos(e);
  
  if(showingEducation) {
    const panelW = 650;
    const panelH = 500;
    const panelX = (canvas.width - panelW) / 2;
    const panelY = (canvas.height - panelH) / 2;
    const btnY = panelY + panelH - 60;
    
    if(isInsideRect(pos.x, pos.y, canvas.width/2 - 120, btnY, 240, 45)) {
      showingEducation = false;
      lastTime = Date.now();
    }
    return;
  }
  
  if(gameState === 'menu') {
    const startY = 320;
    
    NIVELES.forEach((nivel, i) => {
      const y = startY + i * 80;
      if(isInsideRect(pos.x, pos.y, canvas.width/2 - 200, y, 400, 60)) {
        initLevel(i);
      }
    });
    
    if(isInsideRect(pos.x, pos.y, canvas.width/2 - 120, 570, 240, 20)) {
      if(window.GameUI && window.GameUI.returnToMenu) {
        window.GameUI.returnToMenu();
      }
    }
  }
  else if(gameState === 'resultado') {
    const panelW = 500;
    const panelH = 450;
    const panelX = (canvas.width - panelW) / 2;
    const panelY = (canvas.height - panelH) / 2;
    const btnY = panelY + panelH - 100;
    const btnW = 200;
    
    // Repetir
    if(isInsideRect(pos.x, pos.y, canvas.width/2 - btnW - 10, btnY, btnW, 45)) {
      initLevel(currentLevel);
    }
    
    // Siguiente/Menú
    const completados = residuosActuales.filter(r => r.completado).length;
    const total = residuosActuales.length;
    const porcentaje = Math.round((completados / total) * 100);
    
    if(isInsideRect(pos.x, pos.y, canvas.width/2 + 10, btnY, btnW, 45)) {
      if(currentLevel < NIVELES.length - 1 && porcentaje >= 50) {
        initLevel(currentLevel + 1);
      } else {
        gameState = 'menu';
      }
    }
  }
}

function handleMouseDown(e) {
  if(gameState !== 'playing' || showingEducation) return;
  
  const pos = getMousePos(e);
  
  // Buscar residuo clickeado (de atrás hacia adelante para respetar Z-order)
  for(let i = residuosActuales.length - 1; i >= 0; i--) {
    const residuo = residuosActuales[i];
    if(residuo.completado) continue;
    
    const size = 60;
    const x = residuo.x - size/2;
    const y = residuo.y - size/2;
    
    if(isInsideRect(pos.x, pos.y, x, y, size, size)) {
      residuoDragging = residuo;
      residuo.dragging = true;
      offsetX = pos.x - residuo.x;
      offsetY = pos.y - residuo.y;
      
      // Mover al final del array (encima de todo)
      residuosActuales.splice(i, 1);
      residuosActuales.push(residuo);
      break;
    }
  }
}

function handleMouseMove(e) {
  if(!residuoDragging) return;
  
  const pos = getMousePos(e);
  residuoDragging.x = pos.x - offsetX;
  residuoDragging.y = pos.y - offsetY;
}

function handleMouseUp(e) {
  if(!residuoDragging) return;
  
  const pos = getMousePos(e);
  
  // Verificar si está sobre un contenedor
  let encontrado = false;
  for(const key of contenedoresVisibles) {
    const cont = CONTENEDORES[key];
    if(cont.bounds && isInsideRect(pos.x, pos.y, cont.bounds.x, cont.bounds.y, cont.bounds.w, cont.bounds.h)) {
      verificarContenedor(residuoDragging, key);
      encontrado = true;
      break;
    }
  }
  
  if(!encontrado && !residuoDragging.completado) {
    // Volver a posición original
    const index = residuosActuales.indexOf(residuoDragging);
    residuoDragging.x = 100 + (index % 5) * 140;
    residuoDragging.y = 400 + Math.floor(index / 5) * 80;
  }
  
  residuoDragging.dragging = false;
  residuoDragging = null;
}

// ============================================
// BUCLE PRINCIPAL
// ============================================
function gameLoop() {
  update();
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  if(gameState === 'menu') {
    drawMenu();
  }
  else if(gameState === 'playing') {
    drawGame();
    if(showingEducation) {
      drawEducationScreen();
    }
  }
  else if(gameState === 'resultado') {
    drawGame();
    drawResultado();
  }
  
  requestAnimationFrame(gameLoop);
}

// ============================================
// INICIALIZACIÓN
// ============================================
canvas.addEventListener('click', handleClick);
canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);

// Evitar arrastrar fuera del canvas
canvas.addEventListener('mouseleave', () => {
  if(residuoDragging) {
    residuoDragging.dragging = false;
    const index = residuosActuales.indexOf(residuoDragging);
    residuoDragging.x = 100 + (index % 5) * 140;
    residuoDragging.y = 400 + Math.floor(index / 5) * 80;
    residuoDragging = null;
  }
});

let animationFrameId = null;

function gameLoopWrapper() {
  gameLoop();
  animationFrameId = requestAnimationFrame(gameLoopWrapper);
}

gameLoopWrapper();

// ============================================
// CLEANUP
// ============================================
return function cleanup() {
  if(animationFrameId) cancelAnimationFrame(animationFrameId);
  canvas.removeEventListener('click', handleClick);
  canvas.removeEventListener('mousedown', handleMouseDown);
  canvas.removeEventListener('mousemove', handleMouseMove);
  canvas.removeEventListener('mouseup', handleMouseUp);
};

}

window.registerGame = registerGame;
