(() => {
  'use strict';
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const root = document.documentElement;
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* Private browsing still works. */ } }
  };
  const dictionary = {
    ru: {
      skip:'К содержимому', home:'Quiet Light — главная', nav:'Основная навигация', navGallery:'Кадры', navAbout:'О канале', navContact:'На связи', language:'Язык сайта', headerCta:'В Telegram', lightTheme:'Включить светлую тему', darkTheme:'Включить тёмную тему', openMenu:'Открыть меню', closeMenu:'Закрыть меню',
      heroEyebrow:'ФОТОГРАФИЯ КАК ОЩУЩЕНИЕ', filmLabel:'СВЕТ. МОМЕНТ. СВОЙ ВЗГЛЯД.', heroLine1:'Мир становится ближе,', heroLine2:'когда смотришь внимательнее.', join:'Подписаться на канал', heroCtaNote:'Больше фотографий — в Telegram', heroFootnote:'Разные авторы. Один язык — фотография.', explore:'Смотреть кадры',
      aboutLabel:'О КАНАЛЕ', aboutLead:'У каждого свой взгляд.', aboutMain:'У нас — место, где эти взгляды встречаются.', aboutText:'Quiet Light — сообщество людей, которые замечают свет, красоту и настроение в обычных вещах. Город, природа, архитектура, случайные детали. Снимаем по-разному, чувствуем вместе.', submit:'Предложить свой кадр',
      galleryLabel:'02 / ВЫБРАННЫЕ МОМЕНТЫ', galleryLine1:'Остановиться.', galleryLine2:'И увидеть больше.', galleryNote:'Маленькая часть нашего мира. Нажми на кадр, чтобы рассмотреть его ближе.', more:'Ещё немного красоты', less:'Свернуть галерею', openPhoto:'Открыть фотографию:', progress:(shown,total)=>`${shown} из ${total} кадров`,
      joinLine1:'Чуть меньше шума.', joinLine2:'Чуть больше света.', joinText:'Новые кадры, разные истории и люди, которые видят красоту рядом. Всё это — в нашем канале.', footerText:'Фотографии, в которых хочется задержаться.', elsewhere:'МЫ РЯДОМ', stayInTouch:'НА СВЯЗИ', support:'Поддержать канал', contact:'Вопросы и реклама', footerNote:'Создано из любви к фотографии', backTop:'Наверх',
      close:'Закрыть', donateTitle:'Пусть света будет больше.', donateText:'Если канал тебе близок, можно поддержать его любым комфортным переводом.', recipient:'Получатель', recipientName:'Фёдор Андреевич', bank:'Банк', bankName:'СберБанк', card:'Номер карты', copy:'Скопировать номер', copied:'Номер карты скопирован', copyFailed:'Не удалось скопировать. Выдели номер карты и скопируй вручную.', donateNote:'Перевод добровольный. Номер копируется без пробелов.', submitTitle:'Твой взгляд тоже важен.', submitText:'Хочешь поделиться фотографией? Отправь её в личные сообщения канала в Telegram.', sendPhoto:'Предложить фотографию', photoViewer:'Просмотр фотографии', loading:'Загружаем кадр…', loadFailed:'Не удалось загрузить большой кадр. Показана уменьшенная версия.', previous:'Предыдущая фотография', next:'Следующая фотография'
    },
    en: {
      skip:'Skip to content', home:'Quiet Light — home', nav:'Main navigation', navGallery:'Photographs', navAbout:'About the channel', navContact:'Get in touch', language:'Site language', headerCta:'Open Telegram', lightTheme:'Switch to light theme', darkTheme:'Switch to dark theme', openMenu:'Open menu', closeMenu:'Close menu',
      heroEyebrow:'PHOTOGRAPHY AS A FEELING', filmLabel:'LIGHT. MOMENTS. YOUR PERSPECTIVE.', heroLine1:'The world comes closer', heroLine2:'when you look a little longer.', join:'Join the channel', heroCtaNote:'More photographs on Telegram', heroFootnote:'Different eyes. One language — photography.', explore:'Explore the photographs',
      aboutLabel:'ABOUT THE CHANNEL', aboutLead:'Everyone sees differently.', aboutMain:'This is where our perspectives meet.', aboutText:'Quiet Light is a community of people who find light, beauty and mood in everyday things. Cities, nature, architecture, unexpected details. Different ways of seeing, a shared feeling.', submit:'Share your photograph',
      galleryLabel:'02 / SELECTED MOMENTS', galleryLine1:'Take a moment.', galleryLine2:'See a little more.', galleryNote:'A small part of our world. Tap a photograph to take a closer look.', more:'A little more beauty', less:'Collapse gallery', openPhoto:'Open photograph:', progress:(shown,total)=>`${shown} of ${total} photographs`,
      joinLine1:'A little less noise.', joinLine2:'A little more light.', joinText:'New photographs, different stories and people who see beauty nearby. Find it all in our Telegram channel.', footerText:'Photographs worth staying with.', elsewhere:'FIND US HERE', stayInTouch:'GET IN TOUCH', support:'Support the channel', contact:'Inquiries & advertising', footerNote:'Made for the love of photography', backTop:'Back to top',
      close:'Close', donateTitle:'Make room for more light.', donateText:'If the channel means something to you, you can support it with any amount that feels right.', recipient:'Recipient', recipientName:'Fyodor Andreyevich', bank:'Bank', bankName:'SberBank', card:'Card number', copy:'Copy card number', copied:'Card number copied', copyFailed:'Could not copy. Select the card number and copy it manually.', donateNote:'Donations are voluntary. The number is copied without spaces.', submitTitle:'Your perspective matters.', submitText:'Have a photograph to share? Send it to the channel’s direct messages on Telegram.', sendPhoto:'Share a photograph', photoViewer:'Photograph viewer', loading:'Loading photograph…', loadFailed:'The full photograph could not load. Showing the preview.', previous:'Previous photograph', next:'Next photograph'
    }
  };
  let lang = store.get('quietlight-lang') === 'en' ? 'en' : 'ru';
  const t = key => dictionary[lang][key];
  const cards = $$('.photo-card');
  const photos = cards.map(card => $('.photo-open', card));
  let visibleCount = 8;
  let photoIndex = 0;
  let imageRequest = 0;
  let activePhotoImage = null;
  let toastTimer;
  const activeAnimations = new Set();

  function updateThemeButton() {
    const light = root.dataset.theme === 'light';
    $('#theme-toggle').setAttribute('aria-label', t(light ? 'darkTheme' : 'lightTheme'));
    $('#theme-toggle use').setAttribute('href', light ? '#i-moon' : '#i-sun');
    $('meta[name="theme-color"]').content = light ? '#f2f5f4' : '#090c10';
  }
  function updateGalleryProgress() {
    $('#gallery-progress').textContent = t('progress')(visibleCount, cards.length);
    $('#gallery-more').hidden = visibleCount === cards.length;
    $('.more-count').textContent = `+${Math.min(12, cards.length - visibleCount)}`;
    $('#gallery-more').setAttribute('aria-expanded', String(visibleCount > 8));
    $('#gallery-collapse').hidden = visibleCount === 8;
  }
  function applyLanguage(next) {
    lang = next === 'en' ? 'en' : 'ru';
    root.lang = lang;
    $('#language').value = lang;
    $$('[data-i18n]').forEach(el => { if (typeof t(el.dataset.i18n) === 'string') el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
    $$('[data-ru]').forEach(el => { el.textContent = el.dataset[lang]; });
    $$('img[data-alt-ru]').forEach(el => { el.alt = el.dataset[lang === 'ru' ? 'altRu' : 'altEn']; });
    photos.forEach(photo => photo.setAttribute('aria-label', `${t('openPhoto')} ${photo.dataset[lang === 'ru' ? 'titleRu' : 'titleEn']}`));
    updateThemeButton(); updateGalleryProgress();
    $('#menu-toggle').setAttribute('aria-label', t($('#mobile-nav').hidden ? 'openMenu' : 'closeMenu'));
    if ($('#lightbox').open) updatePhotoCaption();
    document.title = lang === 'ru' ? 'Quiet Light — свет, моменты и фотографии в Telegram' : 'Quiet Light — light, moments & photography on Telegram';
    store.set('quietlight-lang', lang);
  }
  $('#language').addEventListener('change', event => applyLanguage(event.target.value));
  $('#theme-toggle').addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    store.set('quietlight-theme', root.dataset.theme); updateThemeButton();
  });
  function setMenu(open) {
    $('#mobile-nav').hidden = !open;
    $('#menu-toggle').setAttribute('aria-expanded', String(open));
    $('#menu-toggle').setAttribute('aria-label', t(open ? 'closeMenu' : 'openMenu'));
    $('#menu-toggle use').setAttribute('href', open ? '#i-close' : '#i-menu');
  }
  $('#menu-toggle').addEventListener('click', () => setMenu($('#mobile-nav').hidden));
  $$('#mobile-nav a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', event => { if (!$('.site-header').contains(event.target)) setMenu(false); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });
  matchMedia('(min-width:801px)').addEventListener('change', event => { if (event.matches) setMenu(false); });

  function animate(target, parameters) {
    if (motionPreference.matches || !window.anime?.animate) return null;
    try {
      let animation;
      const onComplete = parameters.onComplete;
      animation = window.anime.animate(target, {...parameters, onComplete: () => { activeAnimations.delete(animation); onComplete?.(); }});
      activeAnimations.add(animation);
      return animation;
    } catch { return null; }
  }
  function reveal(el, delay = 0) {
    const animation = animate(el, {opacity:[0,1], translateY:[24,0], duration:800, delay, ease:'out(3)', onComplete:() => { el.style.removeProperty('opacity'); el.style.removeProperty('transform'); }});
    if (!animation) { el.style.removeProperty('opacity'); el.style.removeProperty('transform'); }
    if (el.classList.contains('photo-card')) {
      const image = $('img', el);
      animate(image, {clipPath:['inset(0 0 9% 0)','inset(0 0 0% 0)'], duration:950, delay, ease:'out(3)', onComplete:() => image.style.removeProperty('clip-path')});
    }
  }
  let revealObserver;
  function observeReveals(elements) {
    elements.forEach(el => {
      if (el.hidden) return;
      if (revealObserver && !motionPreference.matches) { el.style.opacity = '0'; revealObserver.observe(el); }
      else el.style.removeProperty('opacity');
    });
  }
  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(entries => {
      let index = 0;
      entries.forEach(entry => { if (entry.isIntersecting) { reveal(entry.target, Math.min(index++ * 65, 195)); revealObserver.unobserve(entry.target); } });
    }, {threshold:.08, rootMargin:'0px 0px -25px 0px'});
  }
  observeReveals($$('.reveal'));
  Promise.race([document.fonts?.ready || Promise.resolve(), new Promise(resolve => setTimeout(resolve, 500))]).then(() => {
    $$('.hero-title .word').forEach(word => {
      const text = word.textContent;
      word.replaceChildren(...[...text].map(char => { const span = document.createElement('span'); span.className = 'char'; span.textContent = char; return span; }));
    });
    animate('.hero-title .char', {translateY:[35,0], opacity:[0,1], duration:1000, delay:window.anime?.stagger ? window.anime.stagger(35) : 0, ease:'out(4)'});
    animate('.hero-film', {opacity:[0,1], clipPath:['inset(5% 0 0 0 round 18px)','inset(0% 0 0 0 round 18px)'], duration:1200, ease:'out(4)', onComplete:()=>$('.hero-film').style.removeProperty('clip-path')});
  });
  $('#gallery-more').addEventListener('click', () => {
    const start = visibleCount; visibleCount = Math.min(visibleCount + 12, cards.length);
    const added = cards.slice(start, visibleCount); added.forEach(card => { card.hidden = false; });
    observeReveals(added); updateGalleryProgress();
    // Move keyboard focus to the newly revealed content; the button stays near it.
    photos[start].focus({preventScroll:true});
    cards[start].scrollIntoView({behavior:motionPreference.matches ? 'instant' : 'smooth', block:'start'});
  });
  $('#gallery-collapse').addEventListener('click', () => {
    cards.slice(8).forEach(card => { card.hidden = true; revealObserver?.unobserve(card); card.style.removeProperty('opacity'); card.style.removeProperty('transform'); });
    visibleCount = 8; updateGalleryProgress();
    $('#gallery-more').focus({preventScroll:true});
    $('#gallery').scrollIntoView({behavior:motionPreference.matches ? 'instant' : 'smooth', block:'start'});
  });

  function openDialog(dialog) {
    if (dialog.open) return;
    dialog.showModal(); root.classList.add('modal-open'); setMenu(false);
    animate(dialog, {opacity:[0,1], translateY:[12,0], duration:320, ease:'out(3)', onComplete:()=>dialog.style.removeProperty('transform')});
  }
  $$('[data-open]').forEach(button => button.addEventListener('click', () => openDialog(document.getElementById(button.dataset.open))));
  $$('dialog').forEach(dialog => {
    $('[data-close]', dialog).addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      if (!$('dialog[open]')) root.classList.remove('modal-open');
      dialog.style.removeProperty('opacity'); dialog.style.removeProperty('transform');
      if (dialog.id === 'lightbox') { imageRequest++; activePhotoImage = null; $('#lightbox-load-status').hidden = true; }
    });
  });
  function updatePhotoCaption() {
    const photo = photos[photoIndex];
    $('#lightbox-title').textContent = photo.dataset[lang === 'ru' ? 'titleRu' : 'titleEn'];
    $('#lightbox-image').alt = $('img', photo).alt;
    $('#lightbox-count').textContent = `QL / ${String(photoIndex + 1).padStart(3,'0')} · ${t('progress')(photoIndex + 1, visibleCount)}`;
  }
  function showPhoto(index) {
    photoIndex = (index + visibleCount) % visibleCount;
    const thumb = $('img', photos[photoIndex]);
    const request = ++imageRequest;
    const output = $('#lightbox-image');
    output.src = thumb.currentSrc || thumb.src; updatePhotoCaption();
    $('#lightbox-load-status').hidden = false;
    const full = new Image(); activePhotoImage = full;
    full.onload = () => {
      if (request !== imageRequest || !$('#lightbox').open) return;
      output.src = full.src; $('#lightbox-load-status').hidden = true;
      animate(output, {opacity:[.65,1], duration:260, ease:'out(2)'});
    };
    full.onerror = () => { if (request === imageRequest) { $('#lightbox-load-status').hidden = true; showToast(t('loadFailed')); } };
    full.src = thumb.dataset.full;
  }
  photos.forEach((photo, index) => photo.addEventListener('click', () => { openDialog($('#lightbox')); showPhoto(index); }));
  $('#photo-prev').addEventListener('click', () => showPhoto(photoIndex - 1));
  $('#photo-next').addEventListener('click', () => showPhoto(photoIndex + 1));
  $('#lightbox').addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(photoIndex + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(photoIndex - 1); }
  });
  let swipeStart;
  $('.lightbox-stage').addEventListener('pointerdown', event => { if (event.pointerType === 'touch') swipeStart = {x:event.clientX,y:event.clientY}; });
  $('.lightbox-stage').addEventListener('pointerup', event => {
    if (!swipeStart) return;
    const dx = event.clientX - swipeStart.x, dy = event.clientY - swipeStart.y; swipeStart = null;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) showPhoto(photoIndex + (dx < 0 ? 1 : -1));
  });
  $('.lightbox-stage').addEventListener('pointercancel', () => { swipeStart = null; });

  function showToast(message) {
    const toast = $('#toast');
    ($('dialog[open]') || document.body).append(toast);
    clearTimeout(toastTimer); toast.textContent = message; toast.hidden = false;
    toastTimer = setTimeout(() => { toast.hidden = true; }, 3500);
  }
  $('#copy-card').addEventListener('click', async () => {
    const cardNumber = '2202209220160609';
    let copied = false;
    try { await navigator.clipboard.writeText(cardNumber); copied = true; }
    catch {
      const field = document.createElement('textarea'); field.value = cardNumber; field.style.cssText = 'position:fixed;opacity:0;left:0;top:0';
      $('#donate-dialog').append(field); field.focus(); field.select();
      try { copied = document.execCommand('copy'); } catch { copied = false; }
      field.remove(); $('#copy-card').focus();
    }
    showToast(t(copied ? 'copied' : 'copyFailed'));
  });

  let scrollFrame;
  const hero = $('.hero-film');
  const heroPhoto = $('.hero-photo');
  const mobileCta = $('#mobile-cta');
  const join = $('#join');
  const footer = $('#footer');
  function updateScroll() {
    scrollFrame = null;
    const heroRect = hero.getBoundingClientRect();
    if (!motionPreference.matches && finePointer.matches && heroRect.bottom > 0 && heroRect.top < innerHeight) {
      const delta = Math.max(-25, Math.min(55, -heroRect.top * .085));
      heroPhoto.style.transform = `translate3d(0,calc(-5% + ${delta}px),0) scale(1.02)`;
    }
    const joinRect = join.getBoundingClientRect(), footerRect = footer.getBoundingClientRect();
    const showCta = heroRect.bottom < 0 && !(joinRect.top < innerHeight && joinRect.bottom > 0) && footerRect.top > innerHeight * .75 && !$('dialog[open]');
    mobileCta.classList.toggle('is-visible', showCta);
    mobileCta.tabIndex = showCta ? 0 : -1; mobileCta.setAttribute('aria-hidden', String(!showCta));
  }
  function requestScrollUpdate() { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); }
  addEventListener('scroll', requestScrollUpdate, {passive:true}); addEventListener('resize', requestScrollUpdate, {passive:true});
  motionPreference.addEventListener('change', () => {
    if (motionPreference.matches) {
      activeAnimations.forEach(animation => animation.cancel()); activeAnimations.clear(); revealObserver?.disconnect();
      $$('.reveal,.char,.hero-film').forEach(el => { el.style.removeProperty('opacity'); el.style.removeProperty('transform'); el.style.removeProperty('clip-path'); });
      $$('.photo-open img').forEach(el => el.style.removeProperty('clip-path'));
    }
    heroPhoto.style.removeProperty('transform'); requestScrollUpdate();
  });
  finePointer.addEventListener('change', () => { heroPhoto.style.removeProperty('transform'); requestScrollUpdate(); });
  applyLanguage(lang); updateScroll();
})();
