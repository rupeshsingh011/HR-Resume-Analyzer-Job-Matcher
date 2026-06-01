/**
 * One-time sync: copy candidates from local MongoDB into Atlas.
 * Use when uploads were saved locally before Atlas was configured.
 */
import mongoose from "mongoose";
import { getMongoUri } from "../src/config/env.js";

const LOCAL_URI = process.env.LOCAL_MONGO_URI || "mongodb://127.0.0.1:27017/smart_hr_analyzer";

async function sync() {
  const atlasUri = getMongoUri();
  if (/127\.0\.0\.1|localhost/.test(atlasUri)) {
    console.error("Set MONGO_URI in backend/.env to your Atlas connection string first.");
    process.exit(1);
  }

  let localConn;
  try {
    localConn = await mongoose.createConnection(LOCAL_URI, { serverSelectionTimeoutMS: 5000 }).asPromise();
  } catch {
    console.log("No local MongoDB found — nothing to sync.");
    process.exit(0);
  }

  const atlasConn = await mongoose.createConnection(atlasUri).asPromise();

  const localCandidates = await localConn.db.collection("candidates").find({}).toArray();
  const atlasAdmin = await atlasConn.db.collection("users").findOne({ email: "admin@smarthr.local" });

  if (!atlasAdmin) {
    console.error("Atlas has no admin user. Run: npm run seed");
    process.exit(1);
  }

  let inserted = 0;
  let updated = 0;

  for (const doc of localCandidates) {
    const { _id, ...fields } = doc;
    const filter = fields.email ? { email: fields.email } : { name: fields.name };
    const payload = { ...fields, uploadedBy: atlasAdmin._id };

    const result = await atlasConn.db.collection("candidates").updateOne(
      filter,
      { $set: payload },
      { upsert: true }
    );

    if (result.upsertedCount) inserted += 1;
    else if (result.modifiedCount) updated += 1;
  }

  console.log(`Sync complete: ${inserted} inserted, ${updated} updated in Atlas (${localCandidates.length} local records processed).`);
  await localConn.close();
  await atlasConn.close();
}

sync().catch((error) => {
  console.error(error);
  process.exit(1);
});
