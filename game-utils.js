// Utilidades gráficas comunes para los juegos
// Disponibles en window.GameUI
(function(){
  function gradientBar(ctx, w, h, c1='#0d47a1', c2='#1976d2'){
    const g=ctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0,c1); g.addColorStop(1,c2);
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    ctx.fillStyle='rgba(255,255,255,0.08)';
    ctx.fillRect(0,0,w,h*0.55);
  }
  function softBg(ctx,w,h,colors=['#eef3f7','#f5f9fc']){
    const g=ctx.createLinearGradient(0,0,w,h);
    g.addColorStop(0,colors[0]); g.addColorStop(1,colors[1]);
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
  }
  function glassPanel(ctx,x,y,w,h,r=16){
    ctx.save();
    ctx.globalAlpha=0.85; ctx.fillStyle='rgba(255,255,255,0.55)';
    roundRect(ctx,x,y,w,h,r); ctx.fill();
    ctx.globalAlpha=1; ctx.strokeStyle='rgba(255,255,255,0.9)'; ctx.lineWidth=2; ctx.stroke();
    ctx.restore();
  }
  function shadowedText(ctx, text, x, y, color='#fff', shadow='rgba(0,0,0,0.5)'){ ctx.save(); ctx.fillStyle=shadow; ctx.fillText(text,x+2,y+2); ctx.fillStyle=color; ctx.fillText(text,x,y); ctx.restore(); }
  function outlineText(ctx, text, x,y, fill='#fff', stroke='#000', lw=3){ ctx.save(); ctx.lineWidth=lw; ctx.strokeStyle=stroke; ctx.strokeText(text,x,y); ctx.fillStyle=fill; ctx.fillText(text,x,y); ctx.restore(); }
  function roundRect(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath(); }
  window.GameUI={gradientBar,softBg,glassPanel,shadowedText,outlineText,roundRect};
})();
