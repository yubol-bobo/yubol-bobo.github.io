# The planet homepage

Source for the 3D planet served at `/` (the built file is `index.html` in the repo root).
Jekyll ignores this folder because its name starts with an underscore.

## Rebuild

```bash
cd _planet
npm install
npm run build      # bundles everything into ../index.html
```

`npm run preview` writes a standalone `dist/index.html` whose links point at the live site.

## Where things live

- `src/world.js`: terrain, landmarks, sky, train, clouds
- `src/main.js`: walking, camera, labels, links to the classic pages
- `src/content.js`: place names and the page each place opens (`CLASSIC`)
- `gen/data.py`: regenerates `src/generated.json` from `_bibliography/papers.bib` and `assets/img`
  (run it after adding papers so the constellations stay current)
- `gen/land.mjs`: regenerates the dotted world map mask

The classic pages link back here through the Planet item in `_includes/header.liquid`.
