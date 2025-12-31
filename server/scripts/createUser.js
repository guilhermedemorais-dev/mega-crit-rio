import "dotenv/config";
import { createUser, initDb, ROLE_ADMIN, ROLE_AFFILIATE, ROLE_USER } from "../db.js";

const parseArgs = () => {
  const args = process.argv.slice(2);
  const map = {};
  for (let i = 0; i < args.length; i += 1) {
    const key = args[i];
    if (!key.startsWith("--")) continue;
    map[key.replace("--", "")] = args[i + 1];
    i += 1;
  }
  return map;
};

const main = async () => {
  const args = parseArgs();
  const username = args.username;
  const password = args.password;
  const role = args.role ?? ROLE_USER;
  const credits = Number.parseInt(args.credits ?? "0", 10) || 0;

  if (!username || !password) {
    console.error("Usage: node server/scripts/createUser.js --username <email> --password <senha> [--role admin|user|affiliate] [--credits 10]");
    process.exit(1);
  }

  if (![ROLE_ADMIN, ROLE_USER, ROLE_AFFILIATE].includes(role)) {
    console.error("Role invalida. Use admin, user ou affiliate.");
    process.exit(1);
  }

  await initDb();
  const user = await createUser({ username, password, role, credits });

  console.log("User created:");
  console.log(`  id: ${user.id}`);
  console.log(`  username: ${user.username}`);
  console.log(`  role: ${user.role}`);
  console.log(`  credits: ${user.credits}`);
  console.log(`  api_key: ${user.api_key}`);
};

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
