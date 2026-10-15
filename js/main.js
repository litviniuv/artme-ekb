/* ArtMe demo · shared behaviour */
(function(){
  "use strict";
  var d=document, html=d.documentElement, body=d.body;
  html.classList.add("js");
  var chrome=d.getElementById("chrome");

  /* chrome height -> scroll-padding / menu top */
  function setChrome(){ if(chrome) html.style.setProperty("--chrome-h", chrome.offsetHeight+"px"); }
  setChrome();
  if(window.ResizeObserver && chrome) new ResizeObserver(setChrome).observe(chrome);
  window.addEventListener("resize", setChrome);

  /* pause effects when the tab is hidden */
  d.addEventListener("visibilitychange", function(){ html.classList.toggle("paused", d.hidden); });

  /* mobile menu with scroll lock */
  var btn=d.querySelector(".burger"), menu=d.getElementById("menu"), savedY=0, open=false;
  function lock(){
    savedY=window.scrollY||html.scrollTop;
    var h=chrome.offsetHeight;
    chrome.classList.add("is-fixed");
    body.style.position="fixed"; body.style.top=(-savedY)+"px"; body.style.left="0"; body.style.right="0";
    body.style.paddingTop=h+"px"; html.style.overflow="hidden";
  }
  function unlock(){
    chrome.classList.remove("is-fixed");
    body.style.position=""; body.style.top=""; body.style.left=""; body.style.right=""; body.style.paddingTop=""; html.style.overflow="";
  }
  function restore(then){
    var y=savedY;
    html.style.scrollBehavior="auto";
    window.scrollTo({top:y,left:0,behavior:"instant"});
    requestAnimationFrame(function(){
      if(Math.abs(window.scrollY-y)>1) window.scrollTo({top:y,left:0,behavior:"instant"});
      requestAnimationFrame(function(){
        if(Math.abs(window.scrollY-y)>1) window.scrollTo({top:y,left:0,behavior:"instant"});
        requestAnimationFrame(function(){ html.style.scrollBehavior=""; if(then) then(); });
      });
    });
  }
  function openMenu(){
    if(open) return; open=true; lock(); menu.hidden=false;
    btn.setAttribute("aria-expanded","true"); btn.setAttribute("aria-label","Закрыть меню");
    var f=menu.querySelector("a"); if(f) f.focus({preventScroll:true});
  }
  function closeMenu(target, focusBtn){
    if(!open) return; open=false; menu.hidden=true;
    btn.setAttribute("aria-expanded","false"); btn.setAttribute("aria-label","Открыть меню");
    unlock();
    restore(function(){
      if(target){
        var smooth=!window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        target.scrollIntoView({behavior:smooth?"smooth":"auto",block:"start"});
        if(history.pushState) history.pushState(null,"","#"+target.id);
      }
    });
    if(focusBtn) btn.focus({preventScroll:true});
  }
  if(btn && menu){
    btn.addEventListener("click", function(){ open?closeMenu(null,true):openMenu(); });
    menu.addEventListener("click", function(e){
      var a=e.target.closest("a"); if(!a) return;
      var href=a.getAttribute("href")||"";
      if(href.charAt(0)==="#"){ e.preventDefault(); closeMenu(d.getElementById(href.slice(1)), false); }
      else closeMenu(null,false);
    });
    d.addEventListener("keydown", function(e){
      if(!open) return;
      if(e.key==="Escape"){ closeMenu(null,true); }
      if(e.key==="Tab"){
        var f=[btn].concat([].slice.call(menu.querySelectorAll("a")));
        var i=f.indexOf(d.activeElement);
        if(e.shiftKey && i<=0){ e.preventDefault(); f[f.length-1].focus(); }
        else if(!e.shiftKey && i===f.length-1){ e.preventDefault(); f[0].focus(); }
      }
    });
    window.matchMedia("(min-width:960px)").addEventListener("change", function(m){ if(m.matches) closeMenu(null,false); });
  }

  /* reveal: observe the parent group, with fallback */
  var groups=[].slice.call(d.querySelectorAll("[data-reveal]"));
  function show(g){ g.classList.add("is-in"); }
  function sweep(){
    var vh=window.innerHeight;
    groups.forEach(function(g){ if(g.classList.contains("is-in")) return; var r=g.getBoundingClientRect(); if(r.top<vh) show(g); });
  }
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)){
    groups.forEach(show);
  } else {
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting||e.boundingClientRect.top<0){ show(e.target); io.unobserve(e.target); } }); },{threshold:0,rootMargin:"0px 0px -8% 0px"});
    groups.forEach(function(g){ io.observe(g); });
    window.addEventListener("load", sweep); window.addEventListener("scroll", function(){ requestAnimationFrame(sweep); }, {passive:true});
    setTimeout(sweep, 1200);
    window.addEventListener("hashchange", function(){ setTimeout(sweep,50); });
  }

  /* map loads on click */
  [].forEach.call(d.querySelectorAll("[data-map]"), function(box){
    var b=box.querySelector("button"); if(!b) return;
    b.addEventListener("click", function(){
      var f=d.createElement("iframe");
      f.src=box.getAttribute("data-map"); f.title="Карта: ArtMe, улица Степана Разина, 2"; f.loading="lazy";
      f.setAttribute("allowfullscreen",""); f.referrerPolicy="strict-origin-when-cross-origin";
      box.replaceChild(f,b);
    });
  });

  /* carousels: swipe (native scroll-snap), buttons, keyboard */
  [].forEach.call(d.querySelectorAll("[data-car]"), function(car){
    var track=car.querySelector(".car__track"), slides=[].slice.call(track.children);
    var prev=car.querySelector("[data-prev]"), next=car.querySelector("[data-next]"), count=car.querySelector(".car__count");
    var n=slides.length;
    function perView(){ var w=slides[0].getBoundingClientRect().width; return Math.max(1, Math.round((track.clientWidth+16)/(w+16))); }
    function index(){
      var left=track.scrollLeft, best=0, bd=1e9;
      slides.forEach(function(s,i){ var dd=Math.abs(s.offsetLeft-track.offsetLeft-left); if(dd<bd){bd=dd;best=i;} });
      if(track.scrollLeft+track.clientWidth>=track.scrollWidth-2) best=Math.max(best, n-perView());
      return best;
    }
    function update(){
      var i=index(), pv=perView(), last=Math.max(0,n-pv);
      prev.disabled = track.scrollLeft<=2;
      next.disabled = i>=last || track.scrollLeft+track.clientWidth>=track.scrollWidth-2;
      var a=i+1, b=Math.min(n,i+pv);
      count.textContent = (pv>1 && b>a) ? (a+"–"+b+" / "+n) : (a+" / "+n);
    }
    function go(i){
      i=Math.max(0,Math.min(n-1,i));
      var smooth=!window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      track.scrollTo({left:slides[i].offsetLeft-track.offsetLeft,behavior:smooth?"smooth":"auto"});
    }
    prev.addEventListener("click", function(){ go(index()-1); });
    next.addEventListener("click", function(){ go(index()+1); });
    car.addEventListener("keydown", function(e){
      if(e.key==="ArrowRight"){ e.preventDefault(); go(index()+1); }
      else if(e.key==="ArrowLeft"){ e.preventDefault(); go(index()-1); }
      else if(e.key==="Home"){ e.preventDefault(); go(0); }
      else if(e.key==="End"){ e.preventDefault(); go(n-1); }
    });
    var t; track.addEventListener("scroll", function(){ clearTimeout(t); t=setTimeout(update,60); }, {passive:true});
    var pend=false; function soon(){ if(!pend){ pend=true; requestAnimationFrame(function(){ pend=false; update(); }); } }
    window.addEventListener("resize", soon); window.addEventListener("scroll", soon, {passive:true}); window.addEventListener("load", soon);
    car.addEventListener("focusin", soon); car.addEventListener("pointerenter", soon); update();
  });

})();
