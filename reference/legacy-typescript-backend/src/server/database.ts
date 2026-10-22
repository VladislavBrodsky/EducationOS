import { Pool, type PoolClient } from "pg";

export interface SqlExecutor {
  query<Row extends Record<string, unknown> = Record<string, unknown>>(sql: string, values?: unknown[]): Promise<{ rows: Row[] }>;
}
export interface Database extends SqlExecutor {
  transaction<T>(work: (transaction: SqlExecutor) => Promise<T>): Promise<T>;
}

/** Parameterized SQL only. Prisma owns schema/migrations; this adapter also runs in PostgreSQL integration tests. */
export class PostgresDatabase implements Database {
  private readonly pool: Pool;
  constructor(connectionString: string) {
    const url = new URL(connectionString);
    if (!["postgres:", "postgresql:"].includes(url.protocol)) throw new Error("Unsupported database protocol");
    const local = ["localhost", "127.0.0.1", "::1", "[::1]", "db"].includes(url.hostname);
    if (!local && !["verify-full", "verify-ca"].includes(url.searchParams.get("sslmode") ?? "")) {
      throw new Error("Remote PostgreSQL requires verified TLS configuration");
    }
    this.pool = new Pool({ connectionString, max: 5, connectionTimeoutMillis: 3000, idleTimeoutMillis: 10000, statement_timeout: 5000, query_timeout: 6000 });
    // A disconnected idle client must never crash the web process or log connection credentials.
    this.pool.on("error", () => { console.error(JSON.stringify({ event: "database_pool_error" })); });
  }
  async query<Row extends Record<string, unknown>>(sql: string, values: unknown[] = []): Promise<{ rows: Row[] }> {
    const result = await this.pool.query(sql, values);
    return { rows: result.rows as Row[] };
  }
  async transaction<T>(work: (transaction: SqlExecutor) => Promise<T>): Promise<T> {
    const client: PoolClient = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await work({ query: async <Row extends Record<string, unknown>>(sql: string, values: unknown[] = []) => ({ rows: (await client.query(sql, values)).rows as Row[] }) });
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally { client.release(); }
  }
  async close(): Promise<void> { await this.pool.end(); }
}
