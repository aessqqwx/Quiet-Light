# Redesign QA — 4 October 2026

The final audit specification, stage 9, defines this release. These are checks of the new implementation, not reused results from the previous design.

## Completed

- Two full visual/functional passes in Chromium, followed by visual polish and a repeated final pass.
- 40 layout combinations: RU/EN × dark/light × 320×568, 360×640, 390×844, 430×932, 768×1024, 1024×768, 1366×768, 1440×900, 1920×1080, 844×390. No horizontal overflow; Telegram CTA precedes the hero image.
- All 163 WebP variants are nonempty and decode successfully. All 51 photo previews loaded in the browser. The restored blue-motion full image loads at its original available resolution.
- Native archive starts with eight and expands 8→20→32→43; collapse and final-batch focus work. Archive-open reflow also checked at 320–430px in both languages.
- Lightbox: open, previous/next, keyboard arrows, explicit Tab/Shift+Tab loop, Escape and return to original focus. Slow/out-of-order full-image responses cannot replace the current photograph; failed full images retain preview and readable status.
- Emulated touch/DPR2: coarse/no-hover state, persistent opening hint, one tap, horizontal swipe, vertical gesture, two-finger pinch. The pinch changed viewport scale without advancing the photograph.
- Menu: open/close, anchor, Escape and resize. Fixed focus loss when changing from the open mobile menu to desktop; focus now moves to the visible Telegram link.
- RU/EN and theme persistence, exact social URLs, SVG Instagram, support dialog and clipboard value `2202209220160609`.
- Reduced motion before loading and switched live, deep link, no JavaScript, missing Anime.js and missing font. Primary content and Telegram remain available.
- Automated axe WCAG-tag checks in RU/EN × both themes and an open lightbox found zero violations. Colour contrast returned a manual-review item because of layered backgrounds; this is not a claim of complete WCAG conformance. Neutral text and CTA colour pairs are opaque; the Ambient centre is kept opaque beneath text. Forced-colours focus outline was checked.
- No JavaScript errors or failed local HTTP responses in the normal flow.

## Mobile laboratory measurements

Three cold runs: 390×844, DPR2, RTT150ms, download1.6Mbps, upload750Kbps, CPU4×, local gzip server, headless Chromium with GPU disabled.

| Run | LCP | CLS | Hero encoded bytes | Critical HTML/CSS/JS/fonts bytes |
|---|---:|---:|---:|---:|
| 1 | 2372ms | 0.00175 | 114648 | 144507 |
| 2 | 2372ms | 0.00175 | 114648 | 144507 |
| 3 | 2392ms | 0.00175 | 114648 | 144507 |

Median LCP2372ms; worst2392ms. The selected hero was spiral-sm.webp. Initial lazy proximity loading included fern, reaching hands and Milky Way previews; the archive and 51 full photographs were not preloaded. Initial long tasks were153/155/113ms respectively.

These are controlled local laboratory measurements. They are not published-host or field Core Web Vitals, an INP result or an FPS guarantee. DPR3 may select a larger hero resource.

## Remaining limits

Physical iOS/Android devices, Safari, an actual screen reader, native browser zoom200/400%, full back/bfcache testing and real GPU frame traces were not performed. Reflow was tested down to320CSSpx. The optional featured sticky hold stays disabled where its natural geometry does not meet the audit's conditions; no spacer is added. Mobile uses normal flow with static Ambient and no parallax.

Publication verification is performed separately after GitHub Pages has deployed the release.
