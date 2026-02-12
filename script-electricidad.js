window.registerGame = function registerGame(){
// ============================================
// JUEGO EDUCATIVO: APRENDE ELECTRICIDAD
// Sistema de circuitos eléctricos domésticos reales
// ============================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600;

let af = null;
let gameState = 'menu'; // 'menu', 'playing', 'testing', 'levelComplete', 'error'

// ============================================
// COMPONENTES ELÉCTRICOS
// ============================================
const COMPONENT_DEFS = {
  WIRE_FASE: { name: 'Fase (230V)', color: '#8B0000', type: 'source', icon: 'L', desc: 'Cable de fase - conduce corriente' },
  WIRE_NEUTRO: { name: 'WIRE_NEUTRO', color: '#0000CD', type: 'neutral', icon: 'N', desc: 'Cable neutro - retorno de corriente' },
  WIRE_RETORNO: { name: 'WIRE_RETORNO', color: '#000', type: 'wire', icon: 'R', desc: 'Cable para conmutadas' },
  SWITCH_SIMPLE: { name: 'Interruptor Simple', type: 'switch', w: 50, h: 40, desc: 'Corta o conecta la fase' },
  CONMUTADOR: { name: 'CONMUTADOR', type: 'CONMUTADOR', w: 50, h: 50, desc: 'Dos posiciones para circuitos conmutados' },
  CRUZAMIENTO: { name: 'CRUZAMIENTO', type: 'CRUZAMIENTO', w: 50, h: 50, desc: 'Para conmutadas con 3+ puntos' },
  LIGHT_WHITE: { name: 'Bombilla Blanca', color: '#FFF8DC', type: 'light', radius: 20 },
  LIGHT_YELLOW: { name: 'Bombilla Amarilla', color: '#FFD700', type: 'light', radius: 20 },
  LIGHT_RGB: { name: 'Bombilla RGB', color: '#FF1493', type: 'light', radius: 20 }
};

// ============================================
// DEFINICIÓN DE NIVELES
// ============================================
const LEVELS = [
  {
    id: 1,
    name: 'Circuito Básico',
    description: 'Conecta una fuente de alimentación con una bombilla y un interruptor',
    difficulty: 'Fácil',
    education: `
    🔌 CIRCUITO BÁSICO:
    - La FASE (rojo) lleva la corriente desde la fuente
    - El INTERRUPTOR corta o conecta la fase
    - El NEUTRO (azul) retorna la corriente
    - La bombilla se enciende cuando el circuito se cierra
    `,
    availableComponents: ['WIRE_FASE', 'WIRE_NEUTRO', 'SWITCH_SIMPLE', 'LIGHT_WHITE'],
    fixedElements: [
      { type: 'SOURCE_FASE', x: 50, y: 300, label: 'L' },
      { type: 'SOURCE_NEUTRO', x: 50, y: 340, label: 'N' }
    ],
    solution: {
      mustHave: ['WIRE_FASE', 'WIRE_NEUTRO', 'SWITCH_SIMPLE', 'LIGHT_WHITE'],
      validation: (circuit) => {
        return circuit.hasFaseToLight && circuit.hasNeutroToLight && circuit.hasSwitchInFase;
      }
    },
    hints: [
      'La fase debe pasar por el interruptor',
      'El neutro va directo a la bombilla',
      'Arrastra los componentes desde la izquierda'
    ]
  },
  {
    id: 2,
    name: 'Circuito Doméstico',
    description: 'Instala un circuito de luz como en casa',
    difficulty: 'Fácil',
    education: `
    🏠 INSTALACIÓN DOMÉSTICA:
    - Siempre se corta la FASE, nunca el neutro (seguridad)
    - El neutro va directo del contador a la lámpara
    - El interruptor debe estar en serie con la fase
    - Es el estándar en instalaciones eléctricas
    `,
    availableComponents: ['WIRE_FASE', 'WIRE_NEUTRO', 'SWITCH_SIMPLE', 'LIGHT_WHITE'],
    fixedElements: [
      { type: 'SOURCE_FASE', x: 50, y: 300, label: 'L' },
      { type: 'SOURCE_NEUTRO', x: 50, y: 340, label: 'N' }
    ],
    solution: {
      mustHave: ['WIRE_FASE', 'WIRE_NEUTRO', 'SWITCH_SIMPLE', 'LIGHT_WHITE'],
      validation: (circuit) => {
        return circuit.hasFaseToLight && circuit.hasNeutroToLight && circuit.hasSwitchInFase;
      }
    },
    hints: [
      'Corta siempre la fase, no el neutro',
      'El neutro va directo',
      'Haz clic en el interruptor para probar'
    ]
  },
  {
    id: 3,
    name: 'Luz Conmutada',
    description: 'Controla una luz desde dos puntos diferentes (escalera)',
    difficulty: 'Medio',
    education: `
    🔀 CIRCUITO CONMUTADO:
    - Usado en escaleras: controlar la luz desde arriba y abajo
    - Se usan 2 CONMUTADORES
    - Los viajeros (cables retorno) conectan los conmutadores
    - La luz se enciende/apaga desde cualquier punto
    - Fase → Conmutador1 → Viajeros → Conmutador2 → Luz
    `,
    availableComponents: ['WIRE_FASE', 'WIRE_NEUTRO', 'WIRE_RETORNO', 'CONMUTADOR', 'LIGHT_YELLOW'],
    fixedElements: [
      { type: 'SOURCE_FASE', x: 50, y: 300, label: 'L' },
      { type: 'SOURCE_NEUTRO', x: 50, y: 340, label: 'N' }
    ],
    solution: {
      mustHave: ['WIRE_FASE', 'WIRE_NEUTRO', 'WIRE_RETORNO', 'CONMUTADOR', 'LIGHT_YELLOW'],
      minCount: { conmutador: 2, retorno: 2 },
      validation: (circuit) => {
        return circuit.hasConmutadaCorrect;
      }
    },
    hints: [
      'Necesitas 2 conmutadores',
      'Los cables retorno (negro) conectan los conmutadores',
      'Fase → Conmutador → Retornos → Conmutador → Luz'
    ]
  },
  {
    id: 4,
    name: 'Conmutada con Cruzamiento',
    description: 'Tres puntos de control (pasillo largo)',
    difficulty: 'Avanzado',
    education: `
    ⚡ CONMUTADA CON CRUZAMIENTO:
    - Para controlar desde 3 o más puntos
    - 2 CONMUTADORES en los extremos
    - CRUZAMIENTOS en medio
    - Estructura: Fase → Conmut → Viaj → CRUZ → Viaj → Conmut → Luz
    - Usado en pasillos largos con múltiples accesos
    `,
    availableComponents: ['WIRE_FASE', 'WIRE_NEUTRO', 'WIRE_RETORNO', 'CONMUTADOR', 'CRUZAMIENTO', 'LIGHT_RGB'],
    fixedElements: [
      { type: 'SOURCE_FASE', x: 50, y: 300, label: 'L' },
      { type: 'SOURCE_NEUTRO', x: 50, y: 340, label: 'N' }
    ],
    solution: {
      mustHave: ['WIRE_FASE', 'WIRE_NEUTRO', 'WIRE_RETORNO', 'CONMUTADOR', 'CRUZAMIENTO', 'LIGHT_RGB'],
      minCount: { conmutador: 2, cruzamiento: 1, retorno: 4 },
      validation: (circuit) => {
        return circuit.hasCruzamientoCorrect;
      }
    },
    hints: [
      '2 conmutadores en los extremos',
      '1 cruzamiento en medio',
      'Los retornos conectan todo en serie'
    ]
  }
];

// ============================================
// ESTADO DEL JUEGO
// ============================================
let currentLevel = 0;
let placedComponents = [];
let wires = [];
let draggedComponent = null;
let dragOffset = { x: 0, y: 0 };
let selectedWireType = null;
let wireStart = null;
let wirePreview = null;
let hoveredComponent = null;
let score = 0;
let bestScore = Number(localStorage.getItem('electricidadBest')) || 0;
let testResult = null;
let showingEducation = false;
let showingSolution = true;

// ============================================
// ÁREAS DE LA INTERFAZ
// ============================================
const AREAS = {
  toolbar: { x: 10, y: 100, w: 180, h: 480 },
  workspace: { x: 210, y: 100, w: 480, h: 480 },
  infoPanel: { x: 710, y: 100, w: 180, h: 480 },
  topBar: { x: 0, y: 0, w: 900, h: 90 }
};

// ============================================
// INICIALIZACIÓN DE NIVEL
// ============================================
function initLevel(levelIndex) {
  currentLevel = levelIndex;
  const level = LEVELS[levelIndex];
  
  placedComponents = [];
  wires = [];
  draggedComponent = null;
  selectedWireType = null;
  wireStart = null;
  testResult = null;
  showingEducation = false;
  showingSolution = true;
  
  if(level.fixedElements) {
    for(const elem of level.fixedElements) {
      placedComponents.push({
        ...elem,
        fixed: true,
        id: Math.random()
      });
    }
  }
  
  gameState = 'playing';
}

// ============================================
// DIBUJO - MENÚ PRINCIPAL
// ============================================
function drawMenu() {
  ctx.save();
  
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#1a237e');
  gradient.addColorStop(1, '#283593');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.font = 'bold 44px Arial';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 15;
  ctx.fillText('⚡ Aprende Electricidad ⚡', canvas.width/2, 80);
  
  ctx.shadowBlur = 0;
  ctx.font = '18px Arial';
  ctx.fillText('Circuitos eléctricos domésticos reales', canvas.width/2, 115);
  
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  roundRect(ctx, 100, 160, canvas.width - 200, 100, 12);
  ctx.fill();
  
  ctx.fillStyle = '#fff';
  ctx.font = '15px Arial';
  ctx.textAlign = 'left';
  const infoText = [
    '🔌 Aprende cómo funcionan los circuitos eléctricos de tu casa',
    '💡 Descubre por qué se corta la fase y no el neutro',
    '🔀 Domina los circuitos conmutados (escaleras)',
    '⚡ Instala circuitos siguiendo normas eléctricas reales'
  ];
  
  infoText.forEach((line, i) => {
    ctx.fillText(line, 120, 190 + i * 22);
  });
  
  ctx.textAlign = 'center';
  const startY = 290;
  const spacing = 70;
  
  for(let i = 0; i < LEVELS.length; i++) {
    const level = LEVELS[i];
    const row = Math.floor(i / 2);
    const col = i % 2;
    const x = 200 + col * 250;
    const y = startY + row * spacing;
    
    const diffColors = {
      'Fácil': '#4caf50',
      'Medio': '#ff9800',
      'Avanzado': '#f44336'
    };
    
    ctx.fillStyle = diffColors[level.difficulty] || '#1976d2';
    roundRect(ctx, x, y, 220, 55, 10);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`Nivel ${i + 1}: ${level.name}`, x + 110, y + 22);
    ctx.font = '13px Arial';
    ctx.fillText(`(${level.difficulty})`, x + 110, y + 42);
  }
  
  ctx.font = '14px Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillText('Haz clic en un nivel para comenzar tu aprendizaje', canvas.width/2, canvas.height - 30);
  
  ctx.restore();
}

