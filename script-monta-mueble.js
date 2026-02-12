function registerGame() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas gameCanvas no encontrado');
        return () => {};
    }

    const ctx = canvas.getContext('2d');
    let animationFrameId = null;

    // ==================== CONFIGURACIÓN ====================
    const GRID_SIZE = 40;
    const AREA_PIEZAS = { x: 10, y: 60, width: 180, height: 520 };
    const AREA_MONTAJE = { x: 200, y: 60, width: 500, height: 520 };
    const AREA_INSTRUCCIONES = { x: 710, y: 60, width: 180, height: 380 };

    // ==================== TIPOS DE PIEZAS ====================
    const TIPO_PIEZA = {
        TABLA: 'tabla',
        PATA: 'pata',
        TABLERO: 'tablero',
        LATERAL: 'lateral',
        TAPA: 'tapa',
        BASE: 'base',
        PUERTA: 'puerta',
        BALDA: 'balda',
        ESCUADRA: 'escuadra',
        PLATINA: 'platina',
        TRAVESANO: 'travesaño',
        BISAGRA: 'bisagra',
        POMO: 'pomo',
        PANEL_TRASERO: 'panel_trasero'
    };

    // ==================== TORNILLOS ====================
    const TORNILLOS = [
        { id: '4x20', nombre: '4×20mm Phillips', emoji: '🔩', tipo: 'phillips', diametro: 4, longitud: 20 },
        { id: '5x40', nombre: '5×40mm Phillips', emoji: '🔩', tipo: 'phillips', diametro: 5, longitud: 40 },
        { id: '6x30', nombre: '6×30mm Phillips', emoji: '🔩', tipo: 'phillips', diametro: 6, longitud: 30 },
        { id: 'allenM6', nombre: 'Allen M6×25mm', emoji: '⚙️', tipo: 'allen', diametro: 6, longitud: 25 },
        { id: 'clavo', nombre: 'Clavo pequeño', emoji: '📌', tipo: 'clavo', diametro: 2, longitud: 15 }
    ];

    // ==================== HERRAMIENTAS ====================
    const HERRAMIENTAS = [
        { id: 'phillips', nombre: 'Destornillador Phillips', emoji: '🪛', tipos: ['phillips'] },
        { id: 'allen', nombre: 'Llave Allen 4mm', emoji: '🔧', tipos: ['allen'] },
        { id: 'martillo', nombre: 'Martillo', emoji: '🔨', tipos: ['clavo'] },
        { id: 'nivel', nombre: 'Nivel', emoji: '📏', tipos: [] } // herramienta auxiliar
    ];

    // ==================== NIVELES ====================
    const NIVELES = [
        {
            id: 1,
            nombre: '🪑 Nivel 1: Estantería Simple',
            dificultad: '⭐☆☆☆☆',
            tiempo: 240, // segundos
            piezas: [
                { id: 'tabla1', tipo: TIPO_PIEZA.TABLA, nombre: 'Tabla 1', emoji: '🪵', width: 120, height: 20, color: '#D2691E', x: 30, y: 80, rotation: 0 },
                { id: 'tabla2', tipo: TIPO_PIEZA.TABLA, nombre: 'Tabla 2', emoji: '🪵', width: 120, height: 20, color: '#D2691E', x: 30, y: 120, rotation: 0 },
                { id: 'tabla3', tipo: TIPO_PIEZA.TABLA, nombre: 'Tabla 3', emoji: '🪵', width: 120, height: 20, color: '#D2691E', x: 30, y: 160, rotation: 0 },
                { id: 'tabla4', tipo: TIPO_PIEZA.TABLA, nombre: 'Tabla 4', emoji: '🪵', width: 120, height: 20, color: '#D2691E', x: 30, y: 200, rotation: 0 },
                { id: 'soporteL', tipo: TIPO_PIEZA.LATERAL, nombre: 'Soporte Izq', emoji: '▌', width: 20, height: 160, color: '#8B4513', x: 30, y: 250, rotation: 0 },
                { id: 'soporteR', tipo: TIPO_PIEZA.LATERAL, nombre: 'Soporte Der', emoji: '▐', width: 20, height: 160, color: '#8B4513', x: 30, y: 320, rotation: 0 },
                { id: 'esc1', tipo: TIPO_PIEZA.ESCUADRA, nombre: 'Escuadra', emoji: '⌐', width: 15, height: 15, color: '#C0C0C0', x: 30, y: 390, rotation: 0 },
                { id: 'esc2', tipo: TIPO_PIEZA.ESCUADRA, nombre: 'Escuadra', emoji: '⌐', width: 15, height: 15, color: '#C0C0C0', x: 60, y: 390, rotation: 0 },
                { id: 'esc3', tipo: TIPO_PIEZA.ESCUADRA, nombre: 'Escuadra', emoji: '⌐', width: 15, height: 15, color: '#C0C0C0', x: 90, y: 390, rotation: 0 },
                { id: 'esc4', tipo: TIPO_PIEZA.ESCUADRA, nombre: 'Escuadra', emoji: '⌐', width: 15, height: 15, color: '#C0C0C0', x: 120, y: 390, rotation: 0 },
                { id: 'esc5', tipo: TIPO_PIEZA.ESCUADRA, nombre: 'Escuadra', emoji: '⌐', width: 15, height: 15, color: '#C0C0C0', x: 30, y: 420, rotation: 0 },
                { id: 'esc6', tipo: TIPO_PIEZA.ESCUADRA, nombre: 'Escuadra', emoji: '⌐', width: 15, height: 15, color: '#C0C0C0', x: 60, y: 420, rotation: 0 },
                { id: 'esc7', tipo: TIPO_PIEZA.ESCUADRA, nombre: 'Escuadra', emoji: '⌐', width: 15, height: 15, color: '#C0C0C0', x: 90, y: 420, rotation: 0 },
                { id: 'esc8', tipo: TIPO_PIEZA.ESCUADRA, nombre: 'Escuadra', emoji: '⌐', width: 15, height: 15, color: '#C0C0C0', x: 120, y: 420, rotation: 0 }
            ],
            pasos: [
                { desc: '1. Coloca soporte izquierdo', piezas: ['soporteL'], tornillos: [], herramienta: null, posicion: { x: 250, y: 150 } },
                { desc: '2. Atornilla tabla inferior + 2 escuadras', piezas: ['tabla1', 'esc1', 'esc2'], tornillos: ['4x20', '4x20', '4x20', '4x20'], herramienta: 'phillips', posicion: { x: 270, y: 290 } },
                { desc: '3. Atornilla segunda tabla + escuadras', piezas: ['tabla2', 'esc3', 'esc4'], tornillos: ['4x20', '4x20', '4x20', '4x20'], herramienta: 'phillips', posicion: { x: 270, y: 240 } },
                { desc: '4. Atornilla tercera tabla + escuadras', piezas: ['tabla3', 'esc5', 'esc6'], tornillos: ['4x20', '4x20', '4x20', '4x20'], herramienta: 'phillips', posicion: { x: 270, y: 190 } },
                { desc: '5. Atornilla tabla superior + escuadras', piezas: ['tabla4', 'esc7', 'esc8'], tornillos: ['4x20', '4x20', '4x20', '4x20'], herramienta: 'phillips', posicion: { x: 270, y: 140 } },
                { desc: '6. Coloca soporte derecho', piezas: ['soporteR'], tornillos: [], herramienta: null, posicion: { x: 390, y: 150 } },
                { desc: '7. Verifica estabilidad con nivel', piezas: [], tornillos: [], herramienta: 'nivel', posicion: null }
            ],
            educacion: `📐 ESTANTERÍA BÁSICA

🔩 TORNILLOS PARA MADERA:
• 4mm diámetro × 20mm largo
• Rosca completa para mejor agarre
• Cabeza Phillips (cruz)

🔧 DESTORNILLADOR:
• Phillips (cruz) vs Plano (ranura)
• Gira en sentido horario para apretar
• No aprietes demasiado o pasarás rosca

📏 NIVEL:
• Asegura que las tablas estén horizontales
• Burbuja centrada = nivelado perfecto

⚠️ ERRORES COMUNES:
❌ Apretar tornillos antes de colocar todo
❌ No nivelar → mueble torcido
❌ Destornillador incorrecto → cabeza dañada

✅ Has aprendido los fundamentos del montaje de muebles. ¡Sigamos con algo más complejo!`
        }
    ];

    // ==================== ESTADO DEL JUEGO ====================
    let gameState = {
        nivel: 0,
        estado: 'menu', // menu, instrucciones, jugando, completado, education
        pasoActual: 0,
        piezas: [],
        piezasColocadas: [],
        tornilloSeleccionado: null,
        herramientaSeleccionada: null,
        piezaArrastrada: null,
        offsetX: 0,
        offsetY: 0,
        puntos: 0,
        tiempo: 0,
        errores: 0,
        mensajeFeedback: '',
        feedbackTimer: 0
    };

    // ==================== EVENTOS ====================
    function handleMouseDown(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (gameState.estado === 'menu') {
            handleMenuClick(x, y);
        } else if (gameState.estado === 'instrucciones') {
            handleInstruccionesClick(x, y);
        } else if (gameState.estado === 'jugando') {
            handleJugandoMouseDown(x, y);
        } else if (gameState.estado === 'completado') {
            handleCompletadoClick(x, y);
        } else if (gameState.estado === 'education') {
            handleEducationClick(x, y);
        }
    }

    function handleMouseMove(e) {
        if (gameState.estado === 'jugando' && gameState.piezaArrastrada) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            gameState.piezaArrastrada.x = x - gameState.offsetX;
            gameState.piezaArrastrada.y = y - gameState.offsetY;
        }
    }

    function handleMouseUp(e) {
        if (gameState.estado === 'jugando' && gameState.piezaArrastrada) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Verificar si se soltó en área de montaje
            if (x >= AREA_MONTAJE.x && x <= AREA_MONTAJE.x + AREA_MONTAJE.width &&
                y >= AREA_MONTAJE.y && y <= AREA_MONTAJE.y + AREA_MONTAJE.height) {
                
                // Snap to grid
                gameState.piezaArrastrada.x = Math.round(gameState.piezaArrastrada.x / GRID_SIZE) * GRID_SIZE;
                gameState.piezaArrastrada.y = Math.round(gameState.piezaArrastrada.y / GRID_SIZE) * GRID_SIZE;

                validarPaso();
            } else {
                // Devolver a posición original
                const piezaOriginal = NIVELES[gameState.nivel].piezas.find(p => p.id === gameState.piezaArrastrada.id);
                if (piezaOriginal) {
                    gameState.piezaArrastrada.x = piezaOriginal.x;
                    gameState.piezaArrastrada.y = piezaOriginal.y;
                }
            }

            gameState.piezaArrastrada = null;
        }
    }

    function handleMouseLeave() {
        if (gameState.piezaArrastrada) {
            const piezaOriginal = NIVELES[gameState.nivel].piezas.find(p => p.id === gameState.piezaArrastrada.id);
            if (piezaOriginal) {
                gameState.piezaArrastrada.x = piezaOriginal.x;
                gameState.piezaArrastrada.y = piezaOriginal.y;
            }
            gameState.piezaArrastrada = null;
        }
    }

    // ==================== HANDLERS ====================
    function handleMenuClick(x, y) {
        // Botones de niveles
        for (let i = 0; i < NIVELES.length; i++) {
            const btnY = 150 + i * 100;
            if (x >= 250 && x <= 650 && y >= btnY && y <= btnY + 70) {
                iniciarNivel(i);
                return;
            }
        }
    }

    function handleInstruccionesClick(x, y) {
        // Botón "Comenzar"
        if (x >= 350 && x <= 550 && y >= 520 && y <= 570) {
            gameState.estado = 'jugando';
            gameState.tiempo = NIVELES[gameState.nivel].tiempo;
        }
    }
    
    function handleJugandoMouseDown(x, y) {
        // Click en tornillos (código omitido por espacio...)
        // Click en herramientas (código omitido por espacio...)
        // Arrastre de piezas (código omitido por espacio...)
    }

    function handleCompletadoClick(x, y) {
        // Botón "Continuar"
        if (x >= 350 && x <= 550 && y >= 480 && y <= 530) {
            gameState.estado = 'education';
        }
    }

    function handleEducationClick(x, y) {
        // Botón "Siguiente Nivel" o "Menú"
        if (x >= 350 && x <= 550 && y >= 520 && y <= 570) {
            if (gameState.nivel < NIVELES.length - 1) {
                iniciarNivel(gameState.nivel + 1);
            } else {
                gameState.estado = 'menu';
            }
        }
    }

    // ==================== LÓGICA DEL JUEGO ====================
    function iniciarNivel(nivel) {
        gameState.nivel = nivel;
        gameState.estado = 'instrucciones';
        gameState.pasoActual = 0;
        gameState.piezas = JSON.parse(JSON.stringify(NIVELES[nivel].piezas));
        gameState.piezasColocadas = [];
        gameState.tornilloSeleccionado = null;
        gameState.herramientaSeleccionada = null;
        gameState.piezaArrastrada = null;
        gameState.puntos = 0;
        gameState.tiempo = NIVELES[nivel].tiempo;
        gameState.errores = 0;
        gameState.mensajeFeedback = '';
        gameState.feedbackTimer = 0;
    }

    function validarPaso() {
        const nivel = NIVELES[gameState.nivel];
        const paso = nivel.pasos[gameState.pasoActual];

        // Verificación simplificada (código completo necesita más lógica)
        completarPaso();
    }

    function completarPaso() {
        mostrarFeedback('✅ ¡Correcto! +50 puntos', 'success');
        gameState.puntos += 50;
        gameState.pasoActual++;
        gameState.tornilloSeleccionado = null;
        gameState.herramientaSeleccionada = null;

        if (gameState.pasoActual >= NIVELES[gameState.nivel].pasos.length) {
            completarNivel();
        }
    }

    function completarNivel() {
        const bonusTiempo = Math.max(0, gameState.tiempo * 2);
        const bonusErrores = Math.max(0, (10 - gameState.errores) * 20);
        gameState.puntos += bonusTiempo + bonusErrores;

        // Guardar mejor puntuación
        const bestKey = 'montaMuebleBest';
        const bestScore = parseInt(localStorage.getItem(bestKey)) || 0;
        if (gameState.puntos > bestScore) {
            localStorage.setItem(bestKey, gameState.puntos);
        }

        gameState.estado = 'completado';
    }

    function mostrarFeedback(mensaje, tipo) {
        gameState.mensajeFeedback = mensaje;
        gameState.feedbackTimer = 2; // segundos
    }

    // ==================== RENDERIZADO ====================
    function drawMenu() {
        ctx.fillStyle = '#2C5F2D';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🪑 MONTA UN MUEBLE 🔧', 450, 80);

        ctx.font = '18px Arial';
        ctx.fillText('Aprende a montar muebles siguiendo instrucciones', 450, 110);

        // Botones de niveles
        for (let i = 0; i < NIVELES.length; i++) {
            const nivel = NIVELES[i];
            const y = 150 + i * 100;

            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(250, y, 400, 70);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 20px Arial';
            ctx.fillText(nivel.nombre, 450, y + 25);

            ctx.font = '16px Arial';
            ctx.fillText(`Dificultad: ${nivel.dificultad}`, 450, y + 50);
        }

        // Mejor puntuación
        const bestScore = parseInt(localStorage.getItem('montaMuebleBest')) || 0;
        ctx.fillStyle = '#fff';
        ctx.font = '18px Arial';
        ctx.fillText(`🏆 Mejor Puntuación: ${bestScore}`, 450, 550);
    }

    // ==================== GAME LOOP ====================
    function gameLoop(timestamp) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Render según estado
        if (gameState.estado === 'menu') {
            drawMenu();
        }
        // Otros estados... (código omitido por brevedad)

        animationFrameId = requestAnimationFrame(gameLoop);
    }

    // ==================== INICIALIZACIÓN ====================
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    gameState.estado = 'menu';
    gameLoop(0);

    // ==================== CLEANUP ====================
    return function cleanup() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
}

window.registerGame = registerGame;