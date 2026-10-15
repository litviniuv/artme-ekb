/* v3 · hero entrance, pointer tilt (precise pointer only), rare dust motes; pauses when hidden */
(function(){
  "use strict";
  var d=document, body=d.body, reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ body.classList.add("h3-in"); }); });
  var pic=d.getElementById("h3pic"), fine=window.matchMedia("(pointer: fine)").matches;
  var px=0, py=0;
  if(pic && fine && !reduce){
    d.querySelector(".hero3").addEventListener("pointermove", function(e){
      px=e.clientX/window.innerWidth-.5; py=e.clientY/window.innerHeight-.5;
      pic.style.transform="perspective(900px) rotateY("+(px*6)+"deg) rotateX("+(-py*5)+"deg)";
    });
  }
  var cv=d.getElementById("dust"); if(!cv || reduce) return;
  var ctx=cv.getContext("2d"), dpr=Math.min(2,window.devicePixelRatio||1), W=0, H=0, motes=[], run=false, id=0;
  function size(){ W=cv.clientWidth; H=cv.clientHeight; cv.width=W*dpr; cv.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); }
  function make(){ var n=Math.round(Math.min(34, W*H/38000)); motes=[]; for(var i=0;i<n;i++) motes.push({x:Math.random()*W,y:Math.random()*H,r:.6+Math.random()*1.6,v:.12+Math.random()*.3,a:.15+Math.random()*.35,s:Math.random()*6.28}); }
  function frame(){
    if(!run) return;
    ctx.clearRect(0,0,W,H);
    for(var i=0;i<motes.length;i++){ var m=motes[i]; m.y-=m.v; m.s+=.01; m.x+=Math.sin(m.s)*.15+px*.4; if(m.y<-4){m.y=H+4;m.x=Math.random()*W;}
      ctx.beginPath(); ctx.arc(m.x,m.y,m.r,0,6.283); ctx.fillStyle="rgba(241,226,190,"+m.a+")"; ctx.fill(); }
    id=requestAnimationFrame(frame);
  }
  function start(){ if(run) return; run=true; id=requestAnimationFrame(frame); }
  function stop(){ run=false; cancelAnimationFrame(id); }
  size(); make(); start();
  window.addEventListener("resize", function(){ size(); make(); });
  d.addEventListener("visibilitychange", function(){ d.hidden?stop():start(); });
  window.__dustRunning=function(){ return run; };
})();
