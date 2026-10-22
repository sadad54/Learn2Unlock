import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { seedData, type Learn2UnlockSeed } from "@learn2unlock/shared";
import { config } from "./config";
import { hashPassword } from "./security";

export type EntityType = keyof Learn2UnlockSeed;
type Entity = { id: string };

mkdirSync(dirname(config.databasePath), { recursive: true });
export const database = new DatabaseSync(config.databasePath);
database.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS entities (
    entity_type TEXT NOT NULL,
    id TEXT NOT NULL,
    payload TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (entity_type, id)
  );
  CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(entity_type);
  CREATE TABLE IF NOT EXISTS credentials (
    user_id TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
  CREATE TABLE IF NOT EXISTS child_balances (
    child_id TEXT PRIMARY KEY,
    remaining_minutes INTEGER NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

const upsertEntityStatement = database.prepare(`
  INSERT INTO entities (entity_type, id, payload, updated_at)
  VALUES (?, ?, ?, ?)
  ON CONFLICT(entity_type, id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at
`);

export function listEntities<T extends Entity>(entityType: EntityType): T[] {
  const rows = database.prepare("SELECT payload FROM entities WHERE entity_type = ? ORDER BY updated_at DESC").all(entityType) as { payload: string }[];
  return rows.map((row) => JSON.parse(row.payload) as T);
}

export function getEntity<T extends Entity>(entityType: EntityType, id: string): T | null {
  const row = database.prepare("SELECT payload FROM entities WHERE entity_type = ? AND id = ?").get(entityType, id) as { payload: string } | undefined;
  return row ? JSON.parse(row.payload) as T : null;
}

export function upsertEntity<T extends Entity>(entityType: EntityType, entity: T): T {
  upsertEntityStatement.run(entityType, entity.id, JSON.stringify(entity), new Date().toISOString());
  return entity;
}

export function deleteEntity(entityType: EntityType, id: string): boolean {
  const result = database.prepare("DELETE FROM entities WHERE entity_type = ? AND id = ?").run(entityType, id);
  return Number(result.changes) > 0;
}

export function patchEntity<T extends Entity>(entityType: EntityType, id: string, patch: Partial<T>): T | null {
  const current = getEntity<T>(entityType, id);
  return current ? upsertEntity(entityType, { ...current, ...patch, id }) : null;
}

export function getBalance(childId: string): number {
  const row = database.prepare("SELECT remaining_minutes FROM child_balances WHERE child_id = ?").get(childId) as { remaining_minutes: number } | undefined;
  return row?.remaining_minutes ?? 0;
}

export function setBalance(childId: string, remainingMinutes: number): number {
  database.prepare(`INSERT INTO child_balances (child_id, remaining_minutes, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(child_id) DO UPDATE SET remaining_minutes = excluded.remaining_minutes, updated_at = excluded.updated_at`)
    .run(childId, remainingMinutes, new Date().toISOString());
  return remainingMinutes;
}

export function addBalance(childId: string, minutes: number): number {
  return setBalance(childId, getBalance(childId) + minutes);
}

export function seedDatabase(): void {
  const count = database.prepare("SELECT COUNT(*) AS count FROM entities").get() as { count: number };
  if (count.count > 0) return;
  database.exec("BEGIN IMMEDIATE");
  try {
    for (const [entityType, entities] of Object.entries(seedData) as [EntityType, Entity[]][]) {
      for (const entity of entities) upsertEntity(entityType, entity);
    }
    database.prepare("INSERT OR IGNORE INTO credentials (user_id, password_hash) VALUES (?, ?)").run("user-parent-01", hashPassword("password"));
    setBalance("child-aina", 42);
    setBalance("child-irfan", 30);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

export function resetDatabaseForTests(): void {
  database.exec("DELETE FROM sessions; DELETE FROM credentials; DELETE FROM child_balances; DELETE FROM entities;");
  seedDatabase();
}
