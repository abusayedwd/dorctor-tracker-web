# Doctor Tracker — Web client

Next.js 15 (App Router) + Redux Toolkit / RTK Query + Tailwind CSS. Full architecture: [root README](../README.md).

## Quick start

```bash
# create .env.local with API_URL=http://localhost:5000
npm install
npm run dev             # http://localhost:3000
```

## Deploy — Vercel

1. Push the repo to GitHub
2. Vercel → Add New → Project → import the repo
3. Root Directory: `frontend`
4. Env var: `API_URL` = your VPS API URL (e.g. `https://api.doctortracker.com`)
5. Deploy — each push to `main` auto-deploys

See the [root README](../README.md#deployment) for the full deployment guide.
