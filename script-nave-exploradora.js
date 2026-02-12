function registerGame(){
// Nave exploradora - Juego educativo de planetas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let af = null;

// Estado principal
let nave = { x: canvas.width / 2, y: canvas.height - 60, w: 30, h: 40, speed: 5 };
let teclas = {};
let planetas = [];
let orbes = [];
let mensajes = [];  // Array para efectos de partículas
let score = 0;
let highScore = Number(localStorage.getItem('naveHighScore')||0);
let highName = localStorage.getItem('naveHighScoreName')||'-';
const playerName = localStorage.getItem('playerName')||'';
let infoActual = null;
let mostrarInstrucciones = true;
let nivel = 1;
let maxNivel = 8; // 8 planetas
let metaOrbes = 7; // orbes necesarios por nivel (reducido para mejor ritmo)
let orbesNivel = 0; // contador independiente de orbes en el nivel actual
let planetasDescubiertos = 0; // Contar cuántos planetas ha descubierto en este nivel
let totalPlanetasNivel = 3; // Total de planetas en el nivel
let curiosidadesMostradas = []; // Guardar las curiosidades que vio el jugador
let modoPregunta = false;
let preguntaActual = null;
let idioma = 'es';
let zonaRespuesta = -1; // 0=izq, 1=centro, 2=der
let tiempoEnZona = 0;
let feedbackMsg = '';
let feedbackTime = 0;
let modoQuizFinal = false;
let preguntasQuizFinal = [];
let indicePreguntaActual = 0;
let respuestasCorrectasQuiz = 0;
let planetaActual = null; // El planeta que estamos estudiando este nivel
let juegoPausado = false; // Pausa completa para leer info
let esperandoTeclaDespausar = false; // Esperando que pulse tecla para continuar
let timerQuiz = 60; // 60 segundos para responder cada pregunta (más tiempo)
let timerQuizActivo = false;
let juegoTerminado = false; // Flag para GAME OVER

const datosPlanetas = [
  { 
    nombre: { es: 'Mercurio', en: 'Mercury' },
    color: '#BFB9AB',
    datos: [
      { es: 'El más cercano al Sol y el más rápido.', en: 'The closest to the Sun and the fastest.' },
      { es: 'Su superficie está llena de cráteres.', en: 'Its surface is full of craters.' },
      { es: 'Un día dura 59 días terrestres.', en: 'One day lasts 59 Earth days.' },
      { es: 'Es el planeta más pequeño.', en: 'It is the smallest planet.' },
      { es: 'Tiene temperaturas extremas.', en: 'It has extreme temperatures.' }
    ],
    quiz: [
      {
        pregunta: { es: '¿Cuál es el planeta más cercano al Sol?', en: 'Which planet is closest to the Sun?' },
        correcta: 'Mercury',
        opciones: ['Mercury', 'Venus', 'Mars']
      },
      {
        pregunta: { es: '¿Qué planeta es el más pequeño?', en: 'Which planet is the smallest?' },
        correcta: 'Mercury',
        opciones: ['Earth', 'Mercury', 'Mars']
      }
    ]
  },
  { 
    nombre: { es: 'Venus', en: 'Venus' },
    color: '#E8CA9A',
    datos: [
      { es: 'Es el planeta más caliente.', en: 'It is the hottest planet.' },
      { es: 'Gira en sentido contrario.', en: 'It rotates backwards.' },
      { es: 'Un día es más largo que su año.', en: 'One day is longer than its year.' },
      { es: 'Tiene nubes de ácido sulfúrico.', en: 'It has sulfuric acid clouds.' },
      { es: 'Es el gemelo de la Tierra.', en: 'It is Earth\'s twin.' }
    ],
    quiz: [
      {
        pregunta: { es: '¿Cuál es el planeta más caliente?', en: 'Which is the hottest planet?' },
        correcta: 'Venus',
        opciones: ['Mercury', 'Venus', 'Mars']
      },
      {
        pregunta: { es: '¿Qué planeta gira al revés?', en: 'Which planet rotates backwards?' },
        correcta: 'Venus',
        opciones: ['Venus', 'Uranus', 'Neptune']
      }
    ]
  },
  { 
    nombre: { es: 'Tierra', en: 'Earth' },
    color: '#3282B8',
    datos: [
      { es: 'Nuestro hogar con vida conocida.', en: 'Our home with known life.' },
      { es: 'Tiene océanos de agua líquida.', en: 'It has liquid water oceans.' },
      { es: 'Su atmósfera tiene oxígeno.', en: 'Its atmosphere has oxygen.' },
      { es: 'Tiene placas tectónicas activas.', en: 'It has active tectonic plates.' },
      { es: 'Tiene un campo magnético protector.', en: 'It has a protective magnetic field.' }
    ],
    quiz: [
      {
        pregunta: { es: '¿Dónde vivimos nosotros?', en: 'Where do we live?' },
        correcta: 'Earth',
        opciones: ['Mars', 'Earth', 'Venus']
      },
      {
        pregunta: { es: '¿Qué planeta tiene agua líquida?', en: 'Which planet has liquid water?' },
        correcta: 'Earth',
        opciones: ['Earth', 'Mars', 'Venus']
      }
    ]
  },
  { 
    nombre: { es: 'Marte', en: 'Mars' },
    color: '#CD6133',
    datos: [
      { es: 'El planeta rojo por su óxido.', en: 'The red planet from its rust.' },
      { es: 'Tiene el monte más alto: Olympus Mons.', en: 'It has the highest mountain: Olympus Mons.' },
      { es: 'Tiene dos lunas: Fobos y Deimos.', en: 'It has two moons: Phobos and Deimos.' },
      { es: 'Tuvo agua líquida en el pasado.', en: 'It had liquid water in the past.' },
      { es: 'Es el más explorado por robots.', en: 'It is the most explored by robots.' }
    ],
    quiz: [
      {
        pregunta: { es: '¿Cuál es el planeta rojo?', en: 'Which is the red planet?' },
        correcta: 'Mars',
        opciones: ['Mars', 'Venus', 'Mercury']
      },
      {
        pregunta: { es: '¿Qué planeta tiene el monte más alto?', en: 'Which planet has the highest mountain?' },
        correcta: 'Mars',
        opciones: ['Earth', 'Mars', 'Venus']
      }
    ]
  },
  { 
    nombre: { es: 'Júpiter', en: 'Jupiter' },
    color: '#E6C98C',
    datos: [
      { es: 'El planeta más grande.', en: 'The largest planet.' },
      { es: 'Tiene la Gran Mancha Roja.', en: 'It has the Great Red Spot.' },
      { es: 'Tiene al menos 79 lunas.', en: 'It has at least 79 moons.' },
      { es: 'Es un gigante gaseoso.', en: 'It is a gas giant.' },
      { es: 'Su día dura solo 10 horas.', en: 'Its day lasts only 10 hours.' }
    ],
    quiz: [
      {
        pregunta: { es: '¿Cuál es el planeta más grande?', en: 'Which is the largest planet?' },
        correcta: 'Jupiter',
        opciones: ['Saturn', 'Jupiter', 'Uranus']
      },
      {
        pregunta: { es: '¿Qué planeta tiene la Gran Mancha Roja?', en: 'Which planet has the Great Red Spot?' },
        correcta: 'Jupiter',
        opciones: ['Jupiter', 'Mars', 'Saturn']
      }
    ]
  },
  { 
    nombre: { es: 'Saturno', en: 'Saturn' },
    color: '#F7EABC',
    datos: [
      { es: 'Famoso por sus anillos espectaculares.', en: 'Famous for its spectacular rings.' },
      { es: 'Flotaría en agua por su baja densidad.', en: 'It would float in water due to low density.' },
      { es: 'Tiene al menos 82 lunas.', en: 'It has at least 82 moons.' },
      { es: 'Sus vientos alcanzan 1.800 km/h.', en: 'Its winds reach 1,800 km/h.' },
      { es: 'Tiene hexágonos en sus polos.', en: 'It has hexagons at its poles.' }
    ],
    quiz: [
      {
        pregunta: { es: '¿Qué planeta tiene anillos famosos?', en: 'Which planet has famous rings?' },
        correcta: 'Saturn',
        opciones: ['Jupiter', 'Saturn', 'Uranus']
      },
      {
        pregunta: { es: '¿Cuál flotaría en agua?', en: 'Which would float in water?' },
        correcta: 'Saturn',
        opciones: ['Saturn', 'Jupiter', 'Neptune']
      }
    ]
  },
  { 
    nombre: { es: 'Urano', en: 'Uranus' },
    color: '#9AD4D6',
    datos: [
      { es: 'Gira tumbado de lado.', en: 'It rotates on its side.' },
      { es: 'Primer planeta descubierto con telescopio.', en: 'First planet discovered with telescope.' },
      { es: 'Su color es azul verdoso por el metano.', en: 'Its color is blue-green from methane.' },
      { es: 'Sus estaciones duran 21 años cada una.', en: 'Its seasons last 21 years each.' },
      { es: 'Es un gigante helado.', en: 'It is an ice giant.' }
    ],
    quiz: [
      {
        pregunta: { es: '¿Qué planeta gira de lado?', en: 'Which planet rotates sideways?' },
        correcta: 'Uranus',
        opciones: ['Neptune', 'Uranus', 'Saturn']
      },
      {
        pregunta: { es: '¿Cuál fue descubierto con telescopio?', en: 'Which was discovered with telescope?' },
        correcta: 'Uranus',
        opciones: ['Uranus', 'Neptune', 'Jupiter']
      }
    ]
  },
  { 
    nombre: { es: 'Neptuno', en: 'Neptune' },
    color: '#5151D3',
    datos: [
      { es: 'El más distante del Sol.', en: 'The most distant from the Sun.' },
      { es: 'Tiene vientos de 2.100 km/h.', en: 'It has winds of 2,100 km/h.' },
      { es: 'Fue descubierto por cálculos matemáticos.', en: 'It was discovered by math calculations.' },
      { es: 'Tiene 14 lunas conocidas.', en: 'It has 14 known moons.' },
      { es: 'Su color azul es por el metano.', en: 'Its blue color is from methane.' }
    ],
    quiz: [
      {
        pregunta: { es: '¿Cuál es el planeta más lejano?', en: 'Which is the most distant planet?' },
        correcta: 'Neptune',
        opciones: ['Uranus', 'Neptune', 'Saturn']
      },
      {
        pregunta: { es: '¿Qué planeta tiene los vientos más rápidos?', en: 'Which planet has the fastest winds?' },
        correcta: 'Neptune',
        opciones: ['Jupiter', 'Saturn', 'Neptune']
      }
    ]
  }
];

function getPlanetaDelNivel(nivelNum) {
  // Cada nivel corresponde a un planeta en orden
  const index = Math.min(nivelNum - 1, datosPlanetas.length - 1);
  return datosPlanetas[index];
}

function crearPlanetas() {
  planetas = [];
  planetasDescubiertos = 0; // Reset contador
  curiosidadesMostradas = []; // Reset curiosidades vistas
  
  // El nivel actual determina qué planeta estudiamos
  const planetaData = getPlanetaDelNivel(nivel);
  planetaActual = planetaData;
  
  // Crear el planeta principal del nivel (más grande, centrado)
  const datoIdx = Math.floor(Math.random() * planetaData.datos.length);
  const datoAleatorio = planetaData.datos[datoIdx];
  
  planetas.push({
    x: canvas.width / 2,
    y: 150,
    r: 45, // Más grande
    nombreES: planetaData.nombre.es,
    nombreEN: planetaData.nombre.en,
    dato: datoAleatorio,
    color: planetaData.color,
    descubierto: false,
    planetaData: planetaData,
    esPrincipal: true
  });
  
  // Añadir 2 mini-planetas informativos adicionales
  for (let i = 0; i < 2; i++) {
    const datoIdx2 = Math.floor(Math.random() * planetaData.datos.length);
    planetas.push({
      x: 80 + Math.random() * (canvas.width - 160),
      y: 250 + Math.random() * 150,
      r: 20 + Math.random() * 10,
      nombreES: planetaData.nombre.es,
      nombreEN: planetaData.nombre.en,
      dato: planetaData.datos[datoIdx2],
      color: planetaData.color,
      descubierto: false,
      planetaData: planetaData,
      esPrincipal: false
    });
  }
}

function crearOrbe() {
  orbes.push({ x: 30 + Math.random() * (canvas.width - 60), y: -20, r: 8, dy: 2 + Math.random() * 2 });
}

function drawNave() {
  ctx.save();
  ctx.translate(nave.x, nave.y);
  
  // Sombra de la nave
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 5;
  
  // Cuerpo principal del cohete
  const gradient = ctx.createLinearGradient(-nave.w/2, -nave.h/2, nave.w/2, nave.h/2);
  gradient.addColorStop(0, '#f5f5f5');
  gradient.addColorStop(0.5, '#90caf9');
  gradient.addColorStop(1, '#5d99c6');
  
  // Forma mejorada del cohete
  ctx.beginPath();
  // Punta del cohete
  ctx.moveTo(0, -nave.h/2);
  // Cuerpo principal (más estilizado)
  ctx.bezierCurveTo(
    nave.w/2.5, -nave.h/3,
    nave.w/2, -nave.h/8,
    nave.w/2, nave.h/6
  );
  ctx.lineTo(nave.w/2, nave.h/3);
  // Base del cohete
  ctx.lineTo(nave.w/2.2, nave.h/2);
  ctx.lineTo(-nave.w/2.2, nave.h/2);
  ctx.lineTo(-nave.w/2, nave.h/3);
  ctx.lineTo(-nave.w/2, nave.h/6);
  ctx.bezierCurveTo(
    -nave.w/2, -nave.h/8,
    -nave.w/2.5, -nave.h/3,
    0, -nave.h/2
  );
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // Ventana de la nave
  ctx.beginPath();
  ctx.arc(0, -nave.h/8, nave.w/5, 0, Math.PI * 2);
  ctx.fillStyle = '#c2e8ff';
  ctx.fill();
  ctx.strokeStyle = '#1565c0';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Brillo en la ventana
  ctx.beginPath();
  ctx.arc(-nave.w/15, -nave.h/8 - nave.w/15, nave.w/12, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fill();
  
  // Detalles de la nave (aletas laterales)
  ctx.beginPath();
  ctx.moveTo(nave.w/2.2, nave.h/3);
  ctx.lineTo(nave.w/1.5, nave.h/2.5);
  ctx.lineTo(nave.w/1.8, nave.h/1.5);
  ctx.lineTo(nave.w/2.2, nave.h/2);
  ctx.closePath();
  ctx.fillStyle = '#1565c0';
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(-nave.w/2.2, nave.h/3);
  ctx.lineTo(-nave.w/1.5, nave.h/2.5);
  ctx.lineTo(-nave.w/1.8, nave.h/1.5);
  ctx.lineTo(-nave.w/2.2, nave.h/2);
  ctx.closePath();
  ctx.fillStyle = '#1565c0';
  ctx.fill();
  
  // Franja decorativa
  ctx.beginPath();
  ctx.moveTo(-nave.w/3, -nave.h/4);
  ctx.lineTo(nave.w/3, -nave.h/4);
  ctx.lineTo(nave.w/3, -nave.h/4 + 5);
  ctx.lineTo(-nave.w/3, -nave.h/4 + 5);
  ctx.closePath();
  ctx.fillStyle = '#f50057';
  ctx.fill();
  
  // Fuego del motor cuando se pulsa teclas de movimiento
  if (teclas['ArrowUp'] || teclas['ArrowLeft'] || teclas['ArrowRight']) {
    // Fuego principal
    const fireGradient = ctx.createLinearGradient(0, nave.h/2, 0, nave.h/2 + 25);
    fireGradient.addColorStop(0, '#ff9800');
    fireGradient.addColorStop(0.5, '#ff5722');
    fireGradient.addColorStop(1, 'rgba(255, 87, 34, 0)');
    
    ctx.beginPath();
    // Fuego ondulante (más dinámico)
    const time = Date.now() / 100;
    ctx.moveTo(-nave.w/4, nave.h/2);
    
    // Fuego ondulado con matemática sinusoidal
    for (let i = -nave.w/4; i <= nave.w/4; i += nave.w/12) {
      const height = nave.h/2 + 15 + Math.sin((i + time) / 5) * 5;
      ctx.lineTo(i, height);
    }
    
    ctx.lineTo(nave.w/4, nave.h/2);
    ctx.closePath();
    ctx.fillStyle = fireGradient;
    ctx.fill();
    
    // Brillo interior del fuego
    const innerFireGradient = ctx.createLinearGradient(0, nave.h/2, 0, nave.h/2 + 15);
    innerFireGradient.addColorStop(0, '#ffeb3b');
    innerFireGradient.addColorStop(1, 'rgba(255, 235, 59, 0)');
    
    ctx.beginPath();
    ctx.moveTo(-nave.w/8, nave.h/2);
    
    // Fuego interior más pequeño
    for (let i = -nave.w/8; i <= nave.w/8; i += nave.w/16) {
      const height = nave.h/2 + 10 + Math.sin((i + time + 2) / 4) * 3;
      ctx.lineTo(i, height);
    }
    
    ctx.lineTo(nave.w/8, nave.h/2);
    ctx.closePath();
    ctx.fillStyle = innerFireGradient;
    ctx.fill();
    
    // Pequeñas partículas de fuego
    for (let i = 0; i < 3; i++) {
      const offsetX = (Math.random() - 0.5) * nave.w/2;
      const offsetY = nave.h/2 + 5 + Math.random() * 15;
      const size = 1 + Math.random() * 2;
      
      ctx.beginPath();
      ctx.arc(offsetX, offsetY, size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, ' + (0.7 - offsetY / 30) + ')';
      ctx.fill();
    }
  }
  
  // Quitar la sombra para el resto de elementos
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  
  ctx.restore();
}

function drawPlanetas() {
  for (let p of planetas) {
    // Crear un gradiente radial para dar profundidad al planeta
    const gradient = ctx.createRadialGradient(
      p.x - p.r/3, p.y - p.r/3, 0,
      p.x, p.y, p.r
    );
    
    if (p.descubierto) {
      // Planeta descubierto: usar su color real con un brillo
      gradient.addColorStop(0, lightenColor(p.color, 40));
      gradient.addColorStop(0.7, p.color);
      gradient.addColorStop(1, darkenColor(p.color, 30));
      
      // Dibujar aura alrededor del planeta descubierto
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r + 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fill();
    } else {
      // Planeta no descubierto: marrón/gris misterioso
      gradient.addColorStop(0, '#8d6e63');
      gradient.addColorStop(0.7, '#6d4c41');
      gradient.addColorStop(1, '#4e342e');
    }
    
    // Dibujar el planeta con el gradiente
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Para planetas descubiertos, agregar características según el planeta
    if (p.descubierto) {
      // Características especiales según el planeta
      if (p.nombre === 'Saturno') {
        // Anillos para Saturno
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.r * 1.8, p.r * 0.5, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 231, 186, 0.8)';
        ctx.lineWidth = 3;
        ctx.stroke();
      } else if (p.nombre === 'Júpiter') {
        // Bandas para Júpiter
        for (let i = -3; i <= 3; i+=2) {
          ctx.beginPath();
          ctx.ellipse(p.x, p.y + i * p.r/10, p.r * 0.85, p.r/10, 0, 0, Math.PI * 2);
          ctx.fillStyle = i % 4 === 0 ? '#D1A566' : '#E6C98C';
          ctx.fill();
        }
      } else if (p.nombre === 'Marte') {
        // Casquetes polares para Marte
        ctx.beginPath();
        ctx.ellipse(p.x, p.y - p.r * 0.7, p.r * 0.3, p.r * 0.2, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
      }
      
      // Nombre del planeta
      ctx.font = 'bold 13px Arial';
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.textAlign = 'center';
      ctx.strokeText(p.nombreES, p.x, p.y - p.r - 10);
      ctx.fillText(p.nombreES, p.x, p.y - p.r - 10);
    }
  }
}

// Funciones de ayuda para aclarar y oscurecer colores
function lightenColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (
    0x1000000 + 
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 + 
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 + 
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}

function darkenColor(color, percent) {
  return lightenColor(color, -percent);
}

function drawOrbes() {
  ctx.fillStyle = '#7e57c2';
  for (let o of orbes) {
    ctx.beginPath();
    ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
}

function drawHUD() {
  ctx.save();
  if(window.GameUI){ GameUI.gradientBar(ctx,canvas.width,60,'#0d47a1','#1565c0'); } else { ctx.fillStyle='#0d47a1'; ctx.fillRect(0,0,canvas.width,60);} 
  ctx.font = '16px Arial';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  ctx.fillText('Puntos: ' + score, 12, 24);
  
  // Mostrar planeta actual del nivel (bilingüe)
  if (planetaActual) {
    const textoNivel = 'Level ' + nivel + ': ' + planetaActual.nombre.en + ' (' + planetaActual.nombre.es + ')';
    ctx.fillText(textoNivel, 12, 44);
  } else {
    ctx.fillText('Level ' + nivel, 12, 44);
  }
  
  ctx.textAlign = 'right';
  ctx.fillText('Orbes: ' + orbesNivel + ' / ' + metaOrbes, canvas.width - 12, 24);
  
  // Mostrar progreso de descubrimientos
  const completoOrbes = orbesNivel >= metaOrbes ? '✓' : '';
  const completoPlanetas = planetasDescubiertos >= totalPlanetasNivel ? '✓' : '';
  ctx.fillText(`Planetas: ${planetasDescubiertos}/${totalPlanetasNivel} ${completoPlanetas}`, canvas.width - 12, 44);
  
  ctx.textAlign = 'left';
  ctx.font = '12px Arial';
  ctx.fillText('Récord: ' + highScore, 12, canvas.height - 10);
  ctx.restore();
}

function drawInfo() {
  if (!infoActual) return;
  
  ctx.save();
  
  const boxWidth = canvas.width - 100;
  const boxHeight = 100;
  const boxX = 50;
  const boxY = canvas.height - 120;
  const cornerRadius = 15;
  
  // Color de fondo basado en el planeta
  let bgColor = '#37474f'; // Color por defecto
  let borderColor = '#78909c';
  let iconEmoji = '🪐'; // Emoji por defecto
  
  // Buscar el planeta en la lista para obtener su color
  for (const planeta of planetas) {
    if (planeta.nombreES === infoActual.nombre || planeta.nombreEN === infoActual.nombre) {
      // Usar el color del planeta para el fondo
      bgColor = planeta.color;
      // Determinar un color de borde más oscuro
      borderColor = darkenColor(planeta.color, 20);
      break;
    }
  }
  
  // Emoji específico según el planeta
  switch(infoActual.nombre) {
    case 'Mercurio': iconEmoji = '☿️'; break;
    case 'Venus': iconEmoji = '♀️'; break;
    case 'Tierra': iconEmoji = '🌎'; break;
    case 'Marte': iconEmoji = '♂️'; break;
    case 'Júpiter': iconEmoji = '♃'; break;
    case 'Saturno': iconEmoji = '♄'; break;
    case 'Urano': iconEmoji = '♅'; break;
    case 'Neptuno': iconEmoji = '♆'; break;
    case '¡Completado!': iconEmoji = '🏆'; break;
  }
  
  // Dibujar el panel con esquinas redondeadas y sombra
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetY = 5;
  
  // Fondo del panel con gradiente
  const gradient = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxHeight);
  gradient.addColorStop(0, lightenColor(bgColor, 10));
  gradient.addColorStop(1, darkenColor(bgColor, 10));
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxWidth, boxHeight, cornerRadius);
  ctx.fill();
  
  // Borde del panel
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // Quitar sombra para el texto
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  
  // Título con icono
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'left';
  
  // Determinar el color del texto (claro u oscuro) según el color de fondo
  const isLightBg = isLightColor(bgColor);
  const textColor = isLightBg ? '#000000' : '#ffffff';
  
  ctx.fillStyle = textColor;
  ctx.fillText(`${iconEmoji} ${infoActual.nombre}`, boxX + 20, boxY + 35);
  
  // Mostrar progreso si existe
  if (infoActual.descubiertos) {
    ctx.font = '14px Arial';
    ctx.fillStyle = isLightBg ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)';
    ctx.textAlign = 'right';
    ctx.fillText(`Descubiertos: ${infoActual.descubiertos}`, boxX + boxWidth - 20, boxY + 35);
  }
  
  // Línea divisoria
  ctx.strokeStyle = isLightBg ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(boxX + 20, boxY + 45);
  ctx.lineTo(boxX + boxWidth - 20, boxY + 45);
  ctx.stroke();
  
  // Dato del planeta
  ctx.font = '16px Arial';
  ctx.fillStyle = textColor;
  ctx.textAlign = 'left';
  
  // Dibujar el texto con ajuste de línea (verificar que existe)
  if (infoActual.dato && typeof infoActual.dato === 'string') {
    wrapText(ctx, infoActual.dato, boxX + 20, boxY + 70, boxWidth - 40, 20);
  } else if (infoActual.dato) {
    // Si dato es un objeto, intentar mostrar la versión en español
    const textoMostrar = infoActual.dato.es || infoActual.dato.en || '';
    wrapText(ctx, textoMostrar, boxX + 20, boxY + 70, boxWidth - 40, 20);
  }
  
  // Indicación para continuar (si está pausado)
  if (esperandoTeclaDespausar) {
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = isLightBg ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)';
    ctx.textAlign = 'center';
    
    // Efecto parpadeante
    const parpadeo = Math.floor(Date.now() / 500) % 2 === 0 ? 1 : 0.5;
    ctx.globalAlpha = parpadeo;
    ctx.fillText('▼ Pulsa ESPACIO o cualquier letra para continuar ▼', canvas.width / 2, boxY + boxHeight - 15);
    ctx.globalAlpha = 1;
  }
  
  ctx.restore();
}

