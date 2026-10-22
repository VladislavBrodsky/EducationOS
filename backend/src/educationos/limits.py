from typing import Protocol

from redis.asyncio import Redis
from redis.exceptions import RedisError

from educationos.errors import DomainError


class RateLimiter(Protocol):
    async def check(self, identity: str) -> None: ...


# Atomic TTL prevents permanent locks if a process dies between INCR and EXPIRE.
_SCRIPT = """
local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('EXPIRE', KEYS[1], 60) end
return count
"""


class RedisRateLimiter:
    def __init__(self, redis: Redis, limit: int):
        self.redis, self.limit = redis, limit

    async def check(self, identity: str) -> None:
        try:
            count = await self.redis.eval(_SCRIPT, 1, f"educationos:limit:{identity}")
        except (RedisError, OSError):
            raise DomainError(503, "UNAVAILABLE", "Request protection is unavailable.") from None
        if int(count) > self.limit:
            raise DomainError(429, "RATE_LIMITED", "Please try again later.")
