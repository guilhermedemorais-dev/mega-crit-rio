import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";
import { config } from "./config.js";
import {
  ROLE_ADMIN,
  ROLE_AFFILIATE,
  ROLE_USER,
  addCredits,
  createUser,
  getUserByApiKey,
  getUserById,
  getUserByUsername,
  initDb,
} from "./db.js";
import { loadHistory, getLastConcurso } from "./data.js";
import { computeNumberScores } from "./scoring.js";
import { createRng, generateCards } from "./generator.js";
import { RateLimiter } from "./rateLimit.js";
import { verifyPassword } from "./security.js";

const app = express();

if (config.trustProxyHeaders) {
  app.set("trust proxy", 1);
}

const rateLimiter = new RateLimiter(config.rateLimitMax, config.rateLimitWindow);

const corsOptions = config.allowedOrigins.includes("*")
  ? { origin: true }
  : { origin: config.allowedOrigins };

app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Math.floor(Date.now() / 1000) });
});

app.post("/auth/login", async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    return res.status(400).json({ detail: "Credenciais invalidas." });
  }

  const user = await getUserByUsername(username);
  if (!user || !user.is_active) {
    return res.status(401).json({ detail: "Credenciais invalidas." });
  }

  if (!verifyPassword(password, user.password_salt, user.password_hash)) {
    return res.status(401).json({ detail: "Credenciais invalidas." });
  }

  return res.json({
    id: user.id,
    username: user.username,
    role: user.role,
    credits: user.credits,
    api_key: user.api_key,
  });
});

app.post("/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body ?? {};
    if (!username || !password) {
      return res.status(400).json({ detail: "Dados invalidos." });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ detail: "Senha muito curta." });
    }

    const user = await createUser({
      username,
      password,
      role: ROLE_USER,
      credits: 0,
    });

    return res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      credits: user.credits,
      api_key: user.api_key,
    });
  } catch (error) {
    return handleError(res, error);
  }
});

app.post("/admin/users", async (req, res) => {
  try {
    const admin = await requireAdmin(req);
    const { username, password, role, credits = 0 } = req.body ?? {};
    if (!username || !password || !role) {
      return res.status(400).json({ detail: "Dados invalidos." });
    }

    const normalizedRole = String(role).toLowerCase();
    if (![ROLE_ADMIN, ROLE_USER, ROLE_AFFILIATE].includes(normalizedRole)) {
      return res.status(400).json({ detail: "Role invalida." });
    }

    const user = await createUser({
      username,
      password,
      role: normalizedRole,
      credits: Number.parseInt(credits, 10) || 0,
    });

    console.info(
      `admin_create_user admin_id=${admin.id} user_id=${user.id} role=${user.role} credits=${user.credits}`
    );

    return res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      credits: user.credits,
      api_key: user.api_key,
    });
  } catch (error) {
    return handleError(res, error);
  }
});

app.post("/admin/credits", async (req, res) => {
  try {
    const admin = await requireAdmin(req);
    const { user_id, username, delta, reason } = req.body ?? {};
    if (!user_id && !username) {
      return res.status(400).json({ detail: "Destino invalido." });
    }

    const target = user_id
      ? await getUserById(user_id)
      : await getUserByUsername(username);

    if (!target) {
      return res.status(404).json({ detail: "Usuario nao encontrado." });
    }

    const deltaValue = Number.parseInt(delta, 10);
    if (!deltaValue) {
      return res.status(400).json({ detail: "Delta invalido." });
    }

    const credits = await addCredits({
      userId: target.id,
      delta: deltaValue,
      reason: reason ?? null,
      createdBy: admin.id,
    });

    console.info(
      `admin_adjust_credits admin_id=${admin.id} user_id=${target.id} delta=${deltaValue} credits=${credits}`
    );

    return res.json({ user_id: target.id, credits });
  } catch (error) {
    return handleError(res, error);
  }
});

