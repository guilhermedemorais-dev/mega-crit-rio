const NUMBERS = Array.from({ length: 60 }, (_, i) => i + 1);

export const computeNumberScores = (draws, windowSize) => {
  const totalCounts = countNumbers(draws);
  const globalNorm = normalizeByMax(totalCounts);

  const recentDraws = draws.slice(-windowSize);
  const recentCounts = countNumbers(recentDraws);
  const recentNorm = normalizeByMax(recentCounts);

  const recency = computeRecency(draws);
  const recencyNorm = normalizeInverted(recency);

  const rawScores = {};
  for (const number of NUMBERS) {
    rawScores[number] =
      0.5 * (globalNorm[number] ?? 0) +
      0.3 * (recentNorm[number] ?? 0) +
      0.2 * (recencyNorm[number] ?? 0);
  }

  const scores = normalizeMinMax(rawScores);
  const groups = assignGroups(scores);

  return { scores, groups };
};

const countNumbers = (draws) => {
  const counts = {};
  for (const number of NUMBERS) {
    counts[number] = 0;
  }
  for (const draw of draws) {
    for (const number of draw.numbers) {
      counts[number] = (counts[number] ?? 0) + 1;
    }
  }
  return counts;
};

const normalizeByMax = (counts) => {
  const values = Object.values(counts);
  const max = values.length ? Math.max(...values) : 0;
  const normalized = {};
  for (const number of NUMBERS) {
    normalized[number] = max === 0 ? 0 : (counts[number] ?? 0) / max;
  }
  return normalized;
};

const computeRecency = (draws) => {
  const lastSeen = {};
  for (const number of NUMBERS) {
    lastSeen[number] = null;
  }

  for (let offset = 0; offset < draws.length; offset += 1) {
    const draw = draws[draws.length - 1 - offset];
    for (const number of draw.numbers) {
      if (lastSeen[number] === null) {
        lastSeen[number] = offset;
      }
    }
  }

  const seenValues = Object.values(lastSeen).filter((value) => value !== null);
  const maxSeen = seenValues.length ? Math.max(...seenValues) : 0;

  const recency = {};
  for (const number of NUMBERS) {
    recency[number] = lastSeen[number] === null ? maxSeen + 1 : lastSeen[number];
  }
  return recency;
};

const normalizeInverted = (values) => {
  const numericValues = Object.values(values);
  const min = numericValues.length ? Math.min(...numericValues) : 0;
  const max = numericValues.length ? Math.max(...numericValues) : 0;
  const normalized = {};
  for (const number of NUMBERS) {
    if (max === min) {
      normalized[number] = 1;
    } else {
      normalized[number] = 1 - (values[number] - min) / (max - min);
    }
  }
  return normalized;
};

const normalizeMinMax = (values) => {
  const numericValues = Object.values(values);
  const min = numericValues.length ? Math.min(...numericValues) : 0;
  const max = numericValues.length ? Math.max(...numericValues) : 0;
  const normalized = {};
  for (const number of NUMBERS) {
    if (max === min) {
      normalized[number] = 1;
    } else {
      normalized[number] = (values[number] - min) / (max - min);
    }
  }
  return normalized;
};

const assignGroups = (scores) => {
  const sorted = [...NUMBERS].sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0));
  const total = sorted.length;
  const groupA = Math.ceil(total * 0.2);
  const groupB = Math.ceil(total * 0.5) - groupA;
  const groupC = Math.ceil(total * 0.8) - groupA - groupB;
  const groupD = total - groupA - groupB - groupC;

  return {
    A: sorted.slice(0, groupA),
    B: sorted.slice(groupA, groupA + Math.max(groupB, 0)),
    C: sorted.slice(groupA + groupB, groupA + groupB + Math.max(groupC, 0)),
    D: sorted.slice(groupA + groupB + groupC, groupA + groupB + groupC + Math.max(groupD, 0)),
  };
};
