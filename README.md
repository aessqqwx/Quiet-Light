# Quiet Light

A visual diary landing page for the Telegram channel [@QuietLightPhoto](https://t.me/QuietLightPhoto).

**Live site:** https://aessqqwx.github.io/Quiet-Light/

Static HTML, CSS, JavaScript and local Anime.js 4.0.2. No framework or runtime build is required. The redesign follows the final specification in stage 9 of the Quiet Light audit.

## Content

Eight unique photographs form the main story: spiral → fern → reaching hands → Milky Way → golden hour → lantern → city motion → dusk. The separate native archive contains the other 43 photographs, initially eight, then batches of twelve. All 14 new photographs and all 37 original photographs are retained.

The three empty WebP files were restored from their original JPEGs. Responsive variants, factual RU/EN alt text and actual dimensions are recorded in `assets/photo-manifest.json`. The hero preload and image use the same srcset and sizes. Larger photographs load only when selected in the lightbox; gallery images load lazily.

## Interactions and motion

- Russian/English and dark/light preferences are saved locally.
- Native dialog with explicit Tab/Shift+Tab loop, arrows, Escape and focus return.
- Single tap opens a photograph; horizontal swipe is an optional shortcut. Vertical gestures and pinch remain available.
- Native scroll, short once-only media reveals and semantic text stagger, subtle desktop photo parallax and a finite Ambient invitation.
- Reduced motion before load or switched live finishes all decoration immediately.
- Without JavaScript, the story, Telegram links and native archive with its first eight photographs remain visible.
- No analytics, accounts, remote fonts or third-party initial requests.

Telegram, Instagram and TikTok URLs match the owner's instructions. Voluntary support copies `2202209220160609`. No bank or recipient is asserted. Inquiries and photo submissions use the existing owner contact, without an unverified channel-direct-message promise.

## Local preview

```bash
python3 -m http.server 8080
```

Open http://localhost:8080. Relative paths also work under the GitHub Pages project path `/Quiet-Light/`. Preserve `.nojekyll` and the existing Pages configuration. `vercel.json` remains available for static Vercel hosting, but GitHub Pages is the requested publication.

`python3 tools/render.py` rebuilds the static HTML from the manifest and SVG symbols. Image variants are supplied assets; this command does not recompress photographs.

## Verification

See [QA.md](QA.md) for the completed checks, fixed defects, mobile laboratory conditions and remaining limits. Reports distinguish new verification from the earlier site's historical QA.

Photographs were supplied by the channel owner. Font and Anime.js licenses remain under `assets/fonts/OFL.txt` and `assets/vendor/LICENSE-anime.txt`.

The earlier editable design source is [Quiet Light in Figma](https://www.figma.com/design/5XDH9wQqCABa8MErjATHGW). The current audited implementation is maintained in this repository.
