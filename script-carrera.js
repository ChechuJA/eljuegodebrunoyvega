function registerGame(){
// Carrera F1 simple: esquivar coches y sumar distancia
const canvas=document.getElementById('gameCanvas'); const ctx=canvas.getContext('2d'); let af=null;
canvas.width=800; canvas.height=500;
let showIntro=true;
const laneCount=3; const laneWidth=160; const roadMargin=(canvas.width - laneCount*laneWidth)/2; const roadTop=0; const roadBottom=canvas.height;
let player={lane:1,y:canvas.height-120,w:70,h:120,color:'#ff1744'};
let speed=6; let baseSpeed=6; let distance=0; let high=Number(localStorage.getItem('carreraHigh')||0); let highName=localStorage.getItem('carreraHighName')||''; let obstacles=[]; let spawnTimer=0; let spawnEvery=1200; let lastT=0; let crashed=false; let playerName=localStorage.getItem('playerName')||'';
let powerTimer=0; // futuro para boosts
function laneX(l){ return roadMargin + l*laneWidth + laneWidth/2; }
function spawn(){ const freeLane=Math.floor(Math.random()*laneCount); const car={lane:freeLane,y:-150,w:70,h:120,color:randomCarColor()}; obstacles.push(car); }
function randomCarColor(){ const c=['#1976d2','#388e3c','#ffa000','#7b1fa2','#c2185b']; return c[Math.floor(Math.random()*c.length)]; }
function update(dt){ if(showIntro||crashed) return; distance += speed*dt/100; if(distance>high){ high=Math.floor(distance); localStorage.setItem('carreraHigh',String(high)); localStorage.setItem('carreraHighName', playerName); }
 spawnTimer+=dt; if(spawnTimer>spawnEvery){ spawnTimer=0; spawn(); }
 obstacles.forEach(o=> o.y += speed);
 obstacles=obstacles.filter(o=> o.y < canvas.height+200);
 // colisiones
 for(const o of obstacles){ if(o.lane===player.lane){ if(!(player.y+player.h < o.y || player.y > o.y+o.h)){ crashed=true; break; } } }
}
function drawRoad(){ ctx.fillStyle='#444'; ctx.fillRect(roadMargin-40,0,laneCount*laneWidth+80,canvas.height); ctx.strokeStyle='#fff'; ctx.lineWidth=4; ctx.strokeRect(roadMargin-40,0,laneCount*laneWidth+80,canvas.height); // líneas discontinuas
 ctx.strokeStyle='#fff'; ctx.lineWidth=6; ctx.setLineDash([25,25]); for(let l=1;l<laneCount;l++){ const x=roadMargin + l*laneWidth; ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke(); }
 ctx.setLineDash([]);
}
function drawCarBase(x,y,w,h,color,isPlayer){
	ctx.save(); ctx.translate(x,y);
	// Sombra
	ctx.fillStyle='rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(w/2,h/2,w*0.42,h*0.52,0,0,Math.PI*2); ctx.fill();
	// Ruedas (4)
	const wheelW=w*0.28, wheelH=h*0.12;
	ctx.fillStyle='#111';
	ctx.fillRect(-wheelW*0.5, h*0.15, wheelW, wheelH);
	ctx.fillRect(w-wheelW*0.5, h*0.15, wheelW, wheelH);
	ctx.fillRect(-wheelW*0.5, h*0.75, wheelW, wheelH);
	ctx.fillRect(w-wheelW*0.5, h*0.75, wheelW, wheelH);
	// Cuerpo principal (degradado longitudinal)
	let grad=ctx.createLinearGradient(0,0,0,h);
	grad.addColorStop(0, color);
	grad.addColorStop(0.5, shade(color, -25));
	grad.addColorStop(1, shade(color, -40));
	ctx.fillStyle=grad;
	const bodyW=w*0.55; const bodyX=(w-bodyW)/2;
	ctx.beginPath(); ctx.roundRect(bodyX,0,bodyW,h,12); ctx.fill();
	// Cockpit
	ctx.fillStyle='rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.roundRect(bodyX+bodyW*0.18,h*0.30,bodyW*0.64,h*0.22,8); ctx.fill();
	// Alerón delantero
	ctx.fillStyle=shade(color,-30); ctx.fillRect(bodyX-10,-8,bodyW+20,16);
	// Alerón trasero
	ctx.fillRect(bodyX-8,h-10,bodyW+16,14);
	// Número o marca
	ctx.fillStyle='#fff'; ctx.font='bold '+Math.max(14, w*0.25)+'px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(isPlayer?'1':'', w/2, h*0.54);
	ctx.restore();
}
function drawCars(){
	// Jugador
	drawCarBase(laneX(player.lane)-player.w/2, player.y, player.w, player.h, player.color,true);
	// Obstáculos
	obstacles.forEach(o=> drawCarBase(laneX(o.lane)-o.w/2, o.y, o.w, o.h, o.color,false));
}
// Utilidad para oscurecer color hex
function shade(hex,percent){ if(!/^#/.test(hex)) return hex; let num=parseInt(hex.slice(1),16); let r=(num>>16)&255,g=(num>>8)&255,b=num&255; r=Math.min(255,Math.max(0, r + 255*percent/100)); g=Math.min(255,Math.max(0, g + 255*percent/100)); b=Math.min(255,Math.max(0, b + 255*percent/100)); return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1); }
function drawHUD(){ ctx.fillStyle='#0d47a1'; ctx.fillRect(0,0,canvas.width,50); ctx.fillStyle='#fff'; ctx.font='16px Arial'; ctx.textAlign='left'; ctx.fillText('Distancia: '+Math.floor(distance), 14,30); ctx.fillText('Velocidad: '+speed.toFixed(1), 180,30); ctx.textAlign='right'; ctx.fillText('Récord: '+high+(highName?(' ('+highName+')'):''), canvas.width-14,30); }
function drawIntro(){ ctx.save(); ctx.globalAlpha=0.9; ctx.fillStyle='#fff'; ctx.fillRect(60,70,canvas.width-120,200); ctx.globalAlpha=1; ctx.fillStyle='#0d47a1'; ctx.font='bold 28px Arial'; ctx.textAlign='center'; ctx.fillText('Carrera F1', canvas.width/2,110); ctx.font='15px Arial'; ctx.fillStyle='#333'; ctx.fillText('Usa ← → para cambiar de carril y evita los otros coches.', canvas.width/2,145); ctx.fillText('Ganas puntos por la distancia. Sesiones de máx. 10 minutos.', canvas.width/2,170); ctx.fillText('Pulsa cualquier tecla para empezar.', canvas.width/2,195); ctx.restore(); }
function drawCrash(){ ctx.save(); ctx.globalAlpha=0.85; ctx.fillStyle='#000'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.globalAlpha=1; ctx.fillStyle='#ffeb3b'; ctx.font='bold 30px Arial'; ctx.textAlign='center'; ctx.fillText('¡Choque!', canvas.width/2,canvas.height/2-40); ctx.font='20px Arial'; ctx.fillText('Distancia: '+Math.floor(distance), canvas.width/2, canvas.height/2); ctx.fillText('Pulsa R para reiniciar', canvas.width/2, canvas.height/2+40); ctx.restore(); }
function draw(){ ctx.clearRect(0,0,canvas.width,canvas.height); drawRoad(); drawCars(); drawHUD(); if(showIntro) drawIntro(); if(crashed) drawCrash(); }
function loop(t){ if(!lastT) lastT=t; const dt=t-lastT; lastT=t; update(dt); draw(); af=requestAnimationFrame(loop); }
function key(e){ if(showIntro){ showIntro=false; return; } if(crashed && e.key.toLowerCase()==='r'){ // reset
 distance=0; speed=baseSpeed; obstacles=[]; crashed=false; player.lane=1; return; }
 if(e.key==='ArrowLeft' && player.lane>0) player.lane--; else if(e.key==='ArrowRight' && player.lane<laneCount-1) player.lane++; }
window.addEventListener('keydown',key); requestAnimationFrame(loop);
return function cleanup(){ if(af) cancelAnimationFrame(af); window.removeEventListener('keydown',key); };
}
window.registerGame=registerGame;
