function registerGame(){
// Serpiente clásica con récord de longitud
const canvas=document.getElementById('gameCanvas'); const ctx=canvas.getContext('2d'); let af=null;
const SIZE=20, COLS=30, ROWS=20; canvas.width=COLS*SIZE; canvas.height=ROWS*SIZE+60;
let dir={x:1,y:0}; let snake=[{x:5,y:10},{x:4,y:10},{x:3,y:10}]; let food=spawn(); let score=0; let speed=160; let last=0; let gameOver=false; let high=Number(localStorage.getItem('snakeHigh')||0);
function spawn(){ return {x:Math.floor(Math.random()*COLS),y:Math.floor(Math.random()*ROWS)}; }
function update(t){ if(gameOver) return; if(!last) last=t; const d=t-last; if(d>speed){ last=t; const head={x:snake[0].x+dir.x,y:snake[0].y+dir.y}; if(head.x<0||head.x>=COLS||head.y<0||head.y>=ROWS|| snake.some(s=>s.x===head.x&&s.y===head.y)){ gameOver=true; if(score>high){ high=score; localStorage.setItem('snakeHigh', String(high)); } return;} snake.unshift(head); if(head.x===food.x&&head.y===food.y){ score+=10; speed=Math.max(60, speed-4); food=spawn(); } else snake.pop(); }
}
function draw(){ ctx.clearRect(0,0,canvas.width,canvas.height); ctx.fillStyle='#1b5e20'; ctx.fillRect(0,0,canvas.width,60); ctx.fillStyle='#fff'; ctx.font='18px Arial'; ctx.fillText('Serpiente  Puntos: '+score+'  Récord: '+high, 10,36); for(let i=0;i<snake.length;i++){ ctx.fillStyle= i===0? '#ffeb3b':'#4caf50'; ctx.fillRect(snake[i].x*SIZE, snake[i].y*SIZE+60, SIZE,SIZE); } ctx.fillStyle='#e91e63'; ctx.fillRect(food.x*SIZE, food.y*SIZE+60, SIZE,SIZE); if(gameOver){ ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(0,60,canvas.width,canvas.height-60); ctx.fillStyle='#fff'; ctx.font='24px Arial'; ctx.textAlign='center'; ctx.fillText('FIN - Pulsa R para reiniciar', canvas.width/2, canvas.height/2); }
}
function loop(t){ update(t); draw(); af=requestAnimationFrame(loop); }
function key(e){ if(e.key==='ArrowLeft' && dir.x!==1) dir={x:-1,y:0}; else if(e.key==='ArrowRight'&&dir.x!==-1) dir={x:1,y:0}; else if(e.key==='ArrowUp'&&dir.y!==1) dir={x:0,y:-1}; else if(e.key==='ArrowDown'&&dir.y!==-1) dir={x:0,y:1}; else if(gameOver && e.key.toLowerCase()==='r'){ snake=[{x:5,y:10},{x:4,y:10},{x:3,y:10}]; dir={x:1,y:0}; score=0; speed=160; food=spawn(); gameOver=false; }
}
window.addEventListener('keydown',key); requestAnimationFrame(loop);
return function cleanup(){ if(af) cancelAnimationFrame(af); window.removeEventListener('keydown',key); };
}
window.registerGame=registerGame;
