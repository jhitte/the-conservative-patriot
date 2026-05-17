# The Conservative Patriot

A clean, professional, fast website that automatically aggregates high-quality US political and breaking news links from reputable sources across the political spectrum (Left • Center • Right • Wires).

**"Balanced breaking news from across the spectrum"**

- **Live Wires**: Auto-refreshes every ~5 minutes from public RSS feeds (BBC, Reuters, NPR, Fox, The Hill, Guardian, etc.)
- **Viewpoint filters**: Instantly filter by Left / Center / Right / Wire so readers can balance their own feed
- **Curated Highlights**: Hand-picked must-read analysis pieces (easy to maintain via PR)
- **Community Submissions**: First-class "Suggest a Link" flow that copies a ready-to-paste snippet and opens a pre-filled GitHub Issue

Built with Next.js 16 + TypeScript + Tailwind, designed to be low-maintenance and 100% GitHub + Vercel native.

---

## Quick Start (Local)

```bash
npm run dev
```

Open http://localhost:3000

The live feed will pull real headlines on load.

---

## Deployment (Vercel + GitHub) — Exactly What You Asked For

1. **Create the GitHub repo**
   - Go to GitHub → New repository → name it `the-conservative-patriot` (public recommended)
   - Do **NOT** initialize with README (we already have one)

2. **Push the code**
   ```bash
   cd the-conservative-patriot
   git init
   git add .
   git commit -m "Initial professional build of The Conservative Patriot"
   git remote add origin https://github.com/YOUR_USERNAME/the-conservative-patriot.git
   git branch -M main
   git push -u origin main
   ```

3. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com) → Import Git Repository
   - Select your new repo
   - Vercel auto-detects Next.js — just click Deploy
   - Every push to `main` = instant production update (amazing for a news site)

4. **(Optional) Custom domain**
   - In Vercel project settings → Domains → add your domain (free SSL, instant)

---

## Important: Configure Your GitHub Username (One-Time)

The "Suggest a Link" button opens a GitHub issue on your repo.

Edit `lib/config.ts` and change these two lines:

```ts
github: {
  owner: "YOUR_GITHUB_USERNAME",     // ← your actual username or org
  repo: "the-conservative-patriot",
},
```

Then commit + push. The submit flow will now point to the correct place.

---

## How to Maintain the Site (Super Simple)

### Add a permanent Curated Highlight
1. Edit `lib/curated.ts`
2. Add a new object with `title`, `url`, `source`, `whyImportant`, etc.
3. Commit + push → live in < 60 seconds

### Add / remove a live RSS source
Edit `lib/feeds.ts` → add or remove from the `feeds` array. The `/api/live` route picks it up automatically.

### Change the name / tagline
`lib/config.ts` + the hero section in `app/page.tsx`

---

## Tech Notes

- All heavy lifting (RSS parsing, deduping, normalization) happens in `/api/live` on the server with 5-minute ISR caching.
- Zero database, zero cost beyond Vercel free tier.
- Beautiful dark theme with excellent typography (Geist) and the same high-quality component patterns used in the rest of this workspace.
- Fully responsive, keyboard-friendly (`/` focuses search), accessible.

---

## Future Ideas (Easy to Add Later)

- Supabase for community submissions with upvotes
- Weekly email digest of top stories
- AI-generated neutral TL;DRs on the best items
- RSS export of the current top stories

---

## License & Disclaimer

This is a link aggregation / discovery tool. We do not host, create, or take responsibility for the content at the linked URLs. All sources are clearly labeled.

---

**Ready for production.** Just set your GitHub username in `lib/config.ts`, push to GitHub, and import into Vercel.

Questions or want a specific source added / color tweak / feature? Just say the word.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
