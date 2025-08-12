function registerGame() {
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let af = null;

// Barra (paddle)
let level = 1;
let maxLevel = 5;
let score = 0;
let highScore = Number(localStorage.getItem('arkanoidHighScore')||0);
let paddle = {
	width: 100,
	height: 18,
	x: canvas.width / 2 - 50,
	y: canvas.height - 30,
	speed: 8,
	dx: 0
};

// Bolita
const ball = {
		x: canvas.width / 2,
		y: canvas.height - 45,
		size: 12,
		speed: 4,
		dx: 4,
		dy: -4
};

// Bloques
const blockRowCount = 4;
const blockColumnCount = 8;
const blockWidth = 60;
const blockHeight = 20;
const blockPadding = 10;
const blockOffsetTop = 40;
const blockOffsetLeft = 35;

let blocks = [];
function createBlocks() {
	blocks = [];
	for (let c = 0; c < blockColumnCount; c++) {
		blocks[c] = [];
		for (let r = 0; r < blockRowCount; r++) {
			blocks[c][r] = { x: 0, y: 0, status: 1 };
		}
	}
}
createBlocks();

// Teclas
let rightPressed = false;
let leftPressed = false;

// Dibuja fondo con texto bonito
function drawBackground() {
		ctx.save();
		ctx.globalAlpha = 0.15;
		ctx.font = 'bold 48px Comic Sans MS, Arial';
		ctx.fillStyle = '#e91e63';
		ctx.textAlign = 'center';
		ctx.fillText('El juego de', canvas.width / 2, canvas.height / 2 - 40);
		ctx.font = 'bold 54px Comic Sans MS, Arial';
		ctx.fillStyle = '#0288d1';
		ctx.fillText('Bruno y Vega', canvas.width / 2, canvas.height / 2 + 10);
		ctx.font = 'bold 32px Comic Sans MS, Arial';
		ctx.fillStyle = '#333';
		ctx.fillText('Nivel: ' + level, canvas.width / 2, canvas.height / 2 + 60);
		ctx.restore();
}

// Dibuja bloques
function drawBlocks() {
	for (let c = 0; c < blockColumnCount; c++) {
		for (let r = 0; r < blockRowCount; r++) {
			if (blocks[c][r].status === 1) {
				let blockX = c * (blockWidth + blockPadding) + blockOffsetLeft;
				let blockY = r * (blockHeight + blockPadding) + blockOffsetTop;
				blocks[c][r].x = blockX;
				blocks[c][r].y = blockY;
			ctx.beginPath();
			ctx.rect(blockX, blockY, blockWidth, blockHeight);
			// Colores vivos alternos
			const colors = ['#ffeb3b', '#ff9800', '#f44336', '#4caf50', '#2196f3', '#e91e63', '#00bcd4', '#9c27b0'];
			ctx.fillStyle = colors[(c + r) % colors.length];
			ctx.fill();
			ctx.strokeStyle = '#333';
			ctx.stroke();
			ctx.closePath();
			}
		}
	}
}

// Dibuja barra
function drawPaddle() {
		ctx.beginPath();
		ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
		ctx.fillStyle = '#00c853';
		ctx.shadowColor = '#00e676';
		ctx.shadowBlur = 10;
		ctx.fill();
		ctx.closePath();
		ctx.shadowBlur = 0;
}

// Dibuja bolita
function drawBall() {
		ctx.beginPath();
		ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
		ctx.fillStyle = '#ff5722';
		ctx.shadowColor = '#ff9800';
		ctx.shadowBlur = 10;
		ctx.fill();
		ctx.closePath();
		ctx.shadowBlur = 0;
}

// Dibuja todo
function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawBackground();
	drawBlocks();
	drawPaddle();
	drawBall();
	// Dibuja puntuación
	ctx.save();
	ctx.font = 'bold 24px Arial';
	ctx.fillStyle = '#ff9800';
	ctx.textAlign = 'left';
	ctx.fillText('Puntos: ' + score + '  Récord: ' + highScore, 20, 30);
	ctx.restore();
}

