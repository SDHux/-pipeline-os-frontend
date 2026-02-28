# Pipeline OS — Enterprise Sales Intelligence Platform

Built for Mark Huckins. An AI-powered prospecting and pipeline management system for enterprise SaaS sales.

## Features

- **Company Intelligence** — 40+ target companies with ICP scoring across 7 verticals
- **Job Discovery** — Live job tracking with Greenhouse integration
- **Pipeline CRM** — Full application lifecycle tracking with MEDDIC-aligned notes
- **Outreach Engine** — AI-drafted LinkedIn messages and emails
- **AI Assistant** — Claude-powered sales intelligence, company research, and content generation

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/SDHux/salesproplatform.git
cd salesproplatform
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add:

```
ANTHROPIC_API_KEY=your_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Deploy to Netlify

Push to GitHub and Netlify will auto-deploy. Add environment variables in:
**Netlify Dashboard → salesproplatform → Site Configuration → Environment Variables**

## Environment Variables

| Variable | Where to get it |
|---|---|
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `NEXT_PUBLIC_SUPABASE_URL` | supabase.com → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | supabase.com → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | supabase.com → Project Settings → API |

## Tech Stack

- **Next.js 14** — Full-stack React framework
- **Tailwind CSS** — Utility-first styling
- **Supabase** — Database and auth
- **Claude API** — AI assistant backbone
- **Netlify** — Hosting and deployment

## Roadmap

- [ ] Supabase database integration for persistent CRM data
- [ ] Greenhouse API auto-apply
- [ ] LinkedIn OAuth integration
- [ ] Gmail auto-response sequences
- [ ] Job scraping automation
- [ ] Contact enrichment via Apollo.io
