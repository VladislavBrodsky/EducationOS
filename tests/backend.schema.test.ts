import { execFile } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { promisify } from "node:util";
import { PGlite } from "@electric-sql/pglite";
import { expect, it } from "vitest";

it("keeps Prisma schema columns, indexes and foreign keys aligned with the executable migration", async () => {
  const engines = resolve("node_modules/@prisma/engines");
  const binary = (await readdir(engines)).find((name) => name.startsWith("schema-engine-") && !name.endsWith(".sha256"));
  if (!binary) throw new Error("Run npm ci / prisma generate to install the schema engine before checking schema parity.");
  const generated = await promisify(execFile)(process.execPath, [resolve("node_modules/prisma/build/index.js"), "migrate", "diff", "--from-empty", "--to-schema-datamodel", "prisma/schema.prisma", "--script"], { env: { ...process.env, PRISMA_SCHEMA_ENGINE_BINARY: resolve(engines, binary), PRISMA_HIDE_UPDATE_MESSAGE: "1", CHECKPOINT_DISABLE: "1", DATABASE_URL: "postgresql://synthetic:synthetic@localhost:5432/educationos_test", DIRECT_URL: "postgresql://synthetic:synthetic@localhost:5432/educationos_test" }, maxBuffer: 1024 * 1024 });
  const actual = new PGlite();
  const expected = new PGlite();
  try {
    await actual.exec(await readFile(new URL("../prisma/migrations/202610180001_foundation/migration.sql", import.meta.url), "utf8"));
    await expected.exec(generated.stdout);
    for (const sql of [
      "SELECT table_name,column_name,data_type,udt_name,is_nullable,character_maximum_length,datetime_precision,column_default FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name,ordinal_position",
      "SELECT tablename,indexname,indexdef FROM pg_indexes WHERE schemaname='public' ORDER BY tablename,indexname",
      "SELECT conrelid::regclass::text AS table_name,conname,pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE connamespace='public'::regnamespace AND contype='f' ORDER BY conname",
    ]) expect((await actual.query(sql)).rows).toEqual((await expected.query(sql)).rows);
    // Custom checks and immutability triggers are deliberate additions beyond Prisma's model.
    expect((await actual.query("SELECT count(*)::int AS count FROM pg_trigger WHERE NOT tgisinternal")).rows[0]).toEqual({ count: 7 });
  } finally { await actual.close(); await expected.close(); }
});
