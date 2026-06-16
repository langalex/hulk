import { browser } from "$app/environment";
import type { PouchDoc } from "./types";

export interface HulkDatabase {
  get<T extends PouchDoc = PouchDoc>(id: string): Promise<T & { _rev?: string }>;
  put(doc: PouchDoc & { _rev?: string }): Promise<unknown>;
  remove(doc: PouchDoc & { _rev: string }): Promise<unknown>;
  changes(options: { live: boolean }): {
    on(
      event: "change",
      callback: () => void,
    ): {
      on(event: "error", callback: () => void): { cancel: () => void };
    };
  };
  destroy(): Promise<void>;
}

let db: HulkDatabase | null = null;

export function getDb(): HulkDatabase {
  if (db) {
    return db;
  }
  if (!browser) {
    throw new Error("PouchDB is only available in the browser");
  }
  throw new Error("Database not initialized");
}

export function setDb(instance: HulkDatabase): void {
  db = instance;
}

export function resetDbForTests(instance: HulkDatabase): void {
  db = instance;
}

export function clearDbSingleton(): void {
  db = null;
}

export function subscribeToChanges(onChange: () => void): () => void {
  const database = getDb();
  const listener = database
    .changes({ live: true })
    .on("change", onChange)
    .on("error", () => {});
  return () => listener.cancel();
}
