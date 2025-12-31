from __future__ import annotations

import hashlib
import hmac
import secrets
from typing import Tuple


def hash_password(password: str, salt: bytes | None = None) -> Tuple[str, str]:
    if salt is None:
        salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        120_000,
    )
    return salt.hex(), digest.hex()


def verify_password(password: str, salt_hex: str, digest_hex: str) -> bool:
    salt = bytes.fromhex(salt_hex)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        120_000,
    ).hex()
    return hmac.compare_digest(digest, digest_hex)


def generate_api_key() -> str:
    return secrets.token_urlsafe(32)
