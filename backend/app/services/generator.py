from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List

import numpy as np

EXPLANATION_TEXT = (
    "Combinação formada por 2 números do Grupo A, 2 do Grupo B e 2 do Grupo C, "
    "priorizando o score do modelo com base em análise estatística como ferramenta auxiliar."
)


@dataclass(frozen=True)
class Combination:
    numbers: List[int]
    score: float
    explanation: str


@dataclass(frozen=True)
class Card:
    card_id: str
    combinations: List[Combination]


def generate_cards(
    scores: Dict[int, float],
    groups: Dict[str, List[int]],
    rng: np.random.Generator,
    card_count: int,
    combinations_per_card: int,
) -> List[Card]:
    if len(groups.get("A", [])) < 2 or len(groups.get("B", [])) < 2 or len(groups.get("C", [])) < 2:
        raise ValueError("Groups A, B, and C must have at least 2 numbers each.")

    cards: List[Card] = []
    for card_index in range(card_count):
        combinations = _generate_combinations_for_card(
            scores,
            groups,
            rng,
            combinations_per_card,
        )
        cards.append(
            Card(card_id=f"card-{card_index + 1:03d}", combinations=combinations)
        )

    return cards


def _generate_combinations_for_card(
    scores: Dict[int, float],
    groups: Dict[str, List[int]],
    rng: np.random.Generator,
    combinations_per_card: int,
) -> List[Combination]:
    combinations: List[Combination] = []
    seen: set[tuple[int, ...]] = set()
    max_attempts = combinations_per_card * 20
    attempts = 0

    while len(combinations) < combinations_per_card and attempts < max_attempts:
        attempts += 1
        numbers = _sample_group(groups["A"], scores, rng, 2)
        numbers += _sample_group(groups["B"], scores, rng, 2)
        numbers += _sample_group(groups["C"], scores, rng, 2)
        numbers = sorted(numbers)

        numbers_key = tuple(numbers)
        if numbers_key in seen:
            continue

        seen.add(numbers_key)
        combo_score = _combo_score(numbers, scores)
        combinations.append(
            Combination(numbers=numbers, score=combo_score, explanation=EXPLANATION_TEXT)
        )

    if len(combinations) < combinations_per_card:
        raise ValueError("Could not generate enough unique combinations.")

    return combinations


def _sample_group(
    group_numbers: List[int],
    scores: Dict[int, float],
    rng: np.random.Generator,
    count: int,
) -> List[int]:
    weights = np.array([scores.get(num, 0.0) for num in group_numbers], dtype=float)
    if weights.sum() <= 0:
        weights = np.ones_like(weights)
    probabilities = weights / weights.sum()

    selected_indices = rng.choice(len(group_numbers), size=count, replace=False, p=probabilities)
    return [group_numbers[i] for i in selected_indices]


def _combo_score(numbers: List[int], scores: Dict[int, float]) -> float:
    if not numbers:
        return 0.0
    mean_score = sum(scores.get(num, 0.0) for num in numbers) / len(numbers)
    return round(mean_score * 100, 2)
