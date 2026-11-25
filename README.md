<div align="center">

# Yubo Li

**Intelligence is no longer the bottleneck for AI. Reliability is.**

PhD candidate at Carnegie Mellon University, studying when large language models and AI agents can be trusted.

[**yubol-bobo.github.io**](https://yubol-bobo.github.io) · [About](https://yubol-bobo.github.io/about/) · [Publications](https://yubol-bobo.github.io/publications/) · [CV](https://yubol-bobo.github.io/cv/)

</div>

---

## The site

The homepage is a small 3D planet you can walk around. Each landmark opens a page of the classic academic site (research, publications, experience, life), and every classic page has a way back to the planet. A few easter eggs are hidden along the way.

## Repository map

| Path | What it holds |
| --- | --- |
| `index.html` | The built planet homepage |
| `_planet/` | Planet source (Three.js). Build notes in [`_planet/README.md`](_planet/README.md) |
| `_pages/` | Classic pages: about, publications, CV, blog, life, contact |
| `_bibliography/papers.bib` | Publications, rendered with jekyll-scholar |
| `_news/`, `_posts/` | News items and blog posts |
| `_data/` | CV, experience and other structured content |

## Run locally

```bash
bundle install
bundle exec jekyll serve      # classic site at http://localhost:4000

cd _planet && npm install && npm run build   # rebuild the planet into ../index.html
```

Pushing to `main` deploys through GitHub Actions.

## Credits

The classic site began from the [al-folio](https://github.com/alshedivat/al-folio) Jekyll theme (MIT License) and has since been largely rewritten. The planet homepage is original work.
