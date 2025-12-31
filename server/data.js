import fs from "fs";
import { parse } from "csv-parse/sync";
import { config } from "./config.js";

const REQUIRED_COLUMNS = ["concurso", "n1", "n2", "n3", "n4", "n5", "n6"];

let cached = null;
let cachedMtime = null;

export const loadHistory = () => {
  const filePath = config.csvPath;
  if (!fs.existsSync(filePath)) {
    throw new Error(`CSV not found: ${filePath}`);
  }

  const stat = fs.statSync(filePath);
  if (cached && cachedMtime === stat.mtimeMs) {
    return cached;
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const draws = records
    .map((row) => {
      for (const column of REQUIRED_COLUMNS) {
        if (!(column in row)) {
          throw new Error(`Missing column in CSV: ${column}`);
        }
      }

      const concurso = toInt(row.concurso);
      const numbers = [
        toInt(row.n1),
        toInt(row.n2),
        toInt(row.n3),
        toInt(row.n4),
        toInt(row.n5),
        toInt(row.n6),
      ];

      return { concurso, numbers };
    })
    .filter((draw) => isValidDraw(draw));

  draws.sort((a, b) => a.concurso - b.concurso);

  cached = draws;
  cachedMtime = stat.mtimeMs;

  return draws;
};

export const getLastConcurso = (draws) => {
  if (!draws.length) return null;
  return draws[draws.length - 1].concurso;
};

const toInt = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return parsed;
};

const isValidDraw = ({ concurso, numbers }) => {
  if (!concurso || concurso <= 0) return false;
  if (numbers.some((num) => !num || num < 1 || num > 60)) return false;
  const unique = new Set(numbers);
  if (unique.size !== 6) return false;
  return true;
};
