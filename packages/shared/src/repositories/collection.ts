import type { z } from "zod";
import type { StorageAdapter } from "./storage";

type Entity = { id: string };

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export class PersistentCollection<T extends Entity> {
  constructor(
    private readonly storage: StorageAdapter,
    private readonly key: string,
    private readonly schema: z.ZodType<T, z.ZodTypeDef, unknown>,
    private readonly initial: readonly T[],
  ) {}

  private async read(): Promise<T[]> {
    const stored = await this.storage.getItem(this.key);
    if (!stored) {
      const seeded = this.initial.map((item) => this.schema.parse(item));
      await this.write(seeded);
      return clone(seeded);
    }

    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) throw new Error(`Stored collection ${this.key} is not an array.`);
    return parsed.map((item) => this.schema.parse(item));
  }

  private async write(items: T[]): Promise<void> {
    await this.storage.setItem(this.key, JSON.stringify(items));
  }

  async list(): Promise<T[]> {
    return clone(await this.read());
  }

  async getById(id: string): Promise<T | null> {
    return clone((await this.read()).find((item) => item.id === id) ?? null);
  }

  async create(item: T): Promise<T> {
    const items = await this.read();
    if (items.some((candidate) => candidate.id === item.id)) {
      throw new Error(`Duplicate id ${item.id} in ${this.key}.`);
    }
    const parsed = this.schema.parse(item);
    await this.write([...items, parsed]);
    return clone(parsed);
  }

  async update(id: string, patch: Partial<T>): Promise<T> {
    const items = await this.read();
    const index = items.findIndex((item) => item.id === id);
    if (index < 0) throw new Error(`Cannot update missing id ${id} in ${this.key}.`);
    const updated = this.schema.parse({ ...items[index], ...patch, id });
    items[index] = updated;
    await this.write(items);
    return clone(updated);
  }

  async remove(id: string): Promise<void> {
    const items = await this.read();
    await this.write(items.filter((item) => item.id !== id));
  }

  async reset(): Promise<void> {
    await this.storage.removeItem(this.key);
  }
}