// Función para determinar si un color es claro (para elegir color de texto)
function isLightColor(color) {
  // Convertir el color a RGB
  const r = parseInt(color.substr(1, 2), 16);
  const g = parseInt(color.substr(3, 2), 16);
  const b = parseInt(color.substr(5, 2), 16);
  
  // Calcular la luminosidad percibida
  // Fórmula de W3C para calcular la luminosidad relativa
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Si la luminosidad es mayor a 0.5, el color es claro
  return luminance > 0.5;
}

// Función para ajustar texto a múltiples líneas
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let testLine = '';
  let lineCount = 0;
  
  for (let n = 0; n < words.length; n++) {
    testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
      lineCount++;
      
      if (lineCount >= 2) {
        // Si hay más de dos líneas, agregar puntos suspensivos
        if (n < words.length - 1) {
          const lastSpace = line.lastIndexOf(' ');
          if (lastSpace !== -1) {
            line = line.substring(0, lastSpace) + '...';
          } else {
            line += '...';
          }
        }
        ctx.fillText(line, x, y);
        break;
      }
    } else {
      line = testLine;
    }
  }
  
  if (lineCount < 2) {
    ctx.fillText(line, x, y);
  }
}

function drawInstrucciones() {
  if (!mostrarInstrucciones) return;
  const x=40,y=80,w=canvas.width-80,h=200; if(window.GameUI){ GameUI.glassPanel(ctx,x,y,w,h,20);} else { ctx.save(); ctx.globalAlpha=0.92; ctx.fillStyle='#000'; ctx.fillRect(x,y,w,h); ctx.restore(); }
  ctx.save(); ctx.fillStyle='#fff'; ctx.font='bold 22px Arial'; ctx.textAlign='center'; ctx.fillText('🚀 Nave Exploradora', canvas.width/2, y+36); ctx.font='14px Arial'; ctx.fillText('◀ ▲ ▶ ▼ Flechas para mover la nave', canvas.width/2, y+70); ctx.fillText('🔮 Reúne 7 orbes morados', canvas.width/2, y+92); ctx.fillText('🪐 Descubre los 3 planetas (acércate)', canvas.width/2, y+114); ctx.fillText('📝 Quiz final con 60 segundos por pregunta', canvas.width/2, y+136); ctx.fillText('⚠️ GAME OVER si fallas el quiz', canvas.width/2, y+158); ctx.fillText('Pulsa cualquier tecla para empezar', canvas.width/2, y+178); ctx.restore();
}

