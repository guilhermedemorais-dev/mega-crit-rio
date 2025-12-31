import crypto from "crypto";
import mysql from "mysql2/promise";
import { config } from "./config.js";
import { generateApiKey, hashPassword } from "./security.js";

export const ROLE_ADMIN = "admin";
export const ROLE_USER = "user";
export const ROLE_AFFILIATE = "affiliate";
const VALID_ROLES = new Set([ROLE_ADMIN, ROLE_USER, ROLE_AFFILIATE]);

let pool;

export const initDb = async () => {
  pool = mysql.createPool({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.name,
    waitForConnections: true,
    connectionLimit: 10,
  });

  await pool.query(
    `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      password_salt VARCHAR(64) NOT NULL,
      password_hash VARCHAR(128) NOT NULL,
      role VARCHAR(32) NOT NULL,
      credits INT NOT NULL DEFAULT 0,
      api_key VARCHAR(128) NOT NULL UNIQUE,
      is_active TINYINT NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  );

  await pool.query(
    `CREATE TABLE IF NOT EXISTS credit_transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      delta INT NOT NULL,
      reason VARCHAR(255),
      created_by VARCHAR(36),
      created_at DATETIME NOT NULL,
      INDEX idx_credit_user_id (user_id),
      CONSTRAINT fk_credit_user FOREIGN KEY (user_id) REFERENCES users(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  );
};

export const createUser = async ({ username, password, role, credits = 0 }) => {
  if (!VALID_ROLES.has(role)) {
    throw new Error("Role invalida");
  }

  const id = cryptoRandomUuid();
  const { salt, hash } = hashPassword(password);
  const apiKey = generateApiKey();
  const createdAt = nowSql();

  try {
    await pool.execute(
      `INSERT INTO users (id, username, password_salt, password_hash, role, credits, api_key, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)` ,
      [id, username, salt, hash, role, credits, apiKey, createdAt]
    );
  } catch (error) {
    if (error && error.code === "ER_DUP_ENTRY") {
      throw new Error("Username already exists");
    }
    throw error;
  }

  return {
    id,
    username,
    password_salt: salt,
    password_hash: hash,
    role,
    credits,
    api_key: apiKey,
    is_active: true,
    created_at: createdAt,
  };
};

export const getUserByUsername = async (username) => {
  const [rows] = await pool.execute("SELECT * FROM users WHERE username = ?", [username]);
  return rows[0] ?? null;
};

export const getUserById = async (id) => {
  const [rows] = await pool.execute("SELECT * FROM users WHERE id = ?", [id]);
  return rows[0] ?? null;
};

export const getUserByApiKey = async (apiKey) => {
  const [rows] = await pool.execute("SELECT * FROM users WHERE api_key = ?", [apiKey]);
  return rows[0] ?? null;
};

export const addCredits = async ({ userId, delta, reason, createdBy }) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute(
      "SELECT credits FROM users WHERE id = ? FOR UPDATE",
      [userId]
    );
    if (!rows.length) {
      throw new Error("User not found");
    }

    const current = Number(rows[0].credits);
    const next = current + delta;
    if (next < 0) {
      throw new Error("Insufficient credits");
    }

    await connection.execute("UPDATE users SET credits = ? WHERE id = ?", [next, userId]);
    await connection.execute(
      `INSERT INTO credit_transactions (user_id, delta, reason, created_by, created_at)
       VALUES (?, ?, ?, ?, ?)` ,
      [userId, delta, reason ?? null, createdBy ?? null, nowSql()]
    );
    await connection.commit();
    return next;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const nowSql = () => {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
};

const cryptoRandomUuid = () => {
  if (crypto?.randomUUID) {
    return crypto.randomUUID();
  }
  return generateFallbackUuid();
};

const generateFallbackUuid = () => {
  const bytes = crypto.randomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};
