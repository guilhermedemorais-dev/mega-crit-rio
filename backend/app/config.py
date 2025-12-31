from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parents[1]


def _get_int(name: str, default: int) -> int:
    value = os.getenv(name)
    if value is None or value.strip() == "":
        return default
    return int(value)


def _get_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _get_optional_int(name: str) -> int | None:
    value = os.getenv(name)
    if value is None or value.strip() == "":
        return None
    return int(value)


def _get_origins() -> list[str]:
    raw = os.getenv("MEGA_FACIL_ALLOWED_ORIGINS", "*")
    origins = [item.strip() for item in raw.split(",") if item.strip()]
    return origins if origins else ["*"]


@dataclass(frozen=True)
class Settings:
    csv_path: Path
    db_path: Path
    window_size: int
    combinations_per_card: int
    credits_per_card: int
    rate_limit_max_requests: int
    rate_limit_window_seconds: int
    allowed_origins: list[str]
    seed: int | None
    trust_proxy_headers: bool
    require_api_key: bool
    admin_username: str | None
    admin_password: str | None
    log_level: str


settings = Settings(
    csv_path=Path(
        os.getenv("MEGA_FACIL_CSV_PATH", str(BASE_DIR / "data" / "mega_sena.csv"))
    ),
    db_path=Path(
        os.getenv("MEGA_FACIL_DB_PATH", str(BASE_DIR / "data" / "mega_facil.db"))
    ),
    window_size=_get_int("MEGA_FACIL_WINDOW_SIZE", 50),
    combinations_per_card=_get_int("MEGA_FACIL_COMBINATIONS_PER_CARD", 3),
    credits_per_card=_get_int("MEGA_FACIL_CREDITS_PER_CARD", 1),
    rate_limit_max_requests=_get_int("MEGA_FACIL_RATE_LIMIT_MAX", 20),
    rate_limit_window_seconds=_get_int("MEGA_FACIL_RATE_LIMIT_WINDOW", 60),
    allowed_origins=_get_origins(),
    seed=_get_optional_int("MEGA_FACIL_SEED"),
    trust_proxy_headers=_get_bool("MEGA_FACIL_TRUST_PROXY_HEADERS", False),
    require_api_key=_get_bool("MEGA_FACIL_REQUIRE_API_KEY", True),
    admin_username=os.getenv("MEGA_FACIL_ADMIN_USERNAME"),
    admin_password=os.getenv("MEGA_FACIL_ADMIN_PASSWORD"),
    log_level=os.getenv("MEGA_FACIL_LOG_LEVEL", "INFO"),
)