function update() {
  // Feedback temporal
  if (feedbackTime > 0) {
    feedbackTime--;
    if (feedbackTime === 0) feedbackMsg = '';
  }

  // Si el juego terminó (GAME OVER), no actualizar nada
  if (juegoTerminado) {
    return;
  }

  // Si el juego está pausado, no actualizar nada
  if (juegoPausado) {
    return;
  }

  // Modo pregunta: el juego está pausado, solo esperamos tecla A, B o C
  if (modoPregunta) {
    // Actualizar timer del quiz
    if (timerQuizActivo && !juegoPausado) {
      timerQuiz -= 1/60; // Descontar tiempo (asumiendo 60fps)
      
      if (timerQuiz <= 0) {
        // Se acabó el tiempo - respuesta incorrecta automática
        timerQuizActivo = false;
        
        feedbackMsg = preguntaActual.idiomaPregunta === 'es'
          ? `⏰ Tiempo agotado. Era: ${preguntaActual.correcta}`
          : `⏰ Time's up. It was: ${preguntaActual.correcta}`;
        feedbackTime = 120;
        
        juegoPausado = true;
        indicePreguntaActual++;
        
        setTimeout(() => {
          juegoPausado = false;
          if (modoQuizFinal) {
            cargarPreguntaQuizFinal();
          }
        }, 2500);
        
        modoPregunta = false;
        preguntaActual = null;
        zonaRespuesta = -1;
        tiempoEnZona = 0;
        return;
      }
    }
    
    return; // No ejecutar el resto del update en modo pregunta
  }

  // Movimiento nave normal
  if (teclas['ArrowLeft'] && nave.x - nave.w/2 > 0) nave.x -= nave.speed;
  if (teclas['ArrowRight'] && nave.x + nave.w/2 < canvas.width) nave.x += nave.speed;
  if (teclas['ArrowUp'] && nave.y - nave.h/2 > 0) nave.y -= nave.speed;
  if (teclas['ArrowDown'] && nave.y + nave.h/2 < canvas.height) nave.y += nave.speed;

  // Orbes
  if (Math.random() < 0.02) crearOrbe();
  for (let o of orbes) {
    o.y += o.dy;
  }
  orbes = orbes.filter(o => o.y < canvas.height + 20);

  // Colisión orbes
  for (let i = orbes.length - 1; i >= 0; i--) {
    let o = orbes[i];
    if (Math.abs(o.x - nave.x) < 20 && Math.abs(o.y - nave.y) < 30) {
      score += 20;
      orbesNivel++;
      orbes.splice(i, 1);
    }
  }

  // Descubrir planetas
  for (let p of planetas) {
    let dx = p.x - nave.x;
    let dy = p.y - nave.y;
    let dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < p.r + 30 && !p.descubierto) {
      p.descubierto = true;
      planetasDescubiertos++;
      score += 30; // Puntos extra por descubrir un planeta
      
      // Guardar curiosidad mostrada para generar preguntas
      const curiosidad = p.dato.es;
      curiosidadesMostradas.push({
        texto: curiosidad,
        nombreES: p.nombreES,
        nombreEN: p.nombreEN
      });
      
      // Efecto visual al descubrir un planeta
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = p.r + Math.random() * 20;
        const speed = 0.5 + Math.random() * 1.5;
        
        mensajes.push({
          x: p.x + Math.cos(angle) * distance,
          y: p.y + Math.sin(angle) * distance,
          size: 2 + Math.random() * 3,
          color: p.color,
          speedX: Math.cos(angle) * speed,
          speedY: Math.sin(angle) * speed,
          life: 40 + Math.random() * 20
        });
      }
      
      // Mostrar información sobre el planeta y PAUSAR el juego
      infoActual = { 
        nombre: p.nombreES, 
        dato: p.dato.es, // Siempre mostrar datos en español
        descubiertos: planetasDescubiertos + ' / ' + totalPlanetasNivel
      };
      
      // Pausar juego para que pueda leer tranquilo
      juegoPausado = true;
      esperandoTeclaDespausar = true;
    }
  }
  
  // Actualizar partículas de efectos
  for (let i = mensajes.length - 1; i >= 0; i--) {
    mensajes[i].x += mensajes[i].speedX;
    mensajes[i].y += mensajes[i].speedY;
    mensajes[i].life--;
    
    if (mensajes[i].life <= 0) {
      mensajes.splice(i, 1);
    }
  }

  // Al completar orbes Y descubrir todos los planetas → Quiz final
  if (orbesNivel >= metaOrbes && planetasDescubiertos >= totalPlanetasNivel && !modoQuizFinal) {
    iniciarQuizFinal();
  }
}

