import { DEMO_MISSIONS } from "../src/content/missions";
import { publishedMissionSchema } from "../src/contracts/learning";
import { PostgresDatabase } from "../src/server/database";

/** Seed curriculum only. This script never creates an adult, learner, grant, consent, or session. */
async function main() {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) throw new Error("Set DIRECT_URL or DATABASE_URL to the migrated database before seeding curriculum.");
  const database = new PostgresDatabase(url);
  try {
    await database.transaction(async (tx) => {
      for (const raw of DEMO_MISSIONS) {
        const mission = publishedMissionSchema.parse(raw);
        await tx.query("INSERT INTO missions (id,slug) VALUES ($1,$2) ON CONFLICT (id) DO NOTHING", [mission.missionId, `paper-bridge-${mission.ageBand}`]);
        const existing = await tx.query<{ content: unknown; title: string; age_band: string; world: string; version: number; mission_id: string; published_at: Date }>("SELECT * FROM mission_versions WHERE id = $1", [mission.id]);
        if (existing.rows[0]) {
          const row = existing.rows[0];
          // Published content cannot be updated in place. Reject modified seeds until their IDs/version change.
          const normalize = (value: unknown): string => JSON.stringify(value, (_key, item: unknown) => item && typeof item === "object" && !Array.isArray(item) ? Object.fromEntries(Object.entries(item).sort(([left], [right]) => left.localeCompare(right))) : item);
          if (normalize(row.content) !== normalize(mission.content) || row.title !== mission.title || row.age_band !== mission.ageBand || row.world !== mission.world || row.version !== mission.version || row.mission_id !== mission.missionId || new Date(row.published_at).toISOString() !== mission.publishedAt) {
            throw new Error("Published seed differs from its immutable version. Publish a new version ID.");
          }
          continue;
        }
        await tx.query("INSERT INTO mission_versions (id,mission_id,version,title,age_band,world,content,published_at) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8)", [mission.id, mission.missionId, mission.version, mission.title, mission.ageBand, mission.world, JSON.stringify(mission.content), mission.publishedAt]);
      }
    });
    console.info(JSON.stringify({ event: "curriculum_seed_complete", versions: DEMO_MISSIONS.length }));
  } finally { await database.close(); }
}
main().catch(() => { console.error("Curriculum seeding failed. Check migrated database access and immutable version IDs; credentials are never printed."); process.exitCode = 1; });
