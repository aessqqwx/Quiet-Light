"""Rebuild the static page from the photo manifest. No runtime build is required."""
from pathlib import Path
import json, html, re
SITE=Path(__file__).resolve().parent.parent
catalog=json.loads((SITE/'assets/photo-manifest.json').read_text())
photos={p['id']:p for p in catalog}
main=['spiral','fern','archive-13','milky-way','golden-hour','lantern','archive-01','dusk']
archive=[p['id'] for p in catalog if p['id'] not in main]
icons=(SITE/'assets/icons.svg.txt').read_text()
def esc(v): return html.escape(str(v),quote=True)
def txt(ru,en,tag='span',cls='',extra=''):
    return f'<{tag}'+(f' class="{cls}"' if cls else '')+f' data-ru="{esc(ru)}" data-en="{esc(en)}" {extra}>{esc(ru)}</{tag}>'
def icon(id,cls=''): return f'<svg class="{cls}" aria-hidden="true" focusable="false"><use href="#i-{id}"/></svg>'
def aria(ru,en): return f'aria-label="{esc(ru)}" data-aria-ru="{esc(ru)}" data-aria-en="{esc(en)}"'
def cta(cls=''):
    return '<a class="button button-primary '+cls+'" href="https://t.me/QuietLightPhoto" target="_blank" rel="noopener noreferrer">'+icon('telegram')+txt('Открыть канал в Telegram','Open the channel on Telegram')+'</a>'
def srcset(p): return ', '.join(f'./assets/photos/{v["file"]} {v["width"]}w' for v in p['variants'])
def card(id,cls='',mode='selected',index=0,hidden=False,sizes='(max-width: 699px) calc(100vw - 40px), 90vw'):
    p=photos[id]; ishero=mode=='hero'; isgold=id=='golden-hour'
    tag='figure' if ishero else 'article'
    return f'''<{tag} class="photo-card {cls}" data-kind="{mode}" data-order="{index}" {'hidden' if hidden else ''}>
      <button class="photo-open" data-photo="{id}" data-title-ru="{esc(p['title'])}" data-title-en="{esc(p['en'])}" {aria('Открыть фотографию: '+p['altRu'],'Open photograph: '+p['altEn'])} style="--photo-ratio:{p['width']}/{p['height']}">
        <span class="media-reveal" {'data-reveal="golden"' if isgold else f'data-reveal="{mode}"' if not ishero else ''}>
          <span class="media-parallax" {'data-parallax="20"' if isgold else ''}>
            <span class="media-hover"><img src="./assets/photos/{id}-sm.webp" srcset="{srcset(p)}" sizes="{sizes}" data-full="./assets/photos/{id}.webp" alt="{esc(p['altRu'])}" data-alt-ru="{esc(p['altRu'])}" data-alt-en="{esc(p['altEn'])}" width="{p['previewWidth']}" height="{p['previewHeight']}" {'fetchpriority="high" loading="eager"' if ishero else 'loading="lazy"'} decoding="async"></span>
          </span>
        </span>
        {'<span class="media-shutter" aria-hidden="true"></span>' if isgold else ''}
        <span class="photo-enlarge" aria-hidden="true">{icon('expand')}</span>
      </button>
      <{'figcaption' if ishero else 'div'} class="photo-caption">
        {txt(p['title'],p['en'],'p','photo-title')}
        <span class="photo-index">{str(index).zfill(2)} / {'08' if mode!='archive' else '43'}</span>
      </{'figcaption' if ishero else 'div'}>
    </{tag}>'''
def heading(ru,en,label,n,extra=''):
    return f'<div class="section-heading"><div class="section-marker"><span>{n}</span>{txt(label[0],label[1])}</div>'+txt(ru,en,'h2','section-title',f'data-reveal="heading" {extra}')+'</div>'