function iniciarQuizFinal() {
  modoQuizFinal = true;
  modoPregunta = true;
  indicePreguntaActual = 0;
  respuestasCorrectasQuiz = 0;
  
  // Generar preguntas basadas en las curiosidades que vio
  preguntasQuizFinal = [];
  
  if (curiosidadesMostradas.length > 0 && planetaActual) {
    // Por cada curiosidad vista, crear una pregunta personalizada
    curiosidadesMostradas.forEach(curiosidad => {
      // Usar las preguntas predefinidas del planeta pero relacionadas con lo que vio
      const preguntasBase = planetaActual.quiz;
      if (preguntasBase && preguntasBase.length > 0) {
        // Añadir todas las preguntas del quiz predefinido
        preguntasQuizFinal.push(...preguntasBase);
      }
    });
    
    // Mezclar preguntas
    for (let i = preguntasQuizFinal.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [preguntasQuizFinal[i], preguntasQuizFinal[j]] = [preguntasQuizFinal[j], preguntasQuizFinal[i]];
    }
    
    // Cargar primera pregunta
    cargarPreguntaQuizFinal();
  }
}

function cargarPreguntaQuizFinal() {
  if (indicePreguntaActual >= preguntasQuizFinal.length) {
    finalizarQuizFinal();
    return;
  }
  
  zonaRespuesta = -1;
  tiempoEnZona = 0;
  timerQuiz = 60; // Reset timer a 60 segundos
  timerQuizActivo = true;
  
  // Alternar idioma
  idioma = Math.random() < 0.5 ? 'es' : 'en';
  
  const q = preguntasQuizFinal[indicePreguntaActual];
  
  preguntaActual = {
    texto: q.pregunta[idioma],
    opciones: q.opciones,
    correcta: q.correcta,
    idiomaPregunta: idioma,
    numero: indicePreguntaActual + 1,
    total: preguntasQuizFinal.length
  };
}

