function registerGame(){
// Constelaciones (unir estrellas por orden para descubrir figura / dato)
const canvas=document.getElementById('gameCanvas'); const ctx=canvas.getContext('2d'); let af=null;
canvas.width=640; canvas.height=420;
const figuras=[
 {nombre:'Orión',dato:'Cazador mítico.', puntos:[[80,90],[140,160],[200,100],[260,180],[320,120],[380,200]], icon:'🗡️'},
 {nombre:'Osa Mayor',dato:'Ayuda a encontrar la estrella polar.', puntos:[[70,260],[130,240],[190,250],[250,270],[310,300],[370,320],[430,300]], icon:'🐻'},
 {nombre:'Leo',dato:'Representa un león.', puntos:[[100,110],[160,140],[220,150],[280,130],[340,150],[400,170]], icon:'🦁'}
];
let idx=0; let current=figuras[idx]; let progreso=0; let completadas=0; let mostrarInicio=true; let infoTimer=0;
function drawFondo(){ ctx.fillStyle='#000015'; ctx.fillRect(0,0,canvas.width,canvas.height); for(let i=0;i<70;i++){ ctx.fillStyle='rgba(255,255,255,'+(Math.random()*0.8+0.2).toFixed(2)+')'; ctx.fillRect(Math.random()*canvas.width, Math.random()*canvas.height, 2,2);} }
function drawConstelacion(){ ctx.save(); ctx.strokeStyle='#90caf9'; ctx.lineWidth=2; ctx.beginPath(); for(let i=0;i<progreso;i++){ const [x,y]=current.puntos[i]; if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);} ctx.stroke(); ctx.fillStyle='#fff'; for(let i=0;i<current.puntos.length;i++){ const [x,y]=current.puntos[i]; ctx.beginPath(); ctx.arc(x,y, i===progreso?8:5,0,Math.PI*2); ctx.fillStyle = i<progreso? '#ffeb3b':'#fff'; ctx.fill(); }
 if(progreso===current.puntos.length){ ctx.font='60px serif'; ctx.textAlign='center'; ctx.fillStyle='#ffca28'; ctx.fillText(current.icon, canvas.width/2, canvas.height/2); }
 ctx.restore(); }
function drawHUD(){ ctx.save(); ctx.font='bold 26px Arial'; ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.fillText('Constelaciones', canvas.width/2,40); ctx.font='16px Arial'; ctx.fillText('Figura: '+current.nombre+'  ('+(idx+1)+'/'+figuras.length+')', canvas.width/2,64); if(mostrarInicio) ctx.fillText('Clic en cada estrella en orden para dibujar la constelación', canvas.width/2,90); if(infoTimer>0){ ctx.fillStyle='#ffeb3b'; ctx.fillText(current.dato, canvas.width/2, 110);} ctx.restore(); }
function loop(){ drawFondo(); drawConstelacion(); drawHUD(); if(infoTimer>0) infoTimer-=0.016; af=requestAnimationFrame(loop); }
function click(e){ const rect=canvas.getBoundingClientRect(); const mx=e.clientX-rect.left, my=e.clientY-rect.top; mostrarInicio=false; const [x,y]=current.puntos[progreso]; const dx=mx-x, dy=my-y; if(dx*dx+dy*dy<14*14){ progreso++; if(progreso===current.puntos.length){ completadas++; infoTimer=3; setTimeout(()=>{ idx=(idx+1)%figuras.length; current=figuras[idx]; progreso=0; },1500); } } }
canvas.addEventListener('click',click); loop();
return function cleanup(){ if(af) cancelAnimationFrame(af); canvas.removeEventListener('click',click); };
}
window.registerGame=registerGame;
