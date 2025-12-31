from __future__ import annotations

from collections import defaultdict, deque
import threading
import time
from typing import Deque, Dict, Tuple


class RateLimiter:
    def __init__(self, max_requests: int, window_seconds: int) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._lock = threading.Lock()
        self._requests: Dict[str, Deque[float]] = defaultdict(deque)

    def allow(self, key: str) -> Tuple[bool, int]:
        now = time.time()
        with self._lock:
            queue = self._requests[key]
            cutoff = now - self.window_seconds
            while queue and queue[0] < cutoff:
                queue.popleft()

            if len(queue) >= self.max_requests:
                retry_after = int(queue[0] + self.window_seconds - now)
                return False, max(retry_after, 1)

            queue.append(now)
            return True, 0
