import { LocalStorageAdapter, MemoryStorageAdapter, createMockRepositories } from "@learn2unlock/shared/repositories";

const storage = typeof globalThis.localStorage === "undefined" ? new MemoryStorageAdapter() : new LocalStorageAdapter(globalThis.localStorage);
export const repositories = createMockRepositories(storage);
