import "dotenv/config";
import { addCredits, getUserByUsername, initDb } from "../db.js";

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
  const delta = Number.parseInt(args.delta ?? "0", 10);
  const reason = args.reason ?? "ajuste_manual";
  const createdBy = args.createdBy ?? null;

  if (!username || !delta) {
    console.error("Usage: node server/scripts/addCredits.js --username <email> --delta <valor> [--reason texto]");
    process.exit(1);
  }

  await initDb();
  const user = await getUserByUsername(username);
  if (!user) {
    console.error("User not found");
    process.exit(1);
  }

  const credits = await addCredits({
    userId: user.id,
    delta,
    reason,
    createdBy,
  });

  console.log("Credits updated:");
  console.log(`  user_id: ${user.id}`);
  console.log(`  username: ${user.username}`);
  console.log(`  credits: ${credits}`);
};

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