settings=lambda suffix: f'''<div class="preferences"><button class="icon-button theme-toggle" type="button" {aria('Включить светлую тему','Switch to light theme')}>{icon('sun')}</button><div class="language-wrap"><label class="sr-only" for="language{suffix}">{txt('Язык сайта','Site language')}</label><select class="language-select" id="language{suffix}" name="language"><option value="ru">RU</option><option value="en">EN</option></select></div></div>'''
p=photos['spiral']; hero_sizes='(min-width: 1760px) 1600px, (max-width: 699px) calc(100vw - 40px), 91.6vw'
page=f'''<!doctype html>
<html lang="ru" data-theme="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#080D13">
  <title>Quiet Light — визуальный дневник в Telegram</title>
  <meta name="description" content="Фотографии, в которых хочется задержаться. Свет, город, природа и детали — в Telegram-канале @QuietLightPhoto.">
  <meta property="og:title" content="Quiet Light — фотография как ощущение">
  <meta property="og:description" content="Свет. Моменты. Свой взгляд. Присоединяйся к @QuietLightPhoto в Telegram.">
  <meta property="og:type" content="website">
  <link rel="canonical" href="https://aessqqwx.github.io/Quiet-Light/">
  <link rel="icon" href="./assets/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="./assets/fonts/manrope-extrabold.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" as="image" href="./assets/photos/spiral-sm.webp" imagesrcset="{srcset(p)}" imagesizes="{hero_sizes}">
  <script>try{{document.documentElement.dataset.theme=localStorage.getItem('quietlight-theme')==='light'?'light':'dark'}}catch(e){{}}</script>
  <link rel="stylesheet" href="./styles.css">
  <script src="./assets/vendor/anime-4.0.2.min.js" defer></script>
  <script src="./script.js" defer></script>
</head>
<body>
<a class="skip-link" href="#main">{txt('К содержимому','Skip to content')}</a>
<svg xmlns="http://www.w3.org/2000/svg" class="icon-sprite" aria-hidden="true"><defs>{icons}</defs></svg>
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="#top" {aria('Quiet Light — главная','Quiet Light — home')}>{icon('mark','brand-mark')}<span>quiet light.</span></a>
    <nav class="desktop-nav" {aria('Основная навигация','Main navigation')}><a href="#gallery">{txt('Кадры','Photographs')}</a><a href="#about">{txt('О канале','About the channel')}</a></nav>
    <div class="header-actions"><div class="desktop-preferences">{settings('')}</div>
      <a class="button header-telegram" href="https://t.me/QuietLightPhoto" target="_blank" rel="noopener noreferrer">{icon('telegram')}{txt('В Telegram','Telegram')}</a>
      <button class="icon-button menu-toggle" id="menu-toggle" type="button" {aria('Открыть меню','Open menu')} aria-expanded="false" aria-controls="mobile-nav">{icon('menu')}</button>
    </div>
  </div>
  <nav class="mobile-nav container" id="mobile-nav" {aria('Мобильная навигация','Mobile navigation')} hidden>
    <a href="#gallery">{txt('Кадры','Photographs')}</a><a href="#about">{txt('О канале','About the channel')}</a><a href="#footer">{txt('На связи','Get in touch')}</a>
    <div class="mobile-preferences">{txt('Тема и язык','Theme & language')}{settings('-mobile')}</div>
  </nav>
</header>
<main id="main">
  <section class="hero container" id="top" aria-labelledby="hero-title">
    <div class="hero-eyebrow">{txt('Визуальный дневник в Telegram','A visual diary on Telegram')}<span class="hero-handle">@QuietLightPhoto</span></div>
    <h1 class="hero-title" id="hero-title"><span class="hero-word">QUIET</span> <span class="hero-word">LIGHT</span></h1>
    <div class="hero-intro">{txt('Фотографии, в которых\nхочется задержаться.','Photographs worth\nstaying with.','p','hero-description')}<div class="hero-actions">{cta()}<a class="text-link" href="#gallery">{txt('Смотреть кадры','Explore the photographs')}</a></div></div>
    {card('spiral','hero-photo','hero',1,sizes=hero_sizes)}
  </section>
  <section class="selected container section-space" id="gallery" aria-labelledby="selected-title">
    {heading('Увидеть чуть больше.','Look a little closer.',('Выбранные моменты','Selected moments'),'01','id="selected-title"')}
    <div class="selected-grid">
      {card('fern','selected-fern','selected',2,sizes='(max-width: 699px) calc(100vw - 40px), (min-width: 1760px) 510px, 29vw')}
      {card('archive-13','selected-shadow','selected',3,sizes='(max-width: 699px) calc(100vw - 40px), (min-width: 1760px) 1060px, 60vw')}
      {card('milky-way','selected-night','selected',4,sizes='(max-width: 699px) calc(100vw - 40px), (min-width: 1760px) 1280px, 75vw')}
    </div>
  </section>
  <section class="manifesto container section-space" id="about" aria-labelledby="about-title">
    <div class="section-marker"><span>02</span>{txt('О канале','About the channel')}</div>
    <div class="manifesto-content">
      <h2 id="about-title" class="manifesto-title" data-reveal="manifesto"><span data-ru="Свет меняет всё." data-en="Light changes everything.">Свет меняет всё.</span><span data-ru="Даже привычное." data-en="Even the familiar.">Даже привычное.</span></h2>
      <div class="manifesto-bottom">{txt('Город, природа, тени и детали. Quiet Light собирает кадры, к которым хочется вернуться — и продолжить смотреть.','Cities, nature, shadows and details. Quiet Light brings together photographs you want to return to — and keep exploring.','p')}<a class="text-link" href="https://t.me/QuietLightPhoto" target="_blank" rel="noopener noreferrer">{txt('Больше кадров — в канале','More photographs in the channel')}</a></div>
    </div>
  </section>
  <section class="featured container section-space" id="featured" aria-labelledby="featured-title">
    {heading('Свет рядом.','Light, close by.',('Большое и малое','The large & the small'),'03','id="featured-title"')}
    <div class="featured-grid" id="featured-scene">
      {card('golden-hour','featured-golden','golden',5,sizes='(max-width: 699px) calc(100vw - 40px), (min-width: 1760px) 1060px, 60vw')}
      <div class="featured-detail">{card('lantern','featured-lantern','lantern',6,sizes='(max-width: 699px) calc(83vw - 40px), (min-width: 1760px) 510px, 29vw')}{txt('Иногда — целый горизонт.\nИногда — один маленький огонь.','Sometimes, an entire horizon.\nSometimes, one small glow.','p','featured-note')}</div>
    </div>
  </section>
  <section class="chapters container section-space" aria-labelledby="chapters-title">
    {heading('От города к тишине.','From the city to stillness.',('Два настроения','Two moods'),'04','id="chapters-title"')}
    <div class="chapters-grid">
      {card('archive-01','chapter-city','chapter',7,sizes='(max-width: 699px) calc(100vw - 40px), (min-width: 1760px) 780px, 45vw')}
      {card('dusk','chapter-dusk','chapter',8,sizes='(max-width: 699px) calc(100vw - 40px), (min-width: 1760px) 780px, 45vw')}
    </div>
    <details class="archive" id="archive">
      <summary class="archive-toggle"><span class="archive-label">{txt('Ещё один взгляд.','Another way of seeing.','strong')}{txt('Открыть архив','Open the archive','span','archive-toggle-text')}</span><span class="archive-summary-meta">43 {txt('кадра','photographs')}{icon('expand')}</span></summary>
      <div class="archive-content">
        <div class="archive-top">{txt('Свет, движение и всё между ними.','Light, movement and everything in between.','h3','archive-title', 'tabindex="-1" id="archive-title"')}<span class="archive-progress" id="archive-progress" aria-live="polite">8 / 43</span></div>
        <div class="archive-grid" id="archive-grid">{''.join(card(id,'archive-card','archive',i+1,hidden=i>=8,sizes='(max-width: 479px) calc(100vw - 40px), (max-width: 899px) calc(50vw - 36px), (min-width: 1760px) 380px, 22vw') for i,id in enumerate(archive))}</div>
        <div class="archive-actions js-only"><button class="button button-secondary" id="archive-more" type="button" aria-controls="archive-grid">{txt('Показать ещё','Show more')}<span class="more-count">+12</span></button><button class="text-link" id="archive-collapse" type="button" hidden>{txt('Свернуть до 8 кадров','Back to 8 photographs')}</button></div>
        <noscript><p class="nojs-note">Все фотографии и новые публикации — в <a href="https://t.me/QuietLightPhoto">Telegram</a>.</p></noscript>
      </div>
    </details>
  </section>
  <section class="join section-space" id="join" aria-labelledby="join-title">
    <div class="ambient" aria-hidden="true"><span class="ambient-blue"></span><span class="ambient-coral"></span></div>
    <div class="container join-inner">
      <div class="join-eyebrow">{icon('telegram')}{txt('Продолжение — в Telegram','The story continues on Telegram')}</div>
      <h2 class="join-title" id="join-title" data-reveal="join"><span data-ru="Чуть меньше шума." data-en="A little less noise.">Чуть меньше шума.</span><span data-ru="Чуть больше света." data-en="A little more light.">Чуть больше света.</span></h2>
      {txt('Свет, город, природа и детали.\nОткрой канал и оставайся, если тебе близок этот взгляд.','Light, cities, nature and details.\nOpen the channel and stay if this way of seeing feels like yours.','p','join-description')}
      {cta('join-cta')}
      <a class="join-handle" href="https://t.me/QuietLightPhoto" target="_blank" rel="noopener noreferrer">@QuietLightPhoto</a>
    </div>
  </section>
</main>
<footer class="footer container" id="footer">
  <div class="footer-main"><div class="footer-brand"><a class="brand" href="#top" {aria('Quiet Light — главная','Quiet Light — home')}>{icon('mark','brand-mark')}<span>quiet light.</span></a>{txt('Замечать. Чувствовать. Смотреть.','Notice. Feel. Look.','p','footer-description')}</div>
    <div class="footer-links"><div class="footer-col"><p class="footer-label">{txt('МЫ РЯДОМ','FIND US HERE')}</p>
      <a href="https://t.me/QuietLightPhoto" target="_blank" rel="noopener noreferrer">{icon('telegram')}Telegram</a>
      <a href="https://www.instagram.com/quiet.light.photo?stkn=ajdoNDQ1OG8yN2s5" target="_blank" rel="noopener noreferrer">{icon('instagram')}Instagram</a>
      <a href="https://www.tiktok.com/@quiet.light.photo?" target="_blank" rel="noopener noreferrer">{icon('tiktok')}TikTok</a>
    </div><div class="footer-col"><p class="footer-label">{txt('НА СВЯЗИ','GET IN TOUCH')}</p>
      <a href="https://t.me/aessqqwx" target="_blank" rel="noopener noreferrer">{txt('Вопросы и предложения','Inquiries & submissions')}</a>
      <button type="button" data-open="donate-dialog">{icon('heart')}{txt('Поддержать канал','Support the channel')}</button>
    </div></div>
  </div>
  <div class="footer-bottom"><span>© 2026 Quiet Light</span>{txt('Создано из любви к фотографии','Made for the love of photography')}<a href="#top">{txt('Наверх','Back to top')}</a></div>
</footer>
<dialog class="modal" id="donate-dialog" aria-labelledby="donate-title">
  <div class="modal-inner"><button class="icon-button modal-close" type="button" data-close {aria('Закрыть','Close')}>{icon('close')}</button>
    {icon('heart','modal-symbol')}{txt('Пусть света будет больше.','Make room for more light.','h2','', 'id="donate-title"')}
    {txt('Если канал тебе близок, можно поддержать его любым комфортным переводом.','If the channel means something to you, you can support it with any amount that feels right.','p','modal-desc')}
    <dl class="donate-details"><dt>{txt('Номер карты','Card number')}</dt><dd id="card-number">2202 2092 2016 0609</dd></dl>
    <button class="button button-primary" id="copy-card" type="button">{icon('copy')}{txt('Скопировать номер','Copy card number')}</button>
    {txt('Перевод добровольный. Номер копируется без пробелов.','Donations are voluntary. The number is copied without spaces.','p','modal-fineprint')}
  </div>
</dialog>
<dialog class="lightbox" id="lightbox" {aria('Просмотр фотографии','Photograph viewer')} aria-describedby="lightbox-count">
  <div class="lightbox-inner"><button class="icon-button modal-close" data-close type="button" {aria('Закрыть','Close')}>{icon('close')}</button>
    <div class="lightbox-stage"><img id="lightbox-image" alt="" draggable="false"><span class="lightbox-status" id="lightbox-status" role="status" hidden></span></div>
    <div class="lightbox-caption"><div><p id="lightbox-title"></p><span id="lightbox-count" aria-live="polite"></span></div><div class="lightbox-controls"><button class="icon-button" id="photo-prev" type="button" {aria('Предыдущая фотография','Previous photograph')}>{icon('left')}</button><button class="icon-button" id="photo-next" type="button" {aria('Следующая фотография','Next photograph')}>{icon('right')}</button></div></div>
  </div>
</dialog>
<div class="toast" id="toast" role="status" hidden></div>
<noscript><style>.photo-open{{cursor:default}}.menu-toggle,.desktop-preferences,.mobile-preferences,.footer-col button{{display:none}}</style></noscript>
</body>
</html>
'''
(SITE/'index.html').write_text(page)
print(f'Rendered {len(main)} story photographs and {len(archive)} archive photographs')
