function registerGame() {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const width = 800;
  const height = 500;
  const field = { left: 40, right: 760, top: 54, bottom: 446 };
  const goalTop = 177;
  const goalBottom = 323;
  const keys = new Set();
  const winningScore = 5;
  const matchDuration = 180;
  const playerNames = ['Mateo', 'Pablo', 'Alejandra', 'Julia', 'Martina', 'Alonso', 'Alex', 'Gabriel', 'Vera', 'Paula', 'Claudia', 'Kloe', 'Atenea', 'Ali'];
  let animationFrame;
  let gameState = 'intro';
  let gameMode = 'humans';
  let remainingTime = matchDuration;
  let rosterDescription = '';
  let possession = null;
  let intendedPassReceiver = null;
  let actionMessage = '';
  let actionTimer = 0;
  let goalFlash = 0;
  let lastTime = 0;

  canvas.width = width;
  canvas.height = height;

  const formations = [
    [[78, 250], [175, 130], [175, 250], [175, 370], [300, 155], [300, 345], [320, 250]],
    [[722, 250], [625, 130], [625, 250], [625, 370], [500, 155], [500, 345], [480, 250]]
  ];
  const teams = [
    { name: 'Los Blancos', score: 0, color: '#f5f9ff', dark: '#15508d', highlight: '#ffffff', ink: '#174477', direction: 1 },
    { name: 'Los Azules', score: 0, color: '#3989e8', dark: '#103f7c', highlight: '#b8dcff', ink: '#ffffff', direction: -1 }
  ];
  teams.forEach((team, teamIndex) => {
    team.controlledIndex = 6;
    team.players = formations[teamIndex].map(([x, y], index) => ({
      x, y, homeX: x, homeY: y, radius: 14, speed: 3.6,
      color: team.color, dark: team.dark, highlight: team.highlight, ink: team.ink,
      facingX: team.direction, facingY: 0, kickCooldown: 0, tackleCooldown: 0, dribbleCooldown: 0, index,
      name: playerNames[teamIndex * 7 + index], role: index === 0 ? 'Portero' : 'Jugador'
    }));
  });
  const ball = { x: 400, y: 250, vx: 0, vy: 0, radius: 12, spin: 0 };

  function announceAction(message) {
    actionMessage = message;
    actionTimer = 150;
  }

  function setPossession(team, player, message = `${player.name} conduce`) {
    possession = { team, player };
    intendedPassReceiver = null;
    ball.vx = 0;
    ball.vy = 0;
    team.aiActionCooldown = 70;
    announceAction(message);
  }

  function randomizeTeams() {
    const goalkeepers = ['Mateo', 'Julia'];
    if (Math.random() < 0.5) goalkeepers.reverse();
    const shuffledNames = playerNames.filter(name => !goalkeepers.includes(name));
    for (let index = shuffledNames.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffledNames[index], shuffledNames[swapIndex]] = [shuffledNames[swapIndex], shuffledNames[index]];
    }
    teams.forEach((team, teamIndex) => {
      team.players.forEach((player, index) => {
        player.name = index === 0 ? goalkeepers[teamIndex] : shuffledNames[teamIndex * 6 + index - 1];
        player.role = index === 0 ? 'Portero y capitán' : 'Jugador';
      });
    });
    rosterDescription = teams.map(team => `${team.name}: ${team.players.map(player => `${player.name} (${player.role})`).join(', ')}`).join('. ');
  }

  function resetPositions() {
    teams.forEach(team => { team.controlledIndex = 6; });
    possession = null;
    intendedPassReceiver = null;
    actionMessage = '';
    actionTimer = 0;
    teams.forEach(team => team.players.forEach(player => {
      player.x = player.homeX;
      player.y = player.homeY;
      player.tackleCooldown = 0;
      player.dribbleCooldown = 0;
    }));
    ball.x = 400;
    ball.y = 250;
    ball.vx = 0;
    ball.vy = 0;
  }

  function startMatch(mode = 'humans') {
    gameMode = mode;
    teams.forEach(team => { team.score = 0; });
    remainingTime = matchDuration;
    randomizeTeams();
    resetPositions();
    setGameState('playing');
  }

  function setGameState(state) {
    gameState = state;
    const labels = {
      intro: 'Fútbol 7: elige jugar dos personas o CPU 1 contra CPU 2. Espacio inicia dos personas y 2 inicia CPU.',
      playing: `Partido de fútbol 7 en curso: ${gameMode === 'cpu' ? 'CPU 1 contra CPU 2' : 'dos jugadores'}, máximo 3 minutos o 5 goles.${gameMode === 'humans' ? ' Ctrl izquierdo: cambiar jugador blanco. Ctrl derecho: cambiar jugador azul.' : ''}`,
      gameOver: 'Partido terminado: pulsa R o toca el campo para repetir.'
    };
    canvas.setAttribute('aria-label', `${labels[state]} ${rosterDescription}. Árbitra: Almudena, de negro.`);
  }

  function movePlayer(player, up, down, left, right, delta) {
    let moveX = Number(keys.has(right)) - Number(keys.has(left));
    let moveY = Number(keys.has(down)) - Number(keys.has(up));
    const magnitude = Math.hypot(moveX, moveY);
    if (magnitude > 0) {
      moveX /= magnitude;
      moveY /= magnitude;
      player.facingX = moveX;
      player.facingY = moveY;
      player.x += moveX * player.speed * delta;
      player.y += moveY * player.speed * delta;
    }
    player.x = Math.max(field.left + player.radius, Math.min(field.right - player.radius, player.x));
    player.y = Math.max(field.top + player.radius, Math.min(field.bottom - player.radius, player.y));
    player.kickCooldown = Math.max(0, player.kickCooldown - delta);
  }

  function kick(player, opponentGoalDirection) {
    if (gameState !== 'playing' || player.kickCooldown > 0) return;
    const dx = ball.x - player.x;
    const dy = ball.y - player.y;
    const distance = Math.hypot(dx, dy);
    if (distance > player.radius + ball.radius + 22) return;

    let aimX = dx / (distance || 1) + opponentGoalDirection * 0.72;
    let aimY = dy / (distance || 1) + (ball.y - 250) / 300;
    const aimLength = Math.hypot(aimX, aimY) || 1;
    ball.vx = (aimX / aimLength) * 9.5;
    ball.vy = (aimY / aimLength) * 9.5;
    player.kickCooldown = 12;
  }

  function closestPlayerToBall(team) {
    return team.players.reduce((closest, player) => {
      return Math.hypot(ball.x - player.x, ball.y - player.y) < Math.hypot(ball.x - closest.x, ball.y - closest.y)
        ? player
        : closest;
    }, team.players[0]);
  }

  function kickWithTeam(team) {
    kick(closestPlayerToBall(team), team.direction);
  }

  function switchPlayer(team) {
    const player = closestPlayerToBall(team);
    team.controlledIndex = player.index;
    announceAction(`${team.name}: controlas a ${player.name}`);
  }

  function attemptTackle(team, defender, carrier) {
    if (!possession || possession.team === team || defender.tackleCooldown > 0) return;
    const distance = Math.hypot(carrier.x - defender.x, carrier.y - defender.y);
    if (distance > defender.radius + carrier.radius + 22) return;
    defender.tackleCooldown = 36;
    if (Math.random() < 0.48) setPossession(team, defender, `${defender.name} roba el balón a ${carrier.name}`);
    else announceAction(`${defender.name} intenta robar el balón`);
  }

  function resolveCpuTackle() {
    if (gameMode !== 'cpu' || !possession) return;
    const carrier = possession.player;
    const defendingTeam = teams.find(team => team !== possession.team);
    const nearestDefender = defendingTeam.players.slice(1).reduce((closest, player) =>
      Math.hypot(player.x - carrier.x, player.y - carrier.y) < Math.hypot(closest.x - carrier.x, closest.y - carrier.y)
        ? player
        : closest
    );
    attemptTackle(defendingTeam, nearestDefender, carrier);
  }

  function moveTeammates(team, delta) {
    const availablePlayers = team.players.slice(1).filter(player =>
      gameMode === 'humans'
        ? player.index !== team.controlledIndex
        : player.index !== 6 || (possession && possession.team === team && possession.player !== player)
    ).filter(player => !possession || possession.player !== player);
    const teamHasBall = possession && possession.team === team;
    const nearestPlayer = availablePlayers.reduce((closest, player) => {
      return Math.hypot(ball.x - player.x, ball.y - player.y) < Math.hypot(ball.x - closest.x, ball.y - closest.y)
        ? player
        : closest;
    }, availablePlayers[0]);

    availablePlayers.forEach(player => {
      const chasing = !teamHasBall && player === nearestPlayer && Math.hypot(ball.x - player.x, ball.y - player.y) < 190;
      const targetX = teamHasBall
        ? player.homeX + (ball.x - width / 2) * 0.12 + team.direction * 38
        : chasing ? ball.x - team.direction * 24 : player.homeX + (ball.x - width / 2) * 0.08;
      const targetY = teamHasBall
        ? player.homeY + (ball.y - height / 2) * 0.12
        : chasing ? ball.y : player.homeY + (ball.y - height / 2) * 0.08;
      const dx = targetX - player.x;
      const dy = targetY - player.y;
      const distance = Math.hypot(dx, dy);
      if (distance > 1) {
        const step = Math.min(distance, (chasing ? 2.5 : 1.2) * Math.min(delta, 2));
        player.x += dx / distance * step;
        player.y += dy / distance * step;
      }
      player.x = Math.max(field.left + player.radius, Math.min(field.right - player.radius, player.x));
      player.y = Math.max(field.top + player.radius, Math.min(field.bottom - player.radius, player.y));
      player.facingX = dx === 0 ? player.facingX : Math.sign(dx);
      player.facingY = dy === 0 ? player.facingY : Math.sign(dy);
      player.kickCooldown = Math.max(0, player.kickCooldown - delta);
      player.tackleCooldown = Math.max(0, player.tackleCooldown - delta);
      if (gameMode === 'cpu' && chasing && possession && possession.team !== team) {
        attemptTackle(team, player, possession.player);
      }
    });
  }

  function moveCpuPlayer(team, delta) {
    const player = team.players[6];
    const opponentPossession = possession && possession.team !== team;
    const target = opponentPossession ? possession.player : null;
    const dx = (target ? target.x : ball.x) - team.direction * 22 - player.x;
    const dy = (target ? target.y : ball.y) - player.y;
    const distance = Math.hypot(dx, dy);
    if (distance > 1) {
      const step = Math.min(distance, player.speed * delta);
      player.x += dx / distance * step;
      player.y += dy / distance * step;
      player.facingX = Math.sign(dx) || player.facingX;
      player.facingY = Math.sign(dy) || player.facingY;
    }
    player.x = Math.max(field.left + player.radius, Math.min(field.right - player.radius, player.x));
    player.y = Math.max(field.top + player.radius, Math.min(field.bottom - player.radius, player.y));
    player.kickCooldown = Math.max(0, player.kickCooldown - delta);
    player.tackleCooldown = Math.max(0, player.tackleCooldown - delta);
    if (target) attemptTackle(team, player, target);
  }

  function moveCpuCarrier(team, delta) {
    const player = possession.player;
    const opponents = teams.find(otherTeam => otherTeam !== team).players.slice(1);
    const nearestOpponent = opponents.reduce((closest, opponent) =>
      Math.hypot(opponent.x - player.x, opponent.y - player.y) < Math.hypot(closest.x - player.x, closest.y - player.y)
        ? opponent
        : closest
    );
    const pressure = Math.hypot(nearestOpponent.x - player.x, nearestOpponent.y - player.y);
    player.dribbleCooldown = Math.max(0, player.dribbleCooldown - delta);
    let moveY = 0;
    if (pressure < 88) {
      moveY = player.y <= nearestOpponent.y ? -0.9 : 0.9;
      if (player.dribbleCooldown === 0) {
        announceAction(`${player.name} regatea a ${nearestOpponent.name}`);
        player.dribbleCooldown = 90;
      }
    }
    if (player.y < field.top + 55) moveY = 0.65;
    if (player.y > field.bottom - 55) moveY = -0.65;
    const magnitude = Math.hypot(1, moveY);
    player.x += team.direction / magnitude * player.speed * 0.78 * delta;
    player.y += moveY / magnitude * player.speed * 0.78 * delta;
    player.x = Math.max(field.left + player.radius, Math.min(field.right - player.radius, player.x));
    player.y = Math.max(field.top + player.radius, Math.min(field.bottom - player.radius, player.y));
    player.facingX = team.direction;
    player.facingY = moveY === 0 ? 0 : Math.sign(moveY);
    ball.x = player.x + team.direction * (player.radius + ball.radius - 2);
    ball.y = player.y + player.facingY * 3;
    ball.vx = 0;
    ball.vy = 0;
  }

  function claimLooseBall() {
    const candidates = teams.flatMap(team => team.players.slice(1).map(player => ({ team, player })));
    const nearest = candidates.reduce((closest, candidate) =>
      Math.hypot(candidate.player.x - ball.x, candidate.player.y - ball.y) < Math.hypot(closest.player.x - ball.x, closest.player.y - ball.y)
        ? candidate
        : closest
    );
    if (Math.hypot(nearest.player.x - ball.x, nearest.player.y - ball.y) <= nearest.player.radius + ball.radius + 7) {
      const message = intendedPassReceiver
        ? nearest.player === intendedPassReceiver ? `${nearest.player.name} recibe el pase` : `${nearest.player.name} intercepta el pase`
        : `${nearest.player.name} recupera el balón`;
      intendedPassReceiver = null;
      setPossession(nearest.team, nearest.player, message);
    }
  }

  function choosePassTarget(team, carrier) {
    const opponents = teams.find(otherTeam => otherTeam !== team).players.slice(1);
    return team.players.slice(1).filter(player => player !== carrier).map(player => {
      const distance = Math.hypot(player.x - carrier.x, player.y - carrier.y);
      const openSpace = Math.min(...opponents.map(opponent => Math.hypot(opponent.x - player.x, opponent.y - player.y)));
      const progress = (player.x - carrier.x) * team.direction;
      return { player, distance, score: progress * 0.8 + openSpace * 0.45 - distance * 0.16 };
    }).filter(candidate => candidate.distance > 65 && candidate.distance < 330)
      .sort((first, second) => second.score - first.score)[0]?.player || null;
  }

  function passBall(team, carrier, receiver) {
    const dx = receiver.x - ball.x;
    const dy = receiver.y - ball.y;
    const distance = Math.hypot(dx, dy) || 1;
    possession = null;
    intendedPassReceiver = receiver;
    ball.vx = dx / distance * 7.5;
    ball.vy = dy / distance * 7.5;
    team.aiActionCooldown = 95;
    announceAction(`${carrier.name} pasa a ${receiver.name}`);
  }

  function shootAtGoal(team, player) {
    const dx = (team.direction > 0 ? field.right + 35 : field.left - 35) - ball.x;
    const dy = height / 2 - ball.y;
    const distance = Math.hypot(dx, dy) || 1;
    possession = null;
    intendedPassReceiver = null;
    ball.vx = dx / distance * 10.5;
    ball.vy = dy / distance * 10.5;
    team.aiActionCooldown = 100;
    announceAction(`${player.name} chuta a portería`);
  }

  function decideCpuAction(delta) {
    if (!possession) return;
    const { team, player } = possession;
    team.aiActionCooldown = Math.max(0, team.aiActionCooldown - delta);
    const opponents = teams.find(otherTeam => otherTeam !== team).players.slice(1);
    const pressure = Math.min(...opponents.map(opponent => Math.hypot(opponent.x - player.x, opponent.y - player.y)));
    const goalDistance = team.direction > 0 ? field.right - ball.x : ball.x - field.left;
    if (goalDistance < 285 && (team.aiActionCooldown === 0 || pressure < 58)) {
      shootAtGoal(team, player);
      return;
    }
    if (pressure < 48 || (team.aiActionCooldown === 0 && pressure < 105)) {
      const receiver = choosePassTarget(team, player);
      if (receiver) passBall(team, player, receiver);
      else if (goalDistance < 245) shootAtGoal(team, player);
      else team.aiActionCooldown = 45;
    }
  }

  function update(delta) {
    if (gameState !== 'playing') return;
    if (gameMode === 'humans') {
      movePlayer(teams[0].players[teams[0].controlledIndex], 'KeyW', 'KeyS', 'KeyA', 'KeyD', delta);
      movePlayer(teams[1].players[teams[1].controlledIndex], 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', delta);
    } else {
      teams.forEach(team => {
        if (possession && possession.team === team) moveCpuCarrier(team, delta);
        else moveCpuPlayer(team, delta);
      });
    }
    teams.forEach(team => moveTeammates(team, delta));
    resolveCpuTackle();
    if (gameMode === 'cpu') decideCpuAction(delta);

    if (gameMode === 'cpu' && possession) {
      ball.x = possession.player.x + possession.team.direction * (possession.player.radius + ball.radius - 2);
      ball.y = possession.player.y + possession.player.facingY * 3;
      ball.vx = 0;
      ball.vy = 0;
    } else {
      ball.x += ball.vx * delta;
      ball.y += ball.vy * delta;
      ball.vx *= Math.pow(0.985, delta);
      ball.vy *= Math.pow(0.985, delta);
      ball.spin += Math.hypot(ball.vx, ball.vy) * delta * 0.03;
    }

    if (!possession && (ball.y - ball.radius < field.top || ball.y + ball.radius > field.bottom)) {
      ball.y = Math.max(field.top + ball.radius, Math.min(field.bottom - ball.radius, ball.y));
      ball.vy *= -0.78;
    }

    if (!possession && ball.x - ball.radius < field.left && (ball.y < goalTop || ball.y > goalBottom)) {
      ball.x = field.left + ball.radius;
      ball.vx *= -0.78;
    } else if (!possession && ball.x + ball.radius > field.right && (ball.y < goalTop || ball.y > goalBottom)) {
      ball.x = field.right - ball.radius;
      ball.vx *= -0.78;
    }

    if (!possession) {
      for (const player of teams.flatMap(team => team.players)) {
        const dx = ball.x - player.x;
        const dy = ball.y - player.y;
        const distance = Math.hypot(dx, dy);
        const minDistance = player.radius + ball.radius;
        if (distance < minDistance && distance > 0) {
          const normalX = dx / distance;
          const normalY = dy / distance;
          ball.x = player.x + normalX * minDistance;
          ball.y = player.y + normalY * minDistance;
          const push = Math.max(2.2, Math.hypot(ball.vx, ball.vy) * 0.8);
          ball.vx = normalX * push + (keys.size ? player.facingX * 0.9 : 0);
          ball.vy = normalY * push + (keys.size ? player.facingY * 0.9 : 0);
        }
      }
      if (gameMode === 'cpu') claimLooseBall();
    }

    const scored = ball.x < field.left - 10 && ball.y > goalTop && ball.y < goalBottom
      ? 1
      : ball.x > field.right + 10 && ball.y > goalTop && ball.y < goalBottom ? 0 : -1;
    if (scored !== -1) {
      teams[scored].score += 1;
      goalFlash = 75;
      if (teams[scored].score >= winningScore) setGameState('gameOver');
      else resetPositions();
    }
    remainingTime = Math.max(0, remainingTime - delta / 60);
    if (remainingTime === 0 && gameState === 'playing') setGameState('gameOver');
    goalFlash = Math.max(0, goalFlash - delta);
    actionTimer = Math.max(0, actionTimer - delta);
    if (actionTimer === 0) actionMessage = '';
  }

  function drawField() {
    const stadium = ctx.createLinearGradient(0, 0, 0, height);
    stadium.addColorStop(0, '#102f56');
    stadium.addColorStop(0.5, '#174879');
    stadium.addColorStop(1, '#0d2545');
    ctx.fillStyle = stadium;
    ctx.fillRect(0, 0, width, height);

    for (let row = 0; row < 5; row += 1) {
      ctx.fillStyle = row % 2 ? '#164477' : '#1b5087';
      ctx.fillRect(18, 18 + row * 7, width - 36, 4);
    }
    // Grada de barrio original: público y bufandas, fuera del campo de colisión.
    ctx.save();
    for (let seat = 0; seat < 48; seat += 1) {
      const x = 20 + seat * 16;
      const y = 464 + (seat % 2) * 12;
      ctx.fillStyle = ['#ffd4aa', '#b97952', '#edb58b'][seat % 3];
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = seat % 3 ? '#f5f9ff' : '#3989e8';
      ctx.fillRect(x - 4, y + 4, 8, 7);
      ctx.strokeStyle = '#ffdb70';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 5, y + 1);
      ctx.lineTo(x + 5, y + 1);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#258443';
    ctx.fillRect(field.left, field.top, field.right - field.left, field.bottom - field.top);
    ctx.restore();

    const stripeWidth = (field.right - field.left) / 10;
    for (let stripe = 0; stripe < 10; stripe += 1) {
      ctx.fillStyle = stripe % 2 ? 'rgba(8,75,35,0.2)' : 'rgba(220,255,222,0.11)';
      ctx.fillRect(field.left + stripe * stripeWidth, field.top, stripeWidth, field.bottom - field.top);
    }

    ctx.save();
    ctx.strokeStyle = 'rgba(246,250,255,0.9)';
    ctx.lineWidth = 3;
    ctx.strokeRect(field.left, field.top, field.right - field.left, field.bottom - field.top);
    ctx.beginPath();
    ctx.moveTo(width / 2, field.top);
    ctx.lineTo(width / 2, field.bottom);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 63, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#f5f9ff';
    ctx.fill();
    ctx.strokeRect(field.left, 154, 90, 192);
    ctx.strokeRect(field.left, 195, 38, 110);
    ctx.strokeRect(field.right - 90, 154, 90, 192);
    ctx.strokeRect(field.right - 38, 195, 38, 110);
    ctx.beginPath();
    ctx.arc(field.left + 63, height / 2, 3, 0, Math.PI * 2);
    ctx.arc(field.right - 63, height / 2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    drawGoal(field.left - 27, goalTop, 27, goalBottom - goalTop);
    drawGoal(field.right, goalTop, 27, goalBottom - goalTop);
  }

  function drawGoal(x, y, goalWidth, goalHeight) {
    ctx.save();
    ctx.fillStyle = 'rgba(5,24,52,0.5)';
    ctx.fillRect(x, y, goalWidth, goalHeight);
    ctx.strokeStyle = '#f5f9ff';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, goalWidth, goalHeight);
    ctx.strokeStyle = 'rgba(232,243,255,0.48)';
    ctx.lineWidth = 1;
    for (let lineX = x + 7; lineX < x + goalWidth; lineX += 7) {
      ctx.beginPath();
      ctx.moveTo(lineX, y);
      ctx.lineTo(lineX, y + goalHeight);
      ctx.stroke();
    }
    for (let lineY = y + 8; lineY < y + goalHeight; lineY += 12) {
      ctx.beginPath();
      ctx.moveTo(x, lineY);
      ctx.lineTo(x + goalWidth, lineY);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPlayer(player) {
    ctx.save();
    ctx.translate(player.x, player.y);
    if (gameMode === 'humans' && gameState === 'playing' &&
        teams.some(team => team.players[team.controlledIndex] === player)) {
      ctx.strokeStyle = '#ffe66d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 9, 20, 15, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(5,24,52,0.38)';
    ctx.beginPath();
    ctx.ellipse(2, 17, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#172b43';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-3, 7);
    ctx.lineTo(-4, 16);
    ctx.moveTo(3, 7);
    ctx.lineTo(5, 16);
    ctx.stroke();
    ctx.strokeStyle = '#f5f8fc';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-4, 15);
    ctx.lineTo(-7, 17);
    ctx.moveTo(5, 15);
    ctx.lineTo(8, 17);
    ctx.stroke();

    ctx.strokeStyle = player.dark;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(-6, -6);
    ctx.lineTo(-11, 1);
    ctx.moveTo(6, -6);
    ctx.lineTo(11, 1);
    ctx.stroke();
    ctx.strokeStyle = '#d99b72';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-11, 1);
    ctx.lineTo(-12, 6);
    ctx.moveTo(11, 1);
    ctx.lineTo(12, 6);
    ctx.stroke();

    ctx.fillStyle = player.dark;
    ctx.beginPath();
    ctx.roundRect(-7, 5, 14, 7, 3);
    ctx.fill();
    const jersey = ctx.createLinearGradient(-7, -8, 7, 8);
    jersey.addColorStop(0, player.highlight);
    jersey.addColorStop(0.42, player.color);
    jersey.addColorStop(1, player.dark);
    ctx.fillStyle = jersey;
    ctx.beginPath();
    ctx.moveTo(-5, -8);
    ctx.lineTo(-9, -5);
    ctx.lineTo(-7, 5);
    ctx.quadraticCurveTo(0, 9, 7, 5);
    ctx.lineTo(9, -5);
    ctx.lineTo(5, -8);
    ctx.quadraticCurveTo(0, -5, -5, -8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.88)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const skin = ['#d99b72', '#f0bc91', '#9c6245', '#c68b61'][player.index % 4];
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.roundRect(-2, -11, 4, 5, 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -14, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = ['#35271f', '#754624', '#211d29', '#b57b35'][player.index % 4];
    ctx.beginPath();
    ctx.arc(0, -16, 5.7, Math.PI, Math.PI * 2);
    ctx.lineTo(5, -14);
    ctx.quadraticCurveTo(0, -17, -5, -14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#30251f';
    ctx.beginPath();
    ctx.arc(2.7, -14, 0.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = player.ink;
    ctx.font = 'bold 9px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(player.index + 1), 0, 0);
    ctx.restore();

    const labelY = Math.min(player.y + 28, field.bottom + 11);
    ctx.save();
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const labelWidth = ctx.measureText(player.name).width + 8;
    ctx.fillStyle = 'rgba(7,31,20,0.78)';
    ctx.beginPath();
    ctx.roundRect(player.x - labelWidth / 2, labelY - 7, labelWidth, 14, 5);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(player.name, player.x, labelY);
    ctx.restore();
  }

  function drawReferee() {
    const x = width / 2;
    const y = field.top + 27;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(x + 2, y + 11, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111820';
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#f2c9a5';
    ctx.beginPath();
    ctx.arc(x, y - 13, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(7,31,20,0.85)';
    ctx.strokeText('Almudena', x, y + 21);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Almudena', x, y + 21);
    ctx.restore();
  }

  function drawBall() {
    ctx.save();
    ctx.translate(ball.x, ball.y);
    ctx.fillStyle = 'rgba(5,24,52,0.34)';
    ctx.beginPath();
    ctx.ellipse(3, 9, 13, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.rotate(ball.spin);
    const surface = ctx.createRadialGradient(-5, -6, 1, 0, 0, ball.radius + 2);
    surface.addColorStop(0, '#ffffff');
    surface.addColorStop(0.75, '#e6f0fc');
    surface.addColorStop(1, '#9bb8d8');
    ctx.fillStyle = surface;
    ctx.beginPath();
    ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#174477';
    drawPentagon(0, 0, 3.7);
    for (let patch = 0; patch < 5; patch += 1) {
      const angle = patch * Math.PI * 2 / 5 - Math.PI / 2;
      drawPentagon(Math.cos(angle) * 7.3, Math.sin(angle) * 7.3, 2.4);
    }
    ctx.restore();
  }

  function drawPentagon(x, y, radius) {
    ctx.beginPath();
    for (let point = 0; point < 5; point += 1) {
      const angle = point * Math.PI * 2 / 5 - Math.PI / 2;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      if (point === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }

  function drawScoreboard() {
    ctx.save();
    ctx.fillStyle = 'rgba(8, 30, 58, 0.9)';
    ctx.beginPath();
    ctx.roundRect(287, 8, 226, 48, 12);
    ctx.fill();
    ctx.fillStyle = teams[0].color;
    ctx.font = 'bold 19px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(teams[0].score), 366, 24);
    ctx.fillStyle = '#f5fff5';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('VS', 400, 24);
    ctx.fillStyle = teams[1].color;
    ctx.font = 'bold 19px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(String(teams[1].score), 434, 24);
    ctx.fillStyle = '#dcecff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(formatTime(remainingTime), 400, 44);
    ctx.fillStyle = 'rgba(255,255,255,0.82)';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('J1', 18, 38);
    ctx.textAlign = 'right';
    ctx.fillText('J2', 782, 38);
    ctx.restore();
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainder = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainder}`;
  }

  function drawIntro() {
    ctx.save();
    ctx.fillStyle = 'rgba(8,24,42,0.78)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(12,37,62,0.97)';
    ctx.beginPath();
    ctx.roundRect(130, 105, 540, 300, 22);
    ctx.fill();
    ctx.strokeStyle = 'rgba(221,239,255,0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 38px Arial';
    ctx.fillText('FÚTBOL 7', width / 2, 153);
    ctx.fillStyle = '#d8eaff';
    ctx.font = '16px Arial';
    ctx.fillText('Equipos aleatorios · partido a 5 goles o 3 minutos', width / 2, 205);

    ctx.fillStyle = '#1768ad';
    ctx.beginPath();
    ctx.roundRect(165, 250, 225, 66, 12);
    ctx.fill();
    ctx.fillStyle = '#2c8750';
    ctx.beginPath();
    ctx.roundRect(410, 250, 225, 66, 12);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('JUGAMOS NOSOTROS', 277, 274);
    ctx.font = '12px Arial';
    ctx.fillText('WASD + F  ·  Flechas + Enter', 277, 296);
    ctx.font = 'bold 16px Arial';
    ctx.fillText('CPU 1 vs CPU 2', 522, 274);
    ctx.font = '12px Arial';
    ctx.fillText('Partido automático', 522, 296);
    ctx.fillStyle = '#a9cefa';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Espacio: dos jugadores  ·  Tecla 2: CPU contra CPU', width / 2, 358);
    ctx.font = '12px Arial';
    ctx.fillText('Ctrl izq.: cambiar blanco · Ctrl der.: cambiar azul', width / 2, 382);
    ctx.restore();
  }

  function drawOverlay(title, lines, accent = '#d7ff70') {
    ctx.save();
    ctx.fillStyle = 'rgba(8,24,42,0.76)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(12,37,62,0.96)';
    ctx.beginPath();
    ctx.roundRect(160, 112, 480, 276, 22);
    ctx.fill();
    ctx.strokeStyle = 'rgba(221,239,255,0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = accent;
    ctx.font = '900 42px Arial';
    ctx.fillText(title, width / 2, 170);
    ctx.fillStyle = '#eff6ff';
    ctx.font = '17px Arial';
    lines.forEach((line, index) => ctx.fillText(line, width / 2, 226 + index * 30));
    ctx.fillStyle = '#8fc5ff';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('PULSA R PARA REPETIR', width / 2, 348);
    ctx.restore();
  }

  function draw() {
    drawField();
    teams.forEach(team => team.players.forEach(drawPlayer));
    drawReferee();
    drawBall();
    drawScoreboard();

    if (goalFlash > 0 && gameState === 'playing') {
      ctx.save();
      ctx.fillStyle = `rgba(220,240,255,${Math.min(0.25, goalFlash / 240)})`;
      ctx.fillRect(field.left, field.top, field.right - field.left, field.bottom - field.top);
      ctx.restore();
    }
    if (gameState === 'intro') {
      drawIntro();
    } else if (gameState === 'gameOver') {
      const winner = teams[0].score === teams[1].score
        ? '¡EMPATE!'
        : teams[0].score > teams[1].score ? '¡GANA EQUIPO BLANCO!' : '¡GANA EQUIPO AZUL!';
      const color = teams[0].score === teams[1].score
        ? '#ffffff'
        : teams[0].score > teams[1].score ? teams[0].color : teams[1].color;
      drawOverlay(winner, [`Marcador final: ${teams[0].score} - ${teams[1].score}`, `Tiempo: ${formatTime(remainingTime)} · R para repetir`], color);
    } else {
      if (actionMessage) {
        ctx.save();
        ctx.fillStyle = 'rgba(8,30,58,0.82)';
        ctx.beginPath();
        ctx.roundRect(250, 451, 300, 20, 7);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(actionMessage, width / 2, 461);
        ctx.restore();
      }
      ctx.save();
      ctx.fillStyle = 'rgba(8,30,58,0.78)';
      ctx.beginPath();
      ctx.roundRect(100, 475, 600, 20, 7);
      ctx.fill();
      ctx.fillStyle = '#edf6ff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(gameMode === 'cpu' ? 'CPU 1 VS CPU 2  ·  PARTIDO AUTOMÁTICO' : 'BLANCOS: WASD + F + CTRL IZQ.   ·   AZULES: FLECHAS + ENTER + CTRL DER.', width / 2, 485);
      ctx.restore();
    }
  }

  function handleKeyDown(event) {
    const controls = ['Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'KeyR', 'ControlLeft', 'ControlRight'];
    const isSpace = event.code === 'Space' || event.key === ' ';
    if (controls.includes(event.code) || isSpace) event.preventDefault();
    const code = event.code || (isSpace ? 'Space' : event.key);
    const wasPressed = keys.has(code);
    keys.add(code);

    if (gameState === 'playing' && gameMode === 'humans' && (code === 'ControlLeft' || code === 'ControlRight')) {
      if (!event.repeat && !wasPressed) switchPlayer(teams[code === 'ControlRight' ? 1 : 0]);
    } else if (gameState === 'intro' && (isSpace || code === 'Enter')) {
      startMatch('humans');
    } else if (gameState === 'intro' && (code === 'Digit2' || event.key === '2')) {
      startMatch('cpu');
    } else if (gameState === 'playing' && gameMode === 'humans' && code === 'KeyF') {
      kickWithTeam(teams[0]);
    } else if (gameState === 'playing' && gameMode === 'humans' && code === 'Enter') {
      kickWithTeam(teams[1]);
    } else if (gameState === 'gameOver' && code === 'KeyR') {
      startMatch(gameMode);
    }
  }

  function handleKeyUp(event) {
    keys.delete(event.code || (event.key === ' ' ? 'Space' : event.key));
  }

  function handleBlur() {
    keys.clear();
  }

  function handlePointerDown(event) {
    if (gameState === 'intro') {
      const bounds = canvas.getBoundingClientRect();
      const x = (event.clientX - bounds.left) * width / bounds.width;
      const y = (event.clientY - bounds.top) * height / bounds.height;
      startMatch(x >= 400 && x <= 635 && y >= 250 && y <= 316 ? 'cpu' : 'humans');
    } else if (gameState === 'gameOver') {
      startMatch(gameMode);
    }
  }

  function loop(timestamp = 0) {
    const delta = Math.min((timestamp - lastTime) / 16.67 || 1, 2);
    lastTime = timestamp;
    update(delta);
    draw();
    animationFrame = requestAnimationFrame(loop);
  }

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  window.addEventListener('blur', handleBlur);
  canvas.addEventListener('pointerdown', handlePointerDown);
  randomizeTeams();
  setGameState('intro');
  canvas.focus();
  loop();

  return function cleanup() {
    cancelAnimationFrame(animationFrame);
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    window.removeEventListener('blur', handleBlur);
    canvas.removeEventListener('pointerdown', handlePointerDown);
    keys.clear();
  };
}

window.registerGame = registerGame;