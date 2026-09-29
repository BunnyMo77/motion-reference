# Motion Showcase — 旅行边角料

Open `motion-showcase.html` in a modern browser. No installation, build step, external fonts, libraries, or network access is needed. Alternatively, serve this folder with `python3 -m http.server 4184` and open `http://localhost:4184/motion-showcase.html`.

This animation follows `07.pdf` using the supplied `test02` artwork. It includes an animated opening, pointer parallax, drifting clouds, birds, staggered scroll reveals, a guided tour, replay and motion controls, clickable photos, and a local keepsake creator that exports a PNG. Photos stay on the device.

`motion-showcase.html`, `motion-showcase.css` and `motion-showcase.js` are this version's source files. `assets/` contains optimized derivatives; `test02/` contains the untouched originals. This separate entry point preserves another build that appeared at `index.html` during development.

The original section order, Chinese artwork, colors, collage positions and vertical rhythm are preserved. Desktop side rails and playback controls sit outside the composition. The supplied prize heading uses “Part 3”; this is retained rather than duplicating the PDF's “Part 2” label. The PDF's empty tail is shortened and two example captions were added. The publishing artwork opens a local keepsake creator because no campaign destination or backend was supplied.
