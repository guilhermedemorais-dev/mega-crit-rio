from __future__ import annotations

import argparse
from pathlib import Path
import sys

BASE_DIR = Path(__file__).resolve().parents[1]
sys.path.append(str(BASE_DIR))

from app.config import settings  # noqa: E402
from app.db import ROLE_ADMIN, ROLE_AFFILIATE, ROLE_USER, create_user, init_db  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description="Create a user in the MEGA FACIL database")
    parser.add_argument("--username", required=True)
    parser.add_argument("--password", required=True)
    parser.add_argument("--role", default=ROLE_USER, choices=[ROLE_ADMIN, ROLE_USER, ROLE_AFFILIATE])
    parser.add_argument("--credits", type=int, default=0)
    parser.add_argument(
        "--db-path",
        default=str(settings.db_path),
        help="Path to SQLite database file",
    )

    args = parser.parse_args()
    db_path = Path(args.db_path)

    init_db(db_path)
    user = create_user(db_path, args.username, args.password, args.role, args.credits)

    print("User created:")
    print(f"  id: {user.id}")
    print(f"  username: {user.username}")
    print(f"  role: {user.role}")
    print(f"  credits: {user.credits}")
    print(f"  api_key: {user.api_key}")


if __name__ == "__main__":
    main()
