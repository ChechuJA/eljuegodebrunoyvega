function registerGame(){
// Huerto mágico (gestión ligera + tiempo)
const canvas=document.getElementById('gameCanvas'); const ctx=canvas.getContext('2d'); let af=null;
canvas.width=640; canvas.height=420;
const parcelasCols=6, parcelasRows=3; const size=80; const margin=16; const startY=90;
let semillas=['🍓','🥕','🌽','🥦','🍆'];
let campos=[]; for(let r=0;r<parcelasRows;r++){ for(let c=0;c<parcelasCols;c++){ campos.push({c,r,estado:'vacio',semilla:null,progreso:0,agua:0,plagas:0}); }}
let dinero=0, tiempo=180, started=false; let lastTick=0; let showInstructions=true; let ended=false; let mensajeRecord='';
let highScore = Number(localStorage.getItem('huertoHighScore')||0);
function plantar(campo){ if(campo.estado!=='vacio') return; campo.semilla=semillas[Math.floor(Math.random()*semillas.length)]; campo.estado='creciendo'; campo.progreso=0; campo.agua=5; campo.plagas=0; }
function regar(campo){ if(campo.estado==='creciendo') campo.agua=Math.min(10,campo.agua+3); }
function cosechar(c){ if(c.estado==='listo'){ dinero+=50; c.estado='vacio'; c.semilla=null; }}
function update(dt){
 if(!started) return;
 lastTick+=dt;
 if(lastTick>1000){
	lastTick=0; tiempo--;
	for (let c of campos){
		if(c.estado==='creciendo'){
			c.agua-=1;
			if(c.agua<=0){ c.estado='marchito'; }
			else {
				c.progreso += (c.agua>3? 8:4);
				if(Math.random()<0.08) c.plagas++;
				if(c.plagas>3) c.estado='plagas';
				if(c.progreso>=100){ c.estado='listo'; }
			}
		}
	}
	if(tiempo<=0){
		started=false; ended=true;
		if(dinero>highScore){
			highScore=dinero; localStorage.setItem('huertoHighScore', String(highScore));
			mensajeRecord='¡Nuevo récord!';
		} else mensajeRecord='';
	}
 }
}
function drawParcel(c){ const x=margin + c.c*(size+margin); const y=startY + c.r*(size+margin); ctx.save(); ctx.fillStyle='#6d4c41'; ctx.fillRect(x,y,size,size); if(c.estado==='vacio'){ ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.fillRect(x+4,y+4,size-8,size-8); }
 else if(c.estado==='creciendo'){ ctx.fillStyle='#2e7d32'; ctx.fillRect(x+4,y+4,(size-8)*c.progreso/100,size-8); ctx.font='32px serif'; ctx.fillText(c.semilla,x+size/2,y+size/2); }
 else if(c.estado==='listo'){ ctx.fillStyle='#ffeb3b'; ctx.fillRect(x+4,y+4,size-8,size-8); ctx.font='36px serif'; ctx.fillText(c.semilla,x+size/2,y+size/2); }
 else if(c.estado==='marchito'){ ctx.fillStyle='#9e9e9e'; ctx.fillRect(x+4,y+4,size-8,size-8); }
 else if(c.estado==='plagas'){ ctx.fillStyle='#a1887f'; ctx.fillRect(x+4,y+4,size-8,size-8); ctx.font='20px Arial'; ctx.fillStyle='#311b92'; ctx.fillText('🐛',x+size/2,y+size/2); }
 ctx.strokeStyle='#3e2723'; ctx.lineWidth=3; ctx.strokeRect(x,y,size,size); ctx.restore(); }
function draw(){
 ctx.clearRect(0,0,canvas.width,canvas.height);
 // Cabecera
 ctx.save();
 ctx.font='bold 28px Arial'; ctx.fillStyle='#2e7d32'; ctx.textAlign='center';
 ctx.fillText('Huerto mágico', canvas.width/2,40);
 ctx.font='16px Arial'; ctx.fillStyle='#333';
 ctx.fillText('Dinero: '+dinero+'  Tiempo: '+tiempo+'s   Récord: '+highScore, canvas.width/2,65);
 ctx.restore();
 // Parcelas primero
 for(let c of campos) drawParcel(c);
 // Overlays encima
 if(showInstructions){
	ctx.save();
	ctx.globalAlpha=0.92;
	ctx.fillStyle='#ffffff';
	ctx.fillRect(40,90,canvas.width-80,220);
	ctx.globalAlpha=1;
	ctx.fillStyle='#2e7d32'; ctx.font='bold 20px Arial'; ctx.textAlign='center';
	ctx.fillText('Instrucciones', canvas.width/2,115);
	ctx.fillStyle='#333'; ctx.font='14px Arial';
	const lines=[
		'Objetivo: gana el máximo dinero en 180 segundos.',
		'Click en parcela vacía: plantar (semilla aleatoria).',
		'Mientras crece baja el agua cada segundo.',
		'Agua > 3 = crecimiento rápido; si llega a 0 se marchita.',
		'Plagas (🐛) pueden aparecer; demasiadas arruinan la planta.',
		'Click creciendo: regar. Lista (amarilla): cosechar (+50).',
		'Marchita / plagas: limpiar para replantar.',
		'Al acabar: se guarda récord si mejoras.',
		'Pulsa dentro para empezar. Pulsa I para ver esto de nuevo.'
	];
	lines.forEach((ln,i)=> ctx.fillText(ln, canvas.width/2, 145 + i*18));
	ctx.restore();
 }
 if(ended){
	ctx.save();
	ctx.globalAlpha=0.9; ctx.fillStyle='#000';
	ctx.fillRect(60,130,canvas.width-120,140);
	ctx.globalAlpha=1; ctx.fillStyle='#fff'; ctx.font='bold 22px Arial'; ctx.textAlign='center';
	ctx.fillText('Tiempo agotado. Dinero: '+dinero, canvas.width/2,175);
	if(mensajeRecord){ ctx.fillStyle='#ffeb3b'; ctx.fillText(mensajeRecord, canvas.width/2,205); }
	ctx.fillStyle='#ddd'; ctx.font='16px Arial'; ctx.fillText('Haz click para reiniciar', canvas.width/2,235);
	ctx.restore();
 }
}
function loop(t){ if(!loop.prev) loop.prev=t; const dt=t-loop.prev; loop.prev=t; update(dt); draw(); af=requestAnimationFrame(loop); }
function click(e){
 const rect=canvas.getBoundingClientRect(); const mx=e.clientX-rect.left, my=e.clientY-rect.top;
 if(showInstructions){ showInstructions=false; }
 if(!started){
	if(ended){ // reinicio completo
		ended=false; tiempo=180; dinero=0; campos.forEach(c=>{ c.estado='vacio'; c.semilla=null; c.progreso=0; c.agua=0; c.plagas=0; });
	}
	started=true; return;
 }
 const campo = campos.find(c=>{ const x=margin + c.c*(size+margin); const y=startY + c.r*(size+margin); return mx>x&&mx<x+size&&my>y&&my<y+size; });
 if(!campo) return;
 if(campo.estado==='vacio') plantar(campo);
 else if(campo.estado==='creciendo') regar(campo);
 else if(campo.estado==='listo') cosechar(campo);
 else if(campo.estado==='marchito'||campo.estado==='plagas'){ campo.estado='vacio'; campo.semilla=null; }
}
function key(e){ if(e.key.toLowerCase()==='i'){ showInstructions=true; } }
canvas.addEventListener('click',click); requestAnimationFrame(loop);
window.addEventListener('keydown',key);
return function cleanup(){ if(af) cancelAnimationFrame(af); canvas.removeEventListener('click',click); window.removeEventListener('keydown',key); };
}
window.registerGame=registerGame;
