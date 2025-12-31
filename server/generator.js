import seedrandom from "seedrandom";

const EXPLANATION =
  "Combinação formada por 2 números do Grupo A, 2 do Grupo B e 2 do Grupo C, priorizando o score do modelo com base em análise estatística como ferramenta auxiliar.";

export const createRng = (seed) => {
  if (seed === null || seed === undefined || seed === "") {
    return Math.random;
  }
  return seedrandom(String(seed));
};

export const generateCards = ({ scores, groups, rng, cardCount, combinationsPerCard }) => {
  if ((groups.A ?? []).length < 2 || (groups.B ?? []).length < 2 || (groups.C ?? []).length < 2) {
    throw new Error("Groups A, B, and C must have at least 2 numbers each.");
  }

  const cards = [];
  for (let i = 0; i < cardCount; i += 1) {
    const combinations = generateCombinations({ scores, groups, rng, combinationsPerCard });
    cards.push({ id: `card-${String(i + 1).padStart(3, "0")}`, combinations });
  }
  return cards;
};

const generateCombinations = ({ scores, groups, rng, combinationsPerCard }) => {
  const combinations = [];
  const seen = new Set();
  const maxAttempts = combinationsPerCard * 20;
  let attempts = 0;

  while (combinations.length < combinationsPerCard && attempts < maxAttempts) {
    attempts += 1;
    const numbers = [
      ...sampleGroup(groups.A, scores, rng, 2),
      ...sampleGroup(groups.B, scores, rng, 2),
      ...sampleGroup(groups.C, scores, rng, 2),
    ].sort((a, b) => a - b);

    const key = numbers.join("-");
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);

    combinations.push({
      numbers,
      score: comboScore(numbers, scores),
      explanation: EXPLANATION,
    });
  }

  if (combinations.length < combinationsPerCard) {
    throw new Error("Could not generate enough unique combinations.");
  }

  return combinations;
};

const sampleGroup = (groupNumbers, scores, rng, count) => {
  const selected = [];
  let available = groupNumbers.map((number) => ({
    number,
    weight: scores[number] ?? 0,
  }));

  for (let i = 0; i < count; i += 1) {
    const totalWeight = available.reduce((sum, item) => sum + item.weight, 0);
    const useUniform = totalWeight <= 0;
    const threshold = rng() * (useUniform ? available.length : totalWeight);
    let cumulative = 0;
    let chosenIndex = 0;

    for (let idx = 0; idx < available.length; idx += 1) {
      cumulative += useUniform ? 1 : available[idx].weight;
      if (threshold <= cumulative) {
        chosenIndex = idx;
        break;
      }
    }

    const [chosen] = available.splice(chosenIndex, 1);
    selected.push(chosen.number);
  }

  return selected;
};

const comboScore = (numbers, scores) => {
  if (!numbers.length) return 0;
  const mean = numbers.reduce((sum, number) => sum + (scores[number] ?? 0), 0) / numbers.length;
  return Math.round(mean * 10000) / 100;
};
