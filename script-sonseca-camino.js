// script-sonseca-camino.js
// Juego: Sonseca - "Andándose hace el camino"
// Autor: ChechuJA + GitHub Copilot

(function(){
  // Frases curiosas y datos de Sonseca
  const curiosidades = [
    "El nombre Sonseca viene del latín 'fonte sica', que significa 'fuente seca'.",
    "Sonseca es famosa por su industria del mazapán y el mueble.",
    "En Sonseca se encuentra la presa romana de Alcantarilla, declarada Bien de Interés Cultural.",
    "El municipio está rodeado de suaves colinas y llanuras, ideal para la agricultura.",
    "La altitud media de Sonseca es de 754 metros sobre el nivel del mar.",
    "El arroyo de Casalgordo y el Guajaraz son parte de su red de arroyos.",
    "En el siglo XVIII se desarrolló la industria textil en Sonseca.",
    "El lema popular es: 'Andándose hace el camino'.",
    "En Sonseca se celebran fiestas como San Juan Evangelista y la Virgen de los Remedios.",
    "La villa fue independiente de Toledo desde 1629.",
    "El clima es semiárido frío, con veranos calurosos y secos.",
    "La plaza del pueblo no está en el centro geográfico, sino al este de la localidad.",
    "En la zona de El Berrocal se alcanza la mayor altitud del municipio: 895 metros.",
    "La economía local destaca por el mazapán, el mueble y la agricultura de secano.",
    "En Sonseca se han hallado restos arqueológicos del Calcolítico y la Edad del Bronce."
  ];

  let canvas, ctx, width, height;
  let player, camino, paso, fraseIndex, showFrase, gameOver, keys;
  const PLAYER_SIZE = 36;
  const PASO_SIZE = 32;
  const PASOS_TOTAL = 10;

  function initGame() {
    player = { x: width/2-PLAYER_SIZE/2, y: height-PLAYER_SIZE-10, speed: 5 };
    camino = [];
    for(let i=0; i<PASOS_TOTAL; i++) {
      camino.push({ x: Math.random()*(width-PASO_SIZE), y: 60+i*(height-120)/PASOS_TOTAL, visible: true });
    }
    paso = 0;
    fraseIndex = 0;
    showFrase = false;
    gameOver = false;
    keys = {};
  }

  function draw() {
    ctx.clearRect(0,0,width,height);
    // Fondo
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(0,0,width,height);
    // Camino
    for(let i=0; i<camino.length; i++) {
      if(camino[i].visible) {
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(camino[i].x, camino[i].y, PASO_SIZE, PASO_SIZE);
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.fillText((i+1), camino[i].x+10, camino[i].y+22);
      }
    }
    // Jugador
    ctx.fillStyle = '#1976d2';
    ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
    ctx.fillStyle = '#fff';
    ctx.font = '15px Arial';
    ctx.fillText('Tú', player.x+7, player.y+24);
    // Frase
    if(showFrase) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, height/2-60, width, 120);
      ctx.fillStyle = '#fffde7';
      ctx.font = '20px Arial';
      ctx.fillText('Curiosidad de Sonseca:', width/2-120, height/2-10);
      ctx.font = '18px Arial';
      ctx.fillText(curiosidades[fraseIndex], width/2-ctx.measureText(curiosidades[fraseIndex]).width/2, height/2+30);
      ctx.font = '16px Arial';
      ctx.fillText('Pulsa ESPACIO para seguir el camino', width/2-120, height/2+60);
    }
    // Lema
    ctx.fillStyle = '#388e3c';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('"Andándose hace el camino"', width/2-110, 36);
    if(gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, height/2-40, width, 80);
      ctx.fillStyle = '#fff';
      ctx.font = '32px Arial';
      ctx.fillText('¡Fin del camino!', width/2-110, height/2);
      ctx.font = '20px Arial';
      ctx.fillText('Has descubierto '+PASOS_TOTAL+' curiosidades.', width/2-110, height/2+30);
      ctx.fillText('Pulsa ESPACIO para reiniciar', width/2-120, height/2+60);
    }
  }

  function update() {
    if(gameOver || showFrase) return;
    // Movimiento jugador
    if(keys['ArrowLeft'] && player.x>0) player.x -= player.speed;
    if(keys['ArrowRight'] && player.x<width-PLAYER_SIZE) player.x += player.speed;
    if(keys['ArrowUp'] && player.y>0) player.y -= player.speed;
    if(keys['ArrowDown'] && player.y<height-PLAYER_SIZE) player.y += player.speed;
    // Colisión con paso
    if(paso < camino.length && camino[paso].visible && collide(player, PLAYER_SIZE, camino[paso], PASO_SIZE)) {
      camino[paso].visible = false;
      showFrase = true;
      fraseIndex = Math.floor(Math.random()*curiosidades.length);
      paso++;
      if(paso>=PASOS_TOTAL) gameOver = true;
    }
  }

  function collide(a, asize, b, bsize) {
    return a.x < b.x+bsize && a.x+asize > b.x && a.y < b.y+bsize && a.y+asize > b.y;
  }

  function keydown(e) {
    keys[e.key] = true;
    if(showFrase && e.key===' ') {
      showFrase = false;
    }
    if(gameOver && e.key===' ') {
      initGame();
    }
  }
  function keyup(e) {
    keys[e.key] = false;
  }

  function start(canvasElement) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
    width = canvas.width;
    height = canvas.height;
    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', keyup);
    initGame();
    loop();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  window.registerGame = function() {
    const canvas = document.getElementById('gameCanvas');
    start(canvas);
    return function cleanup() {
      document.removeEventListener('keydown', keydown);
      document.removeEventListener('keyup', keyup);
    };
  };
})();
