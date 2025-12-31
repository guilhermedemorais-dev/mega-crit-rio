from __future__ import annotations

from collections import defaultdict
from typing import Dict, List

import numpy as np
import pandas as pd

from .data import NUMBER_COLUMNS
from .generator import generate_cards
from .scoring import compute_number_scores


def run_backtest(
    history_df: pd.DataFrame,
    window_size: int,
    cards_per_draw: int = 1,
    combinations_per_card: int = 3,
    seed: int | None = None,
) -> Dict[str, object]:
    if history_df.empty or len(history_df) < 2:
        return {
            "total_combinations": 0,
            "match_distribution": {},
            "baseline_match_distribution": {},
            "score_buckets": {},
        }

    rng = np.random.default_rng(seed)
    match_distribution: Dict[int, int] = defaultdict(int)
    baseline_distribution: Dict[int, int] = defaultdict(int)
    score_buckets: Dict[str, Dict[str, float]] = defaultdict(lambda: {"count": 0, "avg_hits": 0.0})

    for idx in range(1, len(history_df)):
        train_df = history_df.iloc[:idx]
        actual_numbers = set(history_df.iloc[idx][NUMBER_COLUMNS].tolist())

        score_result = compute_number_scores(train_df, window_size)
        cards = generate_cards(
            score_result.scores,
            score_result.groups,
            rng,
            cards_per_draw,
            combinations_per_card,
        )

        combinations = [combo for card in cards for combo in card.combinations]

        for combo in combinations:
            hits = len(set(combo.numbers) & actual_numbers)
            match_distribution[hits] += 1
            bucket = _score_bucket(combo.score)
            bucket_data = score_buckets[bucket]
            bucket_data["count"] += 1
            bucket_data["avg_hits"] += hits

        baseline_combos = _random_baseline(
            rng,
            len(combinations),
        )
        for combo_numbers in baseline_combos:
            hits = len(set(combo_numbers) & actual_numbers)
            baseline_distribution[hits] += 1

    for bucket, data in score_buckets.items():
        if data["count"]:
            data["avg_hits"] = round(data["avg_hits"] / data["count"], 3)

    return {
        "total_combinations": sum(match_distribution.values()),
        "match_distribution": dict(match_distribution),
        "baseline_match_distribution": dict(baseline_distribution),
        "score_buckets": dict(score_buckets),
    }


def _random_baseline(rng: np.random.Generator, total: int) -> List[List[int]]:
    baseline = []
    for _ in range(total):
        numbers = rng.choice(60, size=6, replace=False) + 1
        baseline.append(sorted(numbers.tolist()))
    return baseline


def _score_bucket(score: float) -> str:
    if score >= 80:
        return "80-100"
    if score >= 60:
        return "60-80"
    if score >= 40:
        return "40-60"
    if score >= 20:
        return "20-40"
    return "0-20"