function finalizarQuizFinal() {
  modoQuizFinal = false;
  modoPregunta = false;
  preguntaActual = null;
  timerQuizActivo = false;
  
  // Pausar para leer resultado final
  juegoPausado = true;
  
  // Necesita al menos 1 respuesta correcta para pasar
  const aprobado = respuestasCorrectasQuiz >= 1;
  
  if (aprobado) {
    // Bonus por aprobar
    const bonus = respuestasCorrectasQuiz * 50;
    score += bonus;
    
    feedbackMsg = `¡Nivel completado! +${bonus} bonus`;
    feedbackTime = 240; // Más tiempo para leer
    
    // Avanzar nivel
    nivel++;
    if(score>highScore){ 
      highScore=score; 
      highName=playerName||'-'; 
      localStorage.setItem('naveHighScore', String(highScore)); 
      localStorage.setItem('naveHighScoreName', highName); 
    }
    
    orbesNivel = 0;
    
    if (nivel > maxNivel) {
      infoActual = { nombre: '¡Completado!', dato: '¡Has explorado todos los planetas del sistema solar!' };
      esperandoTeclaDespausar = true; // Esperar tecla para terminar
    } else {
      // Preparar siguiente nivel
      setTimeout(() => {
        juegoPausado = false;
        crearPlanetas();
      }, 3500); // Más tiempo para disfrutar el logro
    }
  } else {
    // GAME OVER - Reiniciar desde nivel 1
    juegoTerminado = true; // Activar flag de game over
    feedbackMsg = '❌ GAME OVER - No aprobaste el quiz';
    feedbackTime = 300; // Más tiempo para leer
    
    setTimeout(() => {
      // Reiniciar todo el juego
      juegoTerminado = false;
      nivel = 1;
      score = 0;
      orbesNivel = 0;
      planetasDescubiertos = 0;
      curiosidadesMostradas = [];
      juegoPausado = false;
      crearPlanetas();
    }, 5000); // Más tiempo para ver GAME OVER
  }
}

