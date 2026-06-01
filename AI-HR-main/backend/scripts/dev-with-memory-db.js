import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoMemoryServer } from "mongodb-memory-server";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.join(__dirname, "..");

const mongod = await MongoMemoryServer.create();
const mongoUri = `${mongod.getUri()}smart_hr_analyzer`;
process.env.MONGO_URI = mongoUri;

console.log("In-memory MongoDB:", mongoUri);

await new Promise((resolve, reject) => {
  const seed = spawn("node", ["sample-data/seed.js"], {
    cwd: backendRoot,
    env: { ...process.env, MONGO_URI: mongoUri },
    stdio: "inherit",
    shell: true
  });
  seed.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`seed exited with code ${code}`))));
});

await import("../src/server.js");

process.on("SIGINT", async () => {
  await mongod.stop();
  process.exit(0);
});
