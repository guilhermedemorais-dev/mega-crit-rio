from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
import sqlite3
from typing import Iterable, Optional
from uuid import uuid4

from .security import generate_api_key, hash_password

ROLE_ADMIN = "admin"
ROLE_USER = "user"
ROLE_AFFILIATE = "affiliate"
VALID_ROLES = {ROLE_ADMIN, ROLE_USER, ROLE_AFFILIATE}


@dataclass(frozen=True)
class UserRecord:
    id: str
    username: str
    password_salt: str
    password_hash: str
    role: str
    credits: int
    api_key: str
    is_active: bool
    created_at: str


def init_db(db_path: Path) -> None:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    with _connect(db_path) as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password_salt TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL,
                credits INTEGER NOT NULL DEFAULT 0,
                api_key TEXT UNIQUE NOT NULL,
                is_active INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS credit_transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                delta INTEGER NOT NULL,
                reason TEXT,
                created_by TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            );
            CREATE INDEX IF NOT EXISTS idx_users_api_key ON users(api_key);
            CREATE INDEX IF NOT EXISTS idx_credit_user_id ON credit_transactions(user_id);
            """
        )
        conn.commit()


def create_user(
    db_path: Path,
    username: str,
    password: str,
    role: str,
    credits: int = 0,
) -> UserRecord:
    if role not in VALID_ROLES:
        raise ValueError("Invalid role")

    user_id = str(uuid4())
    salt, digest = hash_password(password)
    api_key = generate_api_key()
    created_at = _now()

    with _connect(db_path) as conn:
        try:
            conn.execute(
                """
                INSERT INTO users (id, username, password_salt, password_hash, role, credits, api_key, is_active, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
                """,
                (user_id, username, salt, digest, role, credits, api_key, created_at),
            )
            conn.commit()
        except sqlite3.IntegrityError as exc:
            raise ValueError("Username already exists") from exc

    return UserRecord(
        id=user_id,
        username=username,
        password_salt=salt,
        password_hash=digest,
        role=role,
        credits=credits,
        api_key=api_key,
        is_active=True,
        created_at=created_at,
    )


def get_user_by_username(db_path: Path, username: str) -> Optional[UserRecord]:
    return _fetch_one(db_path, "SELECT * FROM users WHERE username = ?", (username,))


def get_user_by_id(db_path: Path, user_id: str) -> Optional[UserRecord]:
    return _fetch_one(db_path, "SELECT * FROM users WHERE id = ?", (user_id,))


def get_user_by_api_key(db_path: Path, api_key: str) -> Optional[UserRecord]:
    return _fetch_one(db_path, "SELECT * FROM users WHERE api_key = ?", (api_key,))


def add_credits(
    db_path: Path,
    user_id: str,
    delta: int,
    reason: str | None,
    created_by: str | None,
) -> int:
    with _connect(db_path) as conn:
        row = conn.execute("SELECT credits FROM users WHERE id = ?", (user_id,)).fetchone()
        if row is None:
            raise ValueError("User not found")

        current = int(row["credits"])
        new_total = current + delta
        if new_total < 0:
            raise ValueError("Insufficient credits")

        conn.execute("UPDATE users SET credits = ? WHERE id = ?", (new_total, user_id))
        conn.execute(
            """
            INSERT INTO credit_transactions (user_id, delta, reason, created_by, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (user_id, delta, reason, created_by, _now()),
        )
        conn.commit()
        return new_total


def list_users(db_path: Path) -> Iterable[UserRecord]:
    with _connect(db_path) as conn:
        rows = conn.execute("SELECT * FROM users ORDER BY created_at DESC").fetchall()
    return [_row_to_user(row) for row in rows]


def _fetch_one(db_path: Path, query: str, params: tuple) -> Optional[UserRecord]:
    with _connect(db_path) as conn:
        row = conn.execute(query, params).fetchone()
    if row is None:
        return None
    return _row_to_user(row)


def _row_to_user(row: sqlite3.Row) -> UserRecord:
    return UserRecord(
        id=row["id"],
        username=row["username"],
        password_salt=row["password_salt"],
        password_hash=row["password_hash"],
        role=row["role"],
        credits=int(row["credits"]),
        api_key=row["api_key"],
        is_active=bool(row["is_active"]),
        created_at=row["created_at"],
    )


def _connect(db_path: Path) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def _now() -> str:
    return datetime.utcnow().isoformat(timespec="seconds") + "Z"