// Pre-generar estrellas con formas reales (puntas)
const estrellas = Array.from({length:60},()=>({
  x: Math.random()*canvas.width,
  y: Math.random()*canvas.height,
  r: 1+Math.random()*1.5,
  p: 5 + Math.floor(Math.random()*2),
  o: 0.5 + Math.random()*0.5
}));

function drawStar(s){
  const rot = Math.PI/2 * 3;
  let x = s.x;
  let y = s.y;
  let spikes = s.p;
  let outerRadius = s.r*2.2;
  let innerRadius = s.r;
  let angle = 0;
  ctx.beginPath();
  ctx.moveTo(x, y - outerRadius);
  for (let i=0;i<spikes;i++){
    let rx = x + Math.cos(angle) * outerRadius;
    let ry = y + Math.sin(angle) * outerRadius;
    ctx.lineTo(rx, ry);
    angle += Math.PI / spikes;
    rx = x + Math.cos(angle) * innerRadius;
    ry = y + Math.sin(angle) * innerRadius;
    ctx.lineTo(rx, ry);
    angle += Math.PI / spikes;
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,'+s.o+')';
  ctx.fill();
}

function drawMensajes() {
  // Dibujar partículas de efectos
  for (let m of mensajes) {
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
    ctx.fillStyle = m.color + Math.floor(m.life * 255 / 60).toString(16).padStart(2, '0');
    ctx.fill();
  }
}

