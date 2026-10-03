# Quiet Light

Atmospheric landing page for the Telegram photography community **[@QuietLightPhoto](https://t.me/QuietLightPhoto)**.

Static HTML, CSS and JavaScript. Anime.js 4.0.2 is served locally; there is no build step or framework. All 14 photographs from the new archive and all 37 original photographs are retained. The first eight form the curated selection; the remaining photographs load in batches of twelve. WebP previews and larger lightbox versions are stored separately.

## Preview

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`. The same files work on GitHub Pages and Vercel. Keep relative asset paths so deployment under `/Quiet-Light/` works. `vercel.json` supplies static asset caching and response headers.

## Features

- Russian and English, with a saved language preference.
- Dark and light themes, retaining the original theme preference key.
- Curated gallery, incremental expansion, keyboard-accessible lightbox and touch navigation.
- Telegram subscription links, photo submission, Instagram and TikTok.
- Voluntary support dialog with explicit card-number copying.
- Staggered titles, image reveals, desktop parallax and subtle gradients.
- Reduced-motion support, native scrolling, native modal focus management and local fonts.
- No analytics, cookies, accounts or third-party requests during initial page load.

Photographs are supplied by the channel owner. Third-party licenses are included in `assets/fonts/OFL.txt` and `assets/vendor/LICENSE-anime.txt`.

## Публикация готовой версии

Основа — существующий репозиторий [aessqqwx/Quiet-Light](https://github.com/aessqqwx/Quiet-Light). Сайт посвящён Telegram-каналу и сообществу авторов. Главный кадр — закат над морем из нового архива. Для первой подборки выбраны архитектура, природа, ночное небо, движение и городской свет.

Распакуйте архив. В корне сайта должны лежать `index.html`, `styles.css`, `script.js`, `.nojekyll`, `vercel.json` и папка `assets`. Папку `verification` можно не публиковать: в ней находятся скриншоты и результаты проверки.

Для GitHub Pages замените содержимое рабочего каталога репозитория этими файлами и отправьте изменения в `main`. Не переносите сайт в дополнительную вложенную папку. Существующая конфигурация GitHub Pages продолжит публиковать сайт. Для Vercel выберите этот репозиторий и статический проект без команды сборки; готовая конфигурация находится в `vercel.json`.

Локальная проверка: из корня проекта выполните `python3 -m http.server 8080` и откройте `http://localhost:8080`.

## Что проверено

- Chromium: русская и английская версии на ширинах 320, 375, 390, 428, 768, 800, 1024, 1280, 1440 и 1920 пикселей. Горизонтального переполнения нет.
- Галерея: первая подборка из восьми кадров, загрузка следующих фотографий, все 51 изображение, сворачивание.
- Просмотр фотографий: следующий кадр, стрелки клавиатуры, Escape, возврат фокуса.
- Мобильное меню, сохранение языка и темы, копирование номера карты.
- Режим уменьшенной анимации и доступность основного содержимого без JavaScript.
- Нет ошибок JavaScript и отсутствующих локальных ресурсов в проверенном сценарии.

Проверка выполнена в браузере с desktop/mobile размерами окна. Реальные устройства и Safari отдельно не проверялись. Адреса Telegram, Instagram и TikTok соответствуют заданным ссылкам; состояние внешних сервисов сайт не контролирует.

Редактируемые цвета, типографика и кнопки: [Quiet Light в Figma](https://www.figma.com/design/5XDH9wQqCABa8MErjATHGW).