// Mueve barra
function movePaddle() {
	if (rightPressed && paddle.x < canvas.width - paddle.width) {
		paddle.x += paddle.speed;
	} else if (leftPressed && paddle.x > 0) {
		paddle.x -= paddle.speed;
	}
}

// Mueve bolita
function moveBall() {
	ball.x += ball.dx;
	ball.y += ball.dy;

	// Rebote en los lados
	if (ball.x + ball.size > canvas.width || ball.x - ball.size < 0) {
		ball.dx = -ball.dx;
	}
	// Rebote arriba
	if (ball.y - ball.size < 0) {
		ball.dy = -ball.dy;
	}
	// Rebote en la barra
	if (
		ball.x > paddle.x &&
		ball.x < paddle.x + paddle.width &&
		ball.y + ball.size > paddle.y &&
		ball.y - ball.size < paddle.y + paddle.height
	) {
		ball.dy = -ball.dy;
		ball.y = paddle.y - ball.size;
	}
	// Pierde (bolita abajo)
	if (ball.y + ball.size > canvas.height) {
		// Reinicia nivel y puntuación si pierde
		if(score>highScore){ highScore=score; localStorage.setItem('arkanoidHighScore', String(highScore)); }
		level = 1;
		score = 0;
		paddle.width = 100;
		ball.x = canvas.width / 2;
		ball.y = canvas.height - 45;
		ball.dx = 4;
		ball.dy = -4;
		createBlocks();
	}

	// Colisión con bloques
	let bloquesRestantes = 0;
	for (let c = 0; c < blockColumnCount; c++) {
		for (let r = 0; r < blockRowCount; r++) {
			let b = blocks[c][r];
			if (b.status === 1) {
				bloquesRestantes++;
				if (
					ball.x > b.x &&
					ball.x < b.x + blockWidth &&
					ball.y > b.y &&
					ball.y < b.y + blockHeight
				) {
					ball.dy = -ball.dy;
					b.status = 0;
					score += 10;
					// Efecto especial aleatorio
					if (Math.random() < 0.3) { // 30% de probabilidad
						if (Math.random() < 0.5) {
							// Barra más grande
							paddle.width = Math.min(paddle.width + 30, canvas.width);
						} else {
							// Bola más lenta
							ball.dx *= 0.7;
							ball.dy *= 0.7;
						}
					}
				}
			}
		}
	}
	// Si no quedan bloques, pasa de nivel
	if (bloquesRestantes === 0) {
		if (level < maxLevel) {
			level++;
			paddle.width = Math.max(60, paddle.width - 15); // barra más pequeña
			ball.x = canvas.width / 2;
			ball.y = canvas.height - 45;
			ball.dx = 4 + level;
			ball.dy = -4 - level;
			createBlocks();
		} else {
			// Juego completado
			setTimeout(() => {
				if(score>highScore){ highScore=score; localStorage.setItem('arkanoidHighScore', String(highScore)); }
				alert('¡Felicidades! Has completado todos los niveles. Puntuación final: ' + score);
				level = 1;
				score = 0;
				paddle.width = 100;
				ball.x = canvas.width / 2;
				ball.y = canvas.height - 45;
				ball.dx = 4;
				ball.dy = -4;
				createBlocks();
			}, 100);
		}
	}
}

// Eventos de teclado
function keydown(e){
	if (e.key === 'ArrowRight') rightPressed = true;
	if (e.key === 'ArrowLeft') leftPressed = true;
}
function keyup(e){
	if (e.key === 'ArrowRight') rightPressed = false;
	if (e.key === 'ArrowLeft') leftPressed = false;
}
document.addEventListener('keydown',keydown);
document.addEventListener('keyup',keyup);

// Bucle principal
function gameLoop() {
	movePaddle();
	moveBall();
	draw();
 	af = requestAnimationFrame(gameLoop);
}

gameLoop();

// cleanup
return function cleanup(){
	if (af) cancelAnimationFrame(af);
	document.removeEventListener('keydown',keydown);
	document.removeEventListener('keyup',keyup);
};
}
window.registerGame = registerGame;
