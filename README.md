# Rocketlane

A landing page for a job-search product. Design system rebuilt from a
reference front end; all copy written fresh for this project.

Vite + React 19 + Tailwind v4. One page, no runtime dependencies beyond React.

## Run it

```bash
npm install
npm run dev
```

## Deploy

`vercel.json` is set for Vite (build `npm run build`, output `dist`). Push to
GitHub and import at [vercel.com/new](https://vercel.com/new), or run
`npx vercel` here.

## Status

Front end only. The buttons don't submit anywhere, the board is static content,
and the numbers on the page are illustrative. What's built is the layout, the
motion system, and the responsive behaviour.

## Tests

`npm test` — 4 tests: sections present, pricing correct, a guard asserting no
copy from the reference site survives, and the headline rotation.
