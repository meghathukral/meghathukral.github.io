# meghathukral.github.io, clean rebuild

A static, dependency-free personal site. No Jekyll, no build step.

## Structure
```
.
├── index.html          # main page (hero, news, projects, venues, collaborators, publications, contact)
├── assets/
│   ├── style.css       # all styles, light and dark via prefers-color-scheme
│   ├── viz.js          # interactive venue clusters and research-universe visualizations
│   ├── profile.jpg
│   └── *_fig.jpg       # one figure per project page (see "Per-paper figures" below)
└── projects/
    ├── agentsense.html
    ├── cross-domain-har.html
    ├── genai4hs.html
    ├── hicd.html
    ├── himae.html
    ├── k9bench.html
    ├── ondevice.html
    ├── sleep.html
    ├── sslhar.html
    ├── tdost.html
    ├── voice.html
    ├── wafer.html
    └── wavelet-ppg.html
```

## Local preview
Just open `index.html` in a browser, or:
```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy to GitHub Pages
1. Create or use the existing `meghathukral.github.io` repo.
2. Replace the repo contents with this directory's files.
3. Push to `main` (or whatever branch Pages serves). No CI, no `_config.yml` needed.

## Per-paper figures

Every project page expects a single hero figure at `assets/<id>_fig.jpg` (or `.png`).
If the file is missing, the figure block hides itself gracefully via an `onerror` handler.

Expected files:

| Page                       | Figure file                  | Suggested source                         |
|----------------------------|------------------------------|------------------------------------------|
| projects/wafer.html        | assets/wafer_fig.jpg         | local manuscript Figure 1 (framework overview) |
| projects/k9bench.html      | assets/k9bench_fig.jpg       | local manuscript Figure 1 (task examples) |
| projects/hicd.html         | assets/hicd_fig.jpg          | local manuscript HICD-BERT / HICD-Graph diagram |
| projects/himae.html        | assets/himae_fig.jpg         | OpenReview iPAy5VpGQa, architecture figure |
| projects/ondevice.html     | assets/ondevice_fig.jpg      | OpenReview i6DUa3k63o |
| projects/voice.html        | assets/voice_fig.jpg         | ICASSP 2026 camera-ready Figure 1 |
| projects/sleep.html        | assets/sleep_fig.jpg         | ICASSP 2026 camera-ready Figure 1 |
| projects/genai4hs.html     | assets/genai4hs_fig.jpg      | UbiComp 2025 workshop banner |
| projects/sslhar.html       | assets/sslhar_fig.jpg        | DOI 10.1145/3594738.3611366, scaling plot |
| projects/wavelet-ppg.html  | assets/tdost_method.jpg etc. | OpenReview kJbY2CsTPb |
| projects/tdost.html        | assets/tdost_method.jpg, assets/tdost_results.png | already in repo |

To populate one of these slots, drop the figure into `assets/` with the exact filename above.
PNG works too; just change the file extension in the corresponding project page.

## Editing
- **Add a news item.** Drop a new `.item` block at the top of `#news` in `index.html`.
- **Add a publication.** Add a `.pub` row in the right `.year-group` in `index.html`,
  along with a project page in `projects/` and a `.project-card` link in `#projects`.
- **Add a venue.** Edit `VENUE_PAPERS`, `VENUE_META`, and `VENUE_ORDER` in `assets/viz.js`.
- **Add a research cluster.** Edit `CLUSTERS` in `assets/viz.js` and add a matching
  color block to `assets/style.css`.
- **Tweak the colors and typography.** All design tokens live in `:root` and the
  `prefers-color-scheme: dark` block at the top of `assets/style.css`.
