# Travel Scraps — 旅行边角料

Open **index.html** in a current browser. It is a complete, self-contained website: all 33 selected artwork assets, styles, and JavaScript are embedded. It works offline and needs no installation or server.

The visual sequence follows **07.pdf**, using the artwork in **test02**: sky and grass collage, photo collection, handwritten introduction, album guide, examples, prizes, and closing message. Desktop grids become a vertical composition on small screens.

## Explore

- Move the pointer over the opening scene for layered parallax.
- Hover over or tap photos to explore their stories. Use the arrow keys inside the gallery.
- Tap the birds and prize illustrations for small animations.
- Use either main call to action to make a postcard. Choose a provided image or upload your own, write a short caption, and save a PNG.
- Use **MOTION ON / OFF** to control animation. System reduced-motion preferences are respected.

The postcard maker processes images on the device. It does not publish posts or submit competition entries. Added photo stories are illustrative creative copy. The prize artwork and labels come from the supplied materials.

## Editable source

- `scrapbook/src/index.template.html`: layout, styles, and interactions.
- `scrapbook/scripts/build.mjs`: embeds the provided artwork and creates the standalone `index.html`.
- `scrapbook/scripts/verify.cjs`: browser verification for the current local development environment.

The delivered HTML is portable. The build and verification scripts use this workspace's bundled Node, Sharp, and Playwright installations; update those dependency paths if developing on another machine.

Verified locally: offline loading, every image, gallery navigation, dialog dismissal, postcard export, local upload, responsive widths of 320/390/768/1440 pixels, animation pause, and system reduced-motion behavior.