function drawFondo() {
  ctx.save();
  ctx.fillStyle = '#000014';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  estrellas.forEach(drawStar);
  ctx.restore();
}

function iniciarPregunta(planeta) {
  modoPregunta = true;
  zonaRespuesta = -1;
  tiempoEnZona = 0;
  
  // Alternar idioma aleatoriamente
  idioma = Math.random() < 0.5 ? 'es' : 'en';
  
  const q = planeta.planetaData.quiz[Math.floor(Math.random() * planeta.planetaData.quiz.length)];
  
  preguntaActual = {
    texto: q.pregunta[idioma],
    opciones: q.opciones,
    correcta: q.correcta,
    idiomaPregunta: idioma
  };
}

function comprobarRespuesta(index) {
  if (!preguntaActual) return;
  
  timerQuizActivo = false; // Detener timer
  
  const respuesta = preguntaActual.opciones[index];
  const esCorrecto = respuesta === preguntaActual.correcta;
  
  if (modoQuizFinal) {
    // En quiz final: contar respuestas y pasar a siguiente
    if (esCorrecto) {
      respuestasCorrectasQuiz++;
      score += 100;
      feedbackMsg = preguntaActual.idiomaPregunta === 'es' ? '¡Correcto! +100' : 'Correct! +100';
    } else {
      feedbackMsg = preguntaActual.idiomaPregunta === 'es' 
        ? `Incorrecto. Era: ${preguntaActual.correcta}` 
        : `Wrong. It was: ${preguntaActual.correcta}`;
    }
    
    feedbackTime = 120;
    
    // Pausar brevemente para leer feedback
    juegoPausado = true;
    
    // Desactivar pregunta actual temporalmente
    const preguntaTemp = preguntaActual;
    preguntaActual = null;
    
    // Avanzar a siguiente pregunta del quiz
    indicePreguntaActual++;
    
    setTimeout(() => {
      juegoPausado = false;
      if (modoQuizFinal) {
        cargarPreguntaQuizFinal(); // Esto reactivará modoPregunta si hay más preguntas
      }
    }, 2500); // Más tiempo para leer feedback
    
  } else {
    // Preguntas normales (si las hubiera)
    if (esCorrecto) {
      score += 100;
      feedbackMsg = preguntaActual.idiomaPregunta === 'es' ? '¡Correcto! +100' : 'Correct! +100';
    } else {
      score = Math.max(0, score - 20);
      feedbackMsg = preguntaActual.idiomaPregunta === 'es' ? '¡Incorrecto! -20' : 'Wrong! -20';
    }
    feedbackTime = 120;
    
    modoPregunta = false;
    preguntaActual = null;
  }
  
  zonaRespuesta = -1;
  tiempoEnZona = 0;
}