// ============================================
// DIBUJO - BARRA SUPERIOR
// ============================================
function drawTopBar() {
  const level = LEVELS[currentLevel];
  
  ctx.save();
  
  if(window.GameUI) {
    window.GameUI.gradientBar(ctx, canvas.width, 90, '#1a237e', '#283593');
  } else {
    const gradient = ctx.createLinearGradient(0, 0, 0, 90);
    gradient.addColorStop(0, '#1a237e');
    gradient.addColorStop(1, '#283593');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, 90);
  }
  
  ctx.font = 'bold 26px Arial';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText(`⚡ Nivel ${currentLevel + 1}: ${level.name}`, canvas.width/2, 30);
  
  ctx.font = '15px Arial';
  ctx.fillText(level.description, canvas.width/2, 55);
  
  ctx.font = '13px Arial';
  ctx.fillStyle = '#ffeb3b';
  ctx.fillText(`Dificultad: ${level.difficulty} | Mejor puntuación: ${bestScore || '-'}`, canvas.width/2, 75);
  
  ctx.restore();
}

// ============================================
// DIBUJO - PANEL DE COMPONENTES
// ============================================
function drawToolbar() {
  const level = LEVELS[currentLevel];
  const area = AREAS.toolbar;
  
  ctx.save();
  
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  roundRect(ctx, area.x, area.y, area.w, area.h, 10);
  ctx.fill();
  ctx.strokeStyle = '#1976d2';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  ctx.fillStyle = '#1a237e';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Componentes', area.x + area.w/2, area.y + 25);
  
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(area.x + 10, area.y + 35);
  ctx.lineTo(area.x + area.w - 10, area.y + 35);
  ctx.stroke();
  
  let y = area.y + 50;
  ctx.textAlign = 'left';
  ctx.font = '13px Arial';
  
  for(const compKey of level.availableComponents) {
    const comp = COMPONENT_DEFS[compKey];
    if(!comp) continue;
    
    const itemH = 60;
    const itemX = area.x + 10;
    
    ctx.fillStyle = selectedWireType === compKey ? '#bbdefb' : '#f5f5f5';
    roundRect(ctx, itemX, y, area.w - 20, itemH, 8);
    ctx.fill();
    ctx.strokeStyle = selectedWireType === compKey ? '#1976d2' : '#ccc';
    ctx.lineWidth = selectedWireType === compKey ? 2 : 1;
    ctx.stroke();
    
    ctx.save();
    const miniX = itemX + 35;
    const miniY = y + itemH/2;
    
    if(comp.type === 'source' || comp.type === 'neutral' || comp.type === 'wire') {
      ctx.strokeStyle = comp.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(miniX - 15, miniY);
      ctx.lineTo(miniX + 15, miniY);
      ctx.stroke();
      
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = comp.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(miniX - 15, miniY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if(comp.type === 'switch' || comp.type === 'CONMUTADOR' || comp.type === 'CRUZAMIENTO') {
      ctx.fillStyle = '#666';
      ctx.fillRect(miniX - 15, miniY - 10, 30, 20);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.strokeRect(miniX - 15, miniY - 10, 30, 20);
    } else if(comp.type === 'light') {
      ctx.fillStyle = '#ddd';
      ctx.beginPath();
      ctx.arc(miniX, miniY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#999';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();
    
    ctx.fillStyle = '#333';
    ctx.font = 'bold 12px Arial';
    ctx.fillText(comp.name, itemX + 75, y + itemH/2 - 5);
    
    ctx.font = '10px Arial';
    ctx.fillStyle = '#666';
    const desc = comp.desc || '';
    const maxLen = 18;
    const shortDesc = desc.length > maxLen ? desc.substring(0, maxLen) + '...' : desc;
    ctx.fillText(shortDesc, itemX + 75, y + itemH/2 + 10);
    
    y += itemH + 8;
  }
  
  ctx.restore();
}

// ============================================
// DIBUJO - ÁREA DE TRABAJO
// ============================================
function drawWorkspace() {
  const area = AREAS.workspace;
  
  ctx.save();
  
  ctx.fillStyle = '#f5f5f5';
  roundRect(ctx, area.x, area.y, area.w, area.h, 10);
  ctx.fill();
  
  ctx.strokeStyle = 'rgba(0,0,0,0.05)';
  ctx.lineWidth = 1;
  for(let x = area.x; x < area.x + area.w; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, area.y);
    ctx.lineTo(x, area.y + area.h);
    ctx.stroke();
  }
  for(let y = area.y; y < area.y + area.h; y += 40) {
    ctx.beginPath();
    ctx.moveTo(area.x, y);
    ctx.lineTo(area.x + area.w, y);
    ctx.stroke();
  }
  
  ctx.strokeStyle = '#1976d2';
  ctx.lineWidth = 3;
  ctx.stroke();
  
  for(const wire of wires) {
    ctx.strokeStyle = wire.color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(wire.x1, wire.y1);
    ctx.lineTo(wire.x2, wire.y2);
    ctx.stroke();
    
    ctx.fillStyle = wire.color;
    ctx.beginPath();
    ctx.arc(wire.x1, wire.y1, 5, 0, Math.PI * 2);
    ctx.arc(wire.x2, wire.y2, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  
  if(wireStart && wirePreview) {
    ctx.save();
    ctx.strokeStyle = wirePreview.color;
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.6;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(wireStart.x, wireStart.y);
    ctx.lineTo(wirePreview.x, wirePreview.y);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = wirePreview.color;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(wireStart.x, wireStart.y, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 200) * 0.3;
    ctx.beginPath();
    ctx.arc(wirePreview.x, wirePreview.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  
  for(const comp of placedComponents) {
    const isHovered = hoveredComponent === comp.id;
    if(isHovered) {
      ctx.save();
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 4]);
      const padding = 10;
      if(comp.type === 'SOURCE_FASE' || comp.type === 'SOURCE_NEUTRO') {
        ctx.strokeRect(comp.x - 15 - padding, comp.y - 15 - padding, 30 + padding*2, 30 + padding*2);
      } else {
        ctx.beginPath();
        ctx.arc(comp.x, comp.y, 35, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
    drawComponent(comp);
  }
  
  if(wireStart && selectedWireType) {
    ctx.save();
    for(const comp of placedComponents) {
      const points = getConnectionPoints(comp);
      for(const point of points) {
        const dist = Math.sqrt(Math.pow(wirePreview?.x - point.x, 2) + Math.pow(wirePreview?.y - point.y, 2));
        if(dist < 25) {
          ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
          ctx.beginPath();
          ctx.arc(point.x, point.y, 15, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.strokeStyle = '#4caf50';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 10, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }
  
  if(draggedComponent) {
    ctx.save();
    ctx.globalAlpha = 0.8;
    
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 5;
    
    drawComponent(draggedComponent);
    
    const snappedPos = snapToGrid(draggedComponent.x, draggedComponent.y);
    if(snappedPos.x !== draggedComponent.x || snappedPos.y !== draggedComponent.y) {
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = '#4caf50';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(snappedPos.x, snappedPos.y, 30, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.restore();
  }
  
  ctx.restore();
}

// ============================================
// DIBUJAR UN COMPONENTE
// ============================================
function drawComponent(comp) {
  ctx.save();
  
  if(comp.type === 'SOURCE_FASE') {
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(comp.x - 15, comp.y - 15, 30, 30);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(comp.x - 15, comp.y - 15, 30, 30);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('L', comp.x, comp.y);
    
    ctx.fillStyle = '#8B0000';
    ctx.beginPath();
    ctx.arc(comp.x + 20, comp.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  else if(comp.type === 'SOURCE_NEUTRO') {
    ctx.fillStyle = '#0000CD';
    ctx.fillRect(comp.x - 15, comp.y - 15, 30, 30);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(comp.x - 15, comp.y - 15, 30, 30);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', comp.x, comp.y);
    
    ctx.fillStyle = '#0000CD';
    ctx.beginPath();
    ctx.arc(comp.x + 20, comp.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  else if(comp.type === 'SWITCH_SIMPLE') {
    const w = 50, h = 40;
    ctx.fillStyle = '#666';
    roundRect(ctx, comp.x - w/2, comp.y - h/2, w, h, 5);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.strokeStyle = comp.on ? '#4caf50' : '#f44336';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(comp.x, comp.y);
    const angle = comp.on ? -0.4 : 0.4;
    ctx.lineTo(comp.x + Math.cos(angle) * 15, comp.y + Math.sin(angle) * 15);
    ctx.stroke();
    
    drawConnectionPoint(comp.x - 25, comp.y, '#8B0000');
    drawConnectionPoint(comp.x + 25, comp.y, '#8B0000');
  }
  else if(comp.type === 'CONMUTADOR') {
    const w = 50, h = 50;
    ctx.fillStyle = '#555';
    roundRect(ctx, comp.x - w/2, comp.y - h/2, w, h, 5);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.strokeStyle = comp.position === 'up' ? '#4caf50' : '#ff9800';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(comp.x, comp.y);
    const angle = comp.position === 'up' ? -0.6 : 0.6;
    ctx.lineTo(comp.x + Math.cos(angle) * 18, comp.y + Math.sin(angle) * 18);
    ctx.stroke();
    
    drawConnectionPoint(comp.x - 25, comp.y, '#8B0000');
    drawConnectionPoint(comp.x + 15, comp.y - 20, '#000');
    drawConnectionPoint(comp.x + 15, comp.y + 20, '#000');
    
    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CONM', comp.x, comp.y + 30);
  }
  else if(comp.type === 'CRUZAMIENTO') {
    const w = 50, h = 50;
    ctx.fillStyle = '#444';
    roundRect(ctx, comp.x - w/2, comp.y - h/2, w, h, 5);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(comp.x - 12, comp.y - 12);
    ctx.lineTo(comp.x + 12, comp.y + 12);
    ctx.moveTo(comp.x + 12, comp.y - 12);
    ctx.lineTo(comp.x - 12, comp.y + 12);
    ctx.stroke();
    
    drawConnectionPoint(comp.x - 25, comp.y - 10, '#000');
    drawConnectionPoint(comp.x - 25, comp.y + 10, '#000');
    drawConnectionPoint(comp.x + 25, comp.y - 10, '#000');
    drawConnectionPoint(comp.x + 25, comp.y + 10, '#000');
    
    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CRUZ', comp.x, comp.y + 30);
  }
  else if(comp.type === 'LIGHT_WHITE' || comp.type === 'LIGHT_YELLOW' || comp.type === 'LIGHT_RGB') {
    const def = COMPONENT_DEFS[comp.type];
    const isOn = comp.powered && comp.on;
    
    ctx.fillStyle = '#999';
    ctx.beginPath();
    ctx.arc(comp.x, comp.y + 12, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = isOn ? def.color : '#ddd';
    ctx.beginPath();
    ctx.arc(comp.x, comp.y - 5, 18, 0, Math.PI * 2);
    ctx.fill();
    
    if(isOn) {
      const gradient = ctx.createRadialGradient(comp.x, comp.y - 5, 5, comp.x, comp.y - 5, 35);
      gradient.addColorStop(0, 'rgba(255,255,255,0.9)');
      gradient.addColorStop(0.4, def.color + 'AA');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(comp.x, comp.y - 5, 35, 0, Math.PI * 2);
      ctx.fill();
      
      if(Math.sin(Date.now() / 200) > 0.5) {
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(comp.x, comp.y - 5, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
    
    ctx.strokeStyle = isOn ? def.color : '#999';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(comp.x, comp.y - 5, 18, 0, Math.PI * 2);
    ctx.stroke();
    
    drawConnectionPoint(comp.x - 15, comp.y + 20, '#8B0000');
    drawConnectionPoint(comp.x + 15, comp.y + 20, '#0000CD');
  }
  
  ctx.restore();
}

function drawConnectionPoint(x, y, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.stroke();
}

// ============================================
// DIBUJO - PANEL DE INFORMACIÓN
// ============================================
function drawInfoPanel() {
  const area = AREAS.infoPanel;
  const level = LEVELS[currentLevel];
  
  ctx.save();
  
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  roundRect(ctx, area.x, area.y, area.w, area.h, 10);
  ctx.fill();
  ctx.strokeStyle = '#1976d2';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  ctx.fillStyle = '#1a237e';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Control', area.x + area.w/2, area.y + 25);
  
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(area.x + 10, area.y + 35);
  ctx.lineTo(area.x + area.w - 10, area.y + 35);
  ctx.stroke();
  
  let y = area.y + 55;
  
  const btnTestH = 45;
  ctx.fillStyle = '#4caf50';
  roundRect(ctx, area.x + 15, y, area.w - 30, btnTestH, 8);
  ctx.fill();
  ctx.strokeStyle = '#2e7d32';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px Arial';
  ctx.fillText('Probar', area.x + area.w/2, y + 18);
  ctx.fillText('Circuito', area.x + area.w/2, y + 35);
  
  y += btnTestH + 15;
  
  ctx.fillStyle = '#ff9800';
  roundRect(ctx, area.x + 15, y, area.w - 30, 40, 8);
  ctx.fill();
  ctx.strokeStyle = '#f57c00';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('Reiniciar', area.x + area.w/2, y + 25);
  
  y += 55;
  
  if(testResult) {
    ctx.fillStyle = testResult.success ? 'rgba(76,175,80,0.2)' : 'rgba(244,67,54,0.2)';
    roundRect(ctx, area.x + 15, y, area.w - 30, 80, 8);
    ctx.fill();
    ctx.strokeStyle = testResult.success ? '#4caf50' : '#f44336';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = testResult.success ? '#2e7d32' : '#c62828';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(testResult.success ? '✓ ¡Correcto!' : '✗ Error', area.x + area.w/2, y + 20);
    
    ctx.font = '11px Arial';
    ctx.fillStyle = '#333';
    wrapText(ctx, testResult.message, area.x + 25, y + 40, area.w - 50, 14);
    
    y += 95;
  }
  
  ctx.fillStyle = '#fff9c4';
  roundRect(ctx, area.x + 15, y, area.w - 30, 130, 8);
  ctx.fill();
  ctx.strokeStyle = '#f57f17';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  ctx.fillStyle = '#f57f17';
  ctx.font = 'bold 13px Arial';
  ctx.fillText('💡 Pistas', area.x + area.w/2, y + 20);
  
  ctx.fillStyle = '#333';
  ctx.font = '11px Arial';
  ctx.textAlign = 'left';
  let hintY = y + 35;
  for(const hint of level.hints) {
    wrapText(ctx, '• ' + hint, area.x + 25, hintY, area.w - 50, 13);
    hintY += 28;
  }
  
  ctx.restore();
}

// ============================================
// PANTALLA DE DIAGRAMA DE SOLUCIÓN
// ============================================
function drawSolutionDiagram() {
  const level = LEVELS[currentLevel];
  
  ctx.save();
  
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const panelW = 700;
  const panelH = 520;
  const panelX = (canvas.width - panelW) / 2;
  const panelY = (canvas.height - panelH) / 2;
  
  ctx.fillStyle = '#fff';
  roundRect(ctx, panelX, panelY, panelW, panelH, 15);
  ctx.fill();
  ctx.strokeStyle = '#1976d2';
  ctx.lineWidth = 3;
  ctx.stroke();
  
  ctx.fillStyle = '#1976d2';
  ctx.font = 'bold 26px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`📋 Nivel ${currentLevel + 1}: ${level.name}`, canvas.width/2, panelY + 40);
  
  ctx.font = '15px Arial';
  ctx.fillStyle = '#666';
  ctx.fillText('Objetivo: ' + level.description, canvas.width/2, panelY + 65);
  
  const diagramY = panelY + 100;
  const diagramX = panelX + 50;
  
  ctx.textAlign = 'left';
  ctx.font = 'bold 16px Arial';
  ctx.fillStyle = '#333';
  
  if(currentLevel <= 1) {
    ctx.fillText('🔌 Cómo conectar:', diagramX, diagramY);
    
    const startX = diagramX + 20;
    const startY = diagramY + 30;
    const spacing = 80;
    
    ctx.font = '14px Arial';
    ctx.fillStyle = '#8B0000';
    ctx.fillText('1. Fase (L)', startX, startY);
    ctx.strokeStyle = '#8B0000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startX, startY + 10);
    ctx.lineTo(startX + spacing, startY + 10);
    ctx.stroke();
    
    ctx.fillStyle = '#666';
    ctx.fillText('2. Interruptor', startX + spacing, startY);
    ctx.fillRect(startX + spacing - 5, startY + 5, 40, 20);
    ctx.strokeStyle = '#8B0000';
    ctx.beginPath();
    ctx.moveTo(startX + spacing + 35, startY + 10);
    ctx.lineTo(startX + spacing * 2, startY + 10);
    ctx.stroke();
    
    ctx.fillStyle = '#FFD700';
    ctx.fillText('3. Bombilla', startX + spacing * 2, startY);
    ctx.beginPath();
    ctx.arc(startX + spacing * 2 + 20, startY + 15, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = '#0000CD';
    ctx.font = '14px Arial';
    ctx.fillText('Neutro (N)', startX, startY + 60);
    ctx.strokeStyle = '#0000CD';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startX, startY + 70);
    ctx.lineTo(startX + spacing * 2 + 20, startY + 70);
    ctx.stroke();
    
    ctx.strokeStyle = '#4caf50';
    ctx.fillStyle = '#4caf50';
    ctx.lineWidth = 2;
    for(let i = 0; i < 3; i++) {
      const arrowX = startX + spacing * 0.5 + i * spacing * 0.7;
      ctx.beginPath();
      ctx.moveTo(arrowX, startY + 10);
      ctx.lineTo(arrowX + 10, startY + 5);
      ctx.moveTo(arrowX, startY + 10);
      ctx.lineTo(arrowX + 10, startY + 15);
      ctx.stroke();
    }
    
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    const instructions = [
      '① Selecciona "Fase" en el panel izquierdo',
      '② Haz clic en L (Fase), luego en el interruptor',
      '③ Conecta el interruptor con la bombilla (fase)',
      '④ Selecciona "Neutro" y conecta N con la bombilla',
      '⑤ Coloca el interruptor en el área central',
      '⑥ Coloca la bombilla',
      '⑦ Haz clic en "Probar Circuito" - ¡debe encender!',
      '',
      '⚡ IMPORTANTE: El interruptor corta la FASE, no el neutro'
    ];
    
    let y = startY + 110;
    for(const inst of instructions) {
      if(inst === '') {
        y += 10;
        continue;
      }
      if(inst.includes('IMPORTANTE')) {
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = '#f44336';
      } else {
        ctx.font = '14px Arial';
        ctx.fillStyle = '#333';
      }
      ctx.fillText(inst, diagramX + 20, y);
      y += 22;
    }
  }
  else if(currentLevel === 2) {
    ctx.fillText('🔀 Circuito Conmutado (Escalera):', diagramX, diagramY);
    
    ctx.font = '13px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('Permite encender/apagar la luz desde dos puntos diferentes', diagramX + 20, diagramY + 25);
    
    const startX = diagramX + 40;
    const startY = diagramY + 60;
    
    ctx.strokeStyle = '#8B0000';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#8B0000';
    ctx.fillText('Fase', startX - 20, startY);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + 60, startY);
    ctx.stroke();
    
    ctx.fillStyle = '#555';
    ctx.fillRect(startX + 60, startY - 15, 30, 30);
    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('C1', startX + 75, startY + 5);
    
    ctx.strokeStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(startX + 90, startY - 10);
    ctx.lineTo(startX + 200, startY - 10);
    ctx.moveTo(startX + 90, startY + 10);
    ctx.lineTo(startX + 200, startY + 10);
    ctx.stroke();
    
    ctx.fillStyle = '#000';
    ctx.font = '11px Arial';
    ctx.fillText('Viajeros', startX + 140, startY - 20);
    
    ctx.fillStyle = '#555';
    ctx.fillRect(startX + 200, startY - 15, 30, 30);
    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.fillText('C2', startX + 215, startY + 5);
    
    ctx.strokeStyle = '#8B0000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startX + 230, startY);
    ctx.lineTo(startX + 280, startY);
    ctx.stroke();
    
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(startX + 300, startY, 12, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#0000CD';
    ctx.beginPath();
    ctx.moveTo(startX, startY + 40);
    ctx.lineTo(startX + 300, startY + 40);
    ctx.stroke();
    ctx.fillStyle = '#0000CD';
    ctx.font = '13px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Neutro', startX - 20, startY + 45);
    
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    const instructions = [
      '① Arrastra 2 CONMUTADORES al área central',
      '② Conecta Fase → Conmutador 1',
      '③ Selecciona "Retorno" (cable negro)',
      '④ Conecta ambos conmutadores con 2 cables retorno',
      '⑤ Conecta Conmutador 2 → Bombilla',
      '⑥ Conecta Neutro → Bombilla',
      '',
      '💡 Los conmutadores deben estar en la misma posición'
    ];
    
    let y = startY + 90;
    for(const inst of instructions) {
      if(inst === '') {
        y += 8;
        continue;
      }
      ctx.fillText(inst, diagramX + 20, y);
      y += 20;
    }
  }
  else if(currentLevel === 3) {
    ctx.fillText('⚡ Conmutada con Cruzamiento:', diagramX, diagramY);
    
    ctx.font = '13px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('Control desde 3 puntos - Pasillo largo', diagramX + 20, diagramY + 25);
    
    const startX = diagramX + 30;
    const startY = diagramY + 60;
    
    ctx.strokeStyle = '#8B0000';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#8B0000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Fase', startX, startY);
    
    ctx.beginPath();
    ctx.moveTo(startX + 35, startY);
    ctx.lineTo(startX + 60, startY);
    ctx.stroke();
    
    const spacing = 70;
    ['C1', 'CRUZ', 'C2', 'Luz'].forEach((label, i) => {
      const x = startX + 60 + i * spacing;
      
      if(label.includes('C') || label === 'CRUZ') {
        ctx.fillStyle = label === 'CRUZ' ? '#444' : '#555';
        ctx.fillRect(x - 12, startY - 12, 24, 24);
        ctx.fillStyle = '#fff';
        ctx.font = '9px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(label, x, startY + 3);
      } else {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(x, startY, 10, 0, Math.PI * 2);
        ctx.fill();
      }
      
      if(i < 3) {
        ctx.strokeStyle = i === 0 || i === 2 ? '#8B0000' : '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 12, startY);
        ctx.lineTo(x + spacing - 12, startY);
        ctx.stroke();
      }
    });
    
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    const instructions = [
      '① Coloca 2 CONMUTADORES en los extremos',
      '② Coloca 1 CRUZAMIENTO en medio',
      '③ Conecta: Fase → C1 → Retornos → CRUZ → Retornos → C2 → Luz',
      '④ Necesitas 4 cables retorno en total',
      '⑤ No olvides conectar el neutro',
      '',
      '📚 Este sistema se usa en pasillos largos con 3+ interruptores'
    ];
    
    let y = startY + 60;
    for(const inst of instructions) {
      if(inst === '') {
        y += 8;
        continue;
      }
      ctx.fillText(inst, diagramX + 20, y);
      y += 22;
    }
  }
  
  const btnY = panelY + panelH - 60;
  ctx.fillStyle = '#1976d2';
  roundRect(ctx, canvas.width/2 - 100, btnY, 200, 45, 8);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('¡Entendido, empecemos!', canvas.width/2, btnY + 28);
  
  ctx.restore();
}

// ============================================
// PANTALLA DE EDUCACIÓN
// ============================================
function drawEducationScreen() {
  const level = LEVELS[currentLevel];
  
  ctx.save();
  
  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const panelW = 600;
  const panelH = 400;
  const panelX = (canvas.width - panelW) / 2;
  const panelY = (canvas.height - panelH) / 2;
  
  ctx.fillStyle = '#fff';
  roundRect(ctx, panelX, panelY, panelW, panelH, 15);
  ctx.fill();
  ctx.strokeStyle = '#4caf50';
  ctx.lineWidth = 3;
  ctx.stroke();
  
  ctx.fillStyle = '#4caf50';
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('¡Nivel Completado! 🎉', canvas.width/2, panelY + 50);
  
  ctx.fillStyle = '#333';
  ctx.font = '14px Arial';
  ctx.textAlign = 'left';
  const lines = level.education.trim().split('\n');
  let y = panelY + 90;
  
  for(const line of lines) {
    const trimmed = line.trim();
    if(trimmed) {
      if(trimmed.startsWith('🔌') || trimmed.startsWith('🏠') || trimmed.startsWith('🔀') || trimmed.startsWith('⚡')) {
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#1976d2';
      } else if(trimmed.startsWith('-')) {
        ctx.font = '13px Arial';
        ctx.fillStyle = '#666';
      }
      wrapText(ctx, trimmed, panelX + 40, y, panelW - 80, 20);
      y += 22;
    }
  }
  
  const btnY = panelY + panelH - 70;
  
  if(currentLevel < LEVELS.length - 1) {
    ctx.fillStyle = '#4caf50';
    roundRect(ctx, canvas.width/2 - 180, btnY, 160, 45, 8);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Siguiente Nivel ▶', canvas.width/2 - 100, btnY + 28);
  }
  
  ctx.fillStyle = '#1976d2';
  roundRect(ctx, canvas.width/2 + 20, btnY, 160, 45, 8);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillText('Volver al Menú', canvas.width/2 + 100, btnY + 28);
  
  ctx.restore();
}

// ============================================
// VALIDACIÓN DEL CIRCUITO
// ============================================
function testCircuit() {
  const level = LEVELS[currentLevel];
  
  for(const comp of placedComponents) {
    comp.powered = false;
    comp.on = true;
  }
  
  const counts = {};
  for(const comp of placedComponents) {
    counts[comp.type] = (counts[comp.type] || 0) + 1;
  }
  
  if(currentLevel <= 1) {
    const hasFase = counts.SOURCE_FASE > 0;
    const hasNeutro = counts.SOURCE_NEUTRO > 0;
    const hasSwitch = counts.SWITCH_SIMPLE > 0;
    const hasLight = counts.LIGHT_WHITE > 0;
    const hasWires = wires.length >= 3;
    
    if(!hasFase || !hasNeutro) {
      return { success: false, message: 'Falta la fuente de alimentación (fase y neutro)' };
    }
    if(!hasSwitch) {
      return { success: false, message: 'Necesitas un interruptor para controlar la luz' };
    }
    if(!hasLight) {
      return { success: false, message: 'Coloca una bombilla para completar el circuito' };
    }
    if(!hasWires) {
      return { success: false, message: 'Conecta los componentes con cables' };
    }
    
    const switchComp = placedComponents.find(c => c.type === 'SWITCH_SIMPLE');
    const hasFaseToSwitch = wires.some(w => 
      (w.fromType === 'SOURCE_FASE' && isNearPoint(w.x2, w.y2, switchComp.x - 25, switchComp.y)) ||
      (w.toType === 'SOURCE_FASE' && isNearPoint(w.x1, w.y1, switchComp.x - 25, switchComp.y))
    );
    
    if(!hasFaseToSwitch) {
      return { success: false, message: 'La fase debe pasar por el interruptor. Conecta fase → interruptor' };
    }
    
    if(switchComp.on) {
      const lightComp = placedComponents.find(c => c.type === 'LIGHT_WHITE');
      if(lightComp) {
        lightComp.powered = true;
        return { success: true, message: '¡Perfecto! La fase pasa por el interruptor y llega a la bombilla. El neutro retorna la corriente.' };
      }
    } else {
      return { success: false, message: 'El interruptor está apagado. Haz clic en él para encenderlo.' };
    }
  }
  
  if(currentLevel === 2) {
    const conmutadores = placedComponents.filter(c => c.type === 'CONMUTADOR');
    const retornos = wires.filter(w => w.wireType === 'WIRE_RETORNO');
    const hasLight = counts.LIGHT_YELLOW > 0;
    
    if(conmutadores.length < 2) {
      return { success: false, message: 'Necesitas 2 conmutadores para una luz conmutada' };
    }
    if(retornos.length < 2) {
      return { success: false, message: 'Los conmutadores se conectan con cables retorno (negros)' };
    }
    if(!hasLight) {
      return { success: false, message: 'Coloca la bombilla amarilla' };
    }
    
    const pos1 = conmutadores[0].position || 'up';
    const pos2 = conmutadores[1].position || 'up';
    
    if(pos1 === pos2) {
      const lightComp = placedComponents.find(c => c.type === 'LIGHT_YELLOW');
      if(lightComp) {
        lightComp.powered = true;
        return { success: true, message: '¡Excelente! Circuito conmutado correcto. Puedes encender/apagar desde dos puntos.' };
      }
    } else {
      return { success: false, message: 'Los conmutadores deben estar en la misma posición para cerrar el circuito' };
    }
  }
  
  if(currentLevel === 3) {
    const conmutadores = placedComponents.filter(c => c.type === 'CONMUTADOR');
    const cruzamientos = placedComponents.filter(c => c.type === 'CRUZAMIENTO');
    const retornos = wires.filter(w => w.wireType === 'WIRE_RETORNO');
    const hasLight = counts.LIGHT_RGB > 0;
    
    if(conmutadores.length < 2) {
      return { success: false, message: 'Necesitas 2 conmutadores en los extremos' };
    }
    if(cruzamientos.length < 1) {
      return { success: false, message: 'Necesitas 1 cruzamiento en medio' };
    }
    if(retornos.length < 4) {
      return { success: false, message: 'Necesitas al menos 4 cables retorno para conectar todo' };
    }
    if(!hasLight) {
      return { success: false, message: 'Coloca la bombilla RGB' };
    }
    
    const lightComp = placedComponents.find(c => c.type === 'LIGHT_RGB');
    if(lightComp) {
      lightComp.powered = true;
      return { success: true, message: '¡Magistral! Circuito con cruzamiento completado. Control desde 3 puntos.' };
    }
  }
  
  return { success: false, message: 'Revisa las conexiones del circuito' };
}

// ============================================
// UTILIDADES
// ============================================
function snapToGrid(x, y) {
  const gridSize = 40;
  const wsArea = AREAS.workspace;
  
  const relX = x - wsArea.x;
  const relY = y - wsArea.y;
  
  const snappedRelX = Math.round(relX / gridSize) * gridSize;
  const snappedRelY = Math.round(relY / gridSize) * gridSize;
  
  return {
    x: wsArea.x + snappedRelX,
    y: wsArea.y + snappedRelY
  };
}

function getConnectionPoints(comp) {
  const points = [];
  
  if(comp.type === 'SOURCE_FASE' || comp.type === 'SOURCE_NEUTRO') {
    points.push({ x: comp.x + 20, y: comp.y });
  } else if(comp.type === 'SWITCH_SIMPLE') {
    points.push({ x: comp.x - 25, y: comp.y });
    points.push({ x: comp.x + 25, y: comp.y });
  } else if(comp.type === 'LIGHT_WHITE' || comp.type === 'LIGHT_YELLOW' || comp.type === 'LIGHT_RGB') {
    points.push({ x: comp.x - 15, y: comp.y + 20 });
    points.push({ x: comp.x + 15, y: comp.y + 20 });
  } else if(comp.type === 'CONMUTADOR') {
    points.push({ x: comp.x - 25, y: comp.y });
    points.push({ x: comp.x + 15, y: comp.y - 20 });
    points.push({ x: comp.x + 15, y: comp.y + 20 });
  } else if(comp.type === 'CRUZAMIENTO') {
    points.push({ x: comp.x - 25, y: comp.y - 10 });
    points.push({ x: comp.x - 25, y: comp.y + 10 });
    points.push({ x: comp.x + 25, y: comp.y - 10 });
    points.push({ x: comp.x + 25, y: comp.y + 10 });
  }
  
  return points;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let lineY = y;
  
  for(let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    
    if(metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, x, lineY);
      line = words[i] + ' ';
      lineY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, lineY);
}

function isInsideRect(x, y, rx, ry, rw, rh) {
  return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh;
}

function isNearPoint(x1, y1, x2, y2, threshold = 15) {
  return Math.abs(x1 - x2) < threshold && Math.abs(y1 - y2) < threshold;
}

function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  };
}

// ============================================
// LOOP PRINCIPAL
// ============================================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#eceff1';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  if(gameState === 'menu') {
    drawMenu();
  }
  else if(gameState === 'playing' || gameState === 'testing') {
    drawTopBar();
    drawToolbar();
    drawWorkspace();
    drawInfoPanel();
  }
  
  if(showingEducation) {
    drawEducationScreen();
  }
  
  if(showingSolution) {
    drawSolutionDiagram();
  }
}

function loop() {
  draw();
  af = requestAnimationFrame(loop);
}

// ============================================
// MANEJO DE EVENTOS
// ============================================
function handleClick(e) {
  const pos = getMousePos(e);
  
  if(showingSolution) {
    const panelW = 700;
    const panelH = 520;
    const panelX = (canvas.width - panelW) / 2;
    const panelY = (canvas.height - panelH) / 2;
    const btnY = panelY + panelH - 60;
    
    if(isInsideRect(pos.x, pos.y, canvas.width/2 - 100, btnY, 200, 45)) {
      showingSolution = false;
      return;
    }
    return;
  }
  
  if(gameState === 'menu') {
    const startY = 290;
    const spacing = 70;
    
    for(let i = 0; i < LEVELS.length; i++) {
      const row = Math.floor(i / 2);
      const col = i % 2;
      const x = 200 + col * 250;
      const y = startY + row * spacing;
      
      if(isInsideRect(pos.x, pos.y, x, y, 220, 55)) {
        initLevel(i);
        return;
      }
    }
  }
  else if(gameState === 'playing') {
    const area = AREAS.infoPanel;
    
    if(isInsideRect(pos.x, pos.y, area.x + 15, area.y + 55, area.w - 30, 45)) {
      testResult = testCircuit();
      if(testResult.success) {
        score++;
        if(score > bestScore) {
          bestScore = score;
          localStorage.setItem('electricidadBest', String(bestScore));
          const playerName = localStorage.getItem('playerName') || 'Jugador';
          localStorage.setItem('electricidadBestName', playerName);
        }
        
        setTimeout(() => {
          showingEducation = true;
        }, 1000);
      }
      return;
    }
    
    if(isInsideRect(pos.x, pos.y, area.x + 15, area.y + 115, area.w - 30, 40)) {
      initLevel(currentLevel);
      return;
    }
    
    const toolArea = AREAS.toolbar;
    const level = LEVELS[currentLevel];
    let y = toolArea.y + 50;
    
    for(const compKey of level.availableComponents) {
      if(isInsideRect(pos.x, pos.y, toolArea.x + 10, y, toolArea.w - 20, 60)) {
        const comp = COMPONENT_DEFS[compKey];
        if(comp.type === 'source' || comp.type === 'neutral' || comp.type === 'wire') {
          selectedWireType = compKey;
          wireStart = null;
        } else {
          selectedWireType = null;
          draggedComponent = {
            type: compKey,
            x: pos.x,
            y: pos.y,
            id: Math.random(),
            on: compKey === 'SWITCH_SIMPLE' ? true : undefined,
            position: (compKey === 'CONMUTADOR') ? 'up' : undefined
          };
        }
        return;
      }
      y += 68;
    }
    
    const wsArea = AREAS.workspace;
    if(isInsideRect(pos.x, pos.y, wsArea.x, wsArea.y, wsArea.w, wsArea.h)) {
      for(const comp of placedComponents) {
        if(comp.type === 'SWITCH_SIMPLE' && isNearPoint(pos.x, pos.y, comp.x, comp.y, 30)) {
          comp.on = !comp.on;
          return;
        }
        if(comp.type === 'CONMUTADOR' && isNearPoint(pos.x, pos.y, comp.x, comp.y, 30)) {
          comp.position = comp.position === 'up' ? 'down' : 'up';
          return;
        }
      }
      
      if(draggedComponent) {
        const snappedPos = snapToGrid(pos.x, pos.y);
        draggedComponent.x = snappedPos.x;
        draggedComponent.y = snappedPos.y;
        placedComponents.push(draggedComponent);
        draggedComponent = null;
        return;
      }
      
      if(selectedWireType) {
        const wireColor = COMPONENT_DEFS[selectedWireType].color;
        
        if(!wireStart) {
          wireStart = { x: pos.x, y: pos.y };
        } else {
          let fromType = null;
          let toType = null;
          
          for(const comp of placedComponents) {
            if(comp.type === 'SOURCE_FASE' || comp.type === 'SOURCE_NEUTRO') {
              if(isNearPoint(wireStart.x, wireStart.y, comp.x + 20, comp.y, 20)) {
                fromType = comp.type;
              }
              if(isNearPoint(pos.x, pos.y, comp.x + 20, comp.y, 20)) {
                toType = comp.type;
              }
            } else if(comp.type === 'SWITCH_SIMPLE') {
              if(isNearPoint(wireStart.x, wireStart.y, comp.x - 25, comp.y, 20) || 
                 isNearPoint(wireStart.x, wireStart.y, comp.x + 25, comp.y, 20)) {
                fromType = comp.type;
              }
              if(isNearPoint(pos.x, pos.y, comp.x - 25, comp.y, 20) || 
                 isNearPoint(pos.x, pos.y, comp.x + 25, comp.y, 20)) {
                toType = comp.type;
              }
            } else if(comp.type === 'LIGHT_WHITE' || comp.type === 'LIGHT_YELLOW' || comp.type === 'LIGHT_RGB') {
              if(isNearPoint(wireStart.x, wireStart.y, comp.x - 15, comp.y + 20, 20) || 
                 isNearPoint(wireStart.x, wireStart.y, comp.x + 15, comp.y + 20, 20)) {
                fromType = comp.type;
              }
              if(isNearPoint(pos.x, pos.y, comp.x - 15, comp.y + 20, 20) || 
                 isNearPoint(pos.x, pos.y, comp.x + 15, comp.y + 20, 20)) {
                toType = comp.type;
              }
            } else if(comp.type === 'CONMUTADOR') {
              if(isNearPoint(wireStart.x, wireStart.y, comp.x - 25, comp.y, 20) ||
                 isNearPoint(wireStart.x, wireStart.y, comp.x + 15, comp.y - 20, 20) ||
                 isNearPoint(wireStart.x, wireStart.y, comp.x + 15, comp.y + 20, 20)) {
                fromType = comp.type;
              }
              if(isNearPoint(pos.x, pos.y, comp.x - 25, comp.y, 20) ||
                 isNearPoint(pos.x, pos.y, comp.x + 15, comp.y - 20, 20) ||
                 isNearPoint(pos.x, pos.y, comp.x + 15, comp.y + 20, 20)) {
                toType = comp.type;
              }
            } else if(comp.type === 'CRUZAMIENTO') {
              if(isNearPoint(wireStart.x, wireStart.y, comp.x - 25, comp.y - 10, 20) ||
                 isNearPoint(wireStart.x, wireStart.y, comp.x - 25, comp.y + 10, 20) ||
                 isNearPoint(wireStart.x, wireStart.y, comp.x + 25, comp.y - 10, 20) ||
                 isNearPoint(wireStart.x, wireStart.y, comp.x + 25, comp.y + 10, 20)) {
                fromType = comp.type;
              }
              if(isNearPoint(pos.x, pos.y, comp.x - 25, comp.y - 10, 20) ||
                 isNearPoint(pos.x, pos.y, comp.x - 25, comp.y + 10, 20) ||
                 isNearPoint(pos.x, pos.y, comp.x + 25, comp.y - 10, 20) ||
                 isNearPoint(pos.x, pos.y, comp.x + 25, comp.y + 10, 20)) {
                toType = comp.type;
              }
            }
          }
          
          wires.push({
            x1: wireStart.x,
            y1: wireStart.y,
            x2: pos.x,
            y2: pos.y,
            color: wireColor,
            wireType: selectedWireType,
            fromType: fromType,
            toType: toType,
            id: Math.random()
          });
          wireStart = null;
        }
        return;
      }
    }
  }
  
  if(showingEducation) {
    const panelW = 600;
    const panelH = 400;
    const panelX = (canvas.width - panelW) / 2;
    const panelY = (canvas.height - panelH) / 2;
    const btnY = panelY + panelH - 70;
    
    if(currentLevel < LEVELS.length - 1) {
      if(isInsideRect(pos.x, pos.y, canvas.width/2 - 180, btnY, 160, 45)) {
        showingEducation = false;
        initLevel(currentLevel + 1);
        return;
      }
    }
    
    if(isInsideRect(pos.x, pos.y, canvas.width/2 + 20, btnY, 160, 45)) {
      showingEducation = false;
      gameState = 'menu';
      return;
    }
  }
}

function handleMouseMove(e) {
  const pos = getMousePos(e);
  
  if(wireStart && selectedWireType) {
    const wireColor = COMPONENT_DEFS[selectedWireType].color;
    wirePreview = { x: pos.x, y: pos.y, color: wireColor };
  } else {
    wirePreview = null;
  }
  
  hoveredComponent = null;
  const wsArea = AREAS.workspace;
  if(isInsideRect(pos.x, pos.y, wsArea.x, wsArea.y, wsArea.w, wsArea.h)) {
    for(const comp of placedComponents) {
      if(!comp.fixed && isNearPoint(pos.x, pos.y, comp.x, comp.y, 35)) {
        hoveredComponent = comp.id;
        break;
      }
    }
  }
  
  if(draggedComponent) {
    draggedComponent.x = pos.x;
    draggedComponent.y = pos.y;
  }
  
  canvas.style.cursor = 'default';
  
  if(gameState === 'playing') {
    const wsArea = AREAS.workspace;
    if(isInsideRect(pos.x, pos.y, wsArea.x, wsArea.y, wsArea.w, wsArea.h)) {
      if(selectedWireType) {
        canvas.style.cursor = 'crosshair';
      } else if(draggedComponent) {
        canvas.style.cursor = 'move';
      } else if(hoveredComponent) {
        canvas.style.cursor = 'pointer';
      }
    }
    
    const toolArea = AREAS.toolbar;
    if(isInsideRect(pos.x, pos.y, toolArea.x, toolArea.y, toolArea.w, toolArea.h)) {
      canvas.style.cursor = 'pointer';
    }
    
    const infoArea = AREAS.infoPanel;
    if(isInsideRect(pos.x, pos.y, infoArea.x + 15, infoArea.y + 55, infoArea.w - 30, 45) ||
       isInsideRect(pos.x, pos.y, infoArea.x + 15, infoArea.y + 115, infoArea.w - 30, 40)) {
      canvas.style.cursor = 'pointer';
    }
  }
  
  if(gameState === 'menu') {
    const startY = 290;
    const spacing = 70;
    
    for(let i = 0; i < LEVELS.length; i++) {
      const row = Math.floor(i / 2);
      const col = i % 2;
      const x = 200 + col * 250;
      const y = startY + row * spacing;
      
      if(isInsideRect(pos.x, pos.y, x, y, 220, 55)) {
        canvas.style.cursor = 'pointer';
        break;
      }
    }
  }
}

canvas.addEventListener('click', handleClick);
canvas.addEventListener('mousemove', handleMouseMove);

gameState = 'menu';
loop();

// ============================================
// CLEANUP
// ============================================
return function cleanup() {
  if(af) cancelAnimationFrame(af);
  canvas.removeEventListener('click', handleClick);
  canvas.removeEventListener('mousemove', handleMouseMove);
};
}
