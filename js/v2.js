/* v2 · card rises from the lacquer; tilt, highlight and ring only with a precise pointer */
(function(){
  "use strict";
  var card=document.getElementById("lqCard"); if(!card) return;
  var refl=document.querySelector(".lq-reflect"), ring=card.querySelector(".lq-ring");
  var reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(!reduce){
    card.classList.add("lq-rise"); if(refl) refl.classList.add("lq-rise");
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ card.classList.remove("lq-rise"); if(refl) refl.classList.remove("lq-rise"); }); });
  }
  if(reduce || !window.matchMedia("(pointer: fine)").matches) return;
  var raf=0, tx=0, ty=0;
  card.addEventListener("pointermove", function(e){
    var r=card.getBoundingClientRect(), x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height;
    tx=(x-.5)*12; ty=(.5-y)*10;
    card.style.setProperty("--hx",(x*100)+"%"); card.style.setProperty("--hy",(y*100)+"%");
    if(!raf) raf=requestAnimationFrame(function(){ raf=0; card.style.transform="rotateY("+tx+"deg) rotateX("+ty+"deg)"; });
  });
  card.addEventListener("pointerleave", function(){ card.style.transform=""; });
  card.addEventListener("pointerdown", function(e){
    var r=card.getBoundingClientRect();
    ring.style.setProperty("--rx",(e.clientX-r.left)+"px"); ring.style.setProperty("--ry",(e.clientY-r.top)+"px");
    ring.classList.remove("go"); void ring.offsetWidth; ring.classList.add("go");
  });
})();
