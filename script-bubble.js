function registerGame(){
// Dispara Colores (estilo bubble shooter sencillo con match >=4)
const canvas=document.getElementById('gameCanvas'); const ctx=canvas.getContext('2d'); let af=null;
canvas.width=800; canvas.height=500;
let showIntro=true;
const GRID_ROWS=10, GRID_COLS=14; const R=18; const TOP_OFFSET=70; const LEFT_OFFSET= (canvas.width - (GRID_COLS*R*2))/2 + R; // centrado
const COLORS=['#e91e63','#ff9800','#4caf50','#2196f3','#9c27b0'];
let grid = Array.from({length:GRID_ROWS},()=>Array(GRID_COLS).fill(null));
// Prellenar algunas filas
for(let r=0;r<5;r++) for(let c=0;c<GRID_COLS;c++){ if(Math.random()<0.75) grid[r][c]=COLORS[Math.floor(Math.random()*COLORS.length)]; }
let shooter={x:canvas.width/2, y:canvas.height-40, angle:Math.PI/2, speed:8};
let currentBall = {x:shooter.x, y:shooter.y, vx:0, vy:0, color:COLORS[Math.floor(Math.random()*COLORS.length)], moving:false};
let nextColor = COLORS[Math.floor(Math.random()*COLORS.length)];
let score=0; let high=Number(localStorage.getItem('bubbleHigh')||0); let highName=localStorage.getItem('bubbleHighName')||''; let playerName=localStorage.getItem('playerName')||'';
function newBall(){ currentBall={x:shooter.x,y:shooter.y,vx:0,vy:0,color:nextColor,moving:false}; nextColor=COLORS[Math.floor(Math.random()*COLORS.length)]; }
function update(){ if(showIntro) return; if(currentBall.moving){ currentBall.x += currentBall.vx; currentBall.y += currentBall.vy; // rebote paredes
 if(currentBall.x < R || currentBall.x > canvas.width-R) currentBall.vx*=-1; if(currentBall.y < TOP_OFFSET){ snapBall(); }
 else { // colisión con bolas existentes
  outer: for(let r=0;r<GRID_ROWS;r++) for(let c=0;c<GRID_COLS;c++){ if(grid[r][c]){ const cx=LEFT_OFFSET + c*R*2; const cy=TOP_OFFSET + r*R*2; const dx=currentBall.x-cx; const dy=currentBall.y-cy; if(dx*dx+dy*dy < (R*2)*(R*2)-4){ snapBall(); break outer; } } }
 }
 }
}
function snapBall(){ // colocar en celda más cercana
 let c = Math.round((currentBall.x-LEFT_OFFSET)/(R*2)); c=Math.max(0,Math.min(GRID_COLS-1,c)); let r = Math.round((currentBall.y-TOP_OFFSET)/(R*2)); r=Math.max(0,Math.min(GRID_ROWS-1,r)); // buscar hueco libre hacia abajo
 while(r<GRID_ROWS && grid[r][c]) r++; if(r>=GRID_ROWS) { // fila añadida? scroll down
  scrollDown(); r=GRID_ROWS-1; }
 grid[r][c]=currentBall.color; currentBall.moving=false; matchAndClear(r,c); newBall(); checkGameOver(); }
function scrollDown(){ // desplaza una fila hacia abajo perdiendo última
 for(let r=GRID_ROWS-1;r>0;r--) grid[r]=grid[r-1].slice(); grid[0]=Array(GRID_COLS).fill(null); }
function matchAndClear(sr,sc){ const target=grid[sr][sc]; if(!target) return; const stack=[[sr,sc]]; const visited=new Set(); const cluster=[]; while(stack.length){ const [r,c]=stack.pop(); const key=r+','+c; if(visited.has(key)) continue; visited.add(key); if(r<0||r>=GRID_ROWS||c<0||c>=GRID_COLS) continue; if(grid[r][c]!==target) continue; cluster.push([r,c]); // vecinos 4-dir
 stack.push([r-1,c]); stack.push([r+1,c]); stack.push([r,c-1]); stack.push([r,c+1]); }
 if(cluster.length>=4){ cluster.forEach(([r,c])=> grid[r][c]=null); const gained=cluster.length*10; score+=gained; if(score>high){ high=score; localStorage.setItem('bubbleHigh',String(high)); localStorage.setItem('bubbleHighName', playerName); } }
}
function checkGameOver(){ for(let r=GRID_ROWS-1;r>=GRID_ROWS-3;r--){ for(let c=0;c<GRID_COLS;c++){ if(grid[r][c]) return; } } }
function drawGrid(){ for(let r=0;r<GRID_ROWS;r++) for(let c=0;c<GRID_COLS;c++){ if(grid[r][c]) drawBall(LEFT_OFFSET + c*R*2, TOP_OFFSET + r*R*2, grid[r][c]); } }
function drawBall(x,y,color){ ctx.beginPath(); ctx.arc(x,y,R,0,Math.PI*2); ctx.fillStyle=color; ctx.fill(); ctx.strokeStyle='#222'; ctx.stroke(); }
function drawShooter(){ // base
 ctx.fillStyle='#455a64'; ctx.fillRect(shooter.x-30,shooter.y-10,60,20); // cañón
 ctx.save(); ctx.translate(shooter.x,shooter.y); ctx.rotate(-shooter.angle + Math.PI/2); ctx.fillStyle='#90caf9'; ctx.fillRect(-6,-32,12,40); ctx.restore(); drawBall(shooter.x,shooter.y,currentBall.color); drawBall(shooter.x+50,shooter.y+0,nextColor); ctx.font='12px Arial'; ctx.fillStyle='#333'; ctx.fillText('Siguiente', shooter.x+50,shooter.y+26); }
function drawHUD(){ ctx.fillStyle='#0d47a1'; ctx.fillRect(0,0,canvas.width,50); ctx.fillStyle='#fff'; ctx.font='16px Arial'; ctx.textAlign='left'; ctx.fillText('Puntos: '+score,14,30); ctx.textAlign='right'; ctx.fillText('Récord: '+high+(highName?(' ('+highName+')'):'') , canvas.width-14,30); }
function drawIntro(){ ctx.save(); ctx.globalAlpha=0.9; ctx.fillStyle='#fff'; ctx.fillRect(60,70,canvas.width-120,220); ctx.globalAlpha=1; ctx.fillStyle='#0d47a1'; ctx.font='bold 26px Arial'; ctx.textAlign='center'; ctx.fillText('Dispara Colores', canvas.width/2,110); ctx.font='15px Arial'; ctx.fillStyle='#333'; ctx.fillText('Apunta con el ratón. Clic para disparar la bola.', canvas.width/2,145); ctx.fillText('Junta 4 o más del mismo color para explotar y sumar puntos.', canvas.width/2,170); ctx.fillText('Sesiones cortas (máx. 10 minutos) recomendadas.', canvas.width/2,195); ctx.fillText('Pulsa cualquier tecla para empezar.', canvas.width/2,220); ctx.restore(); }
function draw(){ ctx.clearRect(0,0,canvas.width,canvas.height); drawGrid(); drawShooter(); drawHUD(); if(showIntro) drawIntro(); }
function loop(){ update(); draw(); af=requestAnimationFrame(loop); }
function key(e){ if(showIntro){ showIntro=false; return; } }
function mouseMove(e){ const rect=canvas.getBoundingClientRect(); const mx=e.clientX-rect.left; const my=e.clientY-rect.top; const ang=Math.atan2(shooter.y - my, mx - shooter.x); shooter.angle = ang; }
function mouseClick(e){ if(showIntro) return; if(currentBall.moving) return; currentBall.moving=true; const speed=10; const ang=shooter.angle; currentBall.vx = Math.cos(ang)*speed; currentBall.vy = -Math.sin(ang)*speed; }
canvas.addEventListener('mousemove',mouseMove); canvas.addEventListener('click',mouseClick); window.addEventListener('keydown',key); requestAnimationFrame(loop);
return function cleanup(){ if(af) cancelAnimationFrame(af); canvas.removeEventListener('mousemove',mouseMove); canvas.removeEventListener('click',mouseClick); window.removeEventListener('keydown',key); };
}
window.registerGame=registerGame;
