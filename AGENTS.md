# Agent guide

Google Chrome themes generated from `@langchain/macaw-tokens`. See README.md for tasks.

- `themes/*/manifest.json` is generated. Never edit it by hand: change `src/` and run `mise run generate`.
- `themes/*/icons/` and `themes/langchain-dark/images/` are rendered by `mise run images`; `docs/images/` by `mise run screenshots`. Edit `src/art.ts`, never the images.
- Only keys in Chromium's `kOverwritableColorTable` work as theme colors; `tests/chrome.test.ts` holds that list.
- Map Chrome keys to Macaw **semantic** tokens. Macaw's dark mode inverts its primitive scales, so brand art reads primitives from the light palette (`heroBackdrop`).
- `src/generate.ts` and `scripts/*.ts` are the only files with I/O. Everything else is pure; keep it that way.
- Install packages with `sfw pnpm ...`, never bare `pnpm add`.
- Before finishing: `mise run check && mise run test`.