function drawPregunta() {
  if (!modoPregunta || !preguntaActual) return;
  
  ctx.save();
  
  // Fondo oscuro semitransparente
  ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Título del quiz si es final
  if (modoQuizFinal && preguntaActual.numero) {
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    const tituloQuiz = idioma === 'es' 
      ? `🎓 QUIZ FINAL - ${planetaActual.nombre.es}` 
      : `🎓 FINAL QUIZ - ${planetaActual.nombre.en}`;
    ctx.fillText(tituloQuiz, canvas.width / 2, 100);
    
    // Timer prominente
    const segundosRestantes = Math.ceil(timerQuiz);
    const colorTimer = segundosRestantes <= 5 ? '#FF5252' : (segundosRestantes <= 10 ? '#FFA726' : '#4CAF50');
    ctx.fillStyle = colorTimer;
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`⏱ ${segundosRestantes}s`, canvas.width / 2, 75);
    
    ctx.fillStyle = '#aaa';
    ctx.font = '14px Arial';
    ctx.fillText(`${preguntaActual.numero} / ${preguntaActual.total}`, canvas.width / 2, 120);
  }
  
  // Pregunta
  ctx.fillStyle = 'white';
  ctx.font = 'bold 22px Arial';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 8;
  ctx.fillText(preguntaActual.texto, canvas.width / 2, 150);
  
  ctx.shadowBlur = 0;
  
  // Instrucciones claras con iconos
  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = '#FFD700';
  ctx.textAlign = 'center';
  const instruccion1 = preguntaActual.idiomaPregunta === 'es' 
    ? '⌨️ Pulsa la letra de tu respuesta: A, B o C'
    : '⌨️ Press the letter of your answer: A, B or C';
  ctx.fillText(instruccion1, canvas.width / 2, 185);
  
  ctx.font = '16px Arial';
  ctx.fillStyle = '#90CAF9';
  const instruccion2 = preguntaActual.idiomaPregunta === 'es' 
    ? '✓ Lee bien la pregunta antes de elegir'
    : '✓ Read the question carefully before choosing';
  ctx.fillText(instruccion2, canvas.width / 2, 215);
  
  // Indicador visual de qué zona está activa (eliminado - ya no se usa)
  
  // Zonas de respuesta
  const zonaWidth = canvas.width / 3;
  const zonaY = 250;
  const zonaHeight = 120;
  
  for (let i = 0; i < 3; i++) {
    const x = i * zonaWidth;
    
    // Fondo de zona - estilo simple sin hover
    ctx.fillStyle = 'rgba(50, 50, 100, 0.4)';
    ctx.fillRect(x + 10, zonaY, zonaWidth - 20, zonaHeight);
    
    // Borde de zona
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 10, zonaY, zonaWidth - 20, zonaHeight);
    
    // Letra de opción grande y clara
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'center';
    const letras = ['A', 'B', 'C'];
    ctx.fillText(letras[i], x + zonaWidth / 2, zonaY + 30);
    
    // Opción
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 18px Arial';
    
    // Ajustar texto de opción si es muy largo
    const opcion = preguntaActual.opciones[i];
    const maxWidth = zonaWidth - 30;
    ctx.fillText(opcion, x + zonaWidth / 2, zonaY + zonaHeight / 2 + 10, maxWidth);
  }
  
  ctx.restore();
}

function drawFeedback() {
  if (feedbackTime <= 0 || !feedbackMsg) return;
  
  ctx.save();
  
  const alpha = Math.min(feedbackTime / 60, 1);
  const y = canvas.height / 2 - 100;
  
  // Si es GAME OVER, pantalla completa
  if (juegoTerminado) {
    // Fondo oscuro completo
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Título GAME OVER grande
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FF5252';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 20;
    ctx.fillText('❌ GAME OVER', canvas.width / 2, canvas.height / 2 - 50);
    
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#FFF';
    ctx.fillText('No aprobaste el quiz', canvas.width / 2, canvas.height / 2);
    
    ctx.font = '18px Arial';
    ctx.fillStyle = '#AAA';
    ctx.fillText('Reiniciando en ' + Math.ceil(feedbackTime / 60) + ' segundos...', canvas.width / 2, canvas.height / 2 + 50);
    
    ctx.font = '16px Arial';
    ctx.fillStyle = '#888';
    ctx.fillText('Puntuación final: ' + score, canvas.width / 2, canvas.height / 2 + 90);
  } else {
    // Feedback normal
    // Sombra
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    
    // Texto
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    
    const isCorrect = feedbackMsg.includes('+');
    ctx.fillStyle = isCorrect 
      ? `rgba(76, 175, 80, ${alpha})` 
      : `rgba(244, 67, 54, ${alpha})`;
    
    ctx.fillText(feedbackMsg, canvas.width / 2, y);
  }
  
  ctx.restore();
}

function loop() {
  drawFondo();
  drawPlanetas();
  drawOrbes();
  drawMensajes();  // Dibujar efectos de partículas
  drawNave();
  drawHUD();
  drawInfo();
  drawPregunta();  // Sistema de preguntas
  drawFeedback();  // Feedback de respuestas
  drawInstrucciones();
  if (!mostrarInstrucciones) update();
  af = requestAnimationFrame(loop);
}

// Eventos
function keydown(e){
  if (mostrarInstrucciones) { mostrarInstrucciones = false; return; }
  
  // Si está en modo pregunta (quiz), detectar A, B o C
  if (modoPregunta && preguntaActual && !juegoPausado) {
    const tecla = e.key.toUpperCase();
    
    if (tecla === 'A') {
      comprobarRespuesta(0);
      return;
    } else if (tecla === 'B') {
      comprobarRespuesta(1);
      return;
    } else if (tecla === 'C') {
      comprobarRespuesta(2);
      return;
    }
    // Ignorar otras teclas en modo quiz
    return;
  }
  
  // Si está esperando tecla para despausar (dato curioso)
  // Solo aceptar espacio o teclas que NO sean flechas
  if (esperandoTeclaDespausar && juegoPausado) {
    const esFlechaMovimiento = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key);
    
    // Continuar solo si NO es una flecha (acepta espacio, letras, etc.)
    if (!esFlechaMovimiento) {
      juegoPausado = false;
      esperandoTeclaDespausar = false;
      infoActual = null;
      return;
    }
    // Si es flecha, no hacer nada (no despausar)
    return;
  }
  
  teclas[e.key] = true;
}
function keyup(e){ teclas[e.key] = false; }
window.addEventListener('keydown',keydown);
window.addEventListener('keyup',keyup);

crearPlanetas();
loop();
return function cleanup(){
  if (af) cancelAnimationFrame(af);
  window.removeEventListener('keydown',keydown);
  window.removeEventListener('keyup',keyup);
};
}
window.registerGame = registerGame;
