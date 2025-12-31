import crypto from "crypto";

export const hashPassword = (password, saltHex) => {
  const salt = saltHex ? Buffer.from(saltHex, "hex") : crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 32, "sha256");
  return {
    salt: salt.toString("hex"),
    hash: hash.toString("hex"),
  };
};

export const verifyPassword = (password, saltHex, hashHex) => {
  const { hash } = hashPassword(password, saltHex);
  return crypto.timingSafeEqual(
    Buffer.from(hash, "hex"),
    Buffer.from(hashHex, "hex")
  );
};

export const generateApiKey = () =>
  crypto.randomBytes(32).toString("base64url");
