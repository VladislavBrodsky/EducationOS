"""Redis public-catalog cache. Never cache tokens, learner evidence or identifiers."""

import asyncio
import json

from redis.asyncio import Redis
from redis.exceptions import RedisError


class PublicCatalogCache:
    def __init__(self, redis: Redis):
        self.redis = redis

    async def catalog(self, digest: str, items: list[dict]) -> list[dict]:
        key = f"educationos:public:catalog:{digest}"
        try:
            async with asyncio.timeout(0.05):
                cached = await self.redis.get(key)
                if cached:
                    try:
                        candidate = json.loads(cached)
                    except (ValueError, UnicodeDecodeError):
                        candidate = None
                    # A cache key alone does not prove provenance. Compare exact JSON
                    # content against the reviewed in-process source before reuse.
                    if json.dumps(candidate, sort_keys=True) == json.dumps(items, sort_keys=True):
                        return items
                # Missing, malformed or altered entries are replaced when Redis permits.
                await self.redis.set(key, json.dumps(items), ex=300)
        except (RedisError, OSError, ValueError, TimeoutError):
            pass  # Public reviewed files stay available; private rate limits fail closed.
        return items
