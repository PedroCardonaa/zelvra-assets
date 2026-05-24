"""Zelvra scraper microservice.

Stub FastAPI app. The /web Next.js app calls POST /scrape with a source spec
and gets back normalized Signal payloads that match src/lib/osint/types.ts.
"""

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="zelvra-scraper")


class ScrapeRequest(BaseModel):
    source_id: str
    url: str
    kind: str


class Signal(BaseModel):
    source_id: str
    observed_at: str
    content: str
    url: str | None = None
    hash: str
    metadata: dict | None = None


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/scrape", response_model=list[Signal])
def scrape(_req: ScrapeRequest) -> list[Signal]:
    return []
