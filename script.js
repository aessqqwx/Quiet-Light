(() => {
  'use strict';
  const $ = (s, scope = document) => scope.querySelector(s);
  const $$ = (s, scope = document) => [...scope.querySelectorAll(s)];
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const mobile = matchMedia('(max-width: 699px)');
  const desktopMenu = matchMedia('(min-width: 900px)');
  const storage = {get(k){try{return localStorage.getItem(k);}catch{return null;}},set(k,v){try{localStorage.setItem(k,v);}catch{}}};
  let lang = storage.get('quietlight-lang') === 'en' ? 'en' : 'ru';
  const text = (ru, en) => lang === 'ru' ? ru : en;
  const active = new Set();
  const pending = new Map();
  const played = new WeakSet();
  const perElement = new WeakMap();
  let observer, parallaxFrame = 0, ambientAnimation = null, toastTimer;
  let archiveCount = 8;
  const archive = $('#archive');
  const archiveCards = $$('.archive-card');
  const more = $('#archive-more');
  const menu = $('#mobile-nav');
  const menuButton = $('#menu-toggle');
  const lightbox = $('#lightbox');
  const output = $('#lightbox-image');
  let photoPool = [], photoIndex = 0, requestId = 0, requestImage = null, requestTimer;
  const dialogOrigins = new WeakMap();
  const fullCache = new Map();

  function stopElement(el) {
    const old = perElement.get(el);
    if (old) { old.cancel(); active.delete(old); }
    perElement.delete(el);
    el.style.removeProperty('transform'); el.style.removeProperty('opacity'); el.style.removeProperty('will-change');
  }
  function animate(el, options, finish = () => {}) {
    if (reduced.matches || !window.anime?.animate) { finish(); return null; }
    stopElement(el);
    let animation;
    try {
      animation = window.anime.animate(el, {...options, onComplete: () => {
        active.delete(animation); perElement.delete(el); finish();
      }});
      active.add(animation); perElement.set(el, animation);
      return animation;
    } catch { stopElement(el); finish(); return null; }
  }
  function resetVisual(el) {
    stopElement(el);
    const shutter = $('.media-shutter', el.closest('.photo-open') || el);
    if (shutter) { stopElement(shutter); shutter.style.transform = 'scaleY(0)'; }
  }
  function finishReveal(el) {
    observer?.unobserve(el); pending.delete(el); played.add(el); resetVisual(el);
    $$('.motion-group', el).forEach(stopElement);
  }
  function clearMotion() {
    active.forEach(a => { try { a.cancel(); } catch {} }); active.clear();
    [...pending.keys()].forEach(finishReveal);
    $$('[data-reveal], .hero-word, .media-shutter, .media-parallax, .ambient span, .modal-inner, .lightbox-inner, #lightbox-image, .motion-group').forEach(resetVisual);
    observer?.disconnect(); ambientAnimation = null;
    cancelAnimationFrame(parallaxFrame); parallaxFrame = 0;
    $('#featured-scene').classList.remove('sticky-enabled');
    $('.featured-golden').classList.remove('parallax-enabled');
  }
  function setMenu(open, restore = false) {
    const wasInside = menu.contains(document.activeElement);
    menu.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? text('Закрыть меню','Close menu') : text('Открыть меню','Open menu'));
    $('use', menuButton).setAttribute('href', open ? '#i-close' : '#i-menu');
    if (!open && restore && wasInside) (desktopMenu.matches ? $('.header-telegram') : menuButton).focus();
  }
  menuButton.addEventListener('click', () => setMenu(menu.hidden));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', e => { if (!$('.site-header').contains(e.target) && !menu.hidden) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false, true); e.preventDefault(); } });
  desktopMenu.addEventListener('change', e => { if (e.matches) setMenu(false, true); });

  function updateTheme() {
    const isLight = root.dataset.theme === 'light';
    $$('.theme-toggle').forEach(b => {
      b.setAttribute('aria-label', isLight ? text('Включить тёмную тему','Switch to dark theme') : text('Включить светлую тему','Switch to light theme'));
      $('use', b).setAttribute('href', isLight ? '#i-moon' : '#i-sun');
    });
    $('meta[name="theme-color"]').content = isLight ? '#f2f1ec' : '#080d13';
  }
  $$('.theme-toggle').forEach(b => b.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light'; storage.set('quietlight-theme', root.dataset.theme); updateTheme();
  }));
  function updateArchive() {
    $('#archive-progress').textContent = text(`${archiveCount} из ${archiveCards.length} кадров`,`${archiveCount} of ${archiveCards.length} photographs`);
    more.hidden = archiveCount >= archiveCards.length;
    $('.more-count', more).textContent = `+${Math.min(12, archiveCards.length - archiveCount)}`;
    more.setAttribute('aria-expanded', String(archiveCount > 8));
    $('#archive-collapse').hidden = archiveCount === 8;
    $('.archive-toggle-text').textContent = archive.open ? text('Закрыть архив','Close the archive') : text('Открыть архив','Open the archive');
  }
  function applyLanguage(next) {
    lang = next === 'en' ? 'en' : 'ru'; root.lang = lang;
    $$('[data-ru]').forEach(el => { el.textContent = el.dataset[lang]; if(el.hasAttribute('data-reveal') && el.hasAttribute('aria-label'))el.setAttribute('aria-label',el.textContent); });
    $$('[data-aria-ru]').forEach(el => { el.setAttribute('aria-label', el.dataset[lang === 'ru' ? 'ariaRu' : 'ariaEn']); });
    $$('img[data-alt-ru]').forEach(el => { el.alt = el.dataset[lang === 'ru' ? 'altRu' : 'altEn']; });
    $$('.language-select').forEach(el => { el.value = lang; });
    updateTheme(); updateArchive(); setMenu(!menu.hidden);
    document.title = text('Quiet Light — визуальный дневник в Telegram','Quiet Light — a visual diary on Telegram');
    $('meta[name="description"]').content = text('Фотографии, в которых хочется задержаться. Свет, город, природа и детали — в Telegram-канале @QuietLightPhoto.','Photographs worth staying with. Light, cities, nature and details — on the Telegram channel @QuietLightPhoto.');
    if (lightbox.open) updateCaption();
    storage.set('quietlight-lang', lang); queueGeometry();
  }
  $$('.language-select').forEach(el => el.addEventListener('change', e => {
    $$('[data-reveal="heading"], [data-reveal="manifesto"]').forEach(finishReveal);
    applyLanguage(e.target.value);
  }));

  const settings = {
    heading: {y:16,duration:580,mobileY:8,mobileDuration:380,opacity:1,stagger:45,cap:135},
    manifesto:{y:12,duration:560,mobileY:6,mobileDuration:350,opacity:1,stagger:45,cap:90},
    selected:{y:12,duration:700,mobileY:6,mobileDuration:450,opacity:.75,stagger:65,cap:130},
    golden:{y:0,duration:850,mobileY:0,mobileDuration:450,opacity:1,stagger:0,cap:0},
    lantern:{y:10,duration:650,mobileY:6,mobileDuration:420,opacity:.8,stagger:80,cap:80},
    chapter:{y:10,duration:650,mobileY:6,mobileDuration:420,opacity:.8,stagger:65,cap:65},
    archive:{y:8,duration:500,mobileY:0,mobileDuration:320,opacity:.8,stagger:40,cap:120},
    join:{y:10,duration:500,mobileY:6,mobileDuration:350,opacity:1,stagger:0,cap:0}
  };
  function runReveal(el, groupIndex = 0) {
    pending.delete(el); observer?.unobserve(el); played.add(el);
    const s = settings[el.dataset.reveal];
    if (!s || reduced.matches) { resetVisual(el); return; }
    const isMobile = mobile.matches;
    const duration = isMobile ? s.mobileDuration : s.duration;
    const y = isMobile ? s.mobileY : s.y;
    const delay = isMobile ? 0 : Math.min(groupIndex * s.stagger, s.cap);
    if (el.dataset.reveal === 'golden' && !isMobile) {
      const shutter = $('.media-shutter', el.closest('.photo-open'));
      el.style.removeProperty('opacity');
      if (shutter) animate(shutter, {scaleY:[1,0],duration,ease:'out(3)'}, () => {shutter.style.transform='scaleY(0)';});
      return;
    }
    const opacity = el.dataset.reveal === 'golden' ? .8 : s.opacity;
    let children = el.dataset.reveal === 'manifesto' && !isMobile ? [...el.children] : [el];
    if (el.dataset.reveal === 'heading' && !isMobile) {
      const parts = lang === 'ru' ? {
        'Увидеть чуть больше.':['Увидеть','чуть больше.'],
        'Свет рядом.':['Свет','рядом.'],
        'От города к тишине.':['От города','к тишине.']
      } : {
        'Look a little closer.':['Look','a little closer.'],
        'Light, close by.':['Light,','close by.'],
        'From the city to stillness.':['From the city','to stillness.']
      };
      const title = el.textContent;
      if (parts[title]) {
        el.setAttribute('aria-label', title);
        el.replaceChildren();
        parts[title].forEach((part,i)=>{
          if(i)el.append(document.createTextNode(' '));
          const span=document.createElement('span');span.className='motion-group';span.textContent=part;span.setAttribute('aria-hidden','true');el.append(span);
        });
        children=[...el.children];
      }
    }
    children.forEach((child, i) => animate(child, {translateY:[y,0],opacity:[opacity,1],duration,delay:delay + (!isMobile ? Math.min(i*s.stagger,s.cap) : 0),ease:'out(3)'}, () => resetVisual(child)));
  }
  function prepareReveals(elements) {
    if (!observer || reduced.matches || !window.anime?.animate) return;
    elements.forEach(el => {
      if (played.has(el) || pending.has(el) || el.closest('[hidden]') || (el.closest('#archive') && !archive.open)) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < innerHeight * .88 && rect.bottom > 0) { played.add(el); return; }
      if (rect.bottom <= 0) { played.add(el); return; }
      const s = settings[el.dataset.reveal];
      if (!s) return;
      // Only offscreen media is prepared. Text, buttons, labels and focus remain readable.
      if (s.opacity < 1) el.style.opacity = String(s.opacity);
      pending.set(el, true); observer.observe(el);
    });
  }
  function setupObserver() {
    if (!('IntersectionObserver' in window) || !window.anime?.animate || reduced.matches) return;
    observer = new IntersectionObserver(entries => {
      const incoming = entries.filter(e => e.isIntersecting && pending.has(e.target));
      incoming.sort((a,b) => a.target.compareDocumentPosition(b.target) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
      const groups = new Map();
      incoming.forEach(e => {
        const parent = e.target.closest('section, #archive') || document.body;
        const i = groups.get(parent) || 0; groups.set(parent,i+1); runReveal(e.target,i);
      });
    }, {rootMargin:`0px 0px -${Math.round(innerHeight*.12)}px 0px`,threshold:0});
    prepareReveals($$('[data-reveal]'));
  }
  document.addEventListener('focusin', e => {
    const card = e.target.closest('.photo-card');
    if (card) $$('[data-reveal]',card).forEach(finishReveal);
  });
  $$('main .photo-open img').forEach(img => img.addEventListener('error', () => {
    const layer = img.closest('[data-reveal]'); if (layer) finishReveal(layer);
    // Retry the independent full variant, never leave a broken preview hidden by motion.
    if (!img.dataset.failed && img.dataset.full) { img.dataset.failed='true'; img.removeAttribute('srcset'); img.src=img.dataset.full; }
  }));
  more.addEventListener('click', () => {
    const start=archiveCount;
    archiveCount=Math.min(archiveCount+12,archiveCards.length);
    archiveCards.slice(start,archiveCount).forEach(card => {card.hidden=false;});
    prepareReveals(archiveCards.slice(start,archiveCount).flatMap(c => $$('[data-reveal]',c)));
    updateArchive(); queueGeometry();
    if (more.hidden) { const first=$('.photo-open',archiveCards[start]); finishReveal($('.media-reveal',first)); first.focus(); }
  });
  $('#archive-collapse').addEventListener('click', () => {
    archiveCards.slice(8).forEach(card => { $$('[data-reveal]',card).forEach(finishReveal); card.hidden=true; });
    archiveCount=8; updateArchive(); more.focus({preventScroll:true});
    $('.archive-toggle').scrollIntoView({block:'start',behavior:reduced.matches?'instant':'smooth'}); queueGeometry();
  });
  archive.addEventListener('toggle', () => {updateArchive();if(archive.open)prepareReveals($$('[data-reveal]',archive));else $$('[data-reveal]',archive).forEach(finishReveal);queueGeometry();});

  function showToast(message) {
    clearTimeout(toastTimer);
    const toast=$('#toast'), dialog=$('dialog[open]');
    (dialog || document.body).append(toast); toast.textContent=message; toast.hidden=false;
    toastTimer=setTimeout(()=>{toast.hidden=true;document.body.append(toast);},3500);
  }
  function openDialog(dialog, origin=document.activeElement) {
    if (dialog.open) return;
    dialogOrigins.set(dialog,origin); setMenu(false); dialog.showModal(); root.classList.add('modal-open');
    $('[data-close]',dialog).focus({preventScroll:true});
    const inner=$('.modal-inner, .lightbox-inner',dialog);
    animate(inner,{opacity:[.85,1],translateY:[mobile.matches?0:8,0],duration:mobile.matches?160:220,ease:'out(3)'},()=>resetVisual(inner));
  }
  $$('[data-open]').forEach(b=>b.addEventListener('click',()=>openDialog(document.getElementById(b.dataset.open),b)));
  $$('dialog').forEach(dialog=>{
    $('[data-close]',dialog).addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',e=>{
      if(e.target!==dialog)return;
      const r=dialog.getBoundingClientRect();
      if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();
    });
    // Native modal semantics plus an explicit keyboard loop keep Tab out of browser chrome.
    dialog.addEventListener('keydown',e=>{
      if(e.key!=='Tab')return;
      const controls=$$('button, a[href], select, [tabindex="0"]',dialog).filter(el=>!el.hidden && el.getClientRects().length);
      const first=controls[0],last=controls.at(-1);
      if(e.shiftKey && (document.activeElement===first || !dialog.contains(document.activeElement))){e.preventDefault();last?.focus();}
      else if(!e.shiftKey && (document.activeElement===last || !dialog.contains(document.activeElement))){e.preventDefault();first?.focus();}
    });
    dialog.addEventListener('close',()=>{
      if(!$('dialog[open]'))root.classList.remove('modal-open');
      resetVisual($('.modal-inner, .lightbox-inner',dialog));
      if(dialog===lightbox){requestId++;clearTimeout(requestTimer);requestImage=null;$('#lightbox-status').hidden=true;stopElement(output);output.removeAttribute('src');fullCache.clear();}
      const toast=$('#toast');toast.hidden=true;document.body.append(toast);
      const origin=dialogOrigins.get(dialog);
      if(origin?.isConnected && origin.getClientRects().length) origin.focus({preventScroll:true});
      queueGeometry();
    });
  });
  function updateCaption() {
    const photo=photoPool[photoIndex]; if(!photo)return;
    $('#lightbox-title').textContent=photo.dataset[lang==='ru'?'titleRu':'titleEn'];
    output.alt=$('img',photo).dataset[lang==='ru'?'altRu':'altEn'];
    $('#lightbox-count').textContent=text(`${photoIndex+1} из ${photoPool.length} кадров`,`${photoIndex+1} of ${photoPool.length} photographs`);
  }
  function showPhoto(index) {
    photoIndex=(index+photoPool.length)%photoPool.length;
    const thumb=$('img',photoPool[photoIndex]), fullUrl=thumb.dataset.full;
    const token=++requestId; clearTimeout(requestTimer); stopElement(output);
    output.src=thumb.currentSrc || thumb.src; updateCaption();
    const status=$('#lightbox-status'); status.textContent=text('Загружаем кадр…','Loading photograph…');status.hidden=false;
    if(fullCache.has(fullUrl)){output.src=fullCache.get(fullUrl);status.hidden=true;return;}
    const full=new Image(); requestImage=full;
    const failed=()=>{if(token!==requestId||!lightbox.open)return;clearTimeout(requestTimer);status.textContent=text('Полный кадр не загрузился. Показано превью.','The full photograph could not load. Showing the preview.');};
    full.onload=async()=>{
      try{await full.decode();}catch{}
      if(token!==requestId||!lightbox.open)return;
      clearTimeout(requestTimer);status.hidden=true;output.src=full.src;fullCache.set(fullUrl,full.src);
      if(fullCache.size>3)fullCache.delete(fullCache.keys().next().value);
      animate(output,{opacity:[.8,1],duration:mobile.matches?140:180,ease:'out(3)'},()=>resetVisual(output));
    };
    full.onerror=failed;requestTimer=setTimeout(failed,15000);full.src=fullUrl;
  }
  $$('.photo-open').forEach(photo=>photo.addEventListener('click',()=>{
    if(photo.closest('#archive'))photoPool=archiveCards.slice(0,archiveCount).map(c=>$('.photo-open',c));
    else photoPool=$$('main .photo-open').filter(p=>!p.closest('#archive'));
    photoIndex=photoPool.indexOf(photo);showPhoto(photoIndex);openDialog(lightbox,photo);
  }));
  $('#photo-prev').addEventListener('click',()=>showPhoto(photoIndex-1));
  $('#photo-next').addEventListener('click',()=>showPhoto(photoIndex+1));
  lightbox.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();showPhoto(photoIndex+(e.key==='ArrowRight'?1:-1));}});
  const pointers=new Set();let swipe=null, multi=false;
  const stage=$('.lightbox-stage');
  stage.addEventListener('pointerdown',e=>{
    if(e.pointerType!=='touch')return;
    pointers.add(e.pointerId);
    if(pointers.size>1){multi=true;swipe=null;return;}
    if(!multi)swipe={id:e.pointerId,x:e.clientX,y:e.clientY};
  });
  stage.addEventListener('pointerup',e=>{
    if(swipe?.id===e.pointerId && !multi && pointers.size===1){const dx=e.clientX-swipe.x,dy=e.clientY-swipe.y;if(Math.abs(dx)>55 && Math.abs(dx)>1.5*Math.abs(dy))showPhoto(photoIndex+(dx<0?1:-1));}
    pointers.delete(e.pointerId);swipe=null;if(!pointers.size)multi=false;
  });
  stage.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);swipe=null;if(!pointers.size)multi=false;});
  lightbox.addEventListener('close',()=>{pointers.clear();swipe=null;multi=false;});
  $('#copy-card').addEventListener('click',async()=>{
    let copied=false;
    try{await navigator.clipboard.writeText('2202209220160609');copied=true;}catch{
      const area=document.createElement('textarea');area.value='2202209220160609';area.setAttribute('aria-hidden','true');area.style.cssText='position:fixed;opacity:0;left:-9999px';$('#donate-dialog').append(area);area.select();
      try{copied=document.execCommand('copy');}catch{}area.remove();$('#copy-card').focus();
    }
    showToast(copied?text('Номер карты скопирован','Card number copied'):text('Выдели номер карты и скопируй вручную.','Select the card number and copy it manually.'));
  });

  function runAmbient() {
    if (reduced.matches || mobile.matches || !fine.matches || ambientAnimation) return;
    const targets=$$('.ambient span');
    targets.forEach((el,i)=>{
      const anim=animate(el,{translateX:i?[6,-4]:[-8,4],translateY:i?[-4,4]:[6,-6],duration:4200,ease:'inOut(2)'},()=>resetVisual(el));
      if(anim)ambientAnimation=anim;
    });
  }
  let ambientStarted=false;
  const ambientObserver='IntersectionObserver' in window ? new IntersectionObserver(entries=>{
    if(entries.some(e=>e.isIntersecting)&&!ambientStarted){ambientStarted=true;runAmbient();}
    else if(entries.every(e=>!e.isIntersecting)&&ambientStarted){$$('.ambient span').forEach(stopElement);}
  },{threshold:0}) : null;
  ambientObserver?.observe($('#join'));
  let geometry=[];
  function updateGeometry() {
    const scene=$('#featured-scene'), golden=$('.featured-golden');
    const h=$('.site-header').getBoundingClientRect().height;
    const frame=$('.photo-open',golden).getBoundingClientRect();
    const hold=scene.offsetHeight-golden.offsetHeight;
    const sticky=fine.matches&&!mobile.matches&&!reduced.matches&&innerWidth>=1100&&innerHeight>=800&&golden.offsetHeight<=innerHeight-h-48&&hold>=innerHeight*.35&&hold<=innerHeight*.75;
    scene.classList.toggle('sticky-enabled',sticky);
    // A single optional photo layer: the staircase remains photographically precise and static.
    const canParallax=fine.matches&&!mobile.matches&&!reduced.matches;
    golden.classList.toggle('parallax-enabled',canParallax);
    geometry=canParallax?[{parent:scene,layer:$('.media-parallax',golden),amp:20}]:[];
    if(!canParallax)stopElement($('.media-parallax',golden));
    requestParallax();
  }
  let geometryQueued=false;
  function queueGeometry(){if(geometryQueued)return;geometryQueued=true;requestAnimationFrame(()=>{geometryQueued=false;updateGeometry();});}
  function requestParallax() {
    if(parallaxFrame || document.hidden || reduced.matches || !geometry.length)return;
    parallaxFrame=requestAnimationFrame(()=>{
      parallaxFrame=0;
      const reads=geometry.map(g=>({...g,rect:g.parent.getBoundingClientRect()}));
      reads.forEach(g=>{
        const visible=g.rect.bottom>0 && g.rect.top<innerHeight;
        if(visible){const p=Math.max(0,Math.min(1,(innerHeight-g.rect.top)/(innerHeight+g.rect.height)));g.layer.style.transform=`translate3d(0,${((2*p-1)*g.amp).toFixed(2)}px,0)`;g.layer.style.willChange='transform';}
        else g.layer.style.removeProperty('will-change');
      });
    });
  }
  window.addEventListener('scroll',requestParallax,{passive:true});
  window.addEventListener('resize',()=>{
    observer?.disconnect();
    [...pending.keys()].forEach(el=>{resetVisual(el);pending.delete(el);});
    setupObserver(); queueGeometry();
  },{passive:true});
  $$('main img').forEach(img=>img.addEventListener('load',queueGeometry));
  document.fonts?.ready.then(queueGeometry);
  reduced.addEventListener('change',()=>{clearMotion();if(!reduced.matches)setupObserver();queueGeometry();});
  fine.addEventListener('change',queueGeometry); mobile.addEventListener('change',queueGeometry);
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){cancelAnimationFrame(parallaxFrame);parallaxFrame=0;$$('.ambient span').forEach(stopElement);}
    else queueGeometry();
  });
  window.addEventListener('pageshow',e=>{if(e.persisted){clearMotion();queueGeometry();}});
  window.addEventListener('beforeprint',clearMotion);
  applyLanguage(lang); setupObserver();
  if(!reduced.matches && !location.hash){
    $$('.hero-word').forEach((word,i)=>animate(word,{translateY:[mobile.matches?10:20,0],duration:mobile.matches?480:720,delay:i*(mobile.matches?30:55),ease:'out(4)'},()=>resetVisual(word)));
  }
  const heroImage=$('.hero-photo img'); let heroMediaPlayed=false;
  function enterHeroImage(){
    if(heroMediaPlayed || reduced.matches || mobile.matches || !fine.matches || location.hash)return;
    const rect=$('.hero-photo').getBoundingClientRect();
    if(rect.top>=innerHeight || rect.bottom<=0)return;
    heroMediaPlayed=true;
    animate($('.hero-photo .media-parallax'),{scale:[1.012,1],duration:850,ease:'out(3)'},()=>resetVisual($('.hero-photo .media-parallax')));
  }
  if(heroImage.complete && heroImage.naturalWidth)heroImage.decode().then(enterHeroImage).catch(()=>{});
  else heroImage.addEventListener('load',()=>heroImage.decode().then(enterHeroImage).catch(()=>{}),{once:true});
  root.classList.add('js-ready');
  queueGeometry();
})();
