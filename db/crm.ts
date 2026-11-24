import { desc, eq, and } from "drizzle-orm";
import { jsonb, pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import type { CrmRecord, EntityKey } from "@/lib/crm-config";

/**
 * CRM storage: one table, one JSON document per record, validated in the app
 * against lib/crm-config.ts. Production uses Vercel Postgres / Neon
 * (DATABASE_URL or POSTGRES_URL). Local development falls back to PGlite, an
 * in-process Postgres saved under .data/crm (never in production).
 */
export const crmRecords = pgTable(
  "crm_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entity: text("entity").notNull(),
    data: jsonb("data").notNull().$type<Record<string, string | number>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  table => [index("crm_records_entity_idx").on(table.entity, table.createdAt)],
);

const CREATE_SQL = `
  CREATE TABLE IF NOT EXISTS crm_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    entity text NOT NULL,
    data jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS crm_records_entity_idx ON crm_records (entity, created_at);
`;

const connectionString = () => process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

type CrmDb = {
  get(entity: EntityKey, id: string): Promise<CrmRecord | null>;
  list(entity: EntityKey): Promise<CrmRecord[]>;
  listAll(): Promise<CrmRecord[]>;
  create(entity: EntityKey, data: Record<string, string | number>): Promise<CrmRecord>;
  update(entity: EntityKey, id: string, data: Record<string, string | number>): Promise<CrmRecord | null>;
  remove(entity: EntityKey, id: string): Promise<boolean>;
};

/**
 * One connection per process, kept on globalThis so dev-server hot reloads
 * reuse it. (Two PGlite instances on the same folder corrupt it.)
 */
/** Bump when the CrmDb shape changes, so a hot-reloaded dev server doesn't keep an old connection object. */
const CRM_API_VERSION = 2;
const holder = globalThis as typeof globalThis & { __buzzlyCrm?: Promise<CrmDb | null> | null; __buzzlyCrmVersion?: number };

/** True when the CRM has somewhere to store data in this environment. */
export const crmConfigured = () => Boolean(connectionString()) || process.env.NODE_ENV === "development";

export function getCrm(): Promise<CrmDb | null> {
  if (holder.__buzzlyCrmVersion !== CRM_API_VERSION) { holder.__buzzlyCrm = null; holder.__buzzlyCrmVersion = CRM_API_VERSION; }
  holder.__buzzlyCrm ??= connect().catch(error => {
    holder.__buzzlyCrm = null;
    console.error("CRM database unavailable:", error instanceof Error ? error.message : error);
    return null;
  });
  return holder.__buzzlyCrm;
}

const toRecord = (row: typeof crmRecords.$inferSelect): CrmRecord => ({
  id: row.id,
  entity: row.entity as EntityKey,
  data: row.data,
  createdAt: new Date(row.createdAt).toISOString(),
  updatedAt: new Date(row.updatedAt).toISOString(),
});

async function connect(): Promise<CrmDb | null> {
  const url = connectionString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- both drivers expose the same drizzle query API
  let db: any;
  /** After each write: local snapshot only (no-op on Neon). */
  let persist = async () => {};
  if (url) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    const sql = neon(url);
    for (const statement of CREATE_SQL.split(";").map(s => s.trim()).filter(Boolean)) await sql.query(statement);
    db = drizzle(sql);
  } else if (process.env.NODE_ENV === "development") {
    // Local development: an in-memory Postgres, saved as one snapshot file after every change.
    // The snapshot is written to a temp file and renamed into place, so stopping the dev server
    // at any moment can't leave a half-written database (a live data folder can't survive that).
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle } = await import("drizzle-orm/pglite");
    const { mkdir, readFile, rename, writeFile } = await import("node:fs/promises");
    const { dirname } = await import("node:path");
    const file = `${process.env.CRM_PGLITE_DIR || "./.data/crm-local"}.tar.gz`;
    await mkdir(dirname(file), { recursive: true });
    const saved = await readFile(file).catch(() => null);
    const client = await PGlite.create(saved ? { loadDataDir: new Blob([new Uint8Array(saved)]) } : {});
    await client.exec(CREATE_SQL);
    db = drizzle(client);
    let queue = Promise.resolve();
    persist = () => (queue = queue.then(async () => {
      const dump = await client.dumpDataDir("gzip");
      await writeFile(`${file}.tmp`, new Uint8Array(await dump.arrayBuffer()));
      await rename(`${file}.tmp`, file);
    }).catch(error => console.error("CRM local snapshot failed:", error instanceof Error ? error.message : error)));
  } else {
    return null;
  }

  return {
    async get(entity, id) {
      const [row] = await db.select().from(crmRecords).where(and(eq(crmRecords.entity, entity), eq(crmRecords.id, id))).limit(1);
      return row ? toRecord(row) : null;
    },
    async list(entity) {
      const rows = await db.select().from(crmRecords).where(eq(crmRecords.entity, entity)).orderBy(desc(crmRecords.createdAt));
      return rows.map(toRecord);
    },
    async listAll() {
      const rows = await db.select().from(crmRecords).orderBy(desc(crmRecords.createdAt));
      return rows.map(toRecord);
    },
    async create(entity, data) {
      const [row] = await db.insert(crmRecords).values({ entity, data }).returning();
      await persist();
      return toRecord(row);
    },
    async update(entity, id, data) {
      const [row] = await db.update(crmRecords).set({ data, updatedAt: new Date() }).where(and(eq(crmRecords.entity, entity), eq(crmRecords.id, id))).returning();
      await persist();
      return row ? toRecord(row) : null;
    },
    async remove(entity, id) {
      const rows = await db.delete(crmRecords).where(and(eq(crmRecords.entity, entity), eq(crmRecords.id, id))).returning({ id: crmRecords.id });
      await persist();
      return rows.length > 0;
    },
  };
}
