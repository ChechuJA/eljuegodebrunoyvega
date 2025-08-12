function registerGame(){
// Bloques mágicos (mini Tetris simplificado con récord)
const canvas=document.getElementById('gameCanvas'); const ctx=canvas.getContext('2d'); let af=null;
const COLS=10, ROWS=20, SIZE=24; canvas.width=COLS*SIZE; canvas.height=ROWS*SIZE+80;
const shapes={
 I:[[1,1,1,1]],
 O:[[1,1],[1,1]],
 T:[[1,1,1],[0,1,0]],
 L:[[1,1,1],[1,0,0]],
 J:[[1,1,1],[0,0,1]],
 S:[[0,1,1],[1,1,0]],
 Z:[[1,1,0],[0,1,1]]
};
const colors=['#e91e63','#ff9800','#4caf50','#2196f3','#9c27b0','#00bcd4','#ffc107'];
let grid = Array.from({length:ROWS},()=>Array(COLS).fill(0));
let current=null; let x=3,y=0; let score=0; let level=1; let dropInterval=700; let lastDrop=0; let gameOver=false; let high=Number(localStorage.getItem('bloquesHigh')||0);
function newPiece(){ const keys=Object.keys(shapes); const k=keys[Math.floor(Math.random()*keys.length)]; current=shapes[k].map(r=>r.slice()); x= Math.floor((COLS-current[0].length)/2); y=0; if(collide(0,0,current)){ gameOver=true; if(score>high){ high=score; localStorage.setItem('bloquesHigh', String(high)); }}}
function rotate(mat){ const h=mat.length,w=mat[0].length; const res=Array.from({length:w},()=>Array(h).fill(0)); for(let r=0;r<h;r++) for(let c=0;c<w;c++) res[c][h-1-r]=mat[r][c]; return res; }
function collide(dx,dy,shape){ for(let r=0;r<shape.length;r++) for(let c=0;c<shape[0].length;c++){ if(shape[r][c]){ const nx=x+c+dx, ny=y+r+dy; if(nx<0||nx>=COLS||ny>=ROWS|| (ny>=0 && grid[ny][nx])) return true; }} return false; }
function merge(){ for(let r=0;r<current.length;r++) for(let c=0;c<current[0].length;c++) if(current[r][c]) grid[y+r][x+c]=colors.indexOf(color)+1; }
function clearLines(){ let cleared=0; for(let r=ROWS-1;r>=0;r--){ if(grid[r].every(v=>v)){ grid.splice(r,1); grid.unshift(Array(COLS).fill(0)); cleared++; r++; }} if(cleared){ score += [0,40,100,300,800][cleared]; level = 1+ Math.floor(score/400); dropInterval=Math.max(120,700 - (level-1)*60); }
}
let color = colors[Math.floor(Math.random()*colors.length)];
function spawn(){ color = colors[Math.floor(Math.random()*colors.length)]; newPiece(); }
function update(t){ if(gameOver) return; if(!lastDrop) lastDrop=t; const delta=t-lastDrop; if(delta>dropInterval){ if(!collide(0,1,current)) y++; else { merge(); clearLines(); spawn(); } lastDrop=t; }
}
function draw(){ ctx.clearRect(0,0,canvas.width,canvas.height); ctx.save(); ctx.fillStyle='#111'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.font='16px Arial'; ctx.fillStyle='#fff'; ctx.fillText('Bloques mágicos  Puntos: '+score+'  Nivel: '+level+'  Récord: '+high, 10,20); if(gameOver){ ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(0,40,canvas.width,canvas.height-40); ctx.fillStyle='#ffeb3b'; ctx.font='22px Arial'; ctx.fillText('Game Over. Pulsa R para reiniciar', canvas.width/2, canvas.height/2); }
 // draw grid
 for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){ if(grid[r][c]){ ctx.fillStyle=colors[(grid[r][c]-1)%colors.length]; ctx.fillRect(c*SIZE,r*SIZE+40,SIZE,SIZE); ctx.strokeStyle='#000'; ctx.strokeRect(c*SIZE,r*SIZE+40,SIZE,SIZE); }}
 // draw current
 if(current){ for(let r=0;r<current.length;r++) for(let c=0;c<current[0].length;c++) if(current[r][c]){ ctx.fillStyle=color; ctx.fillRect((x+c)*SIZE,(y+r)*SIZE+40,SIZE,SIZE); ctx.strokeStyle='#000'; ctx.strokeRect((x+c)*SIZE,(y+r)*SIZE+40,SIZE,SIZE); }}
 ctx.restore(); }
function loop(t){ update(t); draw(); af=requestAnimationFrame(loop); }
function key(e){ if(gameOver && e.key.toLowerCase()==='r'){ grid=Array.from({length:ROWS},()=>Array(COLS).fill(0)); score=0; level=1; dropInterval=700; gameOver=false; newPiece(); return; }
 if(e.key==='ArrowLeft'&&!collide(-1,0,current)) x--; else if(e.key==='ArrowRight'&&!collide(1,0,current)) x++; else if(e.key==='ArrowDown'){ if(!collide(0,1,current)) y++; } else if(e.key==='ArrowUp'){ const rot=rotate(current); if(!collide(0,0,rot)) current=rot; } else if(e.key===' '){ while(!collide(0,1,current)) y++; merge(); clearLines(); spawn(); }
}
window.addEventListener('keydown',key); spawn(); requestAnimationFrame(loop);
return function cleanup(){ if(af) cancelAnimationFrame(af); window.removeEventListener('keydown',key); };
}
window.registerGame=registerGame;
