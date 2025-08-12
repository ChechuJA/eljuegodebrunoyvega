function registerGame(){
// Empuja Cajas (mini Sokoban con récord de menos movimientos)
const canvas=document.getElementById('gameCanvas'); const ctx=canvas.getContext('2d'); let af=null;
const TILE=40; const mapaBase=[
'#########',
'#   .  #',
'# # #  #',
'# $@   #',
'#   #  #',
'#  .   #',
'#########'
];
canvas.width=mapaBase[0].length*TILE; canvas.height=mapaBase.length*TILE+70;
let level=0; let movimientos=0; let mejor=Number(localStorage.getItem('sokobanBest')||0);
function parse(){ mapa=mapaBase.map(r=>r.split('')); cajas=[]; objetivos=[]; for(let y=0;y<mapa.length;y++) for(let x=0;x<mapa[0].length;x++){ const ch=mapa[y][x]; if(ch==='@'){ jugador={x,y}; mapa[y][x]=' '; } else if(ch==='$') { cajas.push({x,y}); mapa[y][x]=' '; } else if(ch==='.') { objetivos.push({x,y}); mapa[y][x]='.'; } }
}
let mapa=[], cajas=[], objetivos=[], jugador={x:0,y:0}; parse();
function isObjetivo(x,y){ return objetivos.some(o=>o.x===x&&o.y===y); }
function cajaEn(x,y){ return cajas.find(c=>c.x===x&&c.y===y); }
function libre(x,y){ if(mapa[y][x]==='#') return false; if(cajaEn(x,y)) return false; return true; }
function mover(dx,dy){ const nx=jugador.x+dx, ny=jugador.y+dy; if(mapa[ny][nx]==='#') return; const c=cajaEn(nx,ny); if(c){ const nx2=nx+dx, ny2=ny+dy; if(mapa[ny2][nx2]==='#'||cajaEn(nx2,ny2)) return; c.x=nx2; c.y=ny2; } jugador.x=nx; jugador.y=ny; movimientos++; if(completado()){ if(mejor===0||movimientos<mejor){ mejor=movimientos; localStorage.setItem('sokobanBest', String(mejor)); } setTimeout(()=>{ alert('Nivel completado en '+movimientos+' movimientos'); reiniciar(); },50); }
}
function completado(){ return cajas.every(c=>isObjetivo(c.x,c.y)); }
function reiniciar(){ parse(); movimientos=0; }
function draw(){ ctx.clearRect(0,0,canvas.width,canvas.height); ctx.fillStyle='#283593'; ctx.fillRect(0,0,canvas.width,70); ctx.fillStyle='#fff'; ctx.font='18px Arial'; ctx.fillText('Empuja Cajas  Movimientos: '+movimientos+'  Mejor: '+(mejor>0?mejor:'-')+'  (R reinicia)', 10,40); for(let y=0;y<mapa.length;y++) for(let x=0;x<mapa[0].length;x++){ const ch=mapa[y][x]; if(ch==='#'){ ctx.fillStyle='#455a64'; ctx.fillRect(x*TILE,y*TILE+70,TILE,TILE); } else { ctx.fillStyle='#eceff1'; ctx.fillRect(x*TILE,y*TILE+70,TILE,TILE); if(isObjetivo(x,y)){ ctx.fillStyle='#ffca28'; ctx.beginPath(); ctx.arc(x*TILE+TILE/2,y*TILE+70+TILE/2,8,0,Math.PI*2); ctx.fill(); } } }
 for(let c of cajas){ ctx.fillStyle='#8d6e63'; ctx.fillRect(c.x*TILE+4,c.y*TILE+74,TILE-8,TILE-8); }
 ctx.fillStyle='#4caf50'; ctx.beginPath(); ctx.arc(jugador.x*TILE+TILE/2, jugador.y*TILE+70+TILE/2, TILE/3,0,Math.PI*2); ctx.fill(); }
function loop(){ draw(); af=requestAnimationFrame(loop); }
function key(e){ if(e.key==='ArrowLeft') mover(-1,0); else if(e.key==='ArrowRight') mover(1,0); else if(e.key==='ArrowUp') mover(0,-1); else if(e.key==='ArrowDown') mover(0,1); else if(e.key.toLowerCase()==='r'){ reiniciar(); }}
window.addEventListener('keydown',key); requestAnimationFrame(loop);
return function cleanup(){ if(af) cancelAnimationFrame(af); window.removeEventListener('keydown',key); };
}
window.registerGame=registerGame;