app.post("/generate", async (req, res) => {
  const clientIp = getClientIp(req);
  const limit = rateLimiter.allow(clientIp);
  if (!limit.allowed) {
    return res
      .status(429)
      .set("Retry-After", String(limit.retryAfter))
      .json({ detail: "Rate limit excedido. Tente novamente mais tarde." });
  }

  const { cartoes, user_id, pagamento_confirmado, window_size, seed } = req.body ?? {};
  if (!pagamento_confirmado) {
    return res.status(403).json({ detail: "Pagamento nao confirmado." });
  }

  const cardCount = Number.parseInt(cartoes, 10);
  if (!cardCount || cardCount < 1) {
    return res.status(400).json({ detail: "Quantidade de cartoes invalida." });
  }

  const user = await getUserById(user_id);
  if (!user) {
    return res.status(404).json({ detail: "Usuario nao encontrado." });
  }
  if (!user.is_active) {
    return res.status(403).json({ detail: "Usuario inativo." });
  }

  const apiKey = req.get("x-api-key");
  if (config.requireApiKey) {
    if (!apiKey) {
      return res.status(401).json({ detail: "API key ausente." });
    }
    if (apiKey !== user.api_key) {
      return res.status(401).json({ detail: "API key invalida." });
    }
  } else if (apiKey && apiKey !== user.api_key) {
    return res.status(401).json({ detail: "API key invalida." });
  }

  const cost = cardCount * config.creditsPerCard;
  if (user.credits < cost) {
    return res.status(402).json({ detail: "Creditos insuficientes." });
  }

  let draws;
  try {
    draws = loadHistory();
  } catch (error) {
    return res.status(500).json({ detail: error.message });
  }

  if (!draws.length) {
    return res.status(500).json({ detail: "CSV sem dados validos." });
  }

  const windowSize = Number.parseInt(window_size, 10) || config.windowSize;
  const scoreResult = computeNumberScores(draws, windowSize);
  const rng = createRng(seed ?? config.seed);

  let cards;
  try {
    cards = generateCards({
      scores: scoreResult.scores,
      groups: scoreResult.groups,
      rng,
      cardCount,
      combinationsPerCard: config.combinationsPerCard,
    });
  } catch (error) {
    return res.status(500).json({ detail: error.message });
  }

  let newTotal = user.credits;
  try {
    newTotal = await addCredits({
      userId: user.id,
      delta: -cost,
      reason: "geracao_cartoes",
      createdBy: user.id,
    });
  } catch (error) {
    return res.status(402).json({ detail: error.message });
  }

  const lastConcurso = getLastConcurso(draws);
  console.info(
    `generation ip=${clientIp} user_id=${user.id} cards=${cardCount} combos_per_card=${config.combinationsPerCard} window=${windowSize} last_concurso=${lastConcurso} credits=${newTotal}`
  );

  const responseCards = cards.map((card) => ({
    id: card.id,
    combinacoes: card.combinations.map((combo) => ({
      numeros: combo.numbers,
      score: combo.score,
      explicacao: combo.explanation,
    })),
  }));

  return res.json({ cartoes: responseCards });
});

const distPath = path.join(process.cwd(), "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

const port = Number.parseInt(process.env.PORT, 10) || 8000;

const start = async () => {
  try {
    await initDb();
    if (config.adminUsername && config.adminPassword) {
      const existing = await getUserByUsername(config.adminUsername);
      if (!existing) {
        const admin = await createUser({
          username: config.adminUsername,
          password: config.adminPassword,
          role: ROLE_ADMIN,
          credits: 0,
        });
        console.info(
          `admin_created username=${admin.username} id=${admin.id} api_key=${admin.api_key}`
        );
      }
    }

    app.listen(port, () => {
      console.info(`MEGA FACIL API running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();

const getClientIp = (req) => {
  if (config.trustProxyHeaders) {
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) {
      return String(forwarded).split(",")[0].trim();
    }
  }
  return req.ip || req.connection?.remoteAddress || "unknown";
};

const requireAdmin = async (req) => {
  const apiKey = req.get("x-api-key");
  if (!apiKey) {
    const error = new Error("API key ausente.");
    error.status = 401;
    throw error;
  }
  const user = await getUserByApiKey(apiKey);
  if (!user || !user.is_active) {
    const error = new Error("API key invalida.");
    error.status = 401;
    throw error;
  }
  if (user.role !== ROLE_ADMIN) {
    const error = new Error("Acesso restrito ao admin.");
    error.status = 403;
    throw error;
  }
  return user;
};

const handleError = (res, error) => {
  const status = error.status || 500;
  const message = error.message || "Erro interno.";
  if (message === "Username already exists") {
    return res.status(409).json({ detail: "Usuario ja cadastrado." });
  }
  return res.status(status).json({ detail: message });
};
