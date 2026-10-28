function registerGame() {
  // Juego de Cartas estilo UNO - 2 jugadores (Humano vs IA)
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 800;
  canvas.height = 600;
  
  // Colores del juego
  const COLORS = ['🔴', '🟢', '🔵', '🟡'];
  const COLOR_NAMES = ['Rojo', 'Verde', 'Azul', 'Amarillo'];
  const COLOR_VALUES = {
    '🔴': '#e53935',
    '🟢': '#43a047',
    '🔵': '#1e88e5',
    '🟡': '#fbc02d'
  };
  
  // Tipos de cartas
  const CARD_TYPES = {
    NUMBER: 'number',
    SKIP: 'saltar',
    REVERSE: 'reversa',
    DRAW2: '+2',
    WILD: 'comodín',
    WILD_DRAW4: '+4'
  };
  
  let deck = [];
  let playerHand = [];
  let aiHand = [];
  let discardPile = [];
  let currentPlayer = 'player'; // 'player' o 'ai'
  let direction = 1; // 1 normal, -1 reversa
  let showIntro = true;
  let winner = null;
  let message = '';
  let messageTimer = 0;
  let selectedCardIndex = -1;
  let mustDrawCard = false;
  let drawCount = 0;
  let aiIsThinking = false; // Bandera para evitar que la IA juegue múltiples veces
  
  // Crear mazo de cartas
  function createDeck() {
    const newDeck = [];
    
    // Cartas numeradas (0-9) en 4 colores
    for (let color of COLORS) {
      // Un 0 por color
      newDeck.push({ color, value: 0, type: CARD_TYPES.NUMBER });
      // Dos de cada número del 1-9
      for (let i = 1; i <= 9; i++) {
        newDeck.push({ color, value: i, type: CARD_TYPES.NUMBER });
        newDeck.push({ color, value: i, type: CARD_TYPES.NUMBER });
      }
      // Dos cartas especiales de cada tipo por color
      for (let i = 0; i < 2; i++) {
        newDeck.push({ color, type: CARD_TYPES.SKIP });
        newDeck.push({ color, type: CARD_TYPES.REVERSE });
        newDeck.push({ color, type: CARD_TYPES.DRAW2 });
      }
    }
    
    // Cartas comodín (4 de cada)
    for (let i = 0; i < 4; i++) {
      newDeck.push({ type: CARD_TYPES.WILD, color: null });
      newDeck.push({ type: CARD_TYPES.WILD_DRAW4, color: null });
    }
    
    return shuffleArray(newDeck);
  }
  
  // Mezclar array
  function shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  // Inicializar juego
  function initGame() {
    deck = createDeck();
    playerHand = [];
    aiHand = [];
    discardPile = [];
    currentPlayer = 'player';
    direction = 1;
    winner = null;
    message = '';
    selectedCardIndex = -1;
    mustDrawCard = false;
    drawCount = 0;
    aiIsThinking = false;
    
    // Repartir 7 cartas a cada jugador
    for (let i = 0; i < 7; i++) {
      playerHand.push(deck.pop());
      aiHand.push(deck.pop());
    }
    
    // Carta inicial (no puede ser comodín o +4)
    let startCard;
    do {
      startCard = deck.pop();
    } while (startCard.type === CARD_TYPES.WILD || startCard.type === CARD_TYPES.WILD_DRAW4);
    discardPile.push(startCard);
    
    // Si la carta inicial es especial, aplicar efecto
    if (startCard.type === CARD_TYPES.SKIP) {
      currentPlayer = 'ai';
      setMessage('La carta inicial es Saltar. ¡La IA empieza!');
    } else if (startCard.type === CARD_TYPES.REVERSE) {
      currentPlayer = 'ai';
      direction = -1;
      setMessage('La carta inicial es Reversa. ¡La IA empieza!');
    } else if (startCard.type === CARD_TYPES.DRAW2) {
      mustDrawCard = true;
      drawCount = 2;
      setMessage('La carta inicial es +2. ¡Debes robar 2 cartas!');
    }
  }
  
  // Establecer mensaje temporal
  function setMessage(msg, duration = 2000) {
    message = msg;
    messageTimer = duration;
  }
  
  // Verificar si una carta puede jugarse
  function canPlayCard(card, topCard) {
    if (card.type === CARD_TYPES.WILD || card.type === CARD_TYPES.WILD_DRAW4) {
      return true;
    }
    if (topCard.color && card.color === topCard.color) {
      return true;
    }
    if (card.type === CARD_TYPES.NUMBER && topCard.type === CARD_TYPES.NUMBER && card.value === topCard.value) {
      return true;
    }
    if (card.type === topCard.type && card.type !== CARD_TYPES.NUMBER) {
      return true;
    }
    return false;
  }
  
  // Robar carta
  function drawCard(hand) {
    if (deck.length === 0) {
      // Remover carta superior y mezclar descarte en el mazo
      const topCard = discardPile.pop();
      deck = shuffleArray(discardPile);
      discardPile = [topCard];
    }
    if (deck.length > 0) {
      hand.push(deck.pop());
    }
  }
  
  // Jugar carta
  function playCard(card, hand) {
    const index = hand.indexOf(card);
    if (index >= 0) {
      hand.splice(index, 1);
      
      // Si es comodín, elegir color
      if (card.type === CARD_TYPES.WILD || card.type === CARD_TYPES.WILD_DRAW4) {
        if (currentPlayer === 'player') {
          // Jugador elige color (por ahora, elegimos el más común en su mano)
          card.color = chooseColorForPlayer();
        } else {
          // IA elige color
          card.color = chooseColorForAI();
        }
      }
      
      discardPile.push(card);
      
      // Aplicar efectos de carta especial
      applyCardEffect(card);
      
      // Verificar victoria
      if (hand.length === 0) {
        winner = currentPlayer === 'player' ? 'Jugador' : 'IA';
        setMessage(`¡${winner} ha ganado!`, 5000);
        return;
      }
      
      // Si no hay efecto que cambie turno, cambiar turno
      if (card.type !== CARD_TYPES.SKIP && !mustDrawCard) {
        switchTurn();
      }
    }
  }
  
  // Aplicar efectos de cartas especiales
  function applyCardEffect(card) {
    if (card.type === CARD_TYPES.SKIP) {
      setMessage('¡Carta Saltar! El siguiente jugador pierde su turno.', 2500);
      switchTurn();
      switchTurn(); // Saltar el turno
    } else if (card.type === CARD_TYPES.REVERSE) {
      direction *= -1;
      setMessage('¡Carta Reversa! Se invierte el sentido del juego.', 2500);
      // En juego de 2 jugadores, reversa actúa como saltar
      switchTurn();
      switchTurn();
    } else if (card.type === CARD_TYPES.DRAW2) {
      mustDrawCard = true;
      drawCount = 2;
      setMessage('¡Carta +2! El siguiente jugador debe robar 2 cartas.', 2500);
      switchTurn();
    } else if (card.type === CARD_TYPES.WILD_DRAW4) {
      mustDrawCard = true;
      drawCount = 4;
      setMessage(`¡Carta +4! Nuevo color: ${COLOR_NAMES[COLORS.indexOf(card.color)]}. El siguiente jugador roba 4 cartas.`, 3000);
      switchTurn();
    } else if (card.type === CARD_TYPES.WILD) {
      setMessage(`¡Comodín! Nuevo color: ${COLOR_NAMES[COLORS.indexOf(card.color)]}`, 2500);
    }
  }
  
  // Elegir color para jugador (el más común en su mano)
  function chooseColorForPlayer() {
    const colorCount = {};
    COLORS.forEach(c => colorCount[c] = 0);
    playerHand.forEach(card => {
      if (card.color) colorCount[card.color]++;
    });
    let maxCount = 0;
    let bestColor = COLORS[0];
    for (let color of COLORS) {
      if (colorCount[color] > maxCount) {
        maxCount = colorCount[color];
        bestColor = color;
      }
    }
    return bestColor;
  }
  
  // Elegir color para IA (el más común en su mano)
  function chooseColorForAI() {
    const colorCount = {};
    COLORS.forEach(c => colorCount[c] = 0);
    aiHand.forEach(card => {
      if (card.color) colorCount[card.color]++;
    });
    let maxCount = 0;
    let bestColor = COLORS[0];
    for (let color of COLORS) {
      if (colorCount[color] > maxCount) {
        maxCount = colorCount[color];
        bestColor = color;
      }
    }
    return bestColor;
  }
  
  // Cambiar turno
  function switchTurn() {
    currentPlayer = currentPlayer === 'player' ? 'ai' : 'player';
  }
  
  // Turno de IA
  function aiTurn() {
    if (currentPlayer !== 'ai' || winner || aiIsThinking) return;
    
    aiIsThinking = true; // Marcar que la IA está pensando
    
    defer(() => {
      const topCard = discardPile[discardPile.length - 1];
      
      // Si debe robar cartas
      if (mustDrawCard) {
        for (let i = 0; i < drawCount; i++) {
          drawCard(aiHand);
        }
        setMessage(`La IA robó ${drawCount} carta${drawCount > 1 ? 's' : ''}.`, 2500);
        mustDrawCard = false;
        drawCount = 0;
        switchTurn();
        aiIsThinking = false;
        return;
      }
      
      // Buscar carta jugable
      let playableCards = aiHand.filter(card => canPlayCard(card, topCard));
      
      if (playableCards.length > 0) {
        // Estrategia: preferir cartas especiales, luego números altos
        playableCards.sort((a, b) => {
          if (a.type !== CARD_TYPES.NUMBER && b.type === CARD_TYPES.NUMBER) return -1;
          if (a.type === CARD_TYPES.NUMBER && b.type !== CARD_TYPES.NUMBER) return 1;
          if (a.type === CARD_TYPES.NUMBER && b.type === CARD_TYPES.NUMBER) {
            return b.value - a.value;
          }
          return 0;
        });
        
        playCard(playableCards[0], aiHand);
        aiIsThinking = false;
      } else {
        // Robar carta
        drawCard(aiHand);
        setMessage('La IA robó una carta.', 2500);
        
        // Verificar si la carta robada se puede jugar
        const drawnCard = aiHand[aiHand.length - 1];
        if (canPlayCard(drawnCard, topCard)) {
          defer(() => {
            playCard(drawnCard, aiHand);
            aiIsThinking = false;
          }, 1500);
        } else {
          switchTurn();
          aiIsThinking = false;
        }
      }
    }, 1200);
  }
  
  // Dibujar carta
  function drawCard_visual(ctx, x, y, w, h, card, faceUp = true) {
    ctx.save();
    
    // Fondo de la carta
    if (faceUp) {
      ctx.fillStyle = card.color ? COLOR_VALUES[card.color] : '#333';
      ctx.strokeStyle = '#fff';
    } else {
      ctx.fillStyle = '#444';
      ctx.strokeStyle = '#888';
    }
    
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, w, h, 8) : (() => {
      ctx.rect(x, y, w, h);
    })();
    ctx.fill();
    ctx.stroke();
    
    if (faceUp) {
      // Contenido de la carta
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      if (card.type === CARD_TYPES.NUMBER) {
        ctx.font = 'bold 32px Arial';
        ctx.fillText(card.value, x + w / 2, y + h / 2);
      } else {
        ctx.font = 'bold 16px Arial';
        if (card.type === CARD_TYPES.SKIP) {
          ctx.fillText('⊘', x + w / 2, y + h / 2 - 8);
          ctx.font = '12px Arial';
          ctx.fillText('SALTAR', x + w / 2, y + h / 2 + 8);
        } else if (card.type === CARD_TYPES.REVERSE) {
          ctx.fillText('⇄', x + w / 2, y + h / 2 - 8);
          ctx.font = '12px Arial';
          ctx.fillText('REVERSA', x + w / 2, y + h / 2 + 8);
        } else if (card.type === CARD_TYPES.DRAW2) {
          ctx.font = 'bold 28px Arial';
          ctx.fillText('+2', x + w / 2, y + h / 2);
        } else if (card.type === CARD_TYPES.WILD) {
          ctx.fillText('★', x + w / 2, y + h / 2 - 8);
          ctx.font = '10px Arial';
          ctx.fillText('COMODÍN', x + w / 2, y + h / 2 + 8);
        } else if (card.type === CARD_TYPES.WILD_DRAW4) {
          ctx.font = 'bold 24px Arial';
          ctx.fillText('+4', x + w / 2, y + h / 2 - 8);
          ctx.font = '10px Arial';
          ctx.fillText('COMODÍN', x + w / 2, y + h / 2 + 8);
        }
      }
      
      // Símbolo de color en esquinas
      if (card.color) {
        ctx.font = '20px Arial';
        ctx.fillText(card.color, x + 10, y + 15);
        ctx.fillText(card.color, x + w - 10, y + h - 10);
      }
    } else {
      // Dorso de la carta
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', x + w / 2, y + h / 2);
    }
    
    ctx.restore();
  }
  
  // Dibujar todo
  function draw() {
    // Fondo
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (window.GameUI) GameUI.scenery(ctx, 'uno');
    
    if (showIntro) {
      drawIntro();
      return;
    }
    
    if (winner) {
      drawWinner();
      return;
    }
    
    // Header
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, canvas.width, 60);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎴 Juego de Cartas UNO 🎴', canvas.width / 2, 38);
    
    // Turno actual
    ctx.font = '18px Arial';
    ctx.fillText(currentPlayer === 'player' ? 'Tu turno' : 'Turno de la IA', canvas.width / 2, 80);
    
    // Mano de la IA (boca abajo)
    const aiCardW = 60;
    const aiCardH = 80;
    const aiSpacing = 10;
    const aiStartX = (canvas.width - (aiCardW + aiSpacing) * aiHand.length) / 2;
    
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`IA: ${aiHand.length} carta${aiHand.length !== 1 ? 's' : ''}`, canvas.width / 2, 120);
    
    for (let i = 0; i < aiHand.length; i++) {
      drawCard_visual(ctx, aiStartX + i * (aiCardW + aiSpacing), 130, aiCardW, aiCardH, {}, false);
    }
    
    // Pila de descarte (carta superior)
    const discardX = canvas.width / 2 - 100;
    const discardY = 280;
    if (discardPile.length > 0) {
      const topCard = discardPile[discardPile.length - 1];
      drawCard_visual(ctx, discardX, discardY, 80, 100, topCard, true);
    }
    
    // Mazo (para robar)
    const deckX = canvas.width / 2 + 20;
    const deckY = 280;
    if (deck.length > 0 || discardPile.length > 1) {
      ctx.fillStyle = '#666';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(deckX, deckY, 80, 100, 8) : ctx.rect(deckX, deckY, 80, 100);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('ROBAR', deckX + 40, deckY + 45);
      ctx.font = '14px Arial';
      ctx.fillText(`(${deck.length})`, deckX + 40, deckY + 70);
    }
    
    // Mano del jugador
    const cardW = 70;
    const cardH = 90;
    const spacing = 10;
    const startX = (canvas.width - (cardW + spacing) * playerHand.length) / 2;
    
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Tus cartas:', canvas.width / 2, 410);
    
    for (let i = 0; i < playerHand.length; i++) {
      const x = startX + i * (cardW + spacing);
      const y = i === selectedCardIndex ? 420 : 430;
      
      // Resaltar carta seleccionada
      if (i === selectedCardIndex) {
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(x - 5, y - 5, cardW + 10, cardH + 10);
      }
      
      drawCard_visual(ctx, x, y, cardW, cardH, playerHand[i], true);
    }
    
    // Mensaje
    if (messageTimer > 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(canvas.width / 2 - 200, canvas.height - 80, 400, 50);
      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(message, canvas.width / 2, canvas.height - 50);
    }
    
    // Instrucciones
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Clic en carta: seleccionar | Espacio: jugar | D: robar', 10, canvas.height - 10);
  }
  
  // Dibujar pantalla de introducción
  function drawIntro() {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (window.GameUI) {
      const lines = [
        '🎴 Juego de cartas estilo UNO para 2 jugadores',
        '🎯 Objetivo: Ser el primero en quedarse sin cartas',
        '',
        '📋 Reglas:',
        '• Juega cartas del mismo color o número que la carta superior',
        '• Cartas especiales: Saltar (⊘), Reversa (⇄), +2, Comodín, +4',
        '• Si no puedes jugar, roba una carta del mazo',
        '• Los comodines pueden jugarse en cualquier momento',
        '',
        '🎮 Controles:',
        '• Clic en carta: seleccionar',
        '• Espacio o clic en carta seleccionada: jugar',
        '• D o clic en "ROBAR": robar carta',
        '',
        'Pulsa cualquier tecla para comenzar'
      ];
      
      GameUI.drawInstructionPanel(ctx, '🎴 Juego de Cartas UNO', lines, {
        bgColor: 'rgba(46, 125, 50, 0.95)',
        titleColor: '#ffeb3b'
      });
    }
  }
  
  // Dibujar pantalla de victoria
  function drawWinner() {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = winner === 'Jugador' ? '#4caf50' : '#f44336';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`¡${winner} gana!`, canvas.width / 2, canvas.height / 2 - 40);
    
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText('Pulsa R para jugar de nuevo', canvas.width / 2, canvas.height / 2 + 20);
  }
  
  // Manejar clic
  function handleClick(e) {
    if (showIntro || winner || currentPlayer !== 'player') return;
    
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * canvas.width / rect.width;
    const my = (e.clientY - rect.top) * canvas.height / rect.height;
    
    // Clic en cartas del jugador
    const cardW = 70;
    const cardH = 90;
    const spacing = 10;
    const startX = (canvas.width - (cardW + spacing) * playerHand.length) / 2;
    
    for (let i = 0; i < playerHand.length; i++) {
      const x = startX + i * (cardW + spacing);
      const y = i === selectedCardIndex ? 420 : 430;
      
      if (mx >= x && mx <= x + cardW && my >= y && my <= y + cardH) {
        if (selectedCardIndex === i) {
          // Jugar carta seleccionada
          attemptPlayCard();
        } else {
          selectedCardIndex = i;
        }
        return;
      }
    }
    
    // Clic en mazo para robar
    const deckX = canvas.width / 2 + 20;
    const deckY = 280;
    if (mx >= deckX && mx <= deckX + 80 && my >= deckY && my <= deckY + 100) {
      handleDrawCard();
    }
  }
  
  // Intentar jugar carta seleccionada
  function attemptPlayCard() {
    if (selectedCardIndex < 0) return;
    
    const card = playerHand[selectedCardIndex];
    const topCard = discardPile[discardPile.length - 1];
    
    // Si debe robar cartas, no puede jugar
    if (mustDrawCard) {
      setMessage('¡Debes robar cartas primero!');
      return;
    }
    
    if (canPlayCard(card, topCard)) {
      playCard(card, playerHand);
      selectedCardIndex = -1;
      
      // Turno de IA si es su turno
      if (currentPlayer === 'ai' && !winner) {
        defer(() => aiTurn(), 500);
      }
    } else {
      setMessage('¡No puedes jugar esa carta!');
    }
  }
  
  // Manejar robar carta
  function handleDrawCard() {
    if (currentPlayer !== 'player' || winner) return;
    
    if (mustDrawCard) {
      for (let i = 0; i < drawCount; i++) {
        drawCard(playerHand);
      }
      setMessage(`Robaste ${drawCount} carta${drawCount > 1 ? 's' : ''}.`);
      mustDrawCard = false;
      drawCount = 0;
      switchTurn();
      
      // Turno de IA
      if (currentPlayer === 'ai' && !winner) {
        defer(() => aiTurn(), 500);
      }
    } else {
      drawCard(playerHand);
      setMessage('Robaste una carta.');
      
      // Verificar si puede jugar la carta robada
      const drawnCard = playerHand[playerHand.length - 1];
      const topCard = discardPile[discardPile.length - 1];
      
      if (canPlayCard(drawnCard, topCard)) {
        selectedCardIndex = playerHand.length - 1;
        setMessage('Puedes jugar la carta que robaste. Presiona Espacio o haz clic de nuevo.');
      } else {
        switchTurn();
        
        // Turno de IA
        if (currentPlayer === 'ai' && !winner) {
          defer(() => aiTurn(), 500);
        }
      }
    }
  }
  
  // Manejar teclado
  function handleKeyDown(e) {
    if (showIntro) {
      showIntro = false;
      initGame();
      return;
    }
    
    if (winner) {
      if (e.key.toLowerCase() === 'r') {
        initGame();
        showIntro = false;
      }
      return;
    }
    
    if (currentPlayer !== 'player') return;
    
    if (e.key === ' ' || e.key === 'Enter') {
      attemptPlayCard();
    } else if (e.key.toLowerCase() === 'd') {
      handleDrawCard();
    } else if (e.key === 'ArrowLeft') {
      selectedCardIndex = Math.max(0, selectedCardIndex - 1);
    } else if (e.key === 'ArrowRight') {
      selectedCardIndex = Math.min(playerHand.length - 1, selectedCardIndex + 1);
    }
  }
  
  // Loop principal
  function loop() {
    draw();
    
    // Actualizar mensaje
    if (messageTimer > 0) {
      messageTimer -= 16;
    }
    
    // Turno de IA
    if (currentPlayer === 'ai' && !winner && !showIntro) {
      aiTurn();
    }
    
    animationFrame = requestAnimationFrame(loop);
  }
  
  let animationFrame;
  const pendingTimers = new Set();
  function defer(callback, delay) {
    const timer = setTimeout(() => { pendingTimers.delete(timer); callback(); }, delay);
    pendingTimers.add(timer);
  }
  // Inicializar
  canvas.addEventListener('click', handleClick);
  window.addEventListener('keydown', handleKeyDown);
  
  loop();
  
  // Cleanup
  return function cleanup() {
    cancelAnimationFrame(animationFrame);
    pendingTimers.forEach(timer => clearTimeout(timer));
    pendingTimers.clear();
    canvas.removeEventListener('click', handleClick);
    window.removeEventListener('keydown', handleKeyDown);
  };
}

window.registerGame = registerGame;
