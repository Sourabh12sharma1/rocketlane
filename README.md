# Rocketlane

Marketing homepage, rebuilt from Aarivi's shipped front end with a new name.

Vite + React 19 + Tailwind v4. Single page, no runtime dependencies beyond React.

## Run it

```bash
npm install
npm run dev
```

## Deploy to Vercel

`vercel.json` is already configured for Vite (build `npm run build`, output `dist`).

Either push to GitHub and import the repo at [vercel.com/new](https://vercel.com/new),
or run `npx vercel` in this directory.

## What's real

The design system — oklch palette, Space Grotesk / DM Sans, brutalist shadows,
motion background, bento grid, marquee — came out of Aarivi's shipped bundles.
The pricing ($5/$8 monthly, 500/1,500 AI credits) is their real catalog, not invented.

What is NOT real: there is no job data, no Gmail integration, no billing, and no
auth behind the CTAs. The "12 founders emailed today" counter and the 739-interview
stat are decorative. Everything here is a shell.
