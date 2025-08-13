function registerGame(){
  const canvas = document.getElementById('gameCanvas');
  return initAhorcado(canvas);
}
function initAhorcado(canvas, cleanupBag){
  const ctx=canvas.getContext('2d');
  const ui=window.GameUI;
  const palabras = [
    'GALAXIA','NEBULOSA','ASTEROIDE','COMETA','SATELITE','PLANETA','ORION','METEORO','CUASAR','GRAVEDAD',
    'LUNA','SOL','VENUS','MARTE','URANO','PLUTON','ECLIPSE','ROVER','PROTON','ATOMO'
  ];
  let secreta='', mostrada=[], usadas=new Set();
  let vidas=7, score=0, high=+(localStorage.getItem('ahorcadoHigh')||0);
  let highName=localStorage.getItem('ahorcadoHighName')||'';
  let playerName=localStorage.getItem('playerName')||'Jugador';
  let intro=true, ended=false;
  function nuevaPalabra(){
    secreta = palabras[Math.floor(Math.random()*palabras.length)];
    mostrada = Array(secreta.length).fill('_');
    usadas.clear();
    vidas=7;
    ended=false;
  }
  function start(){ intro=false; score=0; nuevaPalabra(); }
  function dibujaNave(){
    ctx.save();
    ctx.translate(120,300);
    const fails=7-vidas;
    ctx.strokeStyle='#fff';
    ctx.lineWidth=3;
    // base
    ctx.beginPath(); ctx.moveTo(-40,80); ctx.lineTo(40,80); ctx.stroke();
    // torre
    if(fails>0){ ctx.beginPath(); ctx.moveTo(0,80); ctx.lineTo(0,-20); ctx.stroke(); }
    // brazo
    if(fails>1){ ctx.beginPath(); ctx.moveTo(0,-20); ctx.lineTo(60,-20); ctx.stroke(); }
    // cuerda
    if(fails>2){ ctx.beginPath(); ctx.moveTo(60,-20); ctx.lineTo(60,0); ctx.stroke(); }
    // cabeza casco
    if(fails>3){ ctx.beginPath(); ctx.arc(60,15,15,0,Math.PI*2); ctx.stroke(); }
    // cuerpo
    if(fails>4){ ctx.beginPath(); ctx.moveTo(60,30); ctx.lineTo(60,60); ctx.stroke(); }
    // brazos
    if(fails>5){ ctx.beginPath(); ctx.moveTo(60,38); ctx.lineTo(40,50); ctx.moveTo(60,38); ctx.lineTo(80,50); ctx.stroke(); }
    // piernas
    if(fails>6){ ctx.beginPath(); ctx.moveTo(60,60); ctx.lineTo(45,85); ctx.moveTo(60,60); ctx.lineTo(75,85); ctx.stroke(); }
    ctx.restore();
  }
  function guess(letter){
    if(intro||ended) return;
    letter = letter.toUpperCase();
    if(!/^[A-ZÑ]$/.test(letter)) return;
    if(usadas.has(letter)) return;
    usadas.add(letter);
    if(secreta.includes(letter)){
      for(let i=0;i<secreta.length;i++){
        if(secreta[i]===letter) mostrada[i]=letter;
      }
      if(!mostrada.includes('_')){
        score+=50;
        nuevaPalabra();
      }
    } else {
      vidas--;
      if(vidas<=0){
        ended=true;
        if(score>high){
          high=score;
          highName=playerName;
          localStorage.setItem('ahorcadoHigh', high);
          localStorage.setItem('ahorcadoHighName', highName);
        }
      }
    }
  }
  function draw(){
    // Fondo y cabecera: usar GameUI si existe, si no, estilos básicos
    if(window.GameUI && ui){
      ui.softBg(ctx,canvas,'#4a148c');
      ui.gradientBar(ctx,canvas,{from:'#6a1b9a',to:'#4a148c'});
      ui.shadowText(ctx,'Ahorcado Espacial',20,34,{size:24});
    } else {
      ctx.fillStyle='#4a148c';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle='#fff';
      ctx.font='bold 28px Arial';
      ctx.fillText('Ahorcado Espacial', canvas.width/2, 38);
    }
    ctx.fillStyle='#fff';
    ctx.font='14px Arial';
    ctx.fillText('Score: '+score, 20,60);
    ctx.fillText('Récord: '+high+(highName?' ('+highName+')':''), 20,78);
    if(intro){
      if(window.GameUI && ui){
        ui.glassPanel(ctx, canvas.width/2-240,110,480,260);
      } else {
        ctx.globalAlpha=0.85;
        ctx.fillStyle='#fff';
        ctx.fillRect(canvas.width/2-240,110,480,260);
        ctx.globalAlpha=1;
      }
      ctx.fillStyle='#4a148c';
      ctx.font='20px Arial'; ctx.textAlign='center';
      ctx.fillText('Instrucciones', canvas.width/2,140);
      ctx.font='14px Arial';
      const lines=[
        'Adivina la palabra espacial letra a letra.',
        'Pulsa letras (teclado) o usa los botones inferiores.',
        '7 fallos -> fin de la ronda.',
        'Cada palabra acertada = +50 puntos.',
        'Consejo: máximo 10 min y descansa la vista.',
        'Pulsa ESPACIO para comenzar.'
      ];
      lines.forEach((l,i)=>ctx.fillText(l,canvas.width/2,170+i*22));
      ctx.textAlign='left';
      return;
    }
    dibujaNave();
    ctx.font='36px Consolas';
    ctx.textAlign='center';
    ctx.fillStyle='#fff';
    ctx.fillText(mostrada.join(' '), canvas.width/2, 140);
    ctx.font='16px Arial';
    ctx.fillText('Letras usadas: '+[...usadas].join(' '), canvas.width/2, 180);
    if(ended){
      ctx.font='22px Arial';
      ctx.fillText('FIN - Palabra: '+secreta, canvas.width/2, 220);
      ctx.font='16px Arial';
      if(score===high) ctx.fillText('¡Nuevo récord!', canvas.width/2, 250);
      ctx.fillText('Pulsa ESPACIO para reiniciar', canvas.width/2, 275);
    }
    // teclado visual
    const rows=['ABCDEFGHIJKLM','NOPQRSTUVWXYZ'];
    rows.forEach((row,ri)=>{
      [...row].forEach((ch,ci)=>{
        const w=30,h=34;
        const totalRowWidth = row.length*(w+6);
        const startX = canvas.width/2 - totalRowWidth/2;
        const x = startX + ci*(w+6);
        const y = 320 + ri*(h+8);
        ctx.fillStyle = usadas.has(ch)?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.25)';
        ctx.beginPath(); ctx.roundRect(x,y,w,h,6); ctx.fill();
        ctx.strokeStyle='rgba(255,255,255,0.4)'; ctx.stroke();
        ctx.fillStyle='#fff'; ctx.font='16px Arial';
        ctx.fillText(ch, x+w/2, y+22);
      });
    });
    ctx.textAlign='left';
  }

  function key(e){
    if(intro && e.key===' '){ start(); return; }
    if(ended && e.key===' '){ start(); return; }
    if(/^[a-zA-ZñÑ]$/.test(e.key)) guess(e.key);
  }
  function click(e){
    if(intro||ended) return;
    const rect=canvas.getBoundingClientRect();
    const x=e.clientX-rect.left;
    const y=e.clientY-rect.top;
    const rows=['ABCDEFGHIJKLM','NOPQRSTUVWXYZ'];
    rows.forEach((row,ri)=>{
      [...row].forEach((ch,ci)=>{
        const w=30,h=34;
        const totalRowWidth = row.length*(w+6);
        const startX = canvas.width/2 - totalRowWidth/2;
        const bx = startX + ci*(w+6);
        const by = 320 + ri*(h+8);
        if(x>=bx && x<=bx+w && y>=by && y<=by+h){
          guess(ch);
        }
      });
    });
  }

  const keyListener=e=>key(e);
  const clickListener=e=>click(e);
  window.addEventListener('keydown', keyListener);
  canvas.addEventListener('click', clickListener);
  cleanupBag.push(()=>{window.removeEventListener('keydown', keyListener);canvas.removeEventListener('click', clickListener);});

  function loop(){
    draw();
    requestAnimationFrame(loop);
  }
  loop();
}
window.registerGame=registerGame;