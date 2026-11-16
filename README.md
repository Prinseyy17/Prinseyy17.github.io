# Prinseyy — Portfolio 2026

Static portfolio site for **prinseyy17.github.io**, rebuilt from *Prinseyy_Portfolio_2026.pdf*.
Plain HTML, CSS and JavaScript — no build step. Push to the `Prinseyy17.github.io` repo and GitHub Pages serves it.

## Structure

```
index.html            page structure (hero, about, posters, Real Lux, websites, frames, reel, contact)
css/style.css         all styles (palette tokens at the top)
js/content.js         ← edit this to add websites, photos and videos
js/main.js            interactions, animations and API calls
assets/img/           portrait, posters, Real Lux designs, website screenshots
assets/photos/        frames (full size + "-sm" thumbnails, WebP)
assets/videos/        local edits (.mp4)
assets/og-image.jpg   link-preview image for social / WhatsApp
404.html              custom "page not found"
```

## Updating content

Open `js/content.js`:

| To add…           | Add an item to | Notes |
|-------------------|----------------|-------|
| A website         | `websites`     | Drop a screenshot in `assets/img/web/` (square, ~1200 px) |
| A photo           | `frames`       | `layout`: `feature`, `wide`, `tall` or `standard` |
| A video           | `reel`         | `type: 'drive'` for a Google Drive link (shared as "Anyone with the link") or `type: 'video'` for an `.mp4` in `assets/videos/` |

Set `published: false` to hide anything without deleting it. Hero counts update automatically.

The poster series and the Real Lux case study are written directly in `index.html`.

## APIs used

| API | What it does | Key needed? |
|-----|--------------|-------------|
| **Open-Meteo** | Live Dubai "light report": temperature, sky, sunrise/sunset and a golden-hour countdown (hero chip + Frames section) | No |
| **GitHub REST** | "Live from GitHub" strip under Live websites, showing recently pushed public repos | No (turn off with `github.enabled: false`, hide repos with `exclude`) |
| **Web3Forms** | Sends the contact form to your inbox | Yes, free — see below |
| **Google Drive thumbnails** | Hover previews in the Reel list | No |

### Turning on the contact form

1. Go to <https://web3forms.com>, enter `prinseandrewkatigbak@gmail.com`, and copy the access key they email you.
2. Paste it into `js/content.js` → `site.contactForm.web3formsKey`.

Until a key is added, the form still works: it opens the visitor's email app with the message pre-filled.

## Libraries (loaded from CDN)

- **GSAP 3.12.5 + ScrollTrigger**: pinned horizontal poster gallery, parallax, scroll-scrubbed effects
- **Lenis 1.1.13**: smooth scrolling

If either fails to load, the site still works: the poster gallery becomes a swipeable row and scrolling is native.
Visitors with *reduce motion* turned on get a calm version without the preloader, parallax or smooth scroll.

## Previewing locally

Any static server works, for example:

```bash
npx serve .
```

or `py -m http.server 8080`, then open http://localhost:8080.
