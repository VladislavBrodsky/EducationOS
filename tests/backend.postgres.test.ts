import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { PostgresDatabase } from "../src/server/database";
import { LearningRepository } from "../src/server/repository";

const connectionString = process.env.TEST_DATABASE_URL;
/** CI runs this against a migrated ephemeral PostgreSQL service; never a production URL. */
describe.skipIf(!connectionString)("network PostgreSQL adapter", () => {
  it("connects to migrated PostgreSQL and shares a durable rate bucket across adapter instances", async () => {
    const url = new URL(connectionString!);
    if (!url.pathname.endsWith("_test")) throw new Error("TEST_DATABASE_URL must point to a disposable _test database");
    const first = new PostgresDatabase(connectionString!);
    const second = new PostgresDatabase(connectionString!);
    const key = `synthetic-ci-${randomUUID()}`;
    try {
      expect((await first.query("SELECT id FROM mission_versions LIMIT 0")).rows).toEqual([]);
      const repository = new LearningRepository(first, "synthetic-ci-provider");
      const other = new LearningRepository(second, "synthetic-ci-provider");
      expect(await repository.consumeRateLimit(key, 1, 60)).toBe(true);
      expect(await other.consumeRateLimit(key, 1, 60)).toBe(false);
    } finally { await first.close(); await second.close(); }
  });
});
