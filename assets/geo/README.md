# Local GeoJSON cache

This directory is populated automatically during GitHub Pages deployment by:

```bash
node scripts/fetch-geo.mjs
```

The browser loads these same-origin files first. Remote GeoJSON endpoints are retained only as fallbacks.

Generated files are not required to be committed to the repository.
