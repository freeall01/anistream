# Free-Anime

Static anime browsing site. No build step, no server.

| File | Language | Job |
|---|---|---|
| `index.html` | HTML | Page shell: navbar, hero, rows, footer |
| `css/style.css` | CSS | Dark UI, purple/yellow neon, hover animations |
| `js/anilist.js` | JavaScript | AniList GraphQL client, caching, data mapping |
| `js/schedule.js` | JavaScript | Weekly release schedule page |
| `js/app.js` | JavaScript | Cards, rows, routing, details and player pages |
| `manifest.webmanifest` | JSON | Lets you install the site to your home screen |
| `sw.js` | JavaScript | Service worker: offline fallback |
| `icon.svg` | SVG | App icon |

## Deploy on GitHub Pages (from a phone)
1. Create a repo and upload every file, keeping the `css/` and `js/` folders.
2. Settings > Pages > Deploy from branch > `main` / root.
3. Open the Pages link. Live AniList data only loads from a real site, not from a file opened locally.

## Data
Titles, covers, genres, synopses and the schedule come from the free AniList API (https://docs.anilist.co). Responses are cached in the browser for 30 minutes to stay under the rate limit. If AniList can't be reached, sample data is shown.

## Video
The player is a demo with simulated playback. To play real video you have the rights to, add a file in `js/app.js`:
`SRC[titleId]={1:"https://your-host/ep1.mp4"}`
