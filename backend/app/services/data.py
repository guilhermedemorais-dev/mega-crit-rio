from __future__ import annotations

from pathlib import Path
import threading
import pandas as pd

REQUIRED_COLUMNS = ["concurso", "n1", "n2", "n3", "n4", "n5", "n6"]
NUMBER_COLUMNS = ["n1", "n2", "n3", "n4", "n5", "n6"]


def load_history(csv_path: Path) -> pd.DataFrame:
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV not found: {csv_path}")

    df = pd.read_csv(csv_path)
    missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing:
        raise ValueError(f"Missing columns in CSV: {', '.join(missing)}")

    df = df[REQUIRED_COLUMNS].copy()

    for col in REQUIRED_COLUMNS:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df = df.dropna()
    df[REQUIRED_COLUMNS] = df[REQUIRED_COLUMNS].astype(int)

    df = df[df["concurso"] > 0]

    numbers_df = df[NUMBER_COLUMNS]
    valid_range = numbers_df.apply(lambda row: row.between(1, 60).all(), axis=1)
    no_duplicates = numbers_df.apply(lambda row: len(set(row)) == 6, axis=1)

    df = df[valid_range & no_duplicates]
    df = df.drop_duplicates(subset=["concurso"], keep="last")
    df = df.sort_values("concurso").reset_index(drop=True)

    return df


class HistoryCache:
    def __init__(self, csv_path: Path) -> None:
        self.csv_path = csv_path
        self._lock = threading.Lock()
        self._df: pd.DataFrame | None = None
        self._mtime: float | None = None

    def get(self) -> pd.DataFrame:
        with self._lock:
            if not self.csv_path.exists():
                raise FileNotFoundError(f"CSV not found: {self.csv_path}")

            mtime = self.csv_path.stat().st_mtime
            if self._df is None or self._mtime != mtime:
                self._df = load_history(self.csv_path)
                self._mtime = mtime

            return self._df.copy()


def get_last_concurso(df: pd.DataFrame) -> int | None:
    if df.empty:
        return None
    return int(df["concurso"].iloc[-1])
