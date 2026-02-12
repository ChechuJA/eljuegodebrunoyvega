window.registerGame = function() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas gameCanvas no encontrado');
        return () => {};
    }
    const ctx = canvas.getContext('2d');
    
    // Estados: 'menu', 'playing', 'result'
    let gameState = 'menu';
    let animationFrameId = null;
    let score = 0;
    
    // Variables del juego
    let hue = 0;
    let speed = 40; // grados por segundo
    let lastTime = 0;
    let targetHue = 120; // Verde puro
    let tolerance = 60; // Rango aceptable (60-180 aprox)
    let message = '';
    let rounds = 0;
    let maxRounds = 3;
    let totalScore = 0;
    let currentRoundScore = 0;
    let results = []; // Guardar scores de cada ronda
    let changeDirection = 1;
    
    // --- MANEJO DE EVENTOS ---
    function handleInput(e) {
        if (e.target.tagName !== 'BUTTON') {
            // e.preventDefault();
        }

        if (gameState === 'menu') {
            startTotalGame();
        } else if (gameState === 'playing') {
            checkColor();
        } else if (gameState === 'result') {
            if (rounds >= maxRounds) {
                // startTotalGame(); // Mejor forzar botón
            } else {
                nextRound();
            }
        }
    }

    function startTotalGame() {
        rounds = 0;
        totalScore = 0;
        results = [];
        startRound();
    }

    function startRound() {
        gameState = 'playing';
        message = '';
        currentRoundScore = 0;
        
        // Configuración aleatoria de inicio
        // Asegurarse de que no empiece ya en verde (100-140)
        do {
            hue = Math.random() * 360;
        } while (Math.abs(getDiff(hue, targetHue)) < 60);

        // Velocidad aleatoria entre 30 y 80
        speed = 30 + Math.random() * 50;
        
        // Dirección aleatoria
        changeDirection = Math.random() > 0.5 ? 1 : -1;
        
        lastTime = performance.now();
    }

    function nextRound() {
        if (rounds < maxRounds) {
            startRound();
        }
    }

    function getDiff(h1, h2) {
        let diff = Math.abs(h1 - h2);
        if (diff > 180) diff = 360 - diff;
        return diff;
    }

    function checkColor() {
        const diff = getDiff(hue, targetHue);
        
        let p = 0;
        if (diff < 40) {
            p = Math.max(0, 100 - (diff * 2.5)); 
        }
        
        currentRoundScore = Math.round(p);
        results.push(currentRoundScore);
        totalScore += currentRoundScore;
        rounds++;
        
        gameState = 'result';
        playSound(currentRoundScore);
    }
    
    function playSound(points) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctxAudio = new AudioContext();
        const osc = ctxAudio.createOscillator();
        const gain = ctxAudio.createGain();
        osc.connect(gain);
        gain.connect(ctxAudio.destination);
        
        if (points >= 90) {
            osc.frequency.setValueAtTime(880, ctxAudio.currentTime); // A5
            osc.type = 'sine';
        } else if (points >= 50) {
            osc.frequency.setValueAtTime(440, ctxAudio.currentTime); // A4
            osc.type = 'triangle';
        } else {
            osc.frequency.setValueAtTime(200, ctxAudio.currentTime);
            osc.type = 'sawtooth';
        }
        
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, ctxAudio.currentTime + 0.2);
        osc.stop(ctxAudio.currentTime + 0.2);
    }
    
    function update(dt) {
        if (gameState === 'playing') {
            hue += speed * changeDirection * dt;
            if (hue > 360) hue -= 360;
            if (hue < 0) hue += 360;
        }
    }

    function draw() {
        // Fondo
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        if (gameState === 'menu') {
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.font = '30px Arial';
            ctx.fillText('🎨 Reacción al Color', cx, cy - 60);
            
            ctx.font = '20px Arial';
            ctx.fillText('Pulsa cuando el círculo sea', cx, cy - 10);
            
            ctx.fillStyle = '#00ff00';
            ctx.font = 'bold 30px Arial';
            ctx.fillText('VERDE PURO', cx, cy + 30);
            
            // Botón fake
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(cx - 80, cy + 80, 160, 50);
            ctx.fillStyle = '#000';
            ctx.font = 'bold 20px Arial';
            ctx.fillText('JUGAR', cx, cy + 112);
            return;
        }

        // Círculo Central oscilante de color
        const radius = 100;
        const color = `hsl(${hue}, 100%, 50%)`;
        
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#fff';
        ctx.stroke();

        // Indicador de ronda
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Ronda: ${Math.min(rounds + 1, maxRounds)} / ${maxRounds}`, 20, 30);

        if (gameState === 'result') {
            // Overlay
            ctx.fillStyle = 'rgba(0,0,0,0.85)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.textAlign = 'center';
            ctx.fillStyle = '#fff';
            
            if (rounds < maxRounds) {
                // Resultado de ronda
                ctx.font = '30px Arial';
                ctx.fillText('Puntuación:', cx, cy - 50);
                
                let c = '#fff';
                if (currentRoundScore >= 90) c = '#0f0';
                else if (currentRoundScore >= 60) c = '#ff0';
                else c = '#f00';
                
                ctx.fillStyle = c;
                ctx.font = '60px Arial';
                ctx.fillText(currentRoundScore + '%', cx, cy + 20);
                
                ctx.fillStyle = '#fff';
                ctx.font = '20px Arial';
                ctx.fillText('Toca para siguiente ronda', cx, cy + 80);
            } else {
                // Resultado Final
                const avg = Math.round(totalScore / maxRounds);
                
                ctx.font = '30px Arial';
                ctx.fillText('Juego Terminado', cx, cy - 80);
                
                ctx.font = '20px Arial';
                ctx.fillText('Promedio:', cx, cy - 40);
                
                let c = '#fff';
                if (avg >= 90) c = '#0f0';
                else if (avg >= 60) c = '#ff0';
                else c = '#f00';
                
                ctx.fillStyle = c;
                ctx.font = 'bold 70px Arial';
                ctx.fillText(avg + '%', cx, cy + 30);

                // Botón Reiniciar
                ctx.fillStyle = '#fff';
                ctx.fillRect(cx - 90, cy + 80, 180, 45);
                ctx.fillStyle = '#000';
                ctx.font = '18px Arial';
                ctx.fillText('REPETIR TEST', cx, cy + 108);

                // Guardar récord
                const currentBest = parseInt(localStorage.getItem('reaccionColorBest') || '0');
                if (avg > currentBest) {
                    localStorage.setItem('reaccionColorBest', avg);
                    const name = localStorage.getItem('playerName');
                    if (name) localStorage.setItem('reaccionColorBestName', name);
                    ctx.fillStyle = '#ffff00';
                    ctx.font = '16px Arial';
                    ctx.fillText('¡NUEVO RÉCORD!', cx, cy - 120);
                }
            }
        }
    }

    function gameLoop(timestamp) {
        if (!lastTime) lastTime = timestamp;
        const dt = (timestamp - lastTime) / 1000;
        lastTime = timestamp;

        update(dt);
        draw();
        
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    canvas.addEventListener('mousedown', handleInput);
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleInput(e); });

    gameLoop(0);

    return function cleanup() {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        canvas.removeEventListener('mousedown', handleInput);
        canvas.removeEventListener('touchstart', handleInput);
    };
};