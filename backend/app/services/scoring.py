from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
import math
from typing import Dict, List

import pandas as pd

from .data import NUMBER_COLUMNS


@dataclass(frozen=True)
class ScoreResult:
    scores: Dict[int, float]
    groups: Dict[str, List[int]]


def compute_number_scores(history_df: pd.DataFrame, window_size: int) -> ScoreResult:
    numbers = list(range(1, 61))

    total_draws = history_df[NUMBER_COLUMNS].to_numpy().flatten()
    total_counts = Counter(total_draws)
    global_norm = _normalize_by_max(total_counts, numbers)

    recent_df = history_df.tail(window_size)
    recent_draws = recent_df[NUMBER_COLUMNS].to_numpy().flatten()
    recent_counts = Counter(recent_draws)
    recent_norm = _normalize_by_max(recent_counts, numbers)

    recency_raw = _compute_recency(history_df, numbers)
    recency_norm = _normalize_inverted(recency_raw)

    raw_scores = {
        n: 0.5 * global_norm[n] + 0.3 * recent_norm[n] + 0.2 * recency_norm[n]
        for n in numbers
    }
    scores = _normalize_minmax(raw_scores)

    groups = _assign_groups(scores)

    return ScoreResult(scores=scores, groups=groups)


def _compute_recency(history_df: pd.DataFrame, numbers: List[int]) -> Dict[int, int]:
    draws = history_df[NUMBER_COLUMNS].to_numpy()
    last_seen: Dict[int, int | None] = {n: None for n in numbers}

    for offset, row in enumerate(draws[::-1]):
        for num in row:
            if last_seen[num] is None:
                last_seen[num] = offset

    seen_values = [value for value in last_seen.values() if value is not None]
    max_seen = max(seen_values) if seen_values else 0

    return {
        n: (last_seen[n] if last_seen[n] is not None else max_seen + 1)
        for n in numbers
    }


def _normalize_by_max(counts: Counter, numbers: List[int]) -> Dict[int, float]:
    values = {n: float(counts.get(n, 0)) for n in numbers}
    max_value = max(values.values()) if values else 0.0
    if max_value == 0:
        return {n: 0.0 for n in numbers}
    return {n: value / max_value for n, value in values.items()}


def _normalize_minmax(values: Dict[int, float]) -> Dict[int, float]:
    if not values:
        return {}
    min_value = min(values.values())
    max_value = max(values.values())
    if max_value == min_value:
        return {key: 1.0 for key in values}
    return {key: (val - min_value) / (max_value - min_value) for key, val in values.items()}


def _normalize_inverted(values: Dict[int, int]) -> Dict[int, float]:
    if not values:
        return {}
    min_value = min(values.values())
    max_value = max(values.values())
    if max_value == min_value:
        return {key: 1.0 for key in values}
    return {
        key: 1 - (val - min_value) / (max_value - min_value)
        for key, val in values.items()
    }


def _assign_groups(scores: Dict[int, float]) -> Dict[str, List[int]]:
    sorted_numbers = sorted(scores.keys(), key=lambda num: scores[num], reverse=True)
    total = len(sorted_numbers)

    group_a = int(math.ceil(total * 0.2))
    group_b = int(math.ceil(total * 0.5)) - group_a
    group_c = int(math.ceil(total * 0.8)) - group_a - group_b

    group_b = max(group_b, 0)
    group_c = max(group_c, 0)
    group_d = max(total - group_a - group_b - group_c, 0)

    groups = {
        "A": sorted_numbers[:group_a],
        "B": sorted_numbers[group_a : group_a + group_b],
        "C": sorted_numbers[group_a + group_b : group_a + group_b + group_c],
        "D": sorted_numbers[group_a + group_b + group_c : group_a + group_b + group_c + group_d],
    }

    return groups
