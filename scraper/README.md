# Zelvra — scraper

FastAPI microservice that performs the actual fetch/parse work for OSINT sources. The Next.js app calls this over HTTP from `/api/monitor`.

## Setup

```bash
python -m venv .venv
.venv\Scripts\activate     # PowerShell on Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Why a separate service

Vercel's serverless runtime is not a good fit for long-running scrapes, headless browsers, or sticky HTTP sessions. Deploy this on Fly, Render, Railway, or a small VM and point `SCRAPER_URL` in `../web/.env.local` at it.
