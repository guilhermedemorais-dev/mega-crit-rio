from __future__ import annotations

import argparse
from pathlib import Path
import sys

BASE_DIR = Path(__file__).resolve().parents[1]
sys.path.append(str(BASE_DIR))

from app.config import settings  # noqa: E402
from app.db import add_credits, get_user_by_username, init_db  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description="Add credits to a user")
    parser.add_argument("--username", required=True)
    parser.add_argument("--delta", type=int, required=True)
    parser.add_argument("--reason", default="ajuste_manual")
    parser.add_argument("--created-by", default=None)
    parser.add_argument(
        "--db-path",
        default=str(settings.db_path),
        help="Path to SQLite database file",
    )

    args = parser.parse_args()
    db_path = Path(args.db_path)

    init_db(db_path)
    user = get_user_by_username(db_path, args.username)
    if not user:
        raise SystemExit("User not found")

    new_total = add_credits(db_path, user.id, args.delta, args.reason, args.created_by)

    print("Credits updated:")
    print(f"  user_id: {user.id}")
    print(f"  username: {user.username}")
    print(f"  credits: {new_total}")


if __name__ == "__main__":
    main()
