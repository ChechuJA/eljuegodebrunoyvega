function registerGame(){
// Laberinto de colores (generación simple + recolección secuencial)
const canvas=document.getElementById('gameCanvas'); const ctx=canvas.getContext('2d'); let af=null;
canvas.width=800; canvas.height=500;
const cell=30; const cols=Math.floor(canvas.width/cell); const rows=Math.floor(canvas.height/cell);
// grid: 0 vacío, 1 muro
let grid=[]; for(let r=0;r<rows;r++){ let row=[]; for(let c=0;c<cols;c++){ row.push(Math.random()<0.22?1:0);} grid.push(row);} // start-end claros
for(let r=0;r<rows;r++){ grid[r][0]=0; grid[r][cols-1]=0; }
const player={c:1,r:1,steps:0}; grid[player.r][player.c]=0; const objetivoSecuencia=['🔴','🟢','🔵','🟡']; let idx=0; let items=[]; let bestSteps=Number(localStorage.getItem('laberintoBest')||0);
function placeItems(){ items=[]; for(let i=0;i<objetivoSecuencia.length;i++){ let placed=false; while(!placed){ const c=2+Math.floor(Math.random()*(cols-4)); const r=2+Math.floor(Math.random()*(rows-4)); if(grid[r][c]===0 && !items.find(it=>it.c===c&&it.r===r)){ items.push({c,r,icon:objetivoSecuencia[i]}); placed=true; } } } }
placeItems();
function draw(){
	ctx.clearRect(0,0,canvas.width,canvas.height);
	// Fondo suave
	ctx.fillStyle='#eef3f7';
	ctx.fillRect(0,0,canvas.width,canvas.height);
	// Cabecera barra
	ctx.fillStyle='#0d47a1';
	ctx.fillRect(0,0,canvas.width,40);
	ctx.fillStyle='#fff'; ctx.font='16px Arial'; ctx.textAlign='left'; ctx.textBaseline='middle';
	ctx.fillText('Objetivo: '+objetivoSecuencia[idx], 12,20);
	ctx.textAlign='right';
	ctx.fillText('Pasos: '+player.steps+'  Mejor: '+(bestSteps>0?bestSteps:'-'), canvas.width-12,20);
	// Área laberinto desplazada debajo de la barra
	ctx.save(); ctx.translate(0,40);
	for(let r=0;r<rows;r++){
		for(let c=0;c<cols;c++){
			if(grid[r][c]===1){
				ctx.fillStyle='#263238';
				ctx.fillRect(c*cell,r*cell,cell,cell);
			}
		}
	}
	// Items
	ctx.font='20px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
	for(let it of items){ ctx.fillText(it.icon,it.c*cell+cell/2,it.r*cell+cell/2); }
	// Player
	ctx.fillStyle='#ff5722';
	ctx.fillRect(player.c*cell+6,player.r*cell+6,cell-12,cell-12);
	ctx.restore();
}
function canMove(c,r){ return c>=0&&c<cols&&r>=0&&r<rows&&grid[r][c]===0; }
function key(e){ let nc=player.c, nr=player.r; if(e.key==='ArrowLeft') nc--; else if(e.key==='ArrowRight') nc++; else if(e.key==='ArrowUp') nr--; else if(e.key==='ArrowDown') nr++; if(canMove(nc,nr)){ player.c=nc; player.r=nr; player.steps++; const item = items.find(i=>i.c===player.c&&i.r===player.r); if(item){ if(item.icon===objetivoSecuencia[idx]){ idx++; items=items.filter(it=>it!==item); if(idx===objetivoSecuencia.length){ if(bestSteps===0 || player.steps<bestSteps){ bestSteps=player.steps; localStorage.setItem('laberintoBest', String(bestSteps)); } setTimeout(()=>{ alert('¡Laberinto completado! Pasos: '+player.steps); idx=0; player.steps=0; placeItems(); },50); } } }
 } }
function loop(){ draw(); af=requestAnimationFrame(loop);} window.addEventListener('keydown',key); loop();
return function cleanup(){ if(af) cancelAnimationFrame(af); window.removeEventListener('keydown',key); };
}
window.registerGame=registerGame;
